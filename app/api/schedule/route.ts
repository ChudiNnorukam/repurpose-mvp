import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"
import { schedulePostJob } from "@/lib/qstash"
import { Platform } from "@/lib/types"
import { apiRateLimiter, getRateLimitIdentifier, checkRateLimit } from "@/lib/rate-limit"
import { ErrorCode } from "@/lib/api/errors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, content, originalContent, scheduledTime, userId } = body

    // Validate input
    if (!platform || !content || !scheduledTime || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Rate limiting - prevent scheduling spam (30 requests per minute per user)
    const identifier = getRateLimitIdentifier(request, userId)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset).toLocaleTimeString()
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

    if (!["twitter", "linkedin", "instagram"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      )
    }

    const supabaseClient = getSupabaseAdmin()

    // ✅ Verify user exists in auth.users
    const { data: authUser, error: userError } =
      await supabaseClient.auth.admin.getUserById(userId)

    if (userError || !authUser?.user) {
      console.error("User verification failed:", userError)
      return NextResponse.json(
        { error: "User does not exist or session invalid" },
        { status: 400 }
      )
    }

    // Parse and validate scheduled time
    const scheduledDate = new Date(scheduledTime)
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)

    if (scheduledDate < fiveMinutesAgo) {
      console.log("Schedule time validation failed:", {
        scheduledTime,
        scheduledDate: scheduledDate.toISOString(),
        now: now.toISOString(),
        diff: (scheduledDate.getTime() - now.getTime()) / 1000 + " seconds",
      })
      return NextResponse.json(
        {
          error: `Scheduled time must be in the future. You selected: ${scheduledDate.toISOString()}, current time: ${now.toISOString()}`,
        },
        { status: 400 }
      )
    }

    // ✅ Insert post into database
    const { data: post, error: insertError } = await supabaseClient
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
      console.error("Insert error:", insertError)
      console.error("Insert error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      })
      return NextResponse.json(
        { error: `Failed to schedule post: ${insertError.message}` },
        { status: 500 }
      )
    }

    // ✅ Schedule QStash job
    try {
      const delay = Math.max(
        0,
        Math.floor((scheduledDate.getTime() - Date.now()) / 1000)
      )

      const messageId = await schedulePostJob(
        {
          postId: post.id,
          platform: platform as Platform,
          content,
          userId: userId,
        },
        scheduledDate
      )

      console.log(`✅ Post scheduled successfully:`, {
        postId: post.id,
        platform,
        qstashMessageId: messageId,
        scheduledFor: scheduledDate.toISOString(),
        delaySeconds: delay,
      })

      return NextResponse.json({
        success: true,
        post,
        qstashMessageId: messageId,
        message: "Post scheduled successfully",
      })
    } catch (qstashError: any) {
      console.error("❌ Failed to schedule QStash job:", qstashError)

      // Update post to failed status since QStash scheduling failed
      await supabaseClient
        .from("posts")
        .update({
          status: "failed",
          error_message: `QStash scheduling failed: ${qstashError.message}`,
        })
        .eq("id", post.id)

      // Return error to user so they know it failed
      return NextResponse.json(
        { error: `Failed to schedule QStash job: ${qstashError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in /api/schedule:", error)

    return NextResponse.json(
      {
        error: "Failed to schedule post. Please try again.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
