import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Calculate optimal posting times based on historical data
 */
export async function calculateOptimalPostingTimes(
  userId: string,
  accountId: string,
  platform: 'twitter' | 'linkedin'
): Promise<
  Array<{
    dayOfWeek: number
    hour: number
    score: number
    confidence: number
  }>
> {
  // Get historical posting data
  const { data: history } = await supabaseAdmin
    .from('posting_schedule')
    .select(
      `
      id,
      posted_at,
      content_analytics (
        impressions,
        engagements,
        likes,
        comments,
        shares
      )
    `
    )
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .eq('status', 'posted')
    .order('posted_at', { ascending: false })
    .limit(100)

  if (!history || history.length < 10) {
    // Use industry defaults
    return getIndustryBestTimes(platform)
  }

  // Calculate performance by day/hour
  const timeSlots: Record<
    string,
    {
      totalEngagement: number
      totalImpressions: number
      count: number
    }
  > = {}

  history.forEach(post => {
    if (!post.posted_at) return

    const date = new Date(post.posted_at)
    const dayOfWeek = date.getDay()
    const hour = date.getHours()
    const key = `${dayOfWeek}-${hour}`

    if (!timeSlots[key]) {
      timeSlots[key] = {
        totalEngagement: 0,
        totalImpressions: 0,
        count: 0,
      }
    }

    const analytics = Array.isArray(post.content_analytics)
      ? post.content_analytics[0]
      : post.content_analytics

    if (analytics) {
      timeSlots[key].totalEngagement += analytics.engagements || 0
      timeSlots[key].totalImpressions += analytics.impressions || 0
      timeSlots[key].count += 1
    }
  })

  // Calculate scores
  const results = Object.entries(timeSlots).map(([key, data]) => {
    const [dayOfWeek, hour] = key.split('-').map(Number)
    const avgEngagement = data.totalEngagement / data.count
    const avgImpressions = data.totalImpressions / data.count
    const engagementRate =
      data.totalImpressions > 0
        ? (data.totalEngagement / data.totalImpressions) * 100
        : 0

    // Normalize score (0-1)
    const score = Math.min(engagementRate / 10, 1)

    // Confidence based on sample size
    const confidence = Math.min(data.count / 10, 1)

    return {
      dayOfWeek,
      hour,
      score,
      confidence,
    }
  })

  // Sort by score
  return results.sort((a, b) => b.score - a.score).slice(0, 20)
}

/**
 * Industry best times for posting
 */
function getIndustryBestTimes(
  platform: 'twitter' | 'linkedin'
): Array<{
  dayOfWeek: number
  hour: number
  score: number
  confidence: number
}> {
  const defaults = {
    twitter: [
      { dayOfWeek: 2, hour: 9, score: 0.85, confidence: 0.6 }, // Tuesday 9am
      { dayOfWeek: 2, hour: 12, score: 0.82, confidence: 0.6 }, // Tuesday 12pm
      { dayOfWeek: 3, hour: 9, score: 0.8, confidence: 0.6 }, // Wednesday 9am
      { dayOfWeek: 4, hour: 11, score: 0.78, confidence: 0.6 }, // Thursday 11am
      { dayOfWeek: 5, hour: 14, score: 0.75, confidence: 0.6 }, // Friday 2pm
    ],
    linkedin: [
      { dayOfWeek: 2, hour: 10, score: 0.88, confidence: 0.6 }, // Tuesday 10am
      { dayOfWeek: 3, hour: 10, score: 0.86, confidence: 0.6 }, // Wednesday 10am
      { dayOfWeek: 4, hour: 9, score: 0.84, confidence: 0.6 }, // Thursday 9am
      { dayOfWeek: 2, hour: 14, score: 0.8, confidence: 0.6 }, // Tuesday 2pm
      { dayOfWeek: 3, hour: 15, score: 0.78, confidence: 0.6 }, // Wednesday 3pm
    ],
  }

  return defaults[platform]
}

/**
 * Suggest next optimal posting time
 */
export async function suggestNextPostingTime(
  userId: string,
  accountId: string,
  platform: 'twitter' | 'linkedin'
): Promise<Date> {
  const optimalTimes = await calculateOptimalPostingTimes(
    userId,
    accountId,
    platform
  )

  const now = new Date()
  const currentDay = now.getDay()
  const currentHour = now.getHours()

  // Find next available optimal time
  for (const slot of optimalTimes) {
    let daysToAdd = 0

    if (slot.dayOfWeek > currentDay) {
      daysToAdd = slot.dayOfWeek - currentDay
    } else if (slot.dayOfWeek < currentDay) {
      daysToAdd = 7 - (currentDay - slot.dayOfWeek)
    } else {
      // Same day - check if hour has passed
      if (slot.hour > currentHour) {
        daysToAdd = 0
      } else {
        daysToAdd = 7
      }
    }

    const suggestedTime = new Date(now)
    suggestedTime.setDate(suggestedTime.getDate() + daysToAdd)
    suggestedTime.setHours(slot.hour, 0, 0, 0)

    if (suggestedTime > now) {
      return suggestedTime
    }
  }

  // Fallback to tomorrow at 10am
  const fallback = new Date(now)
  fallback.setDate(fallback.getDate() + 1)
  fallback.setHours(10, 0, 0, 0)
  return fallback
}

/**
 * Update optimal posting times based on new post analytics
 */
export async function updateOptimalTimes(
  userId: string,
  accountId: string,
  platform: 'twitter' | 'linkedin',
  postedAt: Date,
  analytics: {
    impressions: number
    engagements: number
    likes?: number
    comments?: number
    shares?: number
  }
): Promise<void> {
  const dayOfWeek = postedAt.getDay()
  const hour = postedAt.getHours()

  const engagementRate =
    analytics.impressions > 0
      ? (analytics.engagements / analytics.impressions) * 100
      : 0

  // Check if time slot exists
  const { data: existing } = await supabaseAdmin
    .from('optimal_posting_times')
    .select('*')
    .eq('user_id', userId)
    .eq('account_id', accountId)
    .eq('platform', platform)
    .eq('day_of_week', dayOfWeek)
    .eq('hour_of_day', hour)
    .single()

  if (existing) {
    // Update running average
    const newCount = existing.posts_count + 1
    const newAvgEngagement =
      (existing.avg_engagement_rate * existing.posts_count + engagementRate) /
      newCount
    const newAvgImpressions =
      (existing.avg_impressions * existing.posts_count +
        analytics.impressions) /
      newCount

    await supabaseAdmin
      .from('optimal_posting_times')
      .update({
        avg_engagement_rate: newAvgEngagement,
        avg_impressions: newAvgImpressions,
        posts_count: newCount,
        confidence: Math.min(newCount / 10, 1),
        last_updated: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    // Create new entry
    await supabaseAdmin.from('optimal_posting_times').insert({
      user_id: userId,
      account_id: accountId,
      platform,
      day_of_week: dayOfWeek,
      hour_of_day: hour,
      avg_engagement_rate: engagementRate,
      avg_impressions: analytics.impressions,
      posts_count: 1,
      confidence: 0.1,
    })
  }
}
