/**
 * Twitter OAuth 2.0 with PKCE Implementation
 *
 * Flow:
 * 1. User clicks "Connect Twitter"
 * 2. Generate code_verifier and code_challenge (PKCE)
 * 3. Store in session/cookies
 * 4. Redirect to Twitter authorization
 * 5. Twitter redirects back with code
 * 6. Exchange code for access token using code_verifier
 * 7. Store encrypted token in database
 *
 * References:
 * - https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code
 * - https://datatracker.ietf.org/doc/html/rfc7636 (PKCE)
 */

import crypto from 'crypto'
import { encrypt } from '@/lib/crypto/encryption'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Twitter OAuth endpoints
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const TWITTER_REVOKE_URL = 'https://api.twitter.com/2/oauth2/revoke'
const TWITTER_ME_URL = 'https://api.twitter.com/2/users/me'

// OAuth scopes for Twitter API v2
// See: https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code
const TWITTER_SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'offline.access' // Required for refresh tokens
].join(' ')

/**
 * Generate PKCE code verifier and challenge
 *
 * PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks
 *
 * @returns Object with code_verifier and code_challenge
 */
export function generatePKCE(): {
  codeVerifier: string
  codeChallenge: string
} {
  // Generate code_verifier: random 43-128 character string
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url')

  // Generate code_challenge: SHA256(code_verifier) in base64url
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  return {
    codeVerifier,
    codeChallenge
  }
}

/**
 * Generate authorization URL for Twitter OAuth
 *
 * @param params - OAuth parameters
 * @returns Authorization URL to redirect user to
 */
export function getTwitterAuthUrl(params: {
  codeChallenge: string
  state: string
  redirectUri: string
}): string {
  const { codeChallenge, state, redirectUri } = params

  const url = new URL(TWITTER_AUTH_URL)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID!)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', TWITTER_SCOPES)
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return url.toString()
}

/**
 * Exchange authorization code for access token
 *
 * @param params - Token exchange parameters
 * @returns Access token response from Twitter
 */
export async function exchangeTwitterCode(params: {
  code: string
  codeVerifier: string
  redirectUri: string
}): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  scope: string
}> {
  const { code, codeVerifier, redirectUri } = params

  // Prepare Basic Auth credentials
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Twitter token exchange failed:', error)
    throw new Error(`Twitter OAuth failed: ${response.status} ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope
  }
}

/**
 * Refresh Twitter access token using refresh token
 *
 * @param refreshToken - The refresh token from initial OAuth
 * @returns New access token response
 */
export async function refreshTwitterToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(TWITTER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: process.env.TWITTER_CLIENT_ID!
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter token refresh failed: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Some APIs don't return new refresh token
    expiresIn: data.expires_in
  }
}

/**
 * Get Twitter user info using access token
 *
 * @param accessToken - Twitter access token
 * @returns User information
 */
export async function getTwitterUser(accessToken: string): Promise<{
  id: string
  username: string
  name: string
  profileImageUrl?: string
}> {
  const response = await fetch(TWITTER_ME_URL + '?user.fields=profile_image_url', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch Twitter user: ${error}`)
  }

  const { data } = await response.json()

  return {
    id: data.id,
    username: data.username,
    name: data.name,
    profileImageUrl: data.profile_image_url
  }
}

/**
 * Store Twitter account in database
 *
 * @param params - Account details
 * @returns Created/updated account record
 */
export async function storeTwitterAccount(params: {
  userId: string
  twitterUser: {
    id: string
    username: string
    name: string
    profileImageUrl?: string
  }
  accessToken: string
  refreshToken: string
  expiresIn: number
  scopes: string[]
}) {
  const {
    userId,
    twitterUser,
    accessToken,
    refreshToken,
    expiresIn,
    scopes
  } = params

  // Encrypt tokens before storing
  const encryptedAccessToken = encrypt(accessToken)
  const encryptedRefreshToken = encrypt(refreshToken)

  // Calculate token expiry
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Upsert social account
  const { data, error } = await supabaseAdmin
    .from('social_accounts')
    .upsert({
      user_id: userId,
      platform: 'twitter',
      account_type: 'personal',
      platform_user_id: twitterUser.id,
      platform_username: twitterUser.username,
      platform_name: twitterUser.name,
      profile_image_url: twitterUser.profileImageUrl,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      scopes: scopes,
      is_active: true,
      last_verified_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform,platform_user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to store Twitter account:', error)
    throw new Error('Failed to save Twitter account')
  }

  return data
}

/**
 * Revoke Twitter access token
 *
 * @param accessToken - Token to revoke
 */
export async function revokeTwitterToken(accessToken: string): Promise<void> {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64')

  await fetch(TWITTER_REVOKE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      token: accessToken,
      token_type_hint: 'access_token'
    })
  })

  // Twitter returns 200 OK even if token was already invalid
  // No need to check response
}

/**
 * Generate random state for OAuth (CSRF protection)
 *
 * @returns Random state string
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('base64url')
}
