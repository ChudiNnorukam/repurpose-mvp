import { TwitterApi } from 'twitter-api-v2'
import { randomBytes, createHash } from 'crypto'
import { logger } from "./logger"

const clientId = process.env.TWITTER_CLIENT_ID
const clientSecret = process.env.TWITTER_CLIENT_SECRET

if (!clientId || !clientSecret) {
  logger.warn('Twitter OAuth credentials not configured')
}

/**
 * Generates a cryptographically secure PKCE code verifier
 * @returns Base64URL-encoded random string (32 bytes)
 */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Generates PKCE code challenge from verifier using SHA256
 * @param verifier - The code verifier to hash
 * @returns Base64URL-encoded SHA256 hash of verifier
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

/**
 * Generate OAuth 2.0 authorization URL with secure PKCE
 * @param state - CSRF protection state
 * @param codeVerifier - PKCE code verifier (must be stored for callback)
 */
export function getTwitterAuthUrl(state: string, codeVerifier: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`
  const challenge = generateCodeChallenge(codeVerifier)

  const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', clientId!)
  authUrl.searchParams.append('redirect_uri', callbackUrl)
  authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access')
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('code_challenge', challenge)
  authUrl.searchParams.append('code_challenge_method', 'S256')

  return authUrl.toString()
}

/**
 * Exchange authorization code for access token using PKCE
 * @param code - OAuth authorization code
 * @param codeVerifier - PKCE code verifier (from initiation)
 */
export async function getTwitterAccessToken(
  code: string,
  codeVerifier: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

  const client = new TwitterApi({
    clientId: clientId!,
    clientSecret: clientSecret!,
  })

  const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackUrl,
  })

  return {
    accessToken,
    refreshToken: refreshToken || '',
    expiresIn: expiresIn || 7200,
  }
}

// Get Twitter user info
export async function getTwitterUser(accessToken: string) {
  const client = new TwitterApi(accessToken)
  const { data: user } = await client.v2.me()
  return user
}

/**
 * Post a tweet and return the tweet ID and URL
 * @param accessToken - Twitter OAuth access token
 * @param content - Tweet content
 * @returns Object with tweetId and url
 */
export async function postTweet(
  accessToken: string,
  content: string
): Promise<{ id: string; url: string }> {
  const client = new TwitterApi(accessToken)
  const { data } = await client.v2.tweet(content)

  // Get the authenticated user's username for the URL
  const user = await client.v2.me()

  return {
    id: data.id,
    url: `https://twitter.com/${user.data.username}/status/${data.id}`
  }
}

// Refresh access token
export async function refreshTwitterToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
}> {
  const client = new TwitterApi({
    clientId: clientId!,
    clientSecret: clientSecret!,
  })

  const { accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(refreshToken)

  return {
    accessToken,
    refreshToken: newRefreshToken || refreshToken,
  }
}
