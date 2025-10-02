import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTwitterAccessToken, getTwitterUser } from '@/lib/twitter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_parameters', request.url)
      )
    }

    // Get cookies and verify state
    const cookieStore = await cookies()
    const storedState = cookieStore.get('twitter_oauth_state')?.value

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      )
    }

    // Create Supabase client
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange code for access token
    const { accessToken, refreshToken } = await getTwitterAccessToken(code)

    // Get Twitter user info
    const twitterUser = await getTwitterUser(accessToken)

    // Save to database
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
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
        new URL('/dashboard?error=save_failed', request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete('twitter_oauth_state')

    // Redirect to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?connected=twitter', request.url)
    )
  } catch (error: any) {
    console.error('Twitter OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
