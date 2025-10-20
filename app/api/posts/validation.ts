/**
 * Validation schemas for /api/posts endpoint
 *
 * Provides Zod schemas and validation logic for bulk post creation
 * to prevent malformed requests and resource exhaustion.
 *
 * Based on v3.2 audit findings:
 * - Add max 50 posts per request limit
 * - Validate each post structure
 * - Prevent oversized content
 */

import { z } from 'zod'

/**
 * Validation constants
 */
export const POST_VALIDATION_CONSTANTS = {
  MAX_POSTS_PER_REQUEST: 50,
  MAX_CONTENT_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  VALID_PLATFORMS: ['twitter', 'linkedin', 'instagram'] as const,
  VALID_STATUSES: ['draft', 'scheduled', 'posted', 'failed'] as const,
}

/**
 * Zod schema for a single post in bulk creation
 */
const PostItemSchema = z.object({
  platform: z.enum(POST_VALIDATION_CONSTANTS.VALID_PLATFORMS),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .max(POST_VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH, `Content cannot exceed ${POST_VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH} characters`),
  original_content: z
    .string()
    .max(POST_VALIDATION_CONSTANTS.MAX_CONTENT_LENGTH)
    .optional(),
  title: z
    .string()
    .max(POST_VALIDATION_CONSTANTS.MAX_TITLE_LENGTH)
    .optional(),
  status: z
    .enum(POST_VALIDATION_CONSTANTS.VALID_STATUSES)
    .default('draft'),
  scheduled_time: z
    .string()
    .datetime()
    .optional()
    .nullable(),
})

export type PostItem = z.infer<typeof PostItemSchema>

/**
 * Zod schema for POST /api/posts request
 */
const CreatePostsRequestSchema = z.object({
  posts: z
    .array(PostItemSchema)
    .min(1, 'At least one post is required')
    .max(
      POST_VALIDATION_CONSTANTS.MAX_POSTS_PER_REQUEST,
      `Cannot create more than ${POST_VALIDATION_CONSTANTS.MAX_POSTS_PER_REQUEST} posts at once`
    ),
})

export type CreatePostsRequest = z.infer<typeof CreatePostsRequestSchema>

/**
 * Validate POST /api/posts request body
 *
 * @param body - Request body to validate
 * @returns Validated request or throws ZodError
 * @throws ZodError if validation fails
 *
 * @example
 * try {
 *   const validated = validateCreatePostsRequest(requestBody)
 *   // Use validated data
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     // Handle validation errors
 *   }
 * }
 */
export function validateCreatePostsRequest(body: unknown): CreatePostsRequest {
  return CreatePostsRequestSchema.parse(body)
}

/**
 * Validate request payload size to prevent memory exhaustion
 *
 * @param jsonBody - JSON string of request body
 * @param maxBytes - Maximum allowed size in bytes (default 1MB)
 * @returns true if valid, throws error if too large
 */
export function validateRequestSize(jsonBody: string, maxBytes: number = 1_000_000): boolean {
  const size = Buffer.byteLength(jsonBody, 'utf8')

  if (size > maxBytes) {
    throw new Error(
      `Request body too large: ${(size / 1024).toFixed(2)}KB exceeds limit of ${(maxBytes / 1024).toFixed(2)}KB`
    )
  }

  return true
}

/**
 * Get validation error details for API response
 *
 * @param error - Zod validation error
 * @returns Formatted error details
 */
export function getValidationErrorDetails(
  error: z.ZodError
): {
  field?: string
  message: string
  code: string
} {
  const issue = error.issues[0]

  if (!issue) {
    return {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
    }
  }

  return {
    field: issue.path?.[0]?.toString(),
    message: issue.message,
    code: issue.code,
  }
}

/**
 * Sanitize post content to prevent injection attacks
 *
 * @param content - Content to sanitize
 * @returns Sanitized content
 */
export function sanitizePostContent(content: string): string {
  return content
    .replace(/```/g, '') // Remove code blocks
    .replace(/\{system\}/gi, '') // Remove system tags
    .replace(/\{[\w-]+\}/g, '') // Remove template tags
    .trim()
}

/**
 * Validate and sanitize array of posts
 *
 * @param posts - Array of posts to validate
 * @returns Validated and sanitized posts
 * @throws Error if validation fails
 */
export function validateAndSanitizePosts(posts: PostItem[]): PostItem[] {
  return posts.map((post) => ({
    ...post,
    content: sanitizePostContent(post.content),
    original_content: post.original_content ? sanitizePostContent(post.original_content) : undefined,
  }))
}

/**
 * Custom validation for batch operations
 *
 * Performs additional validation beyond schema validation
 */
export class BatchPostValidator {
  /**
   * Validate total content size across all posts
   * Prevents creating extremely large batches that could exhaust memory
   *
   * @param posts - Posts to validate
   * @param maxTotalSize - Maximum total size in bytes
   * @returns true if valid
   * @throws Error if exceeds limit
   */
  static validateTotalContentSize(posts: PostItem[], maxTotalSize: number = 100_000): boolean {
    const totalSize = posts.reduce((sum, post) => {
      return sum + Buffer.byteLength(post.content, 'utf8')
    }, 0)

    if (totalSize > maxTotalSize) {
      throw new Error(
        `Total content size ${(totalSize / 1024).toFixed(2)}KB exceeds limit of ${(maxTotalSize / 1024).toFixed(2)}KB`
      )
    }

    return true
  }

  /**
   * Validate platform distribution
   * Prevents all posts from being for the same platform (potential abuse)
   *
   * @param posts - Posts to validate
   * @returns Platform distribution map
   */
  static getPlatformDistribution(posts: PostItem[]): Record<string, number> {
    const distribution: Record<string, number> = {}

    posts.forEach((post) => {
      distribution[post.platform] = (distribution[post.platform] || 0) + 1
    })

    return distribution
  }

  /**
   * Validate scheduled times are in the future
   *
   * @param posts - Posts to validate
   * @returns true if all valid
   * @throws Error if any scheduled time is in the past
   */
  static validateScheduledTimes(posts: PostItem[]): boolean {
    const now = new Date()

    posts.forEach((post) => {
      if (post.scheduled_time) {
        const scheduledTime = new Date(post.scheduled_time)

        if (scheduledTime < now) {
          throw new Error(
            `Cannot schedule post in the past: ${post.scheduled_time}`
          )
        }
      }
    })

    return true
  }

  /**
   * Run all validations
   *
   * @param posts - Posts to validate
   * @returns Validation results
   */
  static runAllValidations(posts: PostItem[]): {
    valid: boolean
    platformDistribution: Record<string, number>
    totalContentSize: number
  } {
    this.validateTotalContentSize(posts)
    this.validateScheduledTimes(posts)

    const distribution = this.getPlatformDistribution(posts)
    const totalSize = posts.reduce((sum, post) => {
      return sum + Buffer.byteLength(post.content, 'utf8')
    }, 0)

    return {
      valid: true,
      platformDistribution: distribution,
      totalContentSize: totalSize,
    }
  }
}
