/**
 * LinkedIn OAuth Initialization Route
 *
 * GET /api/auth/linkedin/init
 *
 * Starts the LinkedIn OAuth 2.0 flow:
 * 1. Generates random state for CSRF protection
 * 2. Stores state in encrypted cookie
 * 3. Redirects user to LinkedIn authorization page
 *
 * Usage:
 *   <a href="/api/auth/linkedin/init">Connect LinkedIn</a>
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-client'
import {
  generateOAuthState,
  getLinkedInAuthUrl
} from '@/lib/linkedin/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate state for CSRF protection
    const state = generateOAuthState()

    // Build redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`

    // Store state in secure httpOnly cookie
    const cookieStore = cookies()

    cookieStore.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/'
    })

    // Generate LinkedIn authorization URL
    const authUrl = getLinkedInAuthUrl({
      state,
      redirectUri
    })

    // Redirect user to LinkedIn
    return NextResponse.redirect(authUrl)

  } catch (error: any) {
    console.error('LinkedIn OAuth init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize LinkedIn OAuth' },
      { status: 500 }
    )
  }
}
