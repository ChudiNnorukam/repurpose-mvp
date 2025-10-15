jest.mock('@/lib/supabase')

import { refreshIfNeeded } from '../refresh'
import { getSupabaseAdmin } from '@/lib/supabase'

// Mock fetch globally
global.fetch = jest.fn()

const mockUpdate = jest.fn().mockReturnThis()
const mockEq = jest.fn().mockResolvedValue({ data: null, error: null })
const mockFrom = jest.fn().mockReturnValue({
  update: mockUpdate,
})

;(getSupabaseAdmin as jest.Mock).mockReturnValue({
  from: mockFrom,
})

describe('refreshIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdate.mockReturnValue({ eq: mockEq })
  })

  describe('No refresh token scenarios', () => {
    it('returns existing access token if no refresh token', async () => {
      const account = {
        id: 'account-1',
        access_token: 'existing-token',
        refresh_token: null,
      }

      const result = await refreshIfNeeded(account, 'twitter')

      expect(result).toBe('existing-token')
      expect(fetch).not.toHaveBeenCalled()
    })

    it('returns existing access token if refresh token is undefined', async () => {
      const account = {
        id: 'account-1',
        access_token: 'existing-token',
        refresh_token: undefined,
      }

      const result = await refreshIfNeeded(account, 'twitter')

      expect(result).toBe('existing-token')
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('Twitter token refresh', () => {
    it('refreshes Twitter token successfully', async () => {
      const account = {
        id: 'twitter-account-1',
        access_token: 'old-twitter-token',
        refresh_token: 'twitter-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-twitter-token',
          refresh_token: 'new-twitter-refresh-token',
        }),
      })

      const result = await refreshIfNeeded(account, 'twitter')

      expect(result).toBe('new-twitter-token')
      expect(fetch).toHaveBeenCalledWith(
        'https://api.twitter.com/2/oauth2/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.any(URLSearchParams),
        }
      )

      // Verify URLSearchParams contains correct data
      const callArgs = (fetch as jest.Mock).mock.calls[0]
      const params = callArgs[1].body as URLSearchParams
      expect(params.get('grant_type')).toBe('refresh_token')
      expect(params.get('refresh_token')).toBe('twitter-refresh-token')
      expect(params.get('client_id')).toBe('test-twitter-client-id')
      expect(params.get('client_secret')).toBe('test-twitter-client-secret')

      // Verify database update
      expect(mockFrom).toHaveBeenCalledWith('social_accounts')
      expect(mockUpdate).toHaveBeenCalledWith({
        access_token: 'new-twitter-token',
        refresh_token: 'new-twitter-refresh-token',
      })
      expect(mockEq).toHaveBeenCalledWith('id', 'twitter-account-1')
    })

    it('keeps old refresh token if new one not provided', async () => {
      const account = {
        id: 'twitter-account-1',
        access_token: 'old-twitter-token',
        refresh_token: 'twitter-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-twitter-token',
          // No refresh_token in response
        }),
      })

      const result = await refreshIfNeeded(account, 'twitter')

      expect(result).toBe('new-twitter-token')
      expect(mockUpdate).toHaveBeenCalledWith({
        access_token: 'new-twitter-token',
        refresh_token: 'twitter-refresh-token', // Old token preserved
      })
    })

    it('throws error if Twitter API responds with failure', async () => {
      const account = {
        id: 'twitter-account-1',
        access_token: 'old-twitter-token',
        refresh_token: 'twitter-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'Invalid refresh token',
      })

      await expect(refreshIfNeeded(account, 'twitter')).rejects.toThrow(
        'Failed to refresh twitter token: Invalid refresh token'
      )
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('throws error if Twitter API request rejects', async () => {
      const account = {
        id: 'twitter-account-1',
        access_token: 'old-twitter-token',
        refresh_token: 'twitter-refresh-token',
      }

      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(refreshIfNeeded(account, 'twitter')).rejects.toThrow(
        'Failed to refresh twitter token: Network error'
      )
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('returns old token if response has no access_token', async () => {
      const account = {
        id: 'twitter-account-1',
        access_token: 'old-twitter-token',
        refresh_token: 'twitter-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          // Missing access_token
          expires_in: 7200,
        }),
      })

      const result = await refreshIfNeeded(account, 'twitter')

      expect(result).toBe('old-twitter-token')
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('LinkedIn token refresh', () => {
    it('refreshes LinkedIn token successfully', async () => {
      const account = {
        id: 'linkedin-account-1',
        access_token: 'old-linkedin-token',
        refresh_token: 'linkedin-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-linkedin-token',
          refresh_token: 'new-linkedin-refresh-token',
        }),
      })

      const result = await refreshIfNeeded(account, 'linkedin')

      expect(result).toBe('new-linkedin-token')
      expect(fetch).toHaveBeenCalledWith(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: expect.any(URLSearchParams),
        }
      )

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      const params = callArgs[1].body as URLSearchParams
      expect(params.get('grant_type')).toBe('refresh_token')
      expect(params.get('refresh_token')).toBe('linkedin-refresh-token')
      expect(params.get('client_id')).toBe('test-linkedin-client-id')
      expect(params.get('client_secret')).toBe('test-linkedin-client-secret')

      expect(mockFrom).toHaveBeenCalledWith('social_accounts')
      expect(mockUpdate).toHaveBeenCalledWith({
        access_token: 'new-linkedin-token',
        refresh_token: 'new-linkedin-refresh-token',
      })
    })

    it('throws error if LinkedIn API responds with failure', async () => {
      const account = {
        id: 'linkedin-account-1',
        access_token: 'old-linkedin-token',
        refresh_token: 'linkedin-refresh-token',
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'Invalid grant',
      })

      await expect(refreshIfNeeded(account, 'linkedin')).rejects.toThrow(
        'Failed to refresh linkedin token: Invalid grant'
      )
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('throws error if LinkedIn API request rejects', async () => {
      const account = {
        id: 'linkedin-account-1',
        access_token: 'old-linkedin-token',
        refresh_token: 'linkedin-refresh-token',
      }

      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(refreshIfNeeded(account, 'linkedin')).rejects.toThrow(
        'Failed to refresh linkedin token: Network error'
      )
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('Unsupported platforms', () => {
    it('returns existing token for unsupported platform', async () => {
      const account = {
        id: 'account-1',
        access_token: 'existing-token',
        refresh_token: 'some-refresh-token',
      }

      const result = await refreshIfNeeded(account, 'facebook')

      expect(result).toBe('existing-token')
      expect(fetch).not.toHaveBeenCalled()
    })

    it('returns existing token for empty platform string', async () => {
      const account = {
        id: 'account-1',
        access_token: 'existing-token',
        refresh_token: 'some-refresh-token',
      }

      const result = await refreshIfNeeded(account, '')

      expect(result).toBe('existing-token')
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})
