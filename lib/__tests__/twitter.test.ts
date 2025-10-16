jest.mock('twitter-api-v2')

import {
  generateCodeVerifier,
  generateCodeChallenge,
  getTwitterAuthUrl,
  getTwitterAccessToken,
  getTwitterUser,
  postTweet,
  refreshTwitterToken,
} from '../twitter'
import { TwitterApi } from 'twitter-api-v2'

describe('Twitter OAuth and API functions', () => {
  describe('PKCE code generation', () => {
    it('generateCodeVerifier creates a base64url string', () => {
      const verifier = generateCodeVerifier()

      expect(typeof verifier).toBe('string')
      expect(verifier.length).toBeGreaterThan(0)
      // Base64url should only contain alphanumeric, -, and _
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('generateCodeVerifier creates unique values', () => {
      const verifier1 = generateCodeVerifier()
      const verifier2 = generateCodeVerifier()

      expect(verifier1).not.toBe(verifier2)
    })

    it('generateCodeChallenge creates SHA256 hash of verifier', () => {
      const verifier = 'test-verifier-12345'
      const challenge = generateCodeChallenge(verifier)

      expect(typeof challenge).toBe('string')
      expect(challenge.length).toBeGreaterThan(0)
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('generateCodeChallenge produces consistent hashes', () => {
      const verifier = 'test-verifier-12345'
      const challenge1 = generateCodeChallenge(verifier)
      const challenge2 = generateCodeChallenge(verifier)

      expect(challenge1).toBe(challenge2)
    })

    it('generateCodeChallenge produces different hashes for different verifiers', () => {
      const challenge1 = generateCodeChallenge('verifier-1')
      const challenge2 = generateCodeChallenge('verifier-2')

      expect(challenge1).not.toBe(challenge2)
    })
  })

  describe('getTwitterAuthUrl', () => {
    it('creates authorization URL with PKCE challenge', () => {
      const state = 'test-csrf-state'
      const verifier = 'test-code-verifier'

      const url = getTwitterAuthUrl(state, verifier)
      const parsedUrl = new URL(url)

      expect(parsedUrl.origin).toBe('https://twitter.com')
      expect(parsedUrl.pathname).toBe('/i/oauth2/authorize')
      expect(parsedUrl.searchParams.get('response_type')).toBe('code')
      expect(parsedUrl.searchParams.get('client_id')).toBe('test-twitter-client-id')
      expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/twitter/callback')
      expect(parsedUrl.searchParams.get('scope')).toBe('tweet.read tweet.write users.read offline.access')
      expect(parsedUrl.searchParams.get('state')).toBe(state)
      expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy()
      expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256')
    })

    it('generates different challenges for different verifiers', () => {
      const state = 'test-state'
      const url1 = getTwitterAuthUrl(state, 'verifier-1')
      const url2 = getTwitterAuthUrl(state, 'verifier-2')

      const parsedUrl1 = new URL(url1)
      const parsedUrl2 = new URL(url2)

      expect(parsedUrl1.searchParams.get('code_challenge')).not.toBe(
        parsedUrl2.searchParams.get('code_challenge')
      )
    })
  })

  describe('getTwitterAccessToken', () => {
    const mockLoginWithOAuth2 = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      ;(TwitterApi as jest.MockedClass<typeof TwitterApi>).mockImplementation(() => ({
        loginWithOAuth2: mockLoginWithOAuth2,
      } as any))
    })

    it('exchanges code for access token using PKCE', async () => {
      mockLoginWithOAuth2.mockResolvedValue({
        accessToken: 'twitter-access-token',
        refreshToken: 'twitter-refresh-token',
        expiresIn: 7200,
      })

      const result = await getTwitterAccessToken('auth-code', 'code-verifier')

      expect(result).toEqual({
        accessToken: 'twitter-access-token',
        refreshToken: 'twitter-refresh-token',
        expiresIn: 7200,
      })

      expect(TwitterApi).toHaveBeenCalledWith({
        clientId: 'test-twitter-client-id',
        clientSecret: 'test-twitter-client-secret',
      })

      expect(mockLoginWithOAuth2).toHaveBeenCalledWith({
        code: 'auth-code',
        codeVerifier: 'code-verifier',
        redirectUri: 'http://localhost:3000/api/auth/twitter/callback',
      })
    })

    it('handles missing refresh token', async () => {
      mockLoginWithOAuth2.mockResolvedValue({
        accessToken: 'twitter-access-token',
        refreshToken: null,
        expiresIn: 7200,
      })

      const result = await getTwitterAccessToken('auth-code', 'code-verifier')

      expect(result.refreshToken).toBe('')
    })

    it('uses default expiresIn if not provided', async () => {
      mockLoginWithOAuth2.mockResolvedValue({
        accessToken: 'twitter-access-token',
        refreshToken: 'twitter-refresh-token',
        expiresIn: null,
      })

      const result = await getTwitterAccessToken('auth-code', 'code-verifier')

      expect(result.expiresIn).toBe(7200)
    })
  })

  describe('getTwitterUser', () => {
    const mockMe = jest.fn()
    const mockV2 = { me: mockMe }

    beforeEach(() => {
      jest.clearAllMocks()
      ;(TwitterApi as jest.MockedClass<typeof TwitterApi>).mockImplementation(() => ({
        v2: mockV2,
      } as any))
    })

    it('fetches authenticated user info', async () => {
      mockMe.mockResolvedValue({
        data: {
          id: 'twitter-user-id',
          username: 'testuser',
          name: 'Test User',
        },
      })

      const user = await getTwitterUser('access-token')

      expect(user).toEqual({
        id: 'twitter-user-id',
        username: 'testuser',
        name: 'Test User',
      })

      expect(TwitterApi).toHaveBeenCalledWith('access-token')
      expect(mockMe).toHaveBeenCalled()
    })
  })

  describe('postTweet', () => {
    const mockTweet = jest.fn()
    const mockMe = jest.fn()
    const mockV2 = { tweet: mockTweet, me: mockMe }

    beforeEach(() => {
      jest.clearAllMocks()
      ;(TwitterApi as jest.MockedClass<typeof TwitterApi>).mockImplementation(() => ({
        v2: mockV2,
      } as any))
    })

    it('posts a tweet and returns tweet ID and URL', async () => {
      mockTweet.mockResolvedValue({
        data: { id: 'tweet-123456' },
      })
      mockMe.mockResolvedValue({
        data: {
          id: 'twitter-user-id',
          username: 'testuser',
          name: 'Test User',
        },
      })

      const result = await postTweet('access-token', 'Hello world!')

      expect(result).toEqual({
        id: 'tweet-123456',
        url: 'https://twitter.com/testuser/status/tweet-123456'
      })
      expect(TwitterApi).toHaveBeenCalledWith('access-token')
      expect(mockTweet).toHaveBeenCalledWith('Hello world!')
      expect(mockMe).toHaveBeenCalled()
    })

    it('handles long tweet content', async () => {
      const longContent = 'A'.repeat(280)
      mockTweet.mockResolvedValue({
        data: { id: 'tweet-789' },
      })
      mockMe.mockResolvedValue({
        data: {
          id: 'user-id',
          username: 'longuser',
          name: 'Long User',
        },
      })

      const result = await postTweet('access-token', longContent)

      expect(result.id).toBe('tweet-789')
      expect(result.url).toBe('https://twitter.com/longuser/status/tweet-789')
      expect(mockTweet).toHaveBeenCalledWith(longContent)
    })
  })

  describe('refreshTwitterToken', () => {
    const mockRefreshOAuth2Token = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      ;(TwitterApi as jest.MockedClass<typeof TwitterApi>).mockImplementation(() => ({
        refreshOAuth2Token: mockRefreshOAuth2Token,
      } as any))
    })

    it('refreshes access token', async () => {
      mockRefreshOAuth2Token.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })

      const result = await refreshTwitterToken('old-refresh-token')

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })

      expect(TwitterApi).toHaveBeenCalledWith({
        clientId: 'test-twitter-client-id',
        clientSecret: 'test-twitter-client-secret',
      })

      expect(mockRefreshOAuth2Token).toHaveBeenCalledWith('old-refresh-token')
    })

    it('keeps old refresh token if new one not provided', async () => {
      mockRefreshOAuth2Token.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: null,
      })

      const result = await refreshTwitterToken('old-refresh-token')

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'old-refresh-token',
      })
    })
  })
})
