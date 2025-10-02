import { NextRequest, NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'

type Platform = 'twitter' | 'linkedin' | 'instagram'

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

    console.log(`Executing scheduled post: ${postId} for platform: ${platform}`)

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the post from database
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      console.error('Post not found:', postId)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if already posted
    if (post.status === 'posted') {
      console.log('Post already posted:', postId)
      return NextResponse.json({
        success: true,
        message: 'Post already posted',
      })
    }

    // Get user's social account for this platform
    const { data: socialAccount, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single()

    if (accountError || !socialAccount) {
      // Update post status to failed
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          error_message: `No connected ${platform} account found`,
        })
        .eq('id', postId)

      return NextResponse.json(
        { error: `No connected ${platform} account found` },
        { status: 400 }
      )
    }

    // Post to social media platform
    let postSuccess = false
    let errorMessage = ''

    try {
      if (platform === 'twitter') {
        const { postTweet } = await import('@/lib/twitter')
        await postTweet(socialAccount.access_token, content)
        postSuccess = true
      } else if (platform === 'linkedin') {
        const { postToLinkedIn } = await import('@/lib/linkedin')
        await postToLinkedIn(socialAccount.access_token, content)
        postSuccess = true
      } else if (platform === 'instagram') {
        // TODO: Implement Instagram posting
        console.log('Instagram posting not yet implemented')
        errorMessage = 'Instagram posting not yet implemented'
      }
    } catch (postError: any) {
      console.error(`Error posting to ${platform}:`, postError)
      errorMessage = postError.message || 'Failed to publish post'
      postSuccess = false
    }

    if (postSuccess) {
      // Update post status to posted
      await supabase
        .from('posts')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
        })
        .eq('id', postId)

      return NextResponse.json({
        success: true,
        message: `Post published to ${platform}`,
        postId,
      })
    } else {
      // Update post status to failed
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', postId)

      return NextResponse.json(
        { error: errorMessage || 'Failed to publish post' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error executing post:', error)

    return NextResponse.json(
      {
        error: 'Failed to execute post',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// Verify QStash signature to ensure request is from Upstash
export const POST = verifySignatureAppRouter(handler)
