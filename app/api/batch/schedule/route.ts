import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { schedulePostJob } from '@/lib/qstash'
import { ErrorCode, ErrorResponses, createErrorResponse } from '@/lib/api/errors'
import { apiRateLimiter, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { PLATFORM_LIMITS } from '@/lib/constants'

type Platform = 'twitter' | 'linkedin'

interface BatchPost {
  id: string
  platform: Platform
  content: string
  scheduledTime: string
  topic?: string
}

function attachTraceId(response: NextResponse, traceId: string) {
  response.headers.set('x-trace-id', traceId)
  return response
}

export async function POST(request: NextRequest) {
  const traceId = randomUUID()

  try {
    // Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized batch schedule attempt', { traceId, authError })
      return attachTraceId(
        ErrorResponses.unauthorized('You must be logged in to schedule posts'),
        traceId
      )
    }

    // Rate limiting
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', {
        traceId,
        userId: user.id,
        rateLimitResult,
      })
      const response = NextResponse.json(
        {
          error: `Rate limit exceeded. You can schedule ${rateLimitResult.limit} batches per minute.`,
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      )
      return attachTraceId(response, traceId)
    }

    // Parse request body
    const body = await request.json()
    const { posts, userId } = body

    // Validate userId
    if (userId !== user.id) {
      logger.warn('User ID mismatch', {
        traceId,
        authenticated: user.id,
        provided: userId,
      })
      return attachTraceId(
        createErrorResponse(
          'User ID mismatch. Please refresh your session.',
          ErrorCode.UNAUTHORIZED,
          403,
          `Authenticated: ${user.id}, Provided: ${userId}`,
          'userId'
        ),
        traceId
      )
    }

    // Validate posts array
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return attachTraceId(
        createErrorResponse(
          'No posts provided to schedule',
          ErrorCode.INVALID_INPUT,
          400,
          undefined,
          'posts'
        ),
        traceId
      )
    }

    if (posts.length > 200) {
      return attachTraceId(
        createErrorResponse(
          'Cannot schedule more than 200 posts at once',
          ErrorCode.INVALID_INPUT,
          400,
          `Provided: ${posts.length}`,
          'posts'
        ),
        traceId
      )
    }

    logger.info('Starting batch scheduling', {
      traceId,
      userId: user.id,
      postCount: posts.length,
    })

    const supabaseAdmin = getSupabaseAdmin()
    const scheduledPosts: string[] = []
    const failedPosts: Array<{ post: BatchPost; error: string }> = []

    // Process each post
    for (const post of posts as BatchPost[]) {
      try {
        // Validate post structure
        if (!post.platform || !post.content || !post.scheduledTime) {
          failedPosts.push({
            post,
            error: 'Missing required fields (platform, content, or scheduledTime)',
          })
          continue
        }

        // Validate platform
        if (!['twitter', 'linkedin'].includes(post.platform)) {
          failedPosts.push({
            post,
            error: `Invalid platform: ${post.platform}`,
          })
          continue
        }

        // Validate content length
        const platformKey = post.platform as keyof typeof PLATFORM_LIMITS
        const platformLimits = PLATFORM_LIMITS[platformKey]
        if (platformLimits && post.content.length > platformLimits.maxLength) {
          failedPosts.push({
            post,
            error: `Content exceeds ${platformLimits.name} limit of ${platformLimits.maxLength} characters`,
          })
          continue
        }

        // Validate scheduled time
        const scheduledDate = new Date(post.scheduledTime)
        if (isNaN(scheduledDate.getTime())) {
          failedPosts.push({
            post,
            error: 'Invalid scheduled time format',
          })
          continue
        }

        if (scheduledDate < new Date()) {
          failedPosts.push({
            post,
            error: 'Scheduled time must be in the future',
          })
          continue
        }

        // Verify social account exists
        const { data: socialAccount, error: socialAccountError } =
          await supabaseAdmin
            .from('social_accounts')
            .select('id, platform, expires_at, account_username')
            .eq('user_id', user.id)
            .eq('platform', post.platform)
            .maybeSingle()

        if (socialAccountError || !socialAccount) {
          failedPosts.push({
            post,
            error: `No connected ${post.platform} account found`,
          })
          continue
        }

        // Check if token is expired
        if (socialAccount.expires_at) {
          const expiresAt = new Date(socialAccount.expires_at)
          if (expiresAt < new Date()) {
            failedPosts.push({
              post,
              error: `${post.platform} account token expired`,
            })
            continue
          }
        }

        // Insert post into database
        const { data: insertedPost, error: insertError } = await supabaseAdmin
          .from('posts')
          .insert({
            user_id: user.id,
            platform: post.platform,
            original_content: post.topic || post.content,
            adapted_content: post.content,
            scheduled_time: scheduledDate.toISOString(),
            status: 'scheduled',
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Failed to insert post', insertError, {
            traceId,
            platform: post.platform,
          })
          failedPosts.push({
            post,
            error: 'Database error while saving post',
          })
          continue
        }

        // Schedule via QStash
        try {
          const messageId = await schedulePostJob(
            {
              postId: insertedPost.id,
              platform: insertedPost.platform,
              content: insertedPost.adapted_content,
              userId: insertedPost.user_id,
            },
            scheduledDate
          )

          await supabaseAdmin
            .from('posts')
            .update({ qstash_message_id: messageId })
            .eq('id', insertedPost.id)

          scheduledPosts.push(insertedPost.id)
          
          logger.info('Post scheduled successfully', {
            traceId,
            postId: insertedPost.id,
            platform: post.platform,
            messageId,
          })
        } catch (qstashError: any) {
          logger.error('QStash scheduling failed', qstashError, {
            traceId,
            postId: insertedPost.id,
          })

          // Mark post as failed in database
          await supabaseAdmin
            .from('posts')
            .update({
              status: 'failed',
              error_message: `QStash scheduling failed: ${qstashError.message}`,
            })
            .eq('id', insertedPost.id)

          failedPosts.push({
            post,
            error: 'Failed to queue post for publishing',
          })
        }
      } catch (error: any) {
        logger.error('Error processing post', error, { traceId, post })
        failedPosts.push({
          post,
          error: error.message || 'Unexpected error',
        })
      }
    }

    logger.info('Batch scheduling complete', {
      traceId,
      userId: user.id,
      scheduledCount: scheduledPosts.length,
      failedCount: failedPosts.length,
    })

    const allFailed = scheduledPosts.length === 0 && failedPosts.length > 0
    const someFailed = failedPosts.length > 0 && scheduledPosts.length > 0

    const response = NextResponse.json(
      {
        success: !allFailed,
        traceId,
        scheduledCount: scheduledPosts.length,
        failedCount: failedPosts.length,
        scheduledPosts,
        failedPosts: someFailed || allFailed ? failedPosts.map(f => ({
          platform: f.post.platform,
          error: f.error,
        })) : undefined,
        message: allFailed
          ? 'Failed to schedule all posts'
          : someFailed
          ? `Scheduled ${scheduledPosts.length} posts, ${failedPosts.length} failed`
          : `Successfully scheduled ${scheduledPosts.length} posts`,
      },
      { status: allFailed ? 400 : 200 }
    )

    return attachTraceId(response, traceId)
  } catch (error: any) {
    logger.error('Unexpected error in /api/batch/schedule', error, { traceId })
    return attachTraceId(
      createErrorResponse(
        'An unexpected error occurred while scheduling posts.',
        ErrorCode.INTERNAL_ERROR,
        500,
        error?.message
      ),
      traceId
    )
  }
}

export const config = {
  runtime: 'nodejs',
}
