/**
 * Token Refresh Service
 *
 * Automatically refreshes expired OAuth tokens for Twitter and LinkedIn
 *
 * Features:
 * - Checks token expiry before API calls
 * - Automatically refreshes expired tokens
 * - Updates encrypted tokens in database
 * - Handles refresh failures gracefully
 *
 * Usage:
 *   import { refreshTokenIfNeeded } from '@/lib/auth/token-refresh'
 *   const token = await refreshTokenIfNeeded(accountId)
 */

import { supabaseAdmin } from '@/lib/supabase/admin'
import { decrypt, encrypt } from '@/lib/crypto/encryption'
import { refreshTwitterToken } from '@/lib/twitter/oauth'
import { refreshLinkedInToken } from '@/lib/linkedin/oauth'

/**
 * Check if token needs refresh (expires in < 5 minutes)
 *
 * @param expiresAt - Token expiration timestamp
 * @returns True if token should be refreshed
 */
export function shouldRefreshToken(expiresAt: string | null): boolean {
  if (!expiresAt) return false

  const expiryTime = new Date(expiresAt).getTime()
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  return expiryTime - now < fiveMinutes
}

/**
 * Get access token for account, refreshing if necessary
 *
 * @param accountId - Social account ID from database
 * @returns Decrypted access token (refreshed if needed)
 */
export async function getAccessToken(accountId: string): Promise<string> {
  // Fetch account from database
  const { data: account, error } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (error || !account) {
    throw new Error('Social account not found')
  }

  // Check if token needs refresh
  if (shouldRefreshToken(account.token_expires_at)) {
    console.log(`Token expiring soon for account ${accountId}, refreshing...`)

    try {
      const newToken = await refreshTokenForAccount(account)
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)

      // Mark account as needing re-authentication
      await supabaseAdmin
        .from('social_accounts')
        .update({
          is_active: false,
          verification_error: 'Token refresh failed - please reconnect your account'
        })
        .eq('id', accountId)

      throw new Error('Token expired and refresh failed. Please reconnect your account.')
    }
  }

  // Token still valid, decrypt and return
  return decrypt(account.access_token)
}

/**
 * Refresh token for a social account
 *
 * @param account - Social account record from database
 * @returns New decrypted access token
 */
async function refreshTokenForAccount(account: any): Promise<string> {
  const { platform, refresh_token, id } = account

  if (!refresh_token) {
    throw new Error(`No refresh token available for ${platform}`)
  }

  // Decrypt refresh token
  const decryptedRefreshToken = decrypt(refresh_token)

  let newAccessToken: string
  let newRefreshToken: string | null = null
  let expiresIn: number

  // Refresh based on platform
  if (platform === 'twitter') {
    const tokenData = await refreshTwitterToken(decryptedRefreshToken)
    newAccessToken = tokenData.accessToken
    newRefreshToken = tokenData.refreshToken
    expiresIn = tokenData.expiresIn

  } else if (platform === 'linkedin') {
    // LinkedIn doesn't typically provide refresh tokens
    // If we have one, try to use it
    const tokenData = await refreshLinkedInToken(decryptedRefreshToken)
    newAccessToken = tokenData.accessToken
    expiresIn = tokenData.expiresIn

  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  // Encrypt new tokens
  const encryptedAccessToken = encrypt(newAccessToken)
  const encryptedRefreshToken = newRefreshToken ? encrypt(newRefreshToken) : refresh_token

  // Calculate new expiry
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  // Update database
  await supabaseAdmin
    .from('social_accounts')
    .update({
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      last_verified_at: new Date().toISOString(),
      verification_error: null
    })
    .eq('id', id)

  console.log(`Successfully refreshed token for ${platform} account ${id}`)

  return newAccessToken
}

/**
 * Batch refresh expired tokens for all accounts
 *
 * Run this as a cron job to proactively refresh expiring tokens
 *
 * @returns Summary of refresh operations
 */
export async function refreshExpiredTokens(): Promise<{
  refreshed: number
  failed: number
  skipped: number
}> {
  console.log('Starting batch token refresh...')

  // Get all accounts with tokens expiring in next hour
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const { data: accounts, error } = await supabaseAdmin
    .from('social_accounts')
    .select('*')
    .lte('token_expires_at', oneHourFromNow)
    .eq('is_active', true)
    .not('refresh_token', 'is', null)

  if (error) {
    console.error('Failed to fetch accounts for refresh:', error)
    return { refreshed: 0, failed: 0, skipped: 0 }
  }

  if (!accounts || accounts.length === 0) {
    console.log('No tokens need refreshing')
    return { refreshed: 0, failed: 0, skipped: 0 }
  }

  console.log(`Found ${accounts.length} accounts with expiring tokens`)

  let refreshed = 0
  let failed = 0
  let skipped = 0

  for (const account of accounts) {
    try {
      if (!account.refresh_token) {
        skipped++
        continue
      }

      await refreshTokenForAccount(account)
      refreshed++

    } catch (error: any) {
      console.error(`Failed to refresh token for account ${account.id}:`, error.message)
      failed++

      // Mark account as needing attention
      await supabaseAdmin
        .from('social_accounts')
        .update({
          is_active: false,
          verification_error: `Auto-refresh failed: ${error.message}`
        })
        .eq('id', account.id)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('Batch token refresh complete:', { refreshed, failed, skipped })

  return { refreshed, failed, skipped }
}

/**
 * Verify token is still valid by making a test API call
 *
 * @param accountId - Social account ID
 * @returns True if token is valid
 */
export async function verifyToken(accountId: string): Promise<boolean> {
  try {
    const token = await getAccessToken(accountId)

    // Fetch account to check platform
    const { data: account } = await supabaseAdmin
      .from('social_accounts')
      .select('platform')
      .eq('id', accountId)
      .single()

    if (!account) return false

    // Make a simple API call to verify token works
    if (account.platform === 'twitter') {
      const { getTwitterUser } = await import('@/lib/twitter/oauth')
      await getTwitterUser(token)

    } else if (account.platform === 'linkedin') {
      const { getLinkedInUser } = await import('@/lib/linkedin/oauth')
      await getLinkedInUser(token)
    }

    // Update last verified timestamp
    await supabaseAdmin
      .from('social_accounts')
      .update({
        last_verified_at: new Date().toISOString(),
        verification_error: null
      })
      .eq('id', accountId)

    return true

  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}
