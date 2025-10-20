import { createClient } from '@/lib/supabase-client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { schedulePost } from '@/lib/qstash/schedule'
import { suggestNextPostingTime } from '@/lib/scheduling/optimal-times'

/**
 * Schedule a post for later
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentId, accountId, scheduledFor, timezone = 'UTC' } =
      await request.json()

    // Get content details
    const { data: content } = await supabaseAdmin
      .from('repurposed_content')
      .select('*')
      .eq('id', contentId)
      .eq('user_id', user.id)
      .single()

    if (!content) {
      return Response.json({ error: 'Content not found' }, { status: 404 })
    }

    // Check daily posting limit
    const { data: account } = await supabaseAdmin
      .from('social_accounts')
      .select('daily_post_limit, posts_today, limit_resets_at')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (!account) {
      return Response.json({ error: 'Account not found' }, { status: 404 })
    }

    if (account.posts_today >= account.daily_post_limit) {
      return Response.json(
        {
          error: 'Daily posting limit reached',
          limit: account.daily_post_limit,
          resetsAt: account.limit_resets_at,
        },
        { status: 429 }
      )
    }

    // Create schedule entry
    const { data: schedule, error } = await supabaseAdmin
      .from('posting_schedule')
      .insert({
        user_id: user.id,
        content_id: contentId,
        account_id: accountId,
        scheduled_for: scheduledFor,
        timezone,
        status: 'scheduled',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create schedule: ${error.message}`)
    }

    // Schedule with QStash
    await schedulePost(schedule.id, new Date(scheduledFor), {
      scheduleId: schedule.id,
      accountId,
      platform: content.platform,
      contentType: content.content_type,
      contentData: content.content_data,
    })

    // Update content status
    await supabaseAdmin
      .from('repurposed_content')
      .update({ status: 'scheduled' })
      .eq('id', contentId)

    return Response.json({
      success: true,
      scheduleId: schedule.id,
      scheduledFor,
    })
  } catch (error) {
    console.error('Scheduling error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Scheduling failed' },
      { status: 500 }
    )
  }
}

/**
 * Get scheduled posts
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'scheduled'

    const { data: scheduled } = await supabaseAdmin
      .from('posting_schedule')
      .select(
        `
        *,
        repurposed_content (*),
        social_accounts (platform, platform_username)
      `
      )
      .eq('user_id', user.id)
      .eq('status', status)
      .order('scheduled_for', { ascending: true })

    return Response.json({ scheduled })
  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch' },
      { status: 500 }
    )
  }
}

/**
 * Cancel scheduled post
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scheduleId } = await request.json()

    // Update status to cancelled
    const { error } = await supabaseAdmin
      .from('posting_schedule')
      .update({ status: 'cancelled' })
      .eq('id', scheduleId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to cancel: ${error.message}`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Cancellation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Cancellation failed' },
      { status: 500 }
    )
  }
}
