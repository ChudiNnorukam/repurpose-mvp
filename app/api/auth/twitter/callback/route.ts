/**
 * Twitter OAuth Callback Route
 *
 * GET /api/auth/twitter/callback
 *
 * Handles the Twitter OAuth callback:
 * 1. Verifies state (CSRF protection)
 * 2. Exchanges authorization code for access token
 * 3. Fetches Twitter user info
 * 4. Stores encrypted tokens in database
 * 5. Redirects to success page
 *
 * Called by Twitter after user authorizes the app
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-client'
import {
  exchangeTwitterCode,
  getTwitterUser,
  storeTwitterAccount
} from '@/lib/twitter/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    // Check if user is authenticated
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=unauthorized`
      )
    }

    // Get OAuth parameters from URL
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Twitter OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=twitter_${error}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=missing_params`
      )
    }

    // Retrieve stored values from cookies
    const cookieStore = cookies()
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value
    const storedState = cookieStore.get('twitter_oauth_state')?.value

    if (!codeVerifier || !storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=session_expired`
      )
    }

    // Verify state (CSRF protection)
    if (state !== storedState) {
      console.error('State mismatch:', { received: state, expected: storedState })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=invalid_state`
      )
    }

    // Clear cookies (they're one-time use)
    cookieStore.delete('twitter_code_verifier')
    cookieStore.delete('twitter_oauth_state')

    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

    const tokenData = await exchangeTwitterCode({
      code,
      codeVerifier,
      redirectUri
    })

    // Fetch Twitter user info
    const twitterUser = await getTwitterUser(tokenData.accessToken)

    // Store account in database (with encrypted tokens)
    await storeTwitterAccount({
      userId: user.id,
      twitterUser,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      scopes: tokenData.scope.split(' ')
    })

    // Success! Redirect to connections page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?success=twitter_connected&username=${twitterUser.username}`
    )

  } catch (error: any) {
    console.error('Twitter OAuth callback error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })

    // Categorize errors for user-friendly messages
    const ERROR_MESSAGES: Record<string, string> = {
      'invalid_grant': 'Authorization code expired. Please try connecting again.',
      'invalid_client': 'App configuration error. Please contact support.',
      'ECONNREFUSED': 'Could not connect to Twitter. Please try again.',
      'ETIMEDOUT': 'Request timed out. Please try again.',
      'Failed to fetch Twitter user': 'Could not get your Twitter information. Please try again.',
      'Failed to save Twitter account': 'Could not save your account. Please try again.'
    }

    const userMessage = ERROR_MESSAGES[error.code]
      || ERROR_MESSAGES[error.message]
      || 'Connection failed. Please try again.'

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/connections?error=twitter_failed&message=${encodeURIComponent(userMessage)}`
    )
  }
}
