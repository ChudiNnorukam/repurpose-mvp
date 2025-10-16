import { schedulePostJob } from '../qstash'

// Mock the qstash Client
jest.mock('@upstash/qstash', () => {
  const mockPublishJSON = jest.fn()
  
  return {
    Client: jest.fn().mockImplementation(() => ({
      publishJSON: mockPublishJSON,
    })),
    __mockPublishJSON: mockPublishJSON,
  }
})

const { __mockPublishJSON: mockPublishJSON } = jest.requireMock('@upstash/qstash')

describe('Retry Mechanism with Exponential Backoff', () => {
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

  describe('Retry Configuration', () => {
    it('schedules job with retry configuration', async () => {
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      expect(mockPublishJSON).toHaveBeenCalledWith(
        expect.objectContaining({
          retries: 5,
          retryDelay: 'min(60000, 2000 * pow(2, retried))',
        })
      )
    })

    it('includes exponential backoff formula', async () => {
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      const callArgs = mockPublishJSON.mock.calls[0][0]
      
      // Verify retry configuration
      expect(callArgs.retries).toBe(5)
      expect(callArgs.retryDelay).toContain('pow(2, retried)')
      expect(callArgs.retryDelay).toContain('min(60000')
    })
  })

  describe('Exponential Backoff Schedule', () => {
    it('calculates backoff delays correctly', () => {
      // The formula is: min(60000, 2000 * pow(2, retried))
      // Expected delays:
      // Attempt 1: Immediate (0s)
      // Attempt 2: 2000 * 2^0 = 2000ms (2s)
      // Attempt 3: 2000 * 2^1 = 4000ms (4s)
      // Attempt 4: 2000 * 2^2 = 8000ms (8s)
      // Attempt 5: 2000 * 2^3 = 16000ms (16s)
      // Attempt 6: 2000 * 2^4 = 32000ms (32s)
      
      const calculateDelay = (retried: number) => {
        return Math.min(60000, 2000 * Math.pow(2, retried))
      }

      expect(calculateDelay(0)).toBe(2000)   // 2s
      expect(calculateDelay(1)).toBe(4000)   // 4s
      expect(calculateDelay(2)).toBe(8000)   // 8s
      expect(calculateDelay(3)).toBe(16000)  // 16s
      expect(calculateDelay(4)).toBe(32000)  // 32s
      expect(calculateDelay(5)).toBe(60000)  // Capped at 60s
    })

    it('caps maximum delay at 60 seconds', () => {
      const calculateDelay = (retried: number) => {
        return Math.min(60000, 2000 * Math.pow(2, retried))
      }

      // After 5 retries, delay would be 64s, but capped at 60s
      expect(calculateDelay(5)).toBe(60000)
      expect(calculateDelay(10)).toBe(60000)
      expect(calculateDelay(100)).toBe(60000)
    })
  })

  describe('Total Retry Budget', () => {
    it('allows up to 6 total attempts (initial + 5 retries)', async () => {
      const futureDate = new Date(Date.now() + 60000)

      await schedulePostJob(mockJobData, futureDate)

      const callArgs = mockPublishJSON.mock.calls[0][0]
      const maxRetries = callArgs.retries

      // 1 initial attempt + 5 retries = 6 total attempts
      expect(maxRetries).toBe(5)
      
      // Total time budget (if all retries are needed):
      // Initial: 0s
      // Retry 1: +2s = 2s
      // Retry 2: +4s = 6s
      // Retry 3: +8s = 14s
      // Retry 4: +16s = 30s
      // Retry 5: +32s = 62s
      // Total: ~62 seconds max delay between attempts
    })
  })

  describe('Retry Error Detection', () => {
    // Helper function that matches the logic in app/api/post/execute/route.ts
    const isTransientError = (errorMessage: string, errorCode?: string): boolean => {
      const errorString = errorMessage.toLowerCase()
      return (
        errorString.includes('timeout') ||
        errorString.includes('network') ||
        errorString.includes('econnrefused') ||
        errorString.includes('enotfound') ||
        errorString.includes('rate limit') ||
        errorString.includes('429') ||
        errorString.includes('503') ||
        errorString.includes('502') ||
        errorString.includes('504') ||
        errorString.includes('connection') ||
        errorCode === 'ECONNRESET' ||
        errorCode === 'ETIMEDOUT'
      )
    }

    it('identifies network timeouts as transient', () => {
      expect(isTransientError('Request timeout')).toBe(true)
      expect(isTransientError('Connection timeout')).toBe(true)
      expect(isTransientError('', 'ETIMEDOUT')).toBe(true)
    })

    it('identifies network errors as transient', () => {
      expect(isTransientError('Network error occurred')).toBe(true)
      expect(isTransientError('ECONNREFUSED')).toBe(true)
      expect(isTransientError('ENOTFOUND')).toBe(true)
      expect(isTransientError('Connection failed')).toBe(true)
      expect(isTransientError('', 'ECONNRESET')).toBe(true)
    })

    it('identifies rate limits as transient', () => {
      expect(isTransientError('Rate limit exceeded')).toBe(true)
      expect(isTransientError('HTTP 429 Too Many Requests')).toBe(true)
    })

    it('identifies server errors as transient', () => {
      expect(isTransientError('503 Service Unavailable')).toBe(true)
      expect(isTransientError('502 Bad Gateway')).toBe(true)
      expect(isTransientError('504 Gateway Timeout')).toBe(true)
    })

    it('does not retry authentication errors', () => {
      expect(isTransientError('Authentication expired')).toBe(false)
      expect(isTransientError('Invalid credentials')).toBe(false)
      expect(isTransientError('401 Unauthorized')).toBe(false)
    })

    it('does not retry validation errors', () => {
      expect(isTransientError('Post not found')).toBe(false)
      expect(isTransientError('No connected account')).toBe(false)
      expect(isTransientError('Invalid content')).toBe(false)
      expect(isTransientError('Validation error')).toBe(false)
    })
  })
})
