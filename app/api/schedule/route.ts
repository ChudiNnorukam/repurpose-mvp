import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { createClient } from "@/lib/supabase/server"
import { schedulePostJob } from "@/lib/qstash"
import { Platform } from "@/lib/types"
import { apiRateLimiter, getRateLimitIdentifier, checkRateLimit } from "@/lib/rate-limit"
import { ErrorCode, ErrorResponses, createErrorResponse } from "@/lib/api/errors"

/**
 * POST /api/schedule
 * Schedule a post for future publishing
 *
 * Security: Requires authentication, enforces user ID match, validates user exists
 * Rate Limit: 30 requests/minute per user
 */
export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK - Prevent unauthorized scheduling
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message)
      return ErrorResponses.unauthorized('You must be logged in to schedule posts')
    }

    console.log('✅ Authenticated user:', user.id)

    // 2. PARSE AND VALIDATE INPUT
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return createErrorResponse(
        'Invalid request body. Expected JSON.',
        ErrorCode.INVALID_INPUT,
        400,
        parseError instanceof Error ? parseError.message : 'JSON parse error'
      )
    }

    const { platform, content, originalContent, scheduledTime, userId } = body

    // Validate required fields
    if (!platform) {
      return ErrorResponses.missingField('platform')
    }
    if (!content) {
      return ErrorResponses.missingField('content')
    }
    if (!scheduledTime) {
      return ErrorResponses.missingField('scheduledTime')
    }
    if (!userId) {
      return ErrorResponses.missingField('userId')
    }

    // 3. VERIFY USER ID MATCHES AUTHENTICATED USER
    // This prevents users from scheduling posts on behalf of other users
    if (userId !== user.id) {
      console.error('❌ User ID mismatch:', {
        authenticated: user.id,
        provided: userId
      })
      return createErrorResponse(
        'User ID mismatch. Cannot schedule posts for other users.',
        ErrorCode.UNAUTHORIZED,
        403,
        `Authenticated: ${user.id}, Provided: ${userId}`
      )
    }

    // 4. RATE LIMITING - Prevent scheduling spam (30 requests/minute per user)
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset).toLocaleTimeString()
      console.warn('⚠️  Rate limit exceeded for user:', user.id)
      return NextResponse.json(
        {
          error: `Rate limit exceeded. You can schedule ${rateLimitResult.limit} posts per minute. Try again after ${resetTime}.`,
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
    }

    // 5. VALIDATE PLATFORM
    const validPlatforms: Platform[] = ["twitter", "linkedin", "instagram"]
    if (!validPlatforms.includes(platform as Platform)) {
      console.error('❌ Invalid platform:', platform)
      return createErrorResponse(
        `Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`,
        ErrorCode.INVALID_PLATFORM,
        400,
        undefined,
        'platform'
      )
    }

    // 6. VALIDATE USER EXISTS IN AUTH.USERS
    // CRITICAL: This prevents foreign key constraint violations
    // We verify with admin client that the user actually exists in auth.users
    const supabaseAdmin = getSupabaseAdmin()

    let authUser
    try {
      const { data, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (userError) {
        console.error('❌ Failed to verify user in auth.users:', {
          userId,
          error: userError.message,
          code: userError.status
        })

        return createErrorResponse(
          'User verification failed. Your session may be invalid or expired.',
          ErrorCode.DATABASE_ERROR,
          400,
          `Auth API error: ${userError.message}`,
          'userId'
        )
      }

      if (!data?.user) {
        console.error('❌ User does not exist in auth.users table:', userId)
        return createErrorResponse(
          'User account not found. Please log out and log back in.',
          ErrorCode.RECORD_NOT_FOUND,
          400,
          'User ID not found in auth.users',
          'userId'
        )
      }

      authUser = data.user
      console.log('✅ User verified in auth.users:', {
        userId: authUser.id,
        email: authUser.email,
        createdAt: authUser.created_at
      })
    } catch (error: any) {
      console.error('❌ Exception during user verification:', error)
      return createErrorResponse(
        'Failed to verify user account. Please try again.',
        ErrorCode.INTERNAL_ERROR,
        500,
        error.message
      )
    }

    // 7. VALIDATE SCHEDULED TIME
    let scheduledDate: Date
    try {
      scheduledDate = new Date(scheduledTime)

      // Check if date is valid
      if (isNaN(scheduledDate.getTime())) {
        console.error('❌ Invalid date format:', scheduledTime)
        return createErrorResponse(
          'Invalid scheduled time format. Please use ISO 8601 format.',
          ErrorCode.INVALID_TIME,
          400,
          `Received: ${scheduledTime}`,
          'scheduledTime'
        )
      }
    } catch (error: any) {
      console.error('❌ Failed to parse scheduled time:', error)
      return createErrorResponse(
        'Invalid scheduled time. Please check your date format.',
        ErrorCode.INVALID_TIME,
        400,
        error.message,
        'scheduledTime'
      )
    }

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)

    if (scheduledDate < fiveMinutesAgo) {
      const diffSeconds = (scheduledDate.getTime() - now.getTime()) / 1000
      console.error('❌ Scheduled time is in the past:', {
        scheduledTime: scheduledDate.toISOString(),
        currentTime: now.toISOString(),
        differenceSeconds: diffSeconds
      })

      return createErrorResponse(
        `Scheduled time must be in the future. You selected ${scheduledDate.toLocaleString()}, but current time is ${now.toLocaleString()}.`,
        ErrorCode.INVALID_TIME,
        400,
        `Time difference: ${diffSeconds.toFixed(1)} seconds`,
        'scheduledTime'
      )
    }

    console.log('✅ Scheduled time validated:', {
      scheduledTime: scheduledDate.toISOString(),
      delaySeconds: Math.floor((scheduledDate.getTime() - now.getTime()) / 1000)
    })

    // 8. INSERT POST INTO DATABASE
    // Use admin client to ensure the insert succeeds (bypasses RLS)
    // Security: We already verified userId matches authenticated user above
    let post
    try {
      const { data, error: insertError } = await supabaseAdmin
        .from("posts")
        .insert({
          user_id: userId,
          platform: platform as Platform,
          original_content: originalContent || content,
          adapted_content: content,
          scheduled_time: scheduledTime,
          status: "scheduled",
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Database insert failed:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })

        // Handle specific error codes
        if (insertError.code === '23503') {
          // Foreign key violation
          return createErrorResponse(
            'Database error: User account not properly linked. Please contact support.',
            ErrorCode.DATABASE_ERROR,
            500,
            `Foreign key constraint: ${insertError.message}`,
            'userId'
          )
        }

        return createErrorResponse(
          'Failed to save post to database. Please try again.',
          ErrorCode.DATABASE_ERROR,
          500,
          insertError.message
        )
      }

      if (!data) {
        console.error('❌ Insert succeeded but no data returned')
        return createErrorResponse(
          'Failed to retrieve saved post. Please check your scheduled posts.',
          ErrorCode.DATABASE_ERROR,
          500,
          'Insert returned null data'
        )
      }

      post = data
      console.log('✅ Post inserted into database:', {
        postId: post.id,
        userId: post.user_id,
        platform: post.platform,
        status: post.status
      })
    } catch (error: any) {
      console.error('❌ Exception during database insert:', error)
      return createErrorResponse(
        'An unexpected error occurred while saving your post.',
        ErrorCode.INTERNAL_ERROR,
        500,
        error.message
      )
    }

    // 9. SCHEDULE QSTASH JOB
    try {
      const delay = Math.max(
        0,
        Math.floor((scheduledDate.getTime() - Date.now()) / 1000)
      )

      console.log('📅 Scheduling QStash job:', {
        postId: post.id,
        platform,
        delaySeconds: delay,
        scheduledFor: scheduledDate.toISOString()
      })

      const messageId = await schedulePostJob(
        {
          postId: post.id,
          platform: platform as Platform,
          content,
          userId: userId,
        },
        scheduledDate
      )

      console.log('✅ QStash job scheduled:', messageId)

      // Save QStash message ID for cancellation/rescheduling
      const { error: updateError } = await supabaseAdmin
        .from("posts")
        .update({ qstash_message_id: messageId })
        .eq("id", post.id)

      if (updateError) {
        console.warn('⚠️  Failed to save QStash message ID:', {
          postId: post.id,
          messageId,
          error: updateError.message
        })
        // Don't fail the request, just log the warning
      } else {
        console.log('✅ QStash message ID saved to database')
      }

      console.log('🎉 Post scheduled successfully:', {
        postId: post.id,
        platform,
        userId,
        qstashMessageId: messageId,
        scheduledFor: scheduledDate.toISOString(),
        delaySeconds: delay,
      })

      return NextResponse.json({
        success: true,
        post: {
          id: post.id,
          platform: post.platform,
          status: post.status,
          scheduled_time: post.scheduled_time,
          created_at: post.created_at
        },
        qstashMessageId: messageId,
        message: `Post scheduled successfully for ${scheduledDate.toLocaleString()}`,
      })
    } catch (qstashError: any) {
      console.error('❌ QStash scheduling failed:', {
        postId: post.id,
        error: qstashError.message,
        stack: qstashError.stack
      })

      // Update post to failed status since QStash scheduling failed
      try {
        await supabaseAdmin
          .from("posts")
          .update({
            status: "failed",
            error_message: `QStash scheduling failed: ${qstashError.message}`,
          })
          .eq("id", post.id)

        console.log('✅ Post status updated to failed')
      } catch (updateError: any) {
        console.error('❌ Failed to update post status:', updateError)
      }

      // Return detailed error to user
      return createErrorResponse(
        'Failed to schedule post delivery. The post was saved but could not be queued for publishing.',
        ErrorCode.QSTASH_ERROR,
        500,
        qstashError.message
      )
    }
  } catch (error: any) {
    console.error('❌ Unexpected error in /api/schedule:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return createErrorResponse(
      'An unexpected error occurred while scheduling your post. Please try again.',
      ErrorCode.INTERNAL_ERROR,
      500,
      error.message
    )
  }
}
