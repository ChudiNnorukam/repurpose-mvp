import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInAuthUrl } from '@/lib/linkedin'
import { randomBytes } from 'crypto'
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    logger.info('[init-linkedin] Request received')
    const body = await request.json()
    logger.info('[init-linkedin] Request body:', body)
    const { userId } = body

    if (!userId) {
      logger.info('[init-linkedin] Missing userId')
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    logger.info('[init-linkedin] Processing for userId:', userId)

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state and userId together
    const stateData = JSON.stringify({ state, userId })
    const encodedState = Buffer.from(stateData).toString('base64url')

    // Get LinkedIn authorization URL
    const authUrl = getLinkedInAuthUrl(encodedState)

    logger.info('[init-linkedin] Success, returning authUrl')
    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    logger.error('[init-linkedin] Error initiating LinkedIn OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    )
  }
}
