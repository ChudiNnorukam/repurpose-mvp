import { NextRequest, NextResponse } from 'next/server'

/**
 * Cancel a scheduled post in QStash
 * Used when user edits or deletes a scheduled post
 */
export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    const qstashToken = process.env.QSTASH_TOKEN
    if (!qstashToken) {
      console.error('QSTASH_TOKEN not configured')
      return NextResponse.json(
        { error: 'Scheduling service not configured' },
        { status: 500 }
      )
    }

    // Delete the message from QStash
    const response = await fetch(
      `https://qstash.upstash.io/v2/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${qstashToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('QStash cancel error:', errorText)

      // If message not found (404), consider it already canceled
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          message: 'Message already canceled or not found'
        })
      }

      return NextResponse.json(
        { error: 'Failed to cancel scheduled post' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post schedule canceled successfully'
    })
  } catch (error: any) {
    console.error('Error canceling schedule:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
