/**
 * Twitter Thread Generation API
 * POST /api/generate/twitter
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateTwitterThread, generateSingleTweet, optimizeThread } from '@/lib/ai/twitter-generator'
import { createClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    // Route to appropriate function
    if (action === 'generate-thread') {
      const result = await generateTwitterThread({
        sourceContent: params.sourceContent,
        threadLength: params.threadLength || 'medium',
        threadType: params.threadType || 'educational',
        tone: params.tone || 'professional',
        includeHashtags: params.includeHashtags !== false,
        targetAudience: params.targetAudience || 'professionals'
      })

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: params.sourceContentId || null,
        platform: 'twitter',
        content_type: 'thread',
        content: result.tweets.map(t => t.text),
        metadata: {
          hook: result.hook,
          cta: result.cta,
          hashtags: result.hashtags,
          totalTweets: result.totalTweets,
          threadType: result.threadType,
          estimatedEngagement: result.estimatedEngagement
        },
        status: 'draft',
        performance_score: result.estimatedEngagement
      })

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue anyway - content was generated
      }

      return NextResponse.json({
        success: true,
        thread: result
      })
    }

    if (action === 'generate-single') {
      const tweet = await generateSingleTweet(
        params.content,
        params.style || 'quote'
      )

      return NextResponse.json({
        success: true,
        tweet
      })
    }

    if (action === 'optimize-thread') {
      const result = await optimizeThread(params.tweets)

      return NextResponse.json({
        success: true,
        optimized: result.optimized,
        improvements: result.improvements
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: generate-thread, generate-single, or optimize-thread' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Twitter generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate content',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
