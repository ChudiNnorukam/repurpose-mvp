import { NextRequest, NextResponse } from 'next/server'
import { getTwitterAuthUrl, generateCodeVerifier } from '@/lib/twitter'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    logger.info('[init-twitter] Request received')
    const body = await request.json()
    logger.info('[init-twitter] Request body:', body)
    const { userId } = body

    if (!userId) {
      logger.info('[init-twitter] Missing userId')
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    logger.info('[init-twitter] Processing for userId:', userId)

    // Generate PKCE code verifier (cryptographically secure)
    const codeVerifier = generateCodeVerifier()

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state and userId together (we'll verify both in callback)
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

    logger.info('[init-twitter] Success, returning authUrl')
    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    logger.error('[init-twitter] Error initiating Twitter OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}
