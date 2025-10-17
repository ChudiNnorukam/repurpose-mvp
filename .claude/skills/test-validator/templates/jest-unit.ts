// Jest Unit Test Template for Repurpose MVP
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Example 1: Testing OAuth Helper Functions
describe('Twitter OAuth Helpers', () => {
  describe('generatePKCE', () => {
    it('should generate valid code verifier and challenge', () => {
      const { codeVerifier, codeChallenge } = generatePKCE()

      // Verify verifier is base64url encoded, 128 chars
      expect(codeVerifier).toHaveLength(128)
      expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/)

      // Verify challenge is base64url encoded SHA-256 hash, 43 chars
      expect(codeChallenge).toHaveLength(43)
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate different verifiers on each call', () => {
      const first = generatePKCE()
      const second = generatePKCE()

      expect(first.codeVerifier).not.toBe(second.codeVerifier)
      expect(first.codeChallenge).not.toBe(second.codeChallenge)
    })
  })

  describe('generateState', () => {
    it('should generate cryptographically secure state token', () => {
      const state = generateState()

      // Should be 64 hex characters (32 bytes)
      expect(state).toHaveLength(64)
      expect(state).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate unique state tokens', () => {
      const tokens = Array.from({ length: 10 }, () => generateState())
      const uniqueTokens = new Set(tokens)

      expect(uniqueTokens.size).toBe(10)
    })
  })
})

// Example 2: Testing Type Guards
describe('Type Guards', () => {
  describe('isPlatform', () => {
    it('should return true for valid platforms', () => {
      expect(isPlatform('twitter')).toBe(true)
      expect(isPlatform('linkedin')).toBe(true)
      expect(isPlatform('instagram')).toBe(true)
    })

    it('should return false for invalid platforms', () => {
      expect(isPlatform('facebook')).toBe(false)
      expect(isPlatform('tiktok')).toBe(false)
      expect(isPlatform('')).toBe(false)
      expect(isPlatform(null)).toBe(false)
    })
  })

  describe('isPostStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isPostStatus('draft')).toBe(true)
      expect(isPostStatus('scheduled')).toBe(true)
      expect(isPostStatus('posted')).toBe(true)
      expect(isPostStatus('failed')).toBe(true)
    })

    it('should return false for invalid statuses', () => {
      expect(isPostStatus('pending')).toBe(false)
      expect(isPostStatus('cancelled')).toBe(false)
    })
  })
})

// Example 3: Testing Utility Functions with Mocks
describe('Content Validation', () => {
  describe('validateContentLength', () => {
    it('should validate Twitter content within limits', () => {
      const result = validateContentLength('twitter', 'Short tweet')
      
      expect(result.isValid).toBe(true)
      expect(result.length).toBe(11)
      expect(result.limit).toBe(280)
    })

    it('should reject Twitter content exceeding limits', () => {
      const longContent = 'a'.repeat(281)
      const result = validateContentLength('twitter', longContent)
      
      expect(result.isValid).toBe(false)
      expect(result.length).toBe(281)
      expect(result.limit).toBe(280)
    })

    it('should handle LinkedIn character limits (3000)', () => {
      const content = 'a'.repeat(3000)
      const result = validateContentLength('linkedin', content)
      
      expect(result.isValid).toBe(true)
      
      const tooLong = 'a'.repeat(3001)
      const invalidResult = validateContentLength('linkedin', tooLong)
      
      expect(invalidResult.isValid).toBe(false)
    })
  })
})

// Example 4: Testing Date/Time Functions
describe('Scheduling Utilities', () => {
  describe('isValidScheduledTime', () => {
    it('should accept future dates', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      
      expect(isValidScheduledTime(futureDate)).toBe(true)
    })

    it('should reject past dates', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      
      expect(isValidScheduledTime(pastDate)).toBe(false)
    })

    it('should reject dates too far in future (> 7 days)', () => {
      const farFuture = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 days
      
      expect(isValidScheduledTime(farFuture)).toBe(false)
    })
  })

  describe('calculateDelay', () => {
    it('should calculate correct delay in seconds', () => {
      const future = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      const delay = calculateDelay(future)

      // Should be approximately 3600 seconds (allow 1 second margin)
      expect(delay).toBeGreaterThan(3599)
      expect(delay).toBeLessThan(3601)
    })

    it('should return 0 for past dates', () => {
      const past = new Date(Date.now() - 1000)
      
      expect(calculateDelay(past)).toBe(0)
    })
  })
})

// Example 5: Testing Error Handlers
describe('Error Responses', () => {
  describe('ErrorResponses.unauthorized', () => {
    it('should return 401 with correct format', () => {
      const response = ErrorResponses.unauthorized()
      const json = response.json()

      expect(response.status).toBe(401)
      expect(json).toEqual({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      })
    })
  })

  describe('ErrorResponses.missingField', () => {
    it('should return 400 with field name', () => {
      const response = ErrorResponses.missingField('email')
      const json = response.json()

      expect(response.status).toBe(400)
      expect(json.error).toContain('email')
      expect(json.code).toBe('INVALID_INPUT')
    })
  })
})

// Example 6: Testing with Mock Dependencies
describe('OpenAI Content Adapter', () => {
  let mockOpenAI: jest.Mocked<OpenAI>

  beforeEach(() => {
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should adapt content for Twitter with correct prompt', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: 'Adapted tweet content'
        }
      }]
    })

    const result = await adaptContent({
      content: 'Original content',
      platform: 'twitter',
      tone: 'professional',
      openai: mockOpenAI
    })

    expect(result).toBe('Adapted tweet content')
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('Twitter')
          })
        ])
      })
    )
  })

  it('should handle OpenAI API errors gracefully', async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error('API rate limit exceeded')
    )

    await expect(
      adaptContent({
        content: 'Test content',
        platform: 'twitter',
        tone: 'casual',
        openai: mockOpenAI
      })
    ).rejects.toThrow('API rate limit exceeded')
  })
})

// Example 7: Testing Async Operations
describe('Token Refresh Logic', () => {
  it('should refresh expired tokens', async () => {
    const expiredToken = {
      access_token: 'old_token',
      refresh_token: 'refresh_123',
      expires_at: new Date(Date.now() - 1000).toISOString()
    }

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_token',
        expires_in: 7200
      })
    })

    global.fetch = mockFetch as any

    const result = await refreshAccessToken('twitter', expiredToken.refresh_token)

    expect(result.access_token).toBe('new_token')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('refresh_token')
      })
    )
  })
})

// Repurpose-Specific Testing Patterns
export const RepurposeTestPatterns = {
  // Pattern 1: Mock Supabase client
  mockSupabaseClient: () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null })
  }),

  // Pattern 2: Mock authenticated user
  mockAuthUser: (userId = 'test-user-123') => ({
    data: {
      user: {
        id: userId,
        email: 'test@example.com',
        created_at: new Date().toISOString()
      }
    },
    error: null
  }),

  // Pattern 3: Mock rate limiter
  mockRateLimiter: (success = true) => ({
    success,
    limit: 10,
    remaining: success ? 5 : 0,
    reset: Date.now() + 60000,
    headers: new Headers()
  })
}
