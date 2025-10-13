import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Bulk operations on posts
 * Supports: delete, reschedule, duplicate, cancel
 */
export async function POST(req: NextRequest) {
  try {
    const { action, postIds, userId, scheduledTime } = await req.json()

    if (!action || !postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: action and postIds array required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 401 }
      )
    }

    let result

    switch (action) {
      case 'delete':
        result = await bulkDelete(postIds, userId)
        break

      case 'reschedule':
        if (!scheduledTime) {
          return NextResponse.json(
            { error: 'scheduledTime is required for reschedule action' },
            { status: 400 }
          )
        }
        result = await bulkReschedule(postIds, userId, scheduledTime)
        break

      case 'duplicate':
        result = await bulkDuplicate(postIds, userId)
        break

      case 'cancel':
        result = await bulkCancel(postIds, userId)
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Bulk delete posts
 */
async function bulkDelete(postIds: string[], userId: string) {
  // First, get posts to cancel QStash messages
  const { data: posts } = await supabase
    .from('posts')
    .select('id, qstash_message_id')
    .in('id', postIds)
    .eq('user_id', userId)

  if (!posts || posts.length === 0) {
    return { success: false, error: 'No posts found or access denied' }
  }

  // Cancel QStash messages for scheduled posts
  const qstashToken = process.env.QSTASH_TOKEN
  if (qstashToken) {
    const cancelPromises = posts
      .filter(p => p.qstash_message_id)
      .map(p =>
        fetch(`https://qstash.upstash.io/v2/messages/${p.qstash_message_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${qstashToken}` }
        }).catch(err => console.error(`Failed to cancel QStash message ${p.qstash_message_id}:`, err))
      )

    await Promise.allSettled(cancelPromises)
  }

  // Delete posts from database
  const { error, count } = await supabase
    .from('posts')
    .delete()
    .in('id', postIds)
    .eq('user_id', userId)

  if (error) {
    console.error('Bulk delete error:', error)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    deletedCount: count || 0,
    message: `Successfully deleted ${count || 0} post(s)`
  }
}

/**
 * Bulk reschedule posts
 */
async function bulkReschedule(postIds: string[], userId: string, newScheduledTime: string) {
  // Get posts that need rescheduling
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .in('id', postIds)
    .eq('user_id', userId)
    .eq('status', 'scheduled')

  if (!posts || posts.length === 0) {
    return { success: false, error: 'No scheduled posts found or access denied' }
  }

  const qstashToken = process.env.QSTASH_TOKEN
  const qstashUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://repurpose-orpin.vercel.app'

  // Cancel old QStash messages and create new ones
  const reschedulePromises = posts.map(async (post) => {
    // Cancel old QStash message
    if (post.qstash_message_id && qstashToken) {
      await fetch(`https://qstash.upstash.io/v2/messages/${post.qstash_message_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${qstashToken}` }
      }).catch(err => console.error('Failed to cancel old QStash message:', err))
    }

    // Create new QStash message
    let newQstashMessageId = null
    if (qstashToken) {
      try {
        const notBefore = Math.floor(new Date(newScheduledTime).getTime() / 1000)
        const response = await fetch('https://qstash.upstash.io/v2/publish/' + encodeURIComponent(`${qstashUrl}/api/post/execute`), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${qstashToken}`,
            'Content-Type': 'application/json',
            'Upstash-Not-Before': notBefore.toString()
          },
          body: JSON.stringify({
            postId: post.id,
            platform: post.platform,
            content: post.adapted_content,
            userId: post.user_id
          })
        })

        if (response.ok) {
          const data = await response.json()
          newQstashMessageId = data.messageId
        }
      } catch (error) {
        console.error('Failed to create new QStash message:', error)
      }
    }

    // Update post in database
    await supabase
      .from('posts')
      .update({
        scheduled_time: newScheduledTime,
        qstash_message_id: newQstashMessageId,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
  })

  await Promise.allSettled(reschedulePromises)

  return {
    success: true,
    rescheduledCount: posts.length,
    message: `Successfully rescheduled ${posts.length} post(s)`,
    newScheduledTime
  }
}

/**
 * Bulk duplicate posts
 */
async function bulkDuplicate(postIds: string[], userId: string) {
  // Get posts to duplicate
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .in('id', postIds)
    .eq('user_id', userId)

  if (!posts || posts.length === 0) {
    return { success: false, error: 'No posts found or access denied' }
  }

  // Create duplicates
  const duplicates = posts.map(post => ({
    user_id: post.user_id,
    original_content: post.original_content,
    platform: post.platform,
    adapted_content: post.adapted_content,
    tone: post.tone,
    status: 'draft',
    is_draft: true,
    parent_post_id: post.id,
    scheduled_time: null,
    qstash_message_id: null
  }))

  const { data: newPosts, error } = await supabase
    .from('posts')
    .insert(duplicates)
    .select()

  if (error) {
    console.error('Bulk duplicate error:', error)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    duplicatedCount: newPosts?.length || 0,
    message: `Successfully duplicated ${newPosts?.length || 0} post(s) as drafts`,
    newPosts
  }
}

/**
 * Bulk cancel scheduled posts
 * Cancels QStash messages and converts posts to drafts
 */
async function bulkCancel(postIds: string[], userId: string) {
  // Get scheduled posts to cancel
  const { data: posts } = await supabase
    .from('posts')
    .select('id, qstash_message_id, status')
    .in('id', postIds)
    .eq('user_id', userId)
    .eq('status', 'scheduled')

  if (!posts || posts.length === 0) {
    return { success: false, error: 'No scheduled posts found or access denied' }
  }

  // Cancel QStash messages
  const qstashToken = process.env.QSTASH_TOKEN
  if (qstashToken) {
    const cancelPromises = posts
      .filter(p => p.qstash_message_id)
      .map(p =>
        fetch(`https://qstash.upstash.io/v2/messages/${p.qstash_message_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${qstashToken}` }
        }).catch(err => console.error(`Failed to cancel QStash message ${p.qstash_message_id}:`, err))
      )

    await Promise.allSettled(cancelPromises)
  }

  // Update posts to draft status
  const { error, count } = await supabase
    .from('posts')
    .update({
      status: 'draft',
      is_draft: true,
      scheduled_time: null,
      qstash_message_id: null,
      updated_at: new Date().toISOString()
    })
    .in('id', postIds)
    .eq('user_id', userId)
    .eq('status', 'scheduled')

  if (error) {
    console.error('Bulk cancel error:', error)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    canceledCount: count || 0,
    message: `Successfully canceled ${count || 0} scheduled post(s) and converted to drafts`
  }
}
