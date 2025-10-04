import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Platform = 'twitter' | 'linkedin' | 'instagram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, content, originalContent, scheduledTime, userId } = body

    // Validate userId is provided
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Use service role client for database operations
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabaseClient = getSupabaseAdmin()

    // Validate input
    if (!platform || !content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Parse the scheduled time
    // datetime-local sends "YYYY-MM-DDTHH:mm" format (no timezone)
    // When creating Date from this, it's interpreted as local time in browser
    // but as UTC on server. We need to handle this properly.
    const scheduledDate = new Date(scheduledTime)
    const now = new Date()

    // Very lenient validation - allow scheduling up to 5 minutes in the past
    // This handles timezone issues and clock skew between client/server
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)

    if (scheduledDate < fiveMinutesAgo) {
      console.log('Schedule time validation failed:', {
        scheduledTime,
        scheduledDate: scheduledDate.toISOString(),
        now: now.toISOString(),
        diff: (scheduledDate.getTime() - now.getTime()) / 1000 + ' seconds'
      })
      return NextResponse.json(
        { error: `Scheduled time must be in the future. You selected: ${scheduledDate.toISOString()}, current time: ${now.toISOString()}` },
        { status: 400 }
      )
    }

    // Save to database
    const { data: post, error: insertError } = await supabaseClient
      .from('posts')
      .insert({
        user_id: userId,
        platform: platform as Platform,
        original_content: originalContent || content,
        adapted_content: content,
        scheduled_time: scheduledTime,
        status: 'scheduled',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting post:', insertError)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    // Schedule QStash job to post at the scheduled time
    try {
      const { schedulePostJob } = await import('@/lib/qstash')

      const messageId = await schedulePostJob(
        {
          postId: post.id,
          platform: platform as Platform,
          content,
          userId: userId,
        },
        scheduledDate
      )

      console.log(`✅ QStash job scheduled: ${messageId} for post ${post.id}`)
    } catch (qstashError: any) {
      console.error('❌ Failed to schedule QStash job:', qstashError)

      // Update post to failed status since QStash scheduling failed
      await supabaseClient
        .from('posts')
        .update({
          status: 'failed',
          error_message: `QStash scheduling failed: ${qstashError.message}`,
        })
        .eq('id', post.id)

      // Return error to user so they know it failed
      return NextResponse.json(
        { error: `Failed to schedule QStash job: ${qstashError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post,
      message: 'Post scheduled successfully',
    })
  } catch (error: any) {
    console.error('Error in /api/schedule:', error)

    return NextResponse.json(
      {
        error: 'Failed to schedule post. Please try again.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
