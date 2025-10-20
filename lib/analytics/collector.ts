import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTwitterAnalytics } from '@/lib/twitter/client'
import { getLinkedInAnalytics } from '@/lib/linkedin/client'
import { updateOptimalTimes } from '@/lib/scheduling/optimal-times'

/**
 * Collect analytics for a posted item
 */
export async function collectPostAnalytics(scheduleId: string): Promise<void> {
  const { data: schedule } = await supabaseAdmin
    .from('posting_schedule')
    .select(
      `
      *,
      social_accounts (platform, id)
    `
    )
    .eq('id', scheduleId)
    .single()

  if (!schedule || schedule.status !== 'posted') {
    return
  }

  let analytics: any = {}

  try {
    if (schedule.social_accounts.platform === 'twitter') {
      // For Twitter threads, get analytics for all tweets
      const tweetIds = schedule.thread_tweet_ids
        ? schedule.thread_tweet_ids.map((t: any) => t.tweet_id)
        : [schedule.platform_post_id]

      const tweetAnalytics = await getTwitterAnalytics(
        schedule.social_accounts.id,
        tweetIds
      )

      // Aggregate thread analytics
      const totals = Object.values(tweetAnalytics).reduce(
        (acc: any, curr: any) => ({
          impressions: acc.impressions + (curr.impressions || 0),
          likes: acc.likes + (curr.likes || 0),
          retweets: acc.retweets + (curr.retweets || 0),
          replies: acc.replies + (curr.replies || 0),
          quotes: acc.quotes + (curr.quotes || 0),
          bookmarks: acc.bookmarks + (curr.bookmarks || 0),
        }),
        {
          impressions: 0,
          likes: 0,
          retweets: 0,
          replies: 0,
          quotes: 0,
          bookmarks: 0,
        }
      )

      analytics = totals
    } else if (schedule.social_accounts.platform === 'linkedin') {
      analytics = await getLinkedInAnalytics(
        schedule.social_accounts.id,
        schedule.platform_post_id
      )
    }

    // Store in database
    const today = new Date().toISOString().split('T')[0]

    await supabaseAdmin.from('content_analytics').upsert(
      {
        schedule_id: scheduleId,
        date: today,
        platform: schedule.social_accounts.platform,
        impressions: analytics.impressions || 0,
        engagements:
          (analytics.likes || 0) +
          (analytics.comments || 0) +
          (analytics.shares || 0) +
          (analytics.retweets || 0) +
          (analytics.quotes || 0),
        likes: analytics.likes || 0,
        comments: analytics.comments || analytics.replies || 0,
        shares: analytics.shares || analytics.retweets || 0,
        saves: analytics.saves || analytics.bookmarks || 0,
        retweets: analytics.retweets || 0,
        quote_tweets: analytics.quotes || 0,
        engagement_rate:
          analytics.impressions > 0
            ? (
                ((analytics.likes || 0) +
                  (analytics.comments || 0) +
                  (analytics.shares || 0)) /
                analytics.impressions
              ).toFixed(2)
            : '0',
      },
      {
        onConflict: 'schedule_id,date',
      }
    )

    // Update optimal posting times
    if (schedule.posted_at) {
      await updateOptimalTimes(
        schedule.user_id,
        schedule.account_id,
        schedule.social_accounts.platform,
        new Date(schedule.posted_at),
        {
          impressions: analytics.impressions || 0,
          engagements:
            (analytics.likes || 0) +
            (analytics.comments || 0) +
            (analytics.shares || 0),
          likes: analytics.likes,
          comments: analytics.comments || analytics.replies,
          shares: analytics.shares || analytics.retweets,
        }
      )
    }
  } catch (error) {
    console.error('Failed to collect analytics:', error)
  }
}

/**
 * Collect analytics for all recent posts
 */
export async function collectAnalyticsForRecentPosts(): Promise<void> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const { data: recentPosts } = await supabaseAdmin
    .from('posting_schedule')
    .select('id')
    .eq('status', 'posted')
    .gte('posted_at', oneWeekAgo.toISOString())

  for (const post of recentPosts || []) {
    await collectPostAnalytics(post.id)
  }
}

/**
 * Get analytics summary for a user
 */
export async function getAnalyticsSummary(
  userId: string,
  platform: 'twitter' | 'linkedin',
  days: number = 30
): Promise<{
  totalPosts: number
  totalImpressions: number
  totalEngagements: number
  avgEngagementRate: number
  topPost: any
}> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data: analytics } = await supabaseAdmin
    .from('content_analytics')
    .select(
      `
      *,
      posting_schedule (id, platform_post_url, content_id)
    `
    )
    .eq('platform', platform)
    .gte('date', startDate)

  if (!analytics || analytics.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      avgEngagementRate: 0,
      topPost: null,
    }
  }

  const totalImpressions = analytics.reduce(
    (sum, a) => sum + (a.impressions || 0),
    0
  )
  const totalEngagements = analytics.reduce(
    (sum, a) => sum + (a.engagements || 0),
    0
  )
  const avgEngagementRate =
    totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0

  // Find top post
  const topPost = analytics.reduce((max, a) => {
    return (a.engagements || 0) > (max.engagements || 0) ? a : max
  })

  return {
    totalPosts: analytics.length,
    totalImpressions,
    totalEngagements,
    avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    topPost,
  }
}
