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
 * Schedules a post to be published at a future time using QStash
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
    logger.info('Scheduling QStash job', { callbackUrl, delay, postId: jobData.postId })

    // Schedule a delayed message to our post execution endpoint
    const response = await qstash.publishJSON({
      url: callbackUrl,
      body: jobData,
      delay: delay,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    logger.info('QStash job scheduled successfully', { messageId: response.messageId, postId: jobData.postId })
    return response.messageId
  } catch (error: any) {
    logger.error('Failed to schedule QStash job', error, {
      postId: jobData.postId,
      platform: jobData.platform,
    })
    throw error
  }
}
