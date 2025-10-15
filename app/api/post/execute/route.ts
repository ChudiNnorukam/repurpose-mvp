import { NextRequest, NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { getSupabaseAdmin } from "@/lib/supabase"
import { refreshIfNeeded } from "@/lib/social-media/refresh"

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

    console.log(`🚀 Executing scheduled post: ${postId} for platform: ${platform}`)

    const supabase = getSupabaseAdmin()

    // Get the post from database
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()

    if (fetchError || !post) {
      console.error("❌ Post not found:", postId)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if already posted
    if (post.status === "posted") {
      console.log("✅ Post already posted:", postId)
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
      console.error(`❌ No connected ${platform} account found for user ${userId}`)

      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: `No connected ${platform} account found`,
        })
        .eq("id", postId)

      return NextResponse.json(
        { error: `No connected ${platform} account found` },
        { status: 400 }
      )
    }

    // ✅ Refresh token if needed
    let accessToken: string
    try {
      accessToken = await refreshIfNeeded(socialAccount, platform)
      console.log(`✅ Access token refreshed for ${platform}`)
    } catch (refreshError: unknown) {
      const refreshErrorMessage =
        refreshError instanceof Error ? refreshError.message : "Unknown refresh error"

      console.error(`❌ Token refresh failed for ${platform}:`, refreshErrorMessage, refreshError)

      // Mark post as failed instead of proceeding with expired token
      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: `Authentication expired. Please reconnect your ${platform} account in Settings > Connections`,
        })
        .eq("id", postId)

      console.log(`❌ Post ${postId} marked as failed due to token refresh failure`)

      return NextResponse.json(
        {
          error: `Authentication expired for ${platform}. Please reconnect your account.`,
          requiresReauth: true,
          platform
        },
        { status: 401 }
      )
    }

    // ✅ Post to social media platform
    let postSuccess = false
    let errorMessage = ""

    try {
      if (platform === "twitter") {
        const { postTweet } = await import("@/lib/twitter")
        await postTweet(accessToken, content)
        postSuccess = true
        console.log(`✅ Successfully posted to Twitter`)
      } else if (platform === "linkedin") {
        const { postToLinkedIn } = await import("@/lib/linkedin")
        await postToLinkedIn(accessToken, content)
        postSuccess = true
        console.log(`✅ Successfully posted to LinkedIn`)
      } else if (platform === "instagram") {
        console.log("⚠️  Instagram posting not yet implemented")
        errorMessage = "Instagram posting not yet implemented"
      }
    } catch (postError: any) {
      console.error(`❌ Error posting to ${platform}:`, postError)
      errorMessage = postError.message || "Failed to publish post"
      postSuccess = false
    }

    if (postSuccess) {
      // Update post status to posted
      await supabase
        .from("posts")
        .update({
          status: "posted",
          posted_at: new Date().toISOString(),
        })
        .eq("id", postId)

      console.log(`✅ Post ${postId} marked as posted`)

      return NextResponse.json({
        success: true,
        message: `Post published to ${platform}`,
        postId,
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

      console.log(`❌ Post ${postId} marked as failed: ${errorMessage}`)

      return NextResponse.json(
        { error: errorMessage || "Failed to publish post" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("❌ Error executing post:", error)

    return NextResponse.json(
      {
        error: "Failed to execute post",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Verify QStash signature to ensure request is from Upstash
export const POST = verifySignatureAppRouter(handler)
