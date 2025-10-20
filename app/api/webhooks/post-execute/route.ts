import { supabaseAdmin } from '@/lib/supabase/admin'
import { postTwitterThread, postSingleTweet } from '@/lib/twitter/client'
import { postToLinkedInProfile, postLinkedInCarousel } from '@/lib/linkedin/client'
import { verifyQStashSignature } from '@/lib/qstash/schedule'
import { collectPostAnalytics } from '@/lib/analytics/collector'

/**
 * QStash webhook for posting scheduled content
 */
export async function POST(request: Request) {
  try {
    // Verify QStash signature
    const signature = request.headers.get('upstash-signature') || ''
    const body = await request.text()

    const isValid = verifyQStashSignature(
      signature,
      body,
      process.env.QSTASH_CURRENT_SIGNING_KEY || ''
    )

    if (!isValid) {
      console.error('Invalid QStash signature')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { scheduleId, accountId, platform, contentType, contentData } = payload

    // Get schedule entry
    const { data: schedule } = await supabaseAdmin
      .from('posting_schedule')
      .select('*')
      .eq('id', scheduleId)
      .single()

    if (!schedule) {
      return Response.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Check if already cancelled
    if (schedule.status === 'cancelled') {
      return Response.json({ success: true, skipped: true })
    }

    // Update status to posting
    await supabaseAdmin
      .from('posting_schedule')
      .update({ status: 'posting' })
      .eq('id', scheduleId)

    let postResult: any

    try {
      // Post to appropriate platform
      if (platform === 'twitter') {
        if (contentType === 'twitter_thread') {
          postResult = await postTwitterThread(
            accountId,
            contentData.tweets.map((t: any) => ({
              text: t.text,
              mediaUrls: t.mediaUrls,
            }))
          )
        } else if (contentType === 'twitter_single') {
          postResult = await postSingleTweet(accountId, contentData.text)
        }
      } else if (platform === 'linkedin') {
        if (contentType === 'linkedin_post') {
          postResult = await postToLinkedInProfile(accountId, {
            text: contentData.post,
            mediaUrls: contentData.mediaUrls,
            articleLink: contentData.articleLink,
          })
        } else if (contentType === 'linkedin_carousel') {
          // For carousel, generate PDF first (placeholder)
          postResult = await postLinkedInCarousel(
            accountId,
            contentData.pdf_url,
            contentData.caption
          )
        }
      }

      // Update schedule with success
      await supabaseAdmin
        .from('posting_schedule')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          platform_post_id: postResult.tweetId || postResult.postId,
          platform_post_url: postResult.tweetUrl || postResult.postUrl,
          thread_tweet_ids:
            postResult.tweetIds && postResult.tweetIds.length > 0
              ? postResult.tweetIds.map((id: string, idx: number) => ({
                  tweet_id: id,
                  tweet_url: postResult.tweetUrls[idx],
                  posted_at: new Date().toISOString(),
                }))
              : null,
        })
        .eq('id', scheduleId)

      // Update content status
      await supabaseAdmin
        .from('repurposed_content')
        .update({ status: 'posted' })
        .eq('id', schedule.content_id)

      // Trigger analytics collection after a delay
      setTimeout(() => {
        collectPostAnalytics(scheduleId).catch(console.error)
      }, 5000)

      return Response.json({ success: true, posted: true })
    } catch (postError) {
      // Handle posting failure with retry logic
      const retryCount = schedule.retry_count || 0
      const maxRetries = schedule.max_retries || 3

      if (retryCount < maxRetries) {
        // Reschedule for retry (exponential backoff)
        const retryDelay = Math.pow(2, retryCount) * 60 * 1000 // 1, 2, 4 minutes
        const newScheduledFor = new Date(Date.now() + retryDelay)

        await supabaseAdmin
          .from('posting_schedule')
          .update({
            status: 'scheduled',
            retry_count: retryCount + 1,
            scheduled_for: newScheduledFor.toISOString(),
            last_error:
              postError instanceof Error ? postError.message : String(postError),
          })
          .eq('id', scheduleId)

        return Response.json({
          success: true,
          retrying: true,
          retryCount: retryCount + 1,
        })
      } else {
        // Max retries exceeded
        await supabaseAdmin
          .from('posting_schedule')
          .update({
            status: 'failed',
            last_error:
              postError instanceof Error ? postError.message : String(postError),
          })
          .eq('id', scheduleId)

        return Response.json({ error: 'Max retries exceeded' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Webhook failed' },
      { status: 500 }
    )
  }
}
