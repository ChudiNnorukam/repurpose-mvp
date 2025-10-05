import { NextResponse } from 'next/server'

/**
 * Standard error codes used across the API
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
  INVALID_PLATFORM = 'INVALID_PLATFORM',
  INVALID_TIME = 'INVALID_TIME',

  // External API errors
  OPENAI_ERROR = 'OPENAI_ERROR',
  QSTASH_ERROR = 'QSTASH_ERROR',
  SOCIAL_MEDIA_ERROR = 'SOCIAL_MEDIA_ERROR',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',

  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Standardized API error response structure
 */
export interface ApiError {
  error: string          // User-facing error message
  code: ErrorCode        // Machine-readable error code
  details?: string       // Additional details (dev-only, omitted in production)
  field?: string         // Field name for validation errors
}

/**
 * Creates a standardized error response
 *
 * @param message - User-facing error message
 * @param code - Error code from ErrorCode enum
 * @param status - HTTP status code
 * @param details - Optional additional details (only included in development)
 * @param field - Optional field name for validation errors
 * @returns NextResponse with standardized error structure
 *
 * @example
 * return createErrorResponse(
 *   'Content is required',
 *   ErrorCode.MISSING_REQUIRED_FIELD,
 *   400,
 *   'Content field was empty or missing',
 *   'content'
 * )
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  details?: string,
  field?: string
): NextResponse<ApiError> {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  const errorBody: ApiError = {
    error: message,
    code,
    ...(field && { field }),
    ...(isDevelopment && details && { details }),
  }

  return NextResponse.json(errorBody, { status })
}

/**
 * Common error response creators for frequently used errors
 */
export const ErrorResponses = {
  /**
   * Returns 401 Unauthorized response
   */
  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(message, ErrorCode.UNAUTHORIZED, 401),

  /**
   * Returns 401 response for expired authentication
   */
  authExpired: (platform?: string) =>
    createErrorResponse(
      platform
        ? `Authentication expired for ${platform}. Please reconnect your account.`
        : 'Authentication expired. Please log in again.',
      ErrorCode.AUTH_EXPIRED,
      401
    ),

  /**
   * Returns 400 response for missing required field
   */
  missingField: (fieldName: string) =>
    createErrorResponse(
      `${fieldName} is required`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      400,
      undefined,
      fieldName
    ),

  /**
   * Returns 400 response for invalid input
   */
  invalidInput: (message: string, field?: string) =>
    createErrorResponse(message, ErrorCode.INVALID_INPUT, 400, undefined, field),

  /**
   * Returns 400 response for content that exceeds maximum length
   */
  contentTooLong: (maxLength: number) =>
    createErrorResponse(
      `Content exceeds maximum length of ${maxLength} characters`,
      ErrorCode.CONTENT_TOO_LONG,
      400,
      undefined,
      'content'
    ),

  /**
   * Returns 404 response for record not found
   */
  notFound: (resource: string) =>
    createErrorResponse(
      `${resource} not found`,
      ErrorCode.RECORD_NOT_FOUND,
      404
    ),

  /**
   * Returns 429 response for rate limit exceeded
   */
  rateLimitExceeded: () =>
    createErrorResponse(
      'Too many requests. Please try again later.',
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429
    ),

  /**
   * Returns 500 response for internal server errors
   */
  internalError: (details?: string) =>
    createErrorResponse(
      'An internal error occurred',
      ErrorCode.INTERNAL_ERROR,
      500,
      details
    ),
}
