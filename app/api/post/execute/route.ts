import { NextRequest, NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { getSupabaseAdmin } from "@/lib/supabase"
import { refreshIfNeeded } from "@/lib/social-media/refresh"
import { logger } from "@/lib/logger"

type Platform = "twitter" | "linkedin" | "instagram"

interface PostJobData {
  postId: string
  platform: Platform
  content: string
  userId: string
}

async function handler(request: NextRequest) {
  try {
    const body: PostJobData = await request.json()
    const { postId, platform, content, userId } = body

    logger.info(`🚀 Executing scheduled post: ${postId} for platform: ${platform}`)

    const supabase = getSupabaseAdmin()

    // Get the post from database
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()

    if (fetchError || !post) {
      logger.error("❌ Post not found:", postId)
      // Return 200 to prevent QStash retry (post doesn't exist, retrying won't help)
      return NextResponse.json({ error: "Post not found" }, { status: 200 })
    }

    // Check if already posted
    if (post.status === "posted") {
      logger.info("✅ Post already posted:", postId)
      return NextResponse.json({
        success: true,
        message: "Post already posted",
      })
    }

    // ✅ Get user's social account for this platform
    const { data: socialAccount, error: accountError } = await supabase
      .from("social_accounts")
      .select("id, access_token, refresh_token")
      .eq("user_id", userId)
      .eq("platform", platform)
      .single()

    if (accountError || !socialAccount) {
      logger.error(`❌ No connected ${platform} account found for user ${userId}`)

      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: `No connected ${platform} account found`,
        })
        .eq("id", postId)

      // Return 200 to prevent QStash retry (missing account won't fix itself)
      return NextResponse.json(
        { error: `No connected ${platform} account found` },
        { status: 200 }
      )
    }

    // ✅ Refresh token if needed
    let accessToken: string
    try {
      accessToken = await refreshIfNeeded(socialAccount, platform)
      logger.info(`✅ Access token refreshed for ${platform}`)
    } catch (refreshError: any) {
      logger.error(`❌ Token refresh failed for ${platform}:`, refreshError)

      // Mark post as failed instead of proceeding with expired token
      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: `Authentication expired. Please reconnect your ${platform} account in Settings > Connections`,
        })
        .eq("id", postId)

      logger.info(`❌ Post ${postId} marked as failed due to token refresh failure`)

      // Return 200 to prevent QStash retry (auth failure requires user action)
      return NextResponse.json(
        {
          error: `Authentication expired for ${platform}. Please reconnect your account.`,
          requiresReauth: true,
          platform
        },
        { status: 200 }
      )
    }

    // ✅ Post to social media platform
    let postSuccess = false
    let errorMessage = ""
    let isTransientError = false
    let platformPostId: string | null = null
    let postUrl: string | null = null

    try {
      if (platform === "twitter") {
        const { postTweet } = await import("@/lib/twitter")
        const result = await postTweet(accessToken, content)
        platformPostId = result.id
        postUrl = result.url
        postSuccess = true
        logger.info(`✅ Successfully posted to Twitter: ${postUrl}`)
      } else if (platform === "linkedin") {
        const { postToLinkedIn } = await import("@/lib/linkedin")
        const result = await postToLinkedIn(accessToken, content)
        platformPostId = result.id
        postUrl = result.url
        postSuccess = true
        logger.info(`✅ Successfully posted to LinkedIn: ${postUrl}`)
      } else if (platform === "instagram") {
        logger.info("⚠️  Instagram posting not yet implemented")
        errorMessage = "Instagram posting not yet implemented"
      }
    } catch (postError: any) {
      logger.error(`❌ Error posting to ${platform}:`, postError)
      errorMessage = postError.message || "Failed to publish post"
      
      // Detect transient errors that should trigger retry
      const errorString = errorMessage.toLowerCase()
      isTransientError = 
        errorString.includes("timeout") ||
        errorString.includes("network") ||
        errorString.includes("econnrefused") ||
        errorString.includes("enotfound") ||
        errorString.includes("rate limit") ||
        errorString.includes("429") ||
        errorString.includes("503") ||
        errorString.includes("502") ||
        errorString.includes("504") ||
        errorString.includes("connection") ||
        postError.code === "ECONNRESET" ||
        postError.code === "ETIMEDOUT"
        
      postSuccess = false
    }

    if (postSuccess) {
      // Update post status to posted with analytics data
      await supabase
        .from("posts")
        .update({
          status: "posted",
          posted_at: new Date().toISOString(),
          platform_post_id: platformPostId,
          post_url: postUrl,
        })
        .eq("id", postId)

      logger.info(`✅ Post ${postId} marked as posted with analytics: ${platformPostId}`)

      return NextResponse.json({
        success: true,
        message: `Post published to ${platform}`,
        postId,
        platformPostId,
        postUrl,
      })
    } else {
      // Update post status to failed
      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: errorMessage,
        })
        .eq("id", postId)

      logger.info(`❌ Post ${postId} marked as failed: ${errorMessage}`)

      // Return 503 for transient errors to trigger QStash retry
      // Return 200 for permanent errors to prevent unnecessary retries
      if (isTransientError) {
        logger.info(`🔄 Transient error detected, QStash will retry`)
        return NextResponse.json(
          { error: errorMessage || "Failed to publish post", transient: true },
          { status: 503 }
        )
      } else {
        return NextResponse.json(
          { error: errorMessage || "Failed to publish post" },
          { status: 200 }
        )
      }
    }
  } catch (error: any) {
    logger.error("❌ Error executing post:", error)

    // For unexpected errors, return 503 to trigger retry
    return NextResponse.json(
      {
        error: "Failed to execute post",
        details: error.message,
      },
      { status: 503 }
    )
  }
}

// Verify QStash signature to ensure request is from Upstash
export const POST = verifySignatureAppRouter(handler)
