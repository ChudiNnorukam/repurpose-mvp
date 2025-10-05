import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'
import { logger } from './logger'

/**
 * Rate limiter configuration
 *
 * Note: Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.
 * If not configured, rate limiting will be bypassed (logs warning).
 */

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

if (!redis) {
  logger.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured')
}

/**
 * Rate limiter for expensive AI operations
 * Limit: 10 requests per hour per user
 */
export const aiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:ai',
    })
  : null

/**
 * Rate limiter for general API operations
 * Limit: 30 requests per minute per user
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null

/**
 * Gets identifier for rate limiting from request
 * Uses user ID from Supabase auth if available, otherwise IP address
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Fallback to IP address for unauthenticated requests
  const ip = request.headers.get('x-forwarded-for') ??
             request.headers.get('x-real-ip') ??
             'anonymous'

  return `ip:${ip}`
}

/**
 * Checks if request should be rate limited
 *
 * @param rateLimiter - The rate limiter to use
 * @param identifier - Unique identifier for the rate limit (user ID or IP)
 * @returns Object with success flag, limit, remaining requests, and reset time
 *
 * @example
 * const userId = 'user-123'
 * const result = await checkRateLimit(aiRateLimiter, `user:${userId}`)
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded' },
 *     { status: 429, headers: result.headers }
 *   )
 * }
 */
export async function checkRateLimit(
  rateLimiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}> {
  // If rate limiting not configured, allow all requests
  if (!rateLimiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      headers: {},
    }
  }

  try {
    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier)

    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }

    if (!success) {
      logger.warn('Rate limit exceeded', { identifier, limit, remaining, reset })
    }

    return {
      success,
      limit,
      remaining,
      reset,
      headers,
    }
  } catch (error) {
    logger.error('Rate limit check failed', error as Error, { identifier })

    // On error, allow request but log the issue
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      headers: {},
    }
  }
}
