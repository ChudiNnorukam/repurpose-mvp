/**
 * Chudi's Personal Brand Content Generation API
 * POST /api/generate/chudi
 *
 * Generates authentic content for Chudi Nnorukam's thought leadership
 * with Type 4w5 personality and voice integrated.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateChudiLinkedInPost,
  generateChudiTwitterThread,
  getRecommendedPillar,
  type ContentPillar,
  type ChudiContentOptions
} from '@/lib/ai/chudi-generator'
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
    const {
      action,
      pillar,
      topic,
      sourceContent,
      platform,
      sourceContentId,
      autoSelectPillar
    } = body

    // Handle pillar recommendation
    if (action === 'recommend-pillar') {
      // Fetch recent posts to analyze distribution
      const { data: recentPosts } = await supabase
        .from('repurposed_content')
        .select('metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const recentPillars: ContentPillar[] = (recentPosts || [])
        .map((post: any) => post.metadata?.pillar)
        .filter(Boolean)

      const recommended = getRecommendedPillar(recentPillars)

      return NextResponse.json({
        success: true,
        recommended,
        currentDistribution: calculateDistribution(recentPillars),
        targetDistribution: {
          educational: 40,
          philosophy: 30,
          misconception: 20,
          project: 10
        }
      })
    }

    // Validate required fields for generation
    if (!topic || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: topic and platform' },
        { status: 400 }
      )
    }

    // Auto-select pillar if requested
    let selectedPillar: ContentPillar = pillar

    if (autoSelectPillar) {
      const { data: recentPosts } = await supabase
        .from('repurposed_content')
        .select('metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const recentPillars: ContentPillar[] = (recentPosts || [])
        .map((post: any) => post.metadata?.pillar)
        .filter(Boolean)

      selectedPillar = getRecommendedPillar(recentPillars)
    }

    const options: ChudiContentOptions = {
      pillar: selectedPillar,
      topic,
      sourceContent,
      platform
    }

    // Generate content based on platform
    if (platform === 'linkedin') {
      const result = await generateChudiLinkedInPost(options)

      // Quality check
      const allChecksPassed = Object.values(result.qualityChecks).every(Boolean)

      if (!allChecksPassed) {
        console.warn('Quality checks failed:', result.qualityChecks)
      }

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: sourceContentId || null,
        platform: 'linkedin',
        content_type: 'post',
        content: [result.post],
        metadata: {
          pillar: result.pillar,
          hook: result.hook,
          characterCount: result.characterCount,
          qualityChecks: result.qualityChecks,
          brandVoice: 'chudi-type4w5',
          topic
        },
        status: 'draft',
        performance_score: allChecksPassed ? 0.85 : 0.7
      })

      if (dbError) {
        console.error('Database error:', dbError)
      }

      return NextResponse.json({
        success: true,
        platform: 'linkedin',
        content: result,
        qualityPassed: allChecksPassed,
        recommendation: allChecksPassed
          ? 'Ready to publish'
          : 'Review quality checks before publishing'
      })
    } else if (platform === 'twitter') {
      const result = await generateChudiTwitterThread(options)

      // Quality check
      const allChecksPassed = Object.values(result.qualityChecks).every(Boolean)

      if (!allChecksPassed) {
        console.warn('Quality checks failed:', result.qualityChecks)
      }

      // Save to database
      const { error: dbError } = await supabase.from('repurposed_content').insert({
        user_id: user.id,
        source_content_id: sourceContentId || null,
        platform: 'twitter',
        content_type: 'thread',
        content: result.tweets.map(t => t.text),
        metadata: {
          pillar: result.pillar,
          hook: result.hook,
          totalTweets: result.totalTweets,
          qualityChecks: result.qualityChecks,
          brandVoice: 'chudi-type4w5',
          topic
        },
        status: 'draft',
        performance_score: allChecksPassed ? 0.85 : 0.7
      })

      if (dbError) {
        console.error('Database error:', dbError)
      }

      return NextResponse.json({
        success: true,
        platform: 'twitter',
        content: result,
        qualityPassed: allChecksPassed,
        recommendation: allChecksPassed
          ? 'Ready to publish'
          : 'Review quality checks before publishing'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid platform. Use: linkedin or twitter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Chudi generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate content pillar distribution
 */
function calculateDistribution(pillars: ContentPillar[]): Record<ContentPillar, number> {
  const distribution: Record<ContentPillar, number> = {
    educational: 0,
    philosophy: 0,
    misconception: 0,
    project: 0
  }

  pillars.forEach(pillar => {
    if (pillar in distribution) {
      distribution[pillar]++
    }
  })

  const total = pillars.length || 1

  return {
    educational: Math.round((distribution.educational / total) * 100),
    philosophy: Math.round((distribution.philosophy / total) * 100),
    misconception: Math.round((distribution.misconception / total) * 100),
    project: Math.round((distribution.project / total) * 100)
  }
}

/**
 * GET endpoint for content strategy info
 */
export async function GET() {
  return NextResponse.json({
    message: "Chudi's Personal Brand Content Generator",
    version: '1.0',
    personality: 'Type 4w5 (Individualistic, Introspective, Analytical)',
    contentPillars: {
      educational: {
        percentage: 40,
        description: 'Teaching AI basics clearly',
        example: 'What is Claude Code and when to use it?'
      },
      philosophy: {
        percentage: 30,
        description: 'Personal frameworks and methodology',
        example: 'My framework for architecting prompts'
      },
      misconception: {
        percentage: 20,
        description: 'Balanced myth-busting',
        example: 'The truth about AI replacing developers'
      },
      project: {
        percentage: 10,
        description: 'Reflective insights from building',
        example: 'What building X taught me about Y'
      }
    },
    platforms: ['linkedin', 'twitter'],
    actions: ['recommend-pillar', 'generate'],
    qualityChecks: [
      'hasEducationalValue',
      'isAuthentic',
      'hasDepth',
      'noMetrics',
      'noScreenshots',
      'hasHonesty',
      'hasLimitations',
      'properFormat'
    ],
    usage: {
      recommendPillar: {
        method: 'POST',
        body: { action: 'recommend-pillar' }
      },
      generate: {
        method: 'POST',
        body: {
          pillar: 'educational | philosophy | misconception | project',
          topic: 'string',
          platform: 'linkedin | twitter',
          sourceContent: 'string (optional)',
          sourceContentId: 'uuid (optional)',
          autoSelectPillar: 'boolean (optional)'
        }
      }
    }
  })
}
