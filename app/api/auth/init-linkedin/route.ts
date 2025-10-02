import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInAuthUrl } from '@/lib/linkedin'
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

    // Store state and userId together
    const stateData = JSON.stringify({ state, userId })
    const encodedState = Buffer.from(stateData).toString('base64url')

    // Get LinkedIn authorization URL
    const authUrl = getLinkedInAuthUrl(encodedState)

    return NextResponse.json({ authUrl, state: encodedState })
  } catch (error) {
    console.error('Error initiating LinkedIn OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn OAuth' },
      { status: 500 }
    )
  }
}
