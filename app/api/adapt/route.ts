import { NextRequest, NextResponse } from 'next/server'
import { adaptContentForPlatform } from '@/lib/anthropic'

type Platform = 'twitter' | 'linkedin' | 'instagram'
type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, tone, platforms } = body

    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    if (!tone || typeof tone !== 'string') {
      return NextResponse.json(
        { error: 'Tone is required and must be a string' },
        { status: 400 }
      )
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    // Adapt content for each selected platform
    const adaptedContent = await Promise.all(
      platforms.map(async (platform: Platform) => {
        const adaptedText = await adaptContentForPlatform({
          content,
          platform,
          tone: tone as Tone,
        })

        return {
          platform,
          content: adaptedText,
        }
      })
    )

    return NextResponse.json({
      success: true,
      adaptedContent,
    })
  } catch (error: any) {
    console.error('Error in /api/adapt:', error)

    return NextResponse.json(
      {
        error: 'Failed to adapt content. Please try again.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
