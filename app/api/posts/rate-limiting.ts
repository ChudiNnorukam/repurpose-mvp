/**
 * Rate Limiting Configuration for /api/posts
 *
 * This module provides rate limiting for the /api/posts endpoint to prevent:
 * - API abuse and DOS attacks
 * - Bulk draft creation causing resource exhaustion
 * - Excessive API calls from single users
 *
 * Based on v3.2 security audit findings
 */

import { NextRequest } from 'next/server'
import { apiRateLimiter, checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { ErrorCode, createErrorResponse } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * Rate limit configuration for /api/posts
 */
export const POSTS_RATE_LIMITS = {
  // GET requests - list all posts
  get: {
    limit: 60, // 60 requests per hour
    window: 3600000, // 1 hour in milliseconds
    description: 'List posts endpoint',
  },

  // POST requests - bulk draft creation
  post: {
    limit: 20, // 20 requests per hour
    window: 3600000, // 1 hour in milliseconds
    description: 'Bulk create posts endpoint',
  },
}

/**
 * Check rate limit for GET /api/posts
 *
 * @param request - Next.js request object
 * @param userId - Authenticated user ID
 * @returns Rate limit result or error response
 */
export async function checkPostsGetRateLimit(
  request: NextRequest,
  userId: string
) {
  const identifier = getRateLimitIdentifier(request, userId)
  const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded on GET /api/posts', {
      userId,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    })

    return createErrorResponse(
      `Rate limit exceeded. You can list posts ${POSTS_RATE_LIMITS.get.limit} times per hour. Try again after ${new Date(
        rateLimitResult.reset
      ).toLocaleTimeString()}.`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      undefined,
      undefined,
      { ...rateLimitResult.headers }
    )
  }

  return null // No error, proceed
}

/**
 * Check rate limit for POST /api/posts
 *
 * @param request - Next.js request object
 * @param userId - Authenticated user ID
 * @returns Rate limit result or error response
 */
export async function checkPostsPostRateLimit(
  request: NextRequest,
  userId: string
) {
  const identifier = getRateLimitIdentifier(request, userId)
  const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)

  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded on POST /api/posts', {
      userId,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    })

    return createErrorResponse(
      `Rate limit exceeded. You can create bulk posts ${POSTS_RATE_LIMITS.post.limit} times per hour. Try again after ${new Date(
        rateLimitResult.reset
      ).toLocaleTimeString()}.`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      undefined,
      undefined,
      { ...rateLimitResult.headers }
    )
  }

  return null // No error, proceed
}

/**
 * Helper to attach rate limit headers to response
 *
 * @param headers - Response headers object
 * @param limit - Rate limit
 * @param remaining - Remaining requests
 * @param reset - Reset time in milliseconds
 */
export function attachRateLimitHeaders(
  headers: Headers,
  limit: number,
  remaining: number,
  reset: number
): void {
  // Standard rate limit headers (RFC 6585)
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', Math.ceil(reset / 1000).toString()) // Unix timestamp

  // Retry-After header (RFC 7231)
  const secondsUntilReset = Math.ceil((reset - Date.now()) / 1000)
  if (secondsUntilReset > 0) {
    headers.set('Retry-After', secondsUntilReset.toString())
  }
}
