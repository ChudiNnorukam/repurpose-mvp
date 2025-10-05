import { schedulePostJob } from '../qstash'

// Mock the QStash client
jest.mock('@upstash/qstash', () => ({
  Client: jest.fn().mockImplementation(() => ({
    publishJSON: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}))

describe('schedulePostJob', () => {
  const mockJobData = {
    postId: 'test-post-id',
    platform: 'twitter' as const,
    content: 'Test tweet content',
    userId: 'test-user-id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Time validation', () => {
    it('throws error if scheduled time is in the past', async () => {
      const pastDate = new Date(Date.now() - 1000) // 1 second ago

      await expect(schedulePostJob(mockJobData, pastDate))
        .rejects
        .toThrow('must be in the future')
    })

    it('accepts scheduled time in the future', async () => {
      const futureDate = new Date(Date.now() + 60000) // 1 minute from now

      const messageId = await schedulePostJob(mockJobData, futureDate)

      expect(messageId).toBe('test-message-id')
    })

    it('calculates correct delay in seconds', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      const futureDate = new Date(Date.now() + 120000) // 2 minutes from now

      await schedulePostJob(mockJobData, futureDate)

      expect(mockPublishJSON).toHaveBeenCalled()
      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThanOrEqual(119) // Allow 1 second variance
      expect(callArgs.delay).toBeLessThanOrEqual(121)
    })
  })

  describe('Environment validation', () => {
    it('throws error if NEXT_PUBLIC_APP_URL not set', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_APP_URL
      delete process.env.NEXT_PUBLIC_APP_URL

      const futureDate = new Date(Date.now() + 60000)

      await expect(schedulePostJob(mockJobData, futureDate))
        .rejects
        .toThrow('NEXT_PUBLIC_APP_URL environment variable is not set')

      process.env.NEXT_PUBLIC_APP_URL = originalUrl
    })

    it('removes trailing slash from base URL', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      process.env.NEXT_PUBLIC_APP_URL = 'https://example.com/'
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.url).toBe('https://example.com/api/post/execute')
      expect(callArgs.url).not.toContain('//')
    })
  })

  describe('QStash API integration', () => {
    it('calls QStash publishJSON with correct parameters', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

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
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'unique-message-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      const futureDate = new Date(Date.now() + 60000)

      const messageId = await schedulePostJob(mockJobData, futureDate)

      expect(messageId).toBe('unique-message-id')
    })

    it('handles QStash API errors gracefully', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockRejectedValue(new Error('QStash API error'))
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      const futureDate = new Date(Date.now() + 60000)

      await expect(schedulePostJob(mockJobData, futureDate))
        .rejects
        .toThrow('QStash API error')
    })
  })

  describe('Edge cases', () => {
    it('handles scheduled time exactly now (0 delay)', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      const now = new Date()

      await schedulePostJob(mockJobData, now)

      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThanOrEqual(0)
    })

    it('handles very long delays (days in future)', async () => {
      const Client = require('@upstash/qstash').Client
      const mockPublishJSON = jest.fn().mockResolvedValue({ messageId: 'test-id' })
      Client.mockImplementation(() => ({ publishJSON: mockPublishJSON }))

      const farFuture = new Date(Date.now() + 86400000 * 7) // 7 days

      const messageId = await schedulePostJob(mockJobData, farFuture)

      expect(messageId).toBe('test-id')
      const callArgs = mockPublishJSON.mock.calls[0][0]
      expect(callArgs.delay).toBeGreaterThan(604800) // More than 7 days in seconds
    })
  })
})
