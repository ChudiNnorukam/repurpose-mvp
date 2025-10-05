import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTwitterAccessToken, getTwitterUser } from '@/lib/twitter'

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const encodedState = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/connections?error=${encodeURIComponent(error)}`, baseUrl)
      )
    }

    if (!code || !encodedState) {
      return NextResponse.redirect(
        new URL('/connections?error=missing_parameters', baseUrl)
      )
    }

    // Decode state to get userId
    let userId: string
    try {
      const stateData = JSON.parse(Buffer.from(encodedState, 'base64url').toString())
      userId = stateData.userId
      if (!userId) throw new Error('Missing userId in state')
    } catch (e) {
      return NextResponse.redirect(
        new URL('/connections?error=invalid_state', baseUrl)
      )
    }

    // Use service role client to insert data directly (we already have userId from state)
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Retrieve code verifier from cookie
    const cookieStore = await cookies()
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value

    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/connections?error=missing_code_verifier', baseUrl)
      )
    }

    // Exchange code for access token using PKCE
    const { accessToken, refreshToken } = await getTwitterAccessToken(code, codeVerifier)

    // Delete the code verifier cookie (one-time use)
    cookieStore.delete('twitter_code_verifier')

    // Get Twitter user info
    const twitterUser = await getTwitterUser(accessToken)

    // Save to database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'twitter',
        access_token: accessToken,
        refresh_token: refreshToken,
        account_username: twitterUser.username,
        account_id: twitterUser.id,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Error saving Twitter account:', dbError)
      return NextResponse.redirect(
        new URL('/connections?error=save_failed', baseUrl)
      )
    }

    // Redirect to connections page with success
    return NextResponse.redirect(
      new URL('/connections?connected=twitter', baseUrl)
    )
  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}
