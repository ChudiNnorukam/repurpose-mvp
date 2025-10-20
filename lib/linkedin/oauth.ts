/**
 * LinkedIn OAuth 2.0 Implementation
 *
 * Flow:
 * 1. User clicks "Connect LinkedIn"
 * 2. Generate random state for CSRF protection
 * 3. Store state in session/cookies
 * 4. Redirect to LinkedIn authorization
 * 5. LinkedIn redirects back with code
 * 6. Exchange code for access token
 * 7. Store encrypted token in database
 *
 * References:
 * - https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
 * - https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
 */

import crypto from 'crypto'
import { encrypt } from '@/lib/crypto/encryption'
import { supabaseAdmin } from '@/lib/supabase/admin'

// LinkedIn OAuth endpoints
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo'

// OAuth scopes for LinkedIn
// See: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile
const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social' // Required for UGC posts
].join(' ')

/**
 * Generate authorization URL for LinkedIn OAuth
 *
 * @param params - OAuth parameters
 * @returns Authorization URL to redirect user to
 */
export function getLinkedInAuthUrl(params: {
  state: string
  redirectUri: string
}): string {
  const { state, redirectUri } = params

  const url = new URL(LINKEDIN_AUTH_URL)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.LINKEDIN_CLIENT_ID!)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', LINKEDIN_SCOPES)
  url.searchParams.set('state', state)

  return url.toString()
}

/**
 * Exchange authorization code for access token
 *
 * @param params - Token exchange parameters
 * @returns Access token response from LinkedIn
 */
export async function exchangeLinkedInCode(params: {
  code: string
  redirectUri: string
}): Promise<{
  accessToken: string
  expiresIn: number
  scope: string
}> {
  const { code, redirectUri } = params

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('LinkedIn token exchange failed:', error)
    throw new Error(`LinkedIn OAuth failed: ${response.status} ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    scope: data.scope
  }
}

/**
 * Get LinkedIn user info using access token
 *
 * Uses OpenID Connect userinfo endpoint
 *
 * @param accessToken - LinkedIn access token
 * @returns User information
 */
export async function getLinkedInUser(accessToken: string): Promise<{
  id: string
  name: string
  email: string
  picture?: string
}> {
  const response = await fetch(LINKEDIN_PROFILE_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch LinkedIn user: ${error}`)
  }

  const data = await response.json()

  return {
    id: data.sub, // OpenID Connect subject identifier
    name: data.name,
    email: data.email,
    picture: data.picture
  }
}

/**
 * Store LinkedIn account in database
 *
 * @param params - Account details
 * @returns Created/updated account record
 */
export async function storeLinkedInAccount(params: {
  userId: string
  linkedInUser: {
    id: string
    name: string
    email: string
    picture?: string
  }
  accessToken: string
  expiresIn: number
  scopes: string[]
}) {
  const {
    userId,
    linkedInUser,
    accessToken,
    expiresIn,
    scopes
  } = params

  // Encrypt token before storing
  const encryptedAccessToken = encrypt(accessToken)

  // Calculate token expiry
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Upsert social account
  const { data, error } = await supabaseAdmin
    .from('social_accounts')
    .upsert({
      user_id: userId,
      platform: 'linkedin',
      account_type: 'personal',
      platform_user_id: linkedInUser.id,
      platform_username: linkedInUser.email, // LinkedIn doesn't provide username in userinfo
      platform_name: linkedInUser.name,
      profile_image_url: linkedInUser.picture,
      access_token: encryptedAccessToken,
      refresh_token: null, // LinkedIn doesn't provide refresh tokens by default
      token_expires_at: expiresAt.toISOString(),
      scopes: scopes,
      is_active: true,
      last_verified_at: new Date().toISOString(),
      verification_error: null
    }, {
      onConflict: 'user_id,platform,platform_user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to store LinkedIn account:', error)
    throw new Error('Failed to save LinkedIn account')
  }

  return data
}

/**
 * Generate random state for OAuth (CSRF protection)
 *
 * @returns Random state string
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Refresh LinkedIn access token
 *
 * Note: LinkedIn refresh tokens are only available with specific permissions
 * Standard OAuth flow doesn't include refresh tokens
 * Users will need to re-authenticate when tokens expire
 *
 * @param refreshToken - The refresh token (if available)
 * @returns New access token response
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<{
  accessToken: string
  expiresIn: number
}> {
  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LinkedIn token refresh failed: ${error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in
  }
}
