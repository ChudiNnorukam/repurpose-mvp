import { NextRequest, NextResponse } from 'next/server'
import { adaptContentForPlatform } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { Platform, Tone } from '@/lib/types'
import { ErrorResponses, ErrorCode, createErrorResponse } from '@/lib/api/errors'

const MAX_CONTENT_LENGTH = 5000
const VALID_PLATFORMS: Platform[] = ['twitter', 'linkedin', 'instagram']
const VALID_TONES: Tone[] = ['professional', 'casual', 'friendly', 'authoritative', 'enthusiastic']

export async function POST(request: NextRequest) {
  try {
    // Authentication check - prevent unauthorized API usage
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return ErrorResponses.unauthorized()
    }

    const body = await request.json()
    const { content, tone, platforms } = body

    // Validate required fields
    if (!content || typeof content !== 'string') {
      return ErrorResponses.missingField('content')
    }

    if (!tone || typeof tone !== 'string') {
      return ErrorResponses.missingField('tone')
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return ErrorResponses.invalidInput('At least one platform must be selected', 'platforms')
    }

    // Sanitize and validate content length
    const sanitizedContent = content
      .replace(/```/g, '')  // Remove code blocks that could manipulate prompts
      .replace(/\{system\}/gi, '')  // Remove system tags
      .trim()

    if (sanitizedContent.length === 0) {
      return ErrorResponses.invalidInput('Content cannot be empty after sanitization', 'content')
    }

    if (sanitizedContent.length > MAX_CONTENT_LENGTH) {
      return ErrorResponses.contentTooLong(MAX_CONTENT_LENGTH)
    }

    // Validate tone
    if (!VALID_TONES.includes(tone as Tone)) {
      return createErrorResponse(
        `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}`,
        ErrorCode.INVALID_INPUT,
        400,
        undefined,
        'tone'
      )
    }

    // Validate platforms
    for (const platform of platforms) {
      if (!VALID_PLATFORMS.includes(platform)) {
        return createErrorResponse(
          `Invalid platform: ${platform}. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
          ErrorCode.INVALID_PLATFORM,
          400,
          undefined,
          'platforms'
        )
      }
    }

    // Adapt content for each selected platform using sanitized content
    const adaptedContent = await Promise.all(
      platforms.map(async (platform: Platform) => {
        const adaptedText = await adaptContentForPlatform({
          content: sanitizedContent,
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
    // Check for OpenAI-specific errors
    if (error.status === 429) {
      return createErrorResponse(
        'Rate limit exceeded. Please try again in a few moments.',
        ErrorCode.RATE_LIMIT_EXCEEDED,
        429,
        error.message
      )
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return createErrorResponse(
        'Failed to connect to AI service. Please try again.',
        ErrorCode.OPENAI_ERROR,
        503,
        error.message
      )
    }

    return ErrorResponses.internalError(error.message)
  }
}
