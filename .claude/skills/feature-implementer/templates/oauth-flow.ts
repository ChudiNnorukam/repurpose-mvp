// OAuth 2.0 PKCE Flow Template (Twitter/LinkedIn pattern)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Step 1: Initiate OAuth
export async function initiateOAuth(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Generate PKCE challenge
  const codeVerifier = crypto.randomBytes(64).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  
  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex')

  // Store verifier and state (encrypted)
  await supabase
    .from('oauth_sessions')
    .insert({
      user_id: user.id,
      state,
      code_verifier: codeVerifier,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min
    })

  // Build authorization URL
  const authUrl = new URL('https://provider.com/oauth/authorize')
  authUrl.searchParams.set('client_id', process.env.PROVIDER_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/provider/callback`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', 'required scopes')

  return NextResponse.redirect(authUrl.toString())
}

// Step 2: Handle callback
export async function handleCallback(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/connections?error=invalid_callback', request.url))
  }

  // Verify state and retrieve verifier
  const { data: session } = await supabase
    .from('oauth_sessions')
    .select('code_verifier, expires_at')
    .eq('user_id', user.id)
    .eq('state', state)
    .single()

  if (!session || new Date(session.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/connections?error=invalid_state', request.url))
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://provider.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/provider/callback`,
      client_id: process.env.PROVIDER_CLIENT_ID!,
      client_secret: process.env.PROVIDER_CLIENT_SECRET!,
      code_verifier: session.code_verifier,
    }),
  })

  const tokens = await tokenResponse.json()

  // Store tokens in social_accounts
  await supabase
    .from('social_accounts')
    .upsert({
      user_id: user.id,
      platform: 'provider',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      account_id: tokens.user_id || 'unknown',
      account_name: tokens.username || 'User'
    })

  // Clean up session
  await supabase
    .from('oauth_sessions')
    .delete()
    .eq('user_id', user.id)
    .eq('state', state)

  return NextResponse.redirect(new URL('/connections?success=true', request.url))
}
