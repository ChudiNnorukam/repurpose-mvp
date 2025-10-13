import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { ZodError, ZodIssue } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { schedulePostJob } from "@/lib/qstash"
import { apiRateLimiter, checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"
import { ErrorCode, ErrorResponses, createErrorResponse } from "@/lib/api/errors"
import { PLATFORM_LIMITS } from "@/lib/constants"
import { logger } from "@/lib/logger"
import {
  ScheduleValidationError,
  scheduleRequestSchema,
  validateScheduledTimestamp,
  scheduleValidationConstants,
  ScheduleRequestPayload,
} from "./validation"

function attachTraceId(response: NextResponse, traceId: string) {
  response.headers.set("x-trace-id", traceId)
  return response
}

function schemaIssueToError(issue: ZodIssue): ScheduleValidationError {
  const field = issue.path?.[0] ? String(issue.path[0]) : undefined

  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return new ScheduleValidationError(
      `${field ?? "field"} is required`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      field,
      issue.message,
    )
  }

  return new ScheduleValidationError(
    issue.message || "Invalid request payload",
    ErrorCode.INVALID_INPUT,
    field,
    issue.message,
  )
}

export async function POST(request: NextRequest) {
  const traceId = randomUUID()

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn("Unauthorized schedule attempt", { traceId, authError })
      return attachTraceId(
        ErrorResponses.unauthorized("You must be logged in to schedule posts"),
        traceId,
      )
    }

    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      logger.warn("Rate limit exceeded", {
        traceId,
        userId: user.id,
        rateLimitResult,
      })
      const response = NextResponse.json(
        {
          error: `Rate limit exceeded. You can schedule ${rateLimitResult.limit} posts per minute.`,
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        },
      )
      return attachTraceId(response, traceId)
    }

    let payload: ScheduleRequestPayload
    try {
      const rawBody = await request.json()
      payload = scheduleRequestSchema.parse(rawBody)
    } catch (error: any) {
      logger.warn("Schedule request validation failed", {
        traceId,
        rawError: error,
      })

      if (error instanceof ZodError) {
        const issue = error.issues[0]
        const validationError = schemaIssueToError(issue)
        return attachTraceId(
          createErrorResponse(
            validationError.message,
            validationError.code,
            400,
            validationError.details,
            validationError.field,
          ),
          traceId,
        )
      }

      return attachTraceId(
        createErrorResponse(
          "Invalid request body. Expected JSON.",
          ErrorCode.INVALID_INPUT,
          400,
          error?.message ?? "JSON parse error",
        ),
        traceId,
      )
    }

    if (payload.userId !== user.id) {
      logger.warn("User mismatch detected", {
        traceId,
        authenticated: user.id,
        provided: payload.userId,
      })
      return attachTraceId(
        createErrorResponse(
          "User ID mismatch. Please refresh your session.",
          ErrorCode.UNAUTHORIZED,
          403,
          `Authenticated: ${user.id}, Provided: ${payload.userId}`,
          "userId",
        ),
        traceId,
      )
    }

    const platformKey = payload.platform as keyof typeof PLATFORM_LIMITS
    const platformLimits = PLATFORM_LIMITS[platformKey]
    if (platformLimits && payload.content.length > platformLimits.maxLength) {
      logger.warn("Content exceeds platform limit", {
        traceId,
        userId: user.id,
        platform: payload.platform,
        length: payload.content.length,
        maxLength: platformLimits.maxLength,
      })
      return attachTraceId(
        createErrorResponse(
          `Content exceeds ${platformLimits.name} limit of ${platformLimits.maxLength} characters`,
          ErrorCode.CONTENT_TOO_LONG,
          400,
          `Length: ${payload.content.length}`,
          "content",
        ),
        traceId,
      )
    }

    let scheduledDate: Date
    try {
      scheduledDate = validateScheduledTimestamp(payload.scheduledTime)
    } catch (error: any) {
      if (error instanceof ScheduleValidationError) {
        logger.warn("Scheduled time validation failed", {
          traceId,
          userId: user.id,
          details: error.details,
        })
        return attachTraceId(
          createErrorResponse(
            error.message,
            error.code,
            400,
            error.details,
            error.field,
          ),
          traceId,
        )
      }

      logger.error("Unexpected error validating schedule timestamp", error, {
        traceId,
      })
      return attachTraceId(
        createErrorResponse(
          "Failed to validate scheduled time",
          ErrorCode.INTERNAL_ERROR,
          500,
          error?.message,
        ),
        traceId,
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    try {
      const { data, error: adminUserError } =
        await supabaseAdmin.auth.admin.getUserById(user.id)

      if (adminUserError) {
        logger.error("Failed to verify user in auth.users", adminUserError, {
          traceId,
          userId: user.id,
        })
        return attachTraceId(
          createErrorResponse(
            "User verification failed. Please log out and back in.",
            ErrorCode.DATABASE_ERROR,
            400,
            adminUserError.message,
            "userId",
          ),
          traceId,
        )
      }

      if (!data?.user) {
        logger.error("User missing from auth.users", null, {
          traceId,
          userId: user.id,
        })
        return attachTraceId(
          createErrorResponse(
            "User account not found. Please log out and log in again.",
            ErrorCode.RECORD_NOT_FOUND,
            400,
            "Supabase auth.users lookup returned null",
            "userId",
          ),
          traceId,
        )
      }
    } catch (error: any) {
      logger.error("Unexpected error verifying user", error, {
        traceId,
        userId: user.id,
      })
      return attachTraceId(
        createErrorResponse(
          "Failed to verify user account. Please try again.",
          ErrorCode.INTERNAL_ERROR,
          500,
          error.message,
        ),
        traceId,
      )
    }

    const { data: socialAccount, error: socialAccountError } =
      await supabaseAdmin
        .from("social_accounts")
        .select("id, platform, expires_at, account_username")
        .eq("user_id", user.id)
        .eq("platform", payload.platform)
        .maybeSingle()

    if (socialAccountError) {
      logger.error(
        "Failed to verify connected social account",
        socialAccountError,
        {
          traceId,
          userId: user.id,
          platform: payload.platform,
        },
      )
      return attachTraceId(
        createErrorResponse(
          "Could not verify your connected account. Please reconnect and retry.",
          ErrorCode.DATABASE_ERROR,
          500,
          socialAccountError.message,
        ),
        traceId,
      )
    }

    if (!socialAccount) {
      logger.warn("Missing connected social account", {
        traceId,
        userId: user.id,
        platform: payload.platform,
      })
      return attachTraceId(
        createErrorResponse(
          `No connected ${payload.platform} account found. Connect the account in Settings > Connections.`,
          ErrorCode.RECORD_NOT_FOUND,
          400,
          undefined,
          "platform",
        ),
        traceId,
      )
    }

    if (socialAccount.expires_at) {
      const expiresAt = new Date(socialAccount.expires_at)
      if (expiresAt < new Date()) {
        logger.warn("OAuth token expired", {
          traceId,
          userId: user.id,
          platform: payload.platform,
          expiresAt: socialAccount.expires_at,
        })
        return attachTraceId(
          ErrorResponses.authExpired(payload.platform),
          traceId,
        )
      }
    }

    const { data: insertedPost, error: insertError } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: user.id,
        platform: payload.platform,
        original_content: payload.originalContent ?? payload.content,
        adapted_content: payload.content,
        scheduled_time: scheduledDate.toISOString(),
        status: "scheduled",
      })
      .select()
      .single()

    if (insertError) {
      logger.error("Database insert failed when scheduling post", insertError, {
        traceId,
        userId: user.id,
        platform: payload.platform,
      })

      const isForeignKeyViolation = insertError.code === "23503"
      const response = createErrorResponse(
        isForeignKeyViolation
          ? "Database constraint failed: your user record is not linked correctly. Please contact support."
          : "Failed to save post to database. Please try again.",
        ErrorCode.DATABASE_ERROR,
        isForeignKeyViolation ? 500 : 500,
        insertError.message,
        isForeignKeyViolation ? "userId" : undefined,
      )

      return attachTraceId(response, traceId)
    }

    logger.info("Post inserted into database", {
      traceId,
      postId: insertedPost.id,
      platform: insertedPost.platform,
      userId: insertedPost.user_id,
      scheduled_time: insertedPost.scheduled_time,
    })

    try {
      const messageId = await schedulePostJob(
        {
          postId: insertedPost.id,
          platform: insertedPost.platform,
          content: insertedPost.adapted_content,
          userId: insertedPost.user_id,
        },
        scheduledDate,
      )

      await supabaseAdmin
        .from("posts")
        .update({ qstash_message_id: messageId })
        .eq("id", insertedPost.id)

      logger.info("QStash job scheduled successfully", {
        traceId,
        messageId,
        postId: insertedPost.id,
        platform: insertedPost.platform,
      })

      const response = NextResponse.json(
        {
          success: true,
          traceId,
          post: {
            id: insertedPost.id,
            platform: insertedPost.platform,
            status: insertedPost.status,
            scheduled_time: insertedPost.scheduled_time,
            qstash_message_id: messageId,
            account_username: socialAccount.account_username,
          },
          message: `Post scheduled successfully for ${new Date(
            insertedPost.scheduled_time,
          ).toLocaleString()}.`,
        },
        { status: 200 },
      )

      return attachTraceId(response, traceId)
    } catch (qstashError: any) {
      logger.error("Failed to schedule QStash job", qstashError, {
        traceId,
        postId: insertedPost.id,
        platform: insertedPost.platform,
      })

      await supabaseAdmin
        .from("posts")
        .update({
          status: "failed",
          error_message: `QStash scheduling failed: ${qstashError.message}`,
        })
        .eq("id", insertedPost.id)

      return attachTraceId(
        createErrorResponse(
          "Failed to queue post for publishing. The post is saved but needs manual retry.",
          ErrorCode.QSTASH_ERROR,
          500,
          qstashError.message,
        ),
        traceId,
      )
    }
  } catch (error: any) {
    logger.error("Unexpected error in /api/schedule", error, { traceId })
    return attachTraceId(
      createErrorResponse(
        "An unexpected error occurred while scheduling your post.",
        ErrorCode.INTERNAL_ERROR,
        500,
        error?.message,
      ),
      traceId,
    )
  }
}

export const config = {
  runtime: "nodejs",
}

export const constants = {
  ...scheduleValidationConstants,
}
