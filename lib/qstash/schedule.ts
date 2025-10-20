import { Client } from '@upstash/qstash'
import crypto from 'crypto'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN || '',
})

interface SchedulePostPayload {
  scheduleId: string
  accountId: string
  platform: 'twitter' | 'linkedin'
  contentType: string
  contentData: any
}

/**
 * Schedule a post to be published at a specific time
 */
export async function schedulePost(
  scheduleId: string,
  scheduledTime: Date,
  payload: SchedulePostPayload
): Promise<string> {
  const delay = Math.max(0, scheduledTime.getTime() - Date.now())

  const messageId = await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/post-execute`,
    headers: {
      'X-Schedule-Id': scheduleId,
      'X-Signature': generateHmacSignature(scheduleId),
    },
    body: payload,
    delay: Math.floor(delay / 1000), // Convert to seconds
  })

  return messageId
}

/**
 * Cancel a scheduled post
 * Note: QStash doesn't support cancellation directly via API
 * Instead, we mark the schedule as cancelled in the database
 * and the webhook handler checks before posting
 */
export async function cancelScheduledPost(scheduleId: string): Promise<void> {
  // The actual cancellation happens in the database
  // This is a placeholder for future QStash cancellation support
  console.log(`Scheduled cancellation for ${scheduleId}`)
}

/**
 * Verify QStash webhook signature
 */
export function verifyQStashSignature(
  signature: string,
  body: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac('sha256', signingKey)
  hmac.update(body)
  const expectedSignature = hmac.digest('base64')

  return signature === expectedSignature
}

/**
 * Generate HMAC signature for QStash requests
 */
function generateHmacSignature(scheduleId: string): string {
  const key = process.env.QSTASH_CURRENT_SIGNING_KEY || ''

  const hmac = crypto.createHmac('sha256', key)
  hmac.update(scheduleId)

  return hmac.digest('base64')
}

/**
 * Get QStash token for testing
 */
export function getQStashToken(): string {
  return process.env.QSTASH_TOKEN || ''
}
