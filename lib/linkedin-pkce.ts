/**
 * LinkedIn OAuth 2.0 PKCE Implementation
 *
 * This module implements RFC 7636 Proof Key for Public OAuth 2.0 Authorization
 * Code Flow for LinkedIn authentication, fixing the security gap identified in
 * the v3.2 audit.
 *
 * Compliance: RFC 7636 (PKCE) - mandatory for enhanced security
 * Standards: OAuth 2.0 Authorization Framework
 */

import { randomBytes, createHash } from 'crypto'
import { logger } from './logger'

/**
 * Generates a cryptographically secure PKCE code verifier
 *
 * Per RFC 7636: code verifier is a string of 43-128 characters using
 * [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 *
 * @returns Base64URL-encoded code verifier (always 43 chars after encoding)
 * @example
 * const verifier = generateLinkedInCodeVerifier()
 * // Returns: 'e9Mz7m_kL3nP2q-R5s_T8uV9wX.yZ~A0b-C1d_E2f'
 */
export function generateLinkedInCodeVerifier(): string {
  // Generate 32 random bytes (256 bits) - provides 256 bits of entropy
  // When base64url encoded: 32 * 4/3 ≈ 43 characters
  const randomBytes_ = randomBytes(32)
  return randomBytes_.toString('base64url')
}

/**
 * Generates PKCE code challenge from verifier using SHA256
 *
 * Per RFC 7636: code_challenge is BASE64URL(SHA256(verifier))
 * Using S256 (SHA256) method - the RECOMMENDED and most secure method
 *
 * @param verifier - Code verifier from generateLinkedInCodeVerifier()
 * @returns Base64URL-encoded SHA256 hash
 * @example
 * const verifier = generateLinkedInCodeVerifier()
 * const challenge = generateLinkedInCodeChallenge(verifier)
 */
export function generateLinkedInCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

/**
 * Generate complete LinkedIn OAuth authorization URL with PKCE
 *
 * @param state - CSRF protection state (should be random, stored in session)
 * @param codeVerifier - Code verifier for PKCE (must be stored for callback)
 * @returns Complete authorization URL ready for redirect
 *
 * @example
 * const verifier = generateLinkedInCodeVerifier()
 * const state = generateRandomState()
 * const authUrl = getLinkedInAuthUrlWithPKCE(state, verifier)
 * // Store verifier and state in session
 * res.redirect(authUrl)
 */
export function getLinkedInAuthUrlWithPKCE(state: string, codeVerifier: string): string {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`
  const clientId = process.env.LINKEDIN_CLIENT_ID!
  const challenge = generateLinkedInCodeChallenge(codeVerifier)

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')

  // Standard OAuth parameters
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', callbackUrl)
  authUrl.searchParams.append('state', state)

  // PKCE parameters (RFC 7636)
  authUrl.searchParams.append('code_challenge', challenge)
  authUrl.searchParams.append('code_challenge_method', 'S256') // Always use S256 (SHA256)

  // LinkedIn-specific scopes
  authUrl.searchParams.append('scope', 'openid profile email w_member_social offline_access')

  logger.info('Generated LinkedIn auth URL with PKCE', {
    challenge_method: 'S256',
    verifier_length: codeVerifier.length,
    challenge_length: challenge.length,
  })

  return authUrl.toString()
}

/**
 * Exchange authorization code for access token using PKCE
 *
 * This is called in the OAuth callback to exchange the authorization code
 * for tokens. The code_verifier is required and must match the code_challenge
 * sent during the authorization request.
 *
 * @param code - Authorization code from LinkedIn redirect
 * @param codeVerifier - Original code verifier (must be retrieved from session/storage)
 * @returns Object with accessToken, refreshToken, and expiresIn
 * @throws Error if token exchange fails
 *
 * @example
 * // In callback handler:
 * const code = req.query.code
 * const codeVerifier = await getStoredCodeVerifier(state) // from Redis/session
 * const tokens = await exchangeLinkedInCodeWithPKCE(code, codeVerifier)
 */
export async function exchangeLinkedInCodeWithPKCE(
  code: string,
  codeVerifier: string
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}> {
  if (!code || !codeVerifier) {
    throw new Error('Code and code_verifier are required for PKCE token exchange')
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: callbackUrl,
      code_verifier: codeVerifier, // PKCE: Send verifier with token request
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('LinkedIn token exchange failed', {
      status: response.status,
      error: error.substring(0, 100), // Log first 100 chars only
    })
    throw new Error(`LinkedIn token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()

  logger.info('LinkedIn token exchange successful with PKCE', {
    expiresIn: data.expires_in,
    hasRefreshToken: !!data.refresh_token,
  })

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || '',
    expiresIn: data.expires_in || 5184000, // Default to 60 days
  }
}

