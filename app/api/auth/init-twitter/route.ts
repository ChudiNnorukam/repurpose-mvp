import { NextRequest, NextResponse } from 'next/server'
import { getTwitterAuthUrl, generateCodeVerifier } from '@/lib/twitter'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    console.log('[init-twitter] Request received')

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[init-twitter] Unauthorized request', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('[init-twitter] Processing for userId:', userId)
    // codex_agent: Validate Supabase session before generating OAuth state.

    // Generate PKCE code verifier (cryptographically secure)
    const codeVerifier = generateCodeVerifier()

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state and userId together (we'll verify both in callback)
    // codex_agent: Bind OAuth state to the authenticated user ID provided by Supabase.
    const stateData = JSON.stringify({ state, userId })
    const encodedState = Buffer.from(stateData).toString('base64url')

    // Store code verifier in httpOnly cookie (secure, not accessible via JS)
    const cookieStore = await cookies()
    cookieStore.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes (OAuth flow should complete quickly)
      path: '/',
    })

    // Get Twitter authorization URL with PKCE
    const authUrl = getTwitterAuthUrl(encodedState, codeVerifier)

    console.log('[init-twitter] Success, returning authUrl')
    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    console.error('[init-twitter] Error initiating Twitter OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}
