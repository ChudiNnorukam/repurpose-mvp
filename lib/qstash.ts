import { Client } from '@upstash/qstash'

const qstashToken = process.env.QSTASH_TOKEN

if (!qstashToken) {
  throw new Error('Missing QSTASH_TOKEN environment variable')
}

export const qstash = new Client({
  token: qstashToken,
})

interface SchedulePostJob {
  postId: string
  platform: 'twitter' | 'linkedin' | 'instagram'
  content: string
  userId: string
}

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
    console.log(`Scheduling QStash job to ${callbackUrl} with delay ${delay}s`)

    // Schedule a delayed message to our post execution endpoint
    const response = await qstash.publishJSON({
      url: callbackUrl,
      body: jobData,
      delay: delay,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('QStash response:', response)
    return response.messageId
  } catch (error: any) {
    console.error('Error scheduling QStash job:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      body: error.body,
    })
    throw error
  }
}
