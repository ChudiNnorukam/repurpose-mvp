/**
 * LinkedIn Content Generation API
 * POST /api/generate/linkedin
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateLinkedInPost,
  generateLinkedInCarousel,
  generateLinkedInArticle
} from '@/lib/ai/linkedin-generator'
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
    if (action === 'generate-post') {
      const result = await generateLinkedInPost({
        sourceContent: params.sourceContent,
        postLength: params.postLength || 'medium',
        postStyle: params.postStyle || 'thought-leadership',
        tone: params.tone || 'professional',
        includeHashtags: params.includeHashtags !== false,
        targetAudience: params.targetAudience || 'professionals',
        includeEmoji: params.includeEmoji !== false
      })

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: params.sourceContentId || null,
        platform: 'linkedin',
        content_type: 'post',
        content: [result.post],
        metadata: {
          headline: result.headline,
          hashtags: result.hashtags,
          mentions: result.mentions,
          characterCount: result.characterCount,
          hasHook: result.hasHook,
          callToAction: result.callToAction,
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
        post: result
      })
    }

    if (action === 'generate-carousel') {
      const result = await generateLinkedInCarousel({
        sourceContent: params.sourceContent,
        slideCount: params.slideCount || 10,
        carouselType: params.carouselType || 'educational',
        includeIntroOutro: params.includeIntroOutro !== false
      })

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: params.sourceContentId || null,
        platform: 'linkedin',
        content_type: 'carousel',
        content: [result.caption],
        metadata: {
          slides: result.slides,
          coverSlide: result.coverSlide,
          closingSlide: result.closingSlide,
          totalSlides: result.slides.length + 2,
          caption: result.caption
        },
        status: 'draft',
        performance_score: 0.75
      })

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue anyway - content was generated
      }

      return NextResponse.json({
        success: true,
        carousel: result
      })
    }

    if (action === 'generate-article') {
      const result = await generateLinkedInArticle(
        params.sourceContent,
        params.articleLength || 'standard'
      )

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: params.sourceContentId || null,
        platform: 'linkedin',
        content_type: 'article',
        content: [result.content],
        metadata: {
          title: result.title,
          subtitle: result.subtitle,
          sections: result.sections,
          seoKeywords: result.seoKeywords
        },
        status: 'draft',
        performance_score: 0.7
      })

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue anyway - content was generated
      }

      return NextResponse.json({
        success: true,
        article: result
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: generate-post, generate-carousel, or generate-article' },
      { status: 400 }
    )
  } catch (error) {
    console.error('LinkedIn generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate content',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
