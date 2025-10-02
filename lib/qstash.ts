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
      throw new Error('Scheduled time must be in the future')
    }

    // Schedule a delayed message to our post execution endpoint
    const response = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`,
      body: jobData,
      delay: delay,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.messageId
  } catch (error) {
    console.error('Error scheduling QStash job:', error)
    throw error
  }
}
