// Mock @upstash/qstash Client constructor
jest.mock('@upstash/qstash', () => {
  const mockPublishJSON = jest.fn()
  
  return {
    Client: jest.fn().mockImplementation(() => ({
      publishJSON: mockPublishJSON,
    })),
    // Export the mock so we can access it in tests
    __mockPublishJSON: mockPublishJSON,
  }
})

import { schedulePostJob } from '../qstash'
// Access the exported mock
const { __mockPublishJSON: mockPublishJSON } = jest.requireMock('@upstash/qstash')

describe('schedulePostJob', () => {
  const mockJobData = {
    postId: 'test-post-id',
    platform: 'twitter' as const,
    content: 'Test tweet content',
    userId: 'test-user-id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublishJSON.mockResolvedValue({ messageId: 'test-message-id' })
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  describe('Time validation', () => {
    it('throws error if scheduled time is in the past', async () => {
      const pastDate = new Date(Date.now() - 1000)

      await expect(schedulePostJob(mockJobData, pastDate))
        .rejects
        .toThrow('must be in the future')
    })

    it('accepts scheduled time in the future', async () => {
      const futureDate = new Date(Date.now() + 60000)

      const messageId = await schedulePostJob(mockJobData, futureDate)

      expect(messageId).toBe('test-message-id')
      expect(mockPublishJSON).toHaveBeenCalled()
    })

    it('calculates correct delay in seconds', async () => {
      const futureDate = new Date(Date.now() + 120000)

      await schedulePostJob(mockJobData, futureDate)

      expect(mockPublishJSON).toHaveBeenCalled()
      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThanOrEqual(119)
      expect(callArgs.delay).toBeLessThanOrEqual(121)
    })
  })

  describe('Environment validation', () => {
    it('throws error if NEXT_PUBLIC_APP_URL not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL

      const futureDate = new Date(Date.now() + 60000)

      await expect(schedulePostJob(mockJobData, futureDate))
        .rejects
        .toThrow('NEXT_PUBLIC_APP_URL environment variable is not set')
    })

    it('removes trailing slash from base URL', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/'
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.url).toBe('https://example.com/api/post/execute')
    })
  })

  describe('QStash API integration', () => {
    it('calls QStash publishJSON with correct parameters', async () => {
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      expect(mockPublishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/post/execute'),
          body: mockJobData,
          delay: expect.any(Number),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    })

    it('returns QStash message ID on success', async () => {
      mockPublishJSON.mockResolvedValue({ messageId: 'unique-message-id' })

      const futureDate = new Date(Date.now() + 60000)
      const messageId = await schedulePostJob(mockJobData, futureDate)

      expect(messageId).toBe('unique-message-id')
    })

    it('handles QStash API errors gracefully', async () => {
      mockPublishJSON.mockRejectedValue(new Error('QStash API error'))

      const futureDate = new Date(Date.now() + 60000)

      await expect(schedulePostJob(mockJobData, futureDate))
        .rejects
        .toThrow('QStash API error')
    })
  })

  describe('Edge cases', () => {
    it('handles minimum valid delay (1 second from now)', async () => {
      const nearFuture = new Date(Date.now() + 1000)

      const messageId = await schedulePostJob(mockJobData, nearFuture)

      expect(messageId).toBe('test-message-id')
      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThanOrEqual(0)
      expect(callArgs.delay).toBeLessThanOrEqual(2)
    })

    it('handles very long delays (days in future)', async () => {
      const farFuture = new Date(Date.now() + 86400000 * 7)

      const messageId = await schedulePostJob(mockJobData, farFuture)

      expect(messageId).toBe('test-message-id')
      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThanOrEqual(604800)
    })
  })
})
