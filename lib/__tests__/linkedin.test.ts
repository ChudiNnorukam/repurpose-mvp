import {
  getLinkedInAuthUrl,
  getLinkedInAccessToken,
  getLinkedInUser,
  postToLinkedIn,
} from '../linkedin'

// Mock fetch globally
global.fetch = jest.fn()

describe('LinkedIn OAuth and API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getLinkedInAuthUrl', () => {
    it('creates authorization URL with correct parameters', () => {
      const state = 'test-csrf-state'

      const url = getLinkedInAuthUrl(state)
      const parsedUrl = new URL(url)

      expect(parsedUrl.origin).toBe('https://www.linkedin.com')
      expect(parsedUrl.pathname).toBe('/oauth/v2/authorization')
      expect(parsedUrl.searchParams.get('response_type')).toBe('code')
      expect(parsedUrl.searchParams.get('client_id')).toBe('test-linkedin-client-id')
      expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/linkedin/callback')
      expect(parsedUrl.searchParams.get('state')).toBe(state)
      expect(parsedUrl.searchParams.get('scope')).toBe('openid profile email w_member_social')
    })

    it('includes correct callback URL from environment', () => {
      const state = 'test-state'
      const url = getLinkedInAuthUrl(state)
      const parsedUrl = new URL(url)

      expect(parsedUrl.searchParams.get('redirect_uri')).toContain('/api/auth/linkedin/callback')
    })
  })

  describe('getLinkedInAccessToken', () => {
    it('exchanges authorization code for access token', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'linkedin-access-token',
          expires_in: 5184000,
        }),
      })

      const result = await getLinkedInAccessToken('auth-code')

      expect(result).toEqual({
        accessToken: 'linkedin-access-token',
      })

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
      expect(params.get('grant_type')).toBe('authorization_code')
      expect(params.get('code')).toBe('auth-code')
      expect(params.get('client_id')).toBe('test-linkedin-client-id')
      expect(params.get('client_secret')).toBe('test-linkedin-client-secret')
      expect(params.get('redirect_uri')).toBe('http://localhost:3000/api/auth/linkedin/callback')
    })

    it('throws error if token exchange fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'Invalid authorization code',
      })

      await expect(getLinkedInAccessToken('invalid-code')).rejects.toThrow(
        'LinkedIn token exchange failed: Invalid authorization code'
      )
    })

    it('throws error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: async () => 'Bad request',
      })

      await expect(getLinkedInAccessToken('code')).rejects.toThrow(
        'LinkedIn token exchange failed: Bad request'
      )
    })
  })

  describe('getLinkedInUser', () => {
    it('fetches user info with access token', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          sub: 'linkedin-user-id-123',
          name: 'Test User',
          email: 'test@example.com',
        }),
      })

      const user = await getLinkedInUser('access-token')

      expect(user).toEqual({
        id: 'linkedin-user-id-123',
        name: 'Test User',
      })

      expect(fetch).toHaveBeenCalledWith(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: {
            'Authorization': 'Bearer access-token',
          },
        }
      )
    })

    it('throws error if user info fetch fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      })

      await expect(getLinkedInUser('invalid-token')).rejects.toThrow(
        'Failed to get LinkedIn user info'
      )
    })

    it('handles missing fields gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          sub: 'user-123',
          name: 'John Doe',
        }),
      })

      const user = await getLinkedInUser('access-token')

      expect(user.id).toBe('user-123')
      expect(user.name).toBe('John Doe')
    })
  })

  describe('postToLinkedIn', () => {
    it('posts content to LinkedIn successfully', async () => {
      // Mock user info fetch
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: 'user-id-123',
            name: 'Test User',
          }),
        })
        // Mock post creation
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'post-id-456',
          }),
        })

      const postId = await postToLinkedIn('access-token', 'Hello LinkedIn!')

      expect(postId).toBe('post-id-456')

      // Verify user info call
      expect(fetch).toHaveBeenNthCalledWith(1, 'https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': 'Bearer access-token',
        },
      })

      // Verify post creation call
      expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer access-token',
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: expect.any(String),
      })

      const postCallArgs = (fetch as jest.Mock).mock.calls[1]
      const postBody = JSON.parse(postCallArgs[1].body)
      expect(postBody.author).toBe('urn:li:person:user-id-123')
      expect(postBody.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary.text).toBe(
        'Hello LinkedIn!'
      )
      expect(postBody.lifecycleState).toBe('PUBLISHED')
      expect(postBody.visibility['com.linkedin.ugc.MemberNetworkVisibility']).toBe('PUBLIC')
    })

    it('throws error if user info fetch fails', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
      })

      await expect(postToLinkedIn('invalid-token', 'Content')).rejects.toThrow(
        'Failed to get LinkedIn user info'
      )

      // Should not make second call
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('throws error if post creation fails', async () => {
      // Mock successful user info fetch
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: 'user-id-123',
            name: 'Test User',
          }),
        })
        // Mock failed post creation
        .mockResolvedValueOnce({
          ok: false,
          text: async () => 'Rate limit exceeded',
        })

      await expect(postToLinkedIn('access-token', 'Content')).rejects.toThrow(
        'Failed to post to LinkedIn: Rate limit exceeded'
      )

      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('handles long post content', async () => {
      let longContent = ''
      for (let i = 0; i < 3000; i++) {
        longContent += 'A'
      }

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: 'user-123', name: 'User' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'post-789' }),
        })

      const postId = await postToLinkedIn('access-token', longContent)

      expect(postId).toBe('post-789')

      const postCallArgs = (fetch as jest.Mock).mock.calls[1]
      const postBody = JSON.parse(postCallArgs[1].body)
      expect(postBody.specificContent['com.linkedin.ugc.ShareContent'].shareCommentary.text).toBe(
        longContent
      )
    })

    it('creates post with correct UGC format', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: 'abc123', name: 'User' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'post-xyz' }),
        })

      await postToLinkedIn('token', 'Test post')

      const postCallArgs = (fetch as jest.Mock).mock.calls[1]
      const postBody = JSON.parse(postCallArgs[1].body)

      expect(postBody).toHaveProperty('author')
      expect(postBody).toHaveProperty('lifecycleState', 'PUBLISHED')
      expect(postBody).toHaveProperty('specificContent')
      expect(postBody.specificContent['com.linkedin.ugc.ShareContent']).toBeDefined()
      expect(postBody.specificContent['com.linkedin.ugc.ShareContent']).toHaveProperty(
        'shareMediaCategory',
        'NONE'
      )
      expect(postBody).toHaveProperty('visibility')
    })
  })
})
