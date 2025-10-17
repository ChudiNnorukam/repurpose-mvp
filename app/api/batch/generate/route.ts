import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { ErrorCode, ErrorResponses, createErrorResponse } from '@/lib/api/errors'
import { aiRateLimiter, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { 
  generateTopicsFromTheme, 
  generateBatchContent 
} from '@/lib/batch-generation'

type Platform = 'twitter' | 'linkedin'

const MAX_POSTS_PER_PLATFORM = 90
const MAX_THEME_LENGTH = 200

function attachTraceId(response: NextResponse, traceId: string) {
  response.headers.set('x-trace-id', traceId)
  return response
}

export async function POST(request: NextRequest) {
  const traceId = randomUUID()

  try {
    // Authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized batch generate attempt', { traceId, authError })
      return attachTraceId(
        ErrorResponses.unauthorized('You must be logged in to generate content'),
        traceId
      )
    }

    // Rate limiting (more generous for batch operations, but still limited)
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(aiRateLimiter, identifier)

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', {
        traceId,
        userId: user.id,
        rateLimitResult,
      })
      const response = NextResponse.json(
        {
          error: `Rate limit exceeded. You can generate ${rateLimitResult.limit} batches per hour.`,
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
      return attachTraceId(response, traceId)
    }

    // Parse request body
    const body = await request.json()
    const { theme, topics, numPosts, platforms, userId } = body

    // Validate userId
    if (userId !== user.id) {
      logger.warn('User ID mismatch', {
        traceId,
        authenticated: user.id,
        provided: userId,
      })
      return attachTraceId(
        createErrorResponse(
          'User ID mismatch. Please refresh your session.',
          ErrorCode.UNAUTHORIZED,
          403,
          `Authenticated: ${user.id}, Provided: ${userId}`,
          'userId'
        ),
        traceId
      )
    }

    // Validate required fields
    if (!theme || typeof theme !== 'string') {
      return attachTraceId(
        ErrorResponses.missingField('theme'),
        traceId
      )
    }

    if (!numPosts || typeof numPosts !== 'number') {
      return attachTraceId(
        ErrorResponses.missingField('numPosts'),
        traceId
      )
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return attachTraceId(
        createErrorResponse(
          'At least one platform must be selected',
          ErrorCode.INVALID_INPUT,
          400,
          undefined,
          'platforms'
        ),
        traceId
      )
    }

    // Validate theme length
    const sanitizedTheme = theme.trim()
    if (sanitizedTheme.length === 0) {
      return attachTraceId(
        createErrorResponse(
          'Theme cannot be empty',
          ErrorCode.INVALID_INPUT,
          400,
          undefined,
          'theme'
        ),
        traceId
      )
    }

    if (sanitizedTheme.length > MAX_THEME_LENGTH) {
      return attachTraceId(
        createErrorResponse(
          `Theme cannot exceed ${MAX_THEME_LENGTH} characters`,
          ErrorCode.CONTENT_TOO_LONG,
          400,
          `Length: ${sanitizedTheme.length}`,
          'theme'
        ),
        traceId
      )
    }

    // Validate numPosts
    if (numPosts < 1 || numPosts > MAX_POSTS_PER_PLATFORM) {
      return attachTraceId(
        createErrorResponse(
          `Number of posts must be between 1 and ${MAX_POSTS_PER_PLATFORM}`,
          ErrorCode.INVALID_INPUT,
          400,
          `Provided: ${numPosts}`,
          'numPosts'
        ),
        traceId
      )
    }

    // Validate platforms
    const validPlatforms: Platform[] = ['twitter', 'linkedin']
    for (const platform of platforms) {
      if (!validPlatforms.includes(platform)) {
        return attachTraceId(
          createErrorResponse(
            `Invalid platform: ${platform}. Must be one of: ${validPlatforms.join(', ')}`,
            ErrorCode.INVALID_PLATFORM,
            400,
            undefined,
            'platforms'
          ),
          traceId
        )
      }
    }

    logger.info('Starting batch content generation', {
      traceId,
      userId: user.id,
      theme: sanitizedTheme.substring(0, 50),
      numPosts,
      platforms,
      hasCustomTopics: !!(topics && topics.length > 0),
    })

    // Generate or use provided topics
    let finalTopics: string[]
    
    if (topics && Array.isArray(topics) && topics.length > 0) {
      // Use provided topics
      finalTopics = topics
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)
        .slice(0, numPosts)
      
      logger.info('Using provided topics', {
        traceId,
        topicCount: finalTopics.length,
      })
    } else {
      // Generate topics from theme
      logger.info('Generating topics from theme', {
        traceId,
        theme: sanitizedTheme,
        numTopics: numPosts,
      })
      
      try {
        finalTopics = await generateTopicsFromTheme({
          theme: sanitizedTheme,
          numTopics: numPosts,
        })
      } catch (error: any) {
        logger.error('Failed to generate topics', error, { traceId })
        return attachTraceId(
          createErrorResponse(
            'Failed to generate topics from theme. Please try again or provide custom topics.',
            ErrorCode.OPENAI_ERROR,
            500,
            error.message
          ),
          traceId
        )
      }
    }

    // If we have fewer topics than requested posts, repeat the cycle
    if (finalTopics.length < numPosts) {
      const expandedTopics: string[] = []
      for (let i = 0; i < numPosts; i++) {
        expandedTopics.push(finalTopics[i % finalTopics.length])
      }
      finalTopics = expandedTopics
    }

    // Generate content for all topics and platforms
    let posts: Array<{
      id: string
      platform: Platform
      content: string
      scheduledTime: string
      topic: string
    }>

    try {
      posts = await generateBatchContent({
        theme: sanitizedTheme,
        topics: finalTopics,
        platforms: platforms as Platform[],
      })
    } catch (error: any) {
      logger.error('Failed to generate batch content', error, { traceId })
      return attachTraceId(
        createErrorResponse(
          'Failed to generate content. Please try again.',
          ErrorCode.OPENAI_ERROR,
          500,
          error.message
        ),
        traceId
      )
    }

    logger.info('Batch content generation complete', {
      traceId,
      userId: user.id,
      postsGenerated: posts.length,
    })

    const response = NextResponse.json(
      {
        success: true,
        traceId,
        posts,
        message: `Generated ${posts.length} posts across ${platforms.length} platform(s)`,
      },
      { status: 200 }
    )

    return attachTraceId(response, traceId)
  } catch (error: any) {
    logger.error('Unexpected error in /api/batch/generate', error, { traceId })
    return attachTraceId(
      createErrorResponse(
        'An unexpected error occurred while generating content.',
        ErrorCode.INTERNAL_ERROR,
        500,
        error?.message
      ),
      traceId
    )
  }
}

export const config = {
  runtime: 'nodejs',
}
