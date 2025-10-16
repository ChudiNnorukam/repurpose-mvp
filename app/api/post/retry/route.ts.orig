import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Get the post using the authenticated user's session
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select(
        'id, user_id, status, scheduled_time, platform, adapted_content'
      )
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to retry this post' },
        { status: 403 }
      )
    }

    // Use service role client for database operations after verifying ownership
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabaseAdmin = getSupabaseAdmin()

    // Can only retry failed posts
    if (post.status !== 'failed') {
      return NextResponse.json(
        { error: 'Can only retry failed posts' },
        { status: 400 }
      )
    }

    // Reset status to scheduled
    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'scheduled',
        error_message: null,
      })
      .eq('id', postId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to retry post' },
        { status: 500 }
      )
    }

    // Re-schedule with QStash
    const { schedulePostJob } = await import('@/lib/qstash')

    try {
      const scheduledDate = new Date(post.scheduled_time)
      // If scheduled time is in the past, schedule for immediate execution
      if (scheduledDate < new Date()) {
        scheduledDate.setTime(Date.now() + 10000) // 10 seconds from now
      }

      await schedulePostJob(
        {
          postId: post.id,
          platform: post.platform,
          content: post.adapted_content,
          userId: user.id,
        },
        scheduledDate
      )
    } catch (qstashError) {
      console.error('Failed to re-schedule QStash job:', qstashError)
      // Rollback status
      await supabaseAdmin
        .from('posts')
        .update({ status: 'failed' })
        .eq('id', postId)

      return NextResponse.json(
        { error: 'Failed to schedule retry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Post retry scheduled',
    })
  } catch (error: any) {
    console.error('Error retrying post:', error)
    return NextResponse.json(
      { error: 'Failed to retry post', details: error.message },
      { status: 500 }
    )
  }
}
