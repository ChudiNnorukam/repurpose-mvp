import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInAccessToken, getLinkedInUser } from '@/lib/linkedin'
import { logger } from "@/lib/logger"

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

    // Use service role client to insert data directly
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Exchange code for access token (now includes refresh token)
    const { accessToken, refreshToken, expiresIn } = await getLinkedInAccessToken(code)

    // Get LinkedIn user info
    const linkedInUser = await getLinkedInUser(accessToken)

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Save to database with refresh token and expiration
    const { error: dbError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'linkedin',
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_at: expiresAt,
        account_username: linkedInUser.name,
        account_id: linkedInUser.id,
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      logger.error('Error saving LinkedIn account:', dbError)
      return NextResponse.redirect(
        new URL('/connections?error=save_failed', baseUrl)
      )
    }

    // Redirect to connections page with success
    return NextResponse.redirect(
      new URL('/connections?connected=linkedin', baseUrl)
    )
  } catch (error: any) {
    logger.error('LinkedIn OAuth callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.url
    return NextResponse.redirect(
      new URL(`/connections?error=${encodeURIComponent(error.message)}`, baseUrl)
    )
  }
}
