import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * DEBUG ENDPOINT - Manual Post Testing
 *
 * Allows manual testing of post execution without waiting for QStash
 * Use this to debug posting issues quickly
 *
 * Usage:
 * curl -X POST http://localhost:3001/api/debug/test-post \
 *   -H "Content-Type: application/json" \
 *   -d '{"postId": "your-post-id"}'
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found', details: postError },
        { status: 404 }
      )
    }

    // Get connected account
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', post.user_id)
      .eq('platform', post.platform)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: `No connected ${post.platform} account found` },
        { status: 400 }
      )
    }

    // Call the post execution endpoint internally
    const executeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`

    const executeResponse = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Skip signature verification for internal calls
        'X-Debug-Mode': 'true',
      },
      body: JSON.stringify({
        postId: post.id,
        platform: post.platform,
        content: post.adapted_content,
        userId: post.user_id,
      }),
    })

    const executeData = await executeResponse.json()

    return NextResponse.json({
      success: executeResponse.ok,
      post,
      account: {
        platform: account.platform,
        username: account.account_username,
        hasRefreshToken: !!account.refresh_token,
      },
      execution: executeData,
      message: executeResponse.ok
        ? 'Post executed successfully! Check your social media feed.'
        : 'Post execution failed. See execution details.',
    })
  } catch (error: any) {
    console.error('Debug test-post error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