/**
 * Refresh LinkedIn access token using PKCE (if refresh token available)
 *
 * LinkedIn's refresh token flow also uses the same OAuth endpoint.
 * PKCE is not required for refresh token grants, but can be used.
 *
 * @param refreshToken - Refresh token from previous authentication
 * @returns Object with new accessToken and refreshToken
 * @throws Error if refresh fails
 */
export async function refreshLinkedInTokenWithPKCE(
  refreshToken: string
): Promise<{
  accessToken: string
  refreshToken: string
}> {
  if (!refreshToken) {
    throw new Error('Refresh token is required')
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('LinkedIn token refresh failed', {
      status: response.status,
      error: error.substring(0, 100),
    })
    throw new Error(`LinkedIn token refresh failed: ${response.statusText}`)
  }

  const data = await response.json()

  logger.info('LinkedIn token refresh successful', {
    hasNewRefreshToken: !!data.refresh_token,
  })

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Use new token if provided
  }
}

/**
 * Generate a random state parameter for CSRF protection
 *
 * State should be random and unique per request to prevent CSRF attacks.
 * Store the state in the session and validate it in the callback.
 *
 * @returns Random base64url-encoded state string
 */
export function generateRandomState(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Validate PKCE parameters
 *
 * Performs basic validation of code verifier length and character set
 * per RFC 7636 requirements.
 *
 * @param verifier - Code verifier to validate
 * @returns true if valid, false otherwise
 */
export function validatePKCEVerifier(verifier: string): boolean {
  // Check length: must be 43-128 characters
  if (verifier.length < 43 || verifier.length > 128) {
    logger.warn('PKCE verifier length invalid', { length: verifier.length })
    return false
  }

  // Check character set: [A-Z] [a-z] [0-9] "-" "." "_" "~"
  const validCharset = /^[A-Za-z0-9\-._~]+$/
  if (!validCharset.test(verifier)) {
    logger.warn('PKCE verifier contains invalid characters')
    return false
  }

  return true
}

/**
 * Type for storing PKCE flow data in session/Redis
 */
export interface LinkedInPKCESession {
  state: string
  codeVerifier: string
  createdAt: number
  expiresAt: number
}

/**
 * Create session data for PKCE flow
 * Should be stored in Redis or encrypted session with TTL of 10 minutes
 *
 * @returns Session data ready to store
 */
export function createLinkedInPKCESession(): LinkedInPKCESession {
  const now = Date.now()
  const ttl = 10 * 60 * 1000 // 10 minutes

  return {
    state: generateRandomState(),
    codeVerifier: generateLinkedInCodeVerifier(),
    createdAt: now,
    expiresAt: now + ttl,
  }
}

/**
 * Validate PKCE session
 * Check if session is valid and not expired
 *
 * @param session - Session data from storage
 * @returns true if valid, false if invalid or expired
 */
export function validateLinkedInPKCESession(session: LinkedInPKCESession): boolean {
  if (!session) {
    return false
  }

  // Check expiration
  if (Date.now() > session.expiresAt) {
    logger.warn('PKCE session expired', {
      age: Date.now() - session.createdAt,
      ttl: session.expiresAt - session.createdAt,
    })
    return false
  }

  // Validate verifier format
  if (!validatePKCEVerifier(session.codeVerifier)) {
    return false
  }

  // Validate state format (should be base64url)
  if (!/^[A-Za-z0-9\-_]+$/.test(session.state)) {
    logger.warn('PKCE state contains invalid characters')
    return false
  }

  return true
}
