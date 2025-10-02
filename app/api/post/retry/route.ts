import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json()

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and User ID required' },
        { status: 400 }
      )
    }

    // Use service role client for database operations
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const supabase = getSupabaseAdmin()

    // Get the post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Can only retry failed posts
    if (post.status !== 'failed') {
      return NextResponse.json(
        { error: 'Can only retry failed posts' },
        { status: 400 }
      )
    }

    // Reset status to scheduled
    const { error: updateError } = await supabase
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
          userId: userId,
        },
        scheduledDate
      )
    } catch (qstashError) {
      console.error('Failed to re-schedule QStash job:', qstashError)
      // Rollback status
      await supabase
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
