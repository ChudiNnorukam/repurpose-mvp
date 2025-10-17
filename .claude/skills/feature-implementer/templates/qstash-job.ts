// QStash Delayed Job Scheduling Template
import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!
})

// Schedule a delayed job
export async function schedulePost(
  postId: string,
  scheduledTime: Date,
  userId: string
) {
  const delay = Math.floor((scheduledTime.getTime() - Date.now()) / 1000)

  if (delay <= 0) {
    throw new Error('Scheduled time must be in the future')
  }

  // Schedule job
  const { messageId } = await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`,
    body: {
      postId,
      userId,
      platform: 'twitter', // or from post data
    },
    delay, // seconds
  })

  return messageId
}

// Cancel scheduled job
export async function cancelScheduledPost(messageId: string) {
  await qstash.messages.delete(messageId)
}

// Job execution handler (in API route)
export async function handleScheduledExecution(body: {
  postId: string
  userId: string
  platform: string
}) {
  // Verify QStash signature
  const signature = request.headers.get('upstash-signature')
  const isValid = await qstash.verify({
    signature: signature!,
    body: JSON.stringify(body)
  })

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Execute the job
  // 1. Get post from database
  // 2. Get social account tokens
  // 3. Post to platform
  // 4. Update post status

  return new Response('OK', { status: 200 })
}
