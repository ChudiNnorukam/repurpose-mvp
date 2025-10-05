import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTwitterAuthUrl, generateCodeVerifier } from '@/lib/twitter'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session to ensure we have the latest auth state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('Twitter auth - Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      cookies: cookieStore.getAll().map(c => c.name)
    })

    if (sessionError || !session) {
      console.log('No session found, redirecting to login')
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    const user = session.user

    // Generate PKCE code verifier (cryptographically secure)
    const codeVerifier = generateCodeVerifier()

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state in cookie for verification
    cookieStore.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    })

    // Store code verifier in httpOnly cookie (secure, not accessible via JS)
    cookieStore.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Get Twitter authorization URL with PKCE
    const authUrl = getTwitterAuthUrl(state, codeVerifier)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error initiating Twitter OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}
