import { TwitterApi } from 'twitter-api-v2'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { decrypt, encrypt } from '@/lib/crypto/encrypt'

/**
 * Get authenticated Twitter client for a specific account
 */
export async function getTwitterClient(accountId: string): Promise<TwitterApi> {
  const { data: account, error } = await supabaseAdmin
    .from('social_accounts')
    .select('access_token, refresh_token, platform')
    .eq('id', accountId)
    .eq('platform', 'twitter')
    .single()

  if (error || !account) {
    throw new Error(`Twitter account not found: ${error?.message}`)
  }

  const accessToken = decrypt(account.access_token)

  return new TwitterApi(accessToken)
}

interface TweetData {
  text: string
  mediaUrls?: string[]
}

interface PostThreadResult {
  success: boolean
  tweetIds: string[]
  tweetUrls: string[]
}

/**
 * Post a Twitter thread (multiple connected tweets)
 */
export async function postTwitterThread(
  accountId: string,
  tweets: TweetData[]
): Promise<PostThreadResult> {
  const client = await getTwitterClient(accountId)

  const tweetIds: string[] = []
  const tweetUrls: string[] = []
  let previousTweetId: string | undefined

  // Get account username for URL construction
  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('platform_username')
    .eq('id', accountId)
    .single()

  const username = account?.platform_username || ''

  for (const [index, tweet] of tweets.entries()) {
    try {
      const tweetData: any = { text: tweet.text }

      // Thread - reply to previous tweet
      if (previousTweetId) {
        tweetData.reply = { in_reply_to_tweet_id: previousTweetId }
      }

      // Add media if present
      if (tweet.mediaUrls?.length) {
        const mediaIds = await uploadMediaToTwitter(client, tweet.mediaUrls)
        tweetData.media = { media_ids: mediaIds }
      }

      const result = await client.v2.tweet(tweetData)
      previousTweetId = result.data.id
      tweetIds.push(result.data.id)

      if (username) {
        tweetUrls.push(`https://twitter.com/${username}/status/${result.data.id}`)
      }

      // Delay between tweets to avoid rate limits
      if (index < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error) {
      console.error(`Failed to post tweet ${index + 1}:`, error)
      throw new Error(`Thread posting failed at tweet ${index + 1}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { success: true, tweetIds, tweetUrls }
}

/**
 * Post a single tweet
 */
export async function postSingleTweet(
  accountId: string,
  text: string,
  mediaUrls?: string[]
): Promise<{ tweetId: string; tweetUrl: string }> {
  const client = await getTwitterClient(accountId)

  const tweetData: any = { text }

  if (mediaUrls?.length) {
    const mediaIds = await uploadMediaToTwitter(client, mediaUrls)
    tweetData.media = { media_ids: mediaIds }
  }

  const result = await client.v2.tweet(tweetData)

  const { data: account } = await supabaseAdmin
    .from('social_accounts')
    .select('platform_username')
    .eq('id', accountId)
    .single()

  const username = account?.platform_username || ''
  const tweetUrl = `https://twitter.com/${username}/status/${result.data.id}`

  return {
    tweetId: result.data.id,
    tweetUrl,
  }
}

/**
 * Upload media to Twitter
 */
async function uploadMediaToTwitter(
  client: TwitterApi,
  mediaUrls: string[]
): Promise<string[]> {
  const mediaIds: string[] = []

  for (const url of mediaUrls) {
    try {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()

      const mediaId = await client.v1.uploadMedia(Buffer.from(buffer), {
        mimeType: response.headers.get('content-type') || 'image/jpeg',
      })

      mediaIds.push(mediaId)
    } catch (error) {
      console.error(`Failed to upload media from ${url}:`, error)
    }
  }

  return mediaIds
}

interface TwitterMetrics {
  impressions: number
  likes: number
  retweets: number
  replies: number
  quotes: number
  bookmarks: number
}

/**
 * Fetch analytics for tweets
 */
export async function getTwitterAnalytics(
  accountId: string,
  tweetIds: string[]
): Promise<Record<string, TwitterMetrics>> {
  const client = await getTwitterClient(accountId)
  const analytics: Record<string, TwitterMetrics> = {}

  for (const tweetId of tweetIds) {
    try {
      const tweet = await client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'created_at'],
      })

      analytics[tweetId] = {
        impressions: tweet.data.public_metrics?.impression_count || 0,
        likes: tweet.data.public_metrics?.like_count || 0,
        retweets: tweet.data.public_metrics?.retweet_count || 0,
        replies: tweet.data.public_metrics?.reply_count || 0,
        quotes: tweet.data.public_metrics?.quote_count || 0,
        bookmarks: tweet.data.public_metrics?.bookmark_count || 0,
      }
    } catch (error) {
      console.error(`Failed to fetch analytics for tweet ${tweetId}:`, error)
    }
  }

  return analytics
}

/**
 * Verify Twitter account access
 */
export async function verifyTwitterAccount(accountId: string): Promise<boolean> {
  try {
    const client = await getTwitterClient(accountId)
    const user = await client.v2.me()
    return !!user.data?.id
  } catch {
    return false
  }
}

/**
 * Revoke Twitter token
 */
export async function revokeTwitterToken(accountId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('social_accounts')
    .update({ is_active: false })
    .eq('id', accountId)
    .eq('platform', 'twitter')

  if (error) {
    throw new Error(`Failed to revoke token: ${error.message}`)
  }
}
