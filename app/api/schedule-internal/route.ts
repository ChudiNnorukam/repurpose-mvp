import { NextRequest, NextResponse } from "next/server"
import { schedulePostJob } from "@/lib/qstash"
import { getSupabaseAdmin } from "@/lib/supabase"

/**
 * Internal scheduling endpoint for n8n workflows
 * Requires Supabase service role key in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify service role authentication
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

    // Debug logging (remove after testing)
    console.log('[schedule-internal] Auth check:', {
      hasAuthHeader: !!authHeader,
      hasExpectedKey: !!expectedKey,
      authHeaderPrefix: authHeader?.substring(0, 20),
      expectedKeyPrefix: expectedKey?.substring(0, 20)
    })

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing Authorization header' },
        { status: 401 }
      )
    }

    if (!expectedKey) {
      console.error('[schedule-internal] SUPABASE_SERVICE_ROLE_KEY not set in environment!')
      return NextResponse.json(
        { error: 'Server Error', message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Extract Bearer token
    const token = authHeader.replace('Bearer ', '').trim()

    if (token !== expectedKey) {
      console.error('[schedule-internal] Token mismatch!', {
        receivedLength: token.length,
        expectedLength: expectedKey.length,
        receivedPrefix: token.substring(0, 30),
        expectedPrefix: expectedKey.substring(0, 30)
      })
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid service role key' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { postId, userId, platform, content, scheduledTime } = body

    if (!postId || !userId || !platform || !content || !scheduledTime) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required fields: postId, userId, platform, content, scheduledTime'
        },
        { status: 400 }
      )
    }

    // Schedule with QStash
    const result = await schedulePostJob({
      postId,
      userId,
      platform,
      content,
      scheduledTime: new Date(scheduledTime),
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Scheduling Failed',
          message: result.error || 'Failed to schedule post with QStash'
        },
        { status: 500 }
      )
    }

    // Update post in database
    const supabase = getSupabaseAdmin()
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({
        status: 'scheduled',
        qstash_message_id: result.messageId,
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Failed to update post status:', updateError)
      // Don't fail the request - QStash already scheduled
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      scheduledFor: scheduledTime,
      postId,
    })

  } catch (error: any) {
    console.error('Internal schedule error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
