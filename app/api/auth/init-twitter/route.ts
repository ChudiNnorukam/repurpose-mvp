import { NextRequest, NextResponse } from 'next/server'
import { getTwitterAuthUrl } from '@/lib/twitter'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex')

    // Store state and userId together (we'll verify both in callback)
    const stateData = JSON.stringify({ state, userId })
    const encodedState = Buffer.from(stateData).toString('base64url')

    // Get Twitter authorization URL
    const authUrl = getTwitterAuthUrl(encodedState)

    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    console.error('Error initiating Twitter OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    )
  }
}
