import { Client } from '@upstash/qstash'
import { SchedulePostJob } from './types'
import { logger } from './logger'

const qstashToken = process.env.QSTASH_TOKEN

if (!qstashToken) {
  throw new Error('Missing QSTASH_TOKEN environment variable')
}

export const qstash = new Client({
  token: qstashToken,
})

/**
 * Retry configuration for QStash jobs
 * - Max retries: 3 (free tier limit)
 * - Backoff: Exponential with base 2 (2s, 4s, 8s)
 * - Max delay: 60s (prevents excessive wait times)
 *
 * Formula: min(60000, 2000 * pow(2, retried))
 * Retry schedule:
 * - Attempt 1: Immediate
 * - Attempt 2: 2s later
 * - Attempt 3: 4s later
 * - Attempt 4: 8s later
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  // Exponential backoff: 2s * 2^retried, capped at 60s
  retryDelay: 'min(60000, 2000 * pow(2, retried))' as const,
}

/**
 * Schedules a post to be published at a future time using QStash with automatic retry
 *
 * @param jobData - Post metadata including platform, content, user ID, and post ID
 * @param scheduledTime - When to publish the post (must be in the future)
 * @returns QStash message ID for tracking the scheduled job
 * @throws {Error} If scheduled time is in the past
 * @throws {Error} If NEXT_PUBLIC_APP_URL environment variable is not set
 * @throws {Error} If QStash API call fails
 *
 * @example
 * const messageId = await schedulePostJob(
 *   { postId: '123', platform: 'twitter', content: 'Hello!', userId: 'user-1' },
 *   new Date('2025-12-31T23:59:59Z')
 * )
 */
export async function schedulePostJob(
  jobData: SchedulePostJob,
  scheduledTime: Date
): Promise<string> {
  try {
    const delay = Math.floor((scheduledTime.getTime() - Date.now()) / 1000)

    if (delay <= 0) {
      throw new Error(`Scheduled time must be in the future. Delay calculated: ${delay} seconds`)
    }

    // Ensure base URL doesn't have trailing slash
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set')
    }

    const callbackUrl = `${baseUrl}/api/post/execute`
    logger.info('Scheduling QStash job with retry', {
      callbackUrl,
      delay,
      postId: jobData.postId,
      retries: RETRY_CONFIG.maxRetries,
    })

    // Schedule a delayed message to our post execution endpoint with retry configuration
    const response = await qstash.publishJSON({
      url: callbackUrl,
      body: jobData,
      delay: delay,
      headers: {
        'Content-Type': 'application/json',
      },
      retries: RETRY_CONFIG.maxRetries,
      retryDelay: RETRY_CONFIG.retryDelay,
    })

    logger.info('QStash job scheduled successfully', {
      messageId: response.messageId,
      postId: jobData.postId,
      retryConfig: RETRY_CONFIG,
    })
    return response.messageId
  } catch (error: any) {
    logger.error('Failed to schedule QStash job', error, {
      postId: jobData.postId,
      platform: jobData.platform,
    })
    throw error
  }
}
