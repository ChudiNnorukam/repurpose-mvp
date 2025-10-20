/**
 * Token Encryption/Decryption Helpers for Repurpose MVP
 *
 * This module provides encryption and decryption utilities for OAuth tokens
 * stored in the social_accounts table. Uses pgcrypto for server-side encryption.
 *
 * Security: Tokens are encrypted at rest using AES-256 encryption
 * Standards: Follows OWASP guidelines for cryptographic key management
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

/**
 * Encrypt a token using pgcrypto via Supabase
 *
 * @param token - Plain text token to encrypt
 * @returns Encrypted token as base64 string
 * @throws Error if encryption fails
 *
 * @example
 * const encrypted = await encryptToken(accessToken)
 */
export async function encryptToken(token: string): Promise<string> {
  if (!token) {
    throw new Error('Token cannot be empty')
  }

  try {
    // Use Supabase service role to call encryption function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Call the encrypt_token SQL function via RPC
    const { data, error } = await supabase.rpc('encrypt_token', {
      token_text: token,
    })

    if (error) {
      logger.error('Token encryption failed', error)
      throw new Error(`Encryption failed: ${error.message}`)
    }

    if (!data) {
      throw new Error('Encryption returned no data')
    }

    // Convert bytea to base64 for storage/transmission
    return Buffer.from(data).toString('base64')
  } catch (error) {
    logger.error('Unexpected error during token encryption', error)
    throw error
  }
}

/**
 * Decrypt an encrypted token using pgcrypto via Supabase
 *
 * @param encryptedToken - Base64-encoded encrypted token
 * @returns Plain text token
 * @throws Error if decryption fails
 *
 * @example
 * const plainToken = await decryptToken(encryptedTokenFromDB)
 */
export async function decryptToken(encryptedToken: string | null | undefined): Promise<string> {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty')
  }

  try {
    // Use Supabase service role to call decryption function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Convert base64 back to bytea format
    const tokenBuffer = Buffer.from(encryptedToken, 'base64')

    // Call the decrypt_token SQL function via RPC
    const { data, error } = await supabase.rpc('decrypt_token', {
      token_encrypted: tokenBuffer,
    })

    if (error) {
      logger.error('Token decryption failed', error)
      throw new Error(`Decryption failed: ${error.message}`)
    }

    if (!data || typeof data !== 'string') {
      throw new Error('Decryption returned invalid data')
    }

    return data
  } catch (error) {
    logger.error('Unexpected error during token decryption', error)
    throw error
  }
}

/**
 * Batch decrypt multiple tokens efficiently
 *
 * @param tokens - Array of base64-encoded encrypted tokens
 * @returns Array of decrypted tokens in same order
 *
 * @example
 * const plainTokens = await decryptTokenBatch([token1, token2, token3])
 */
export async function decryptTokenBatch(tokens: (string | null)[]): Promise<(string | null)[]> {
  return Promise.all(
    tokens.map(async (token) => {
      if (!token) {
        return null
      }
      try {
        return await decryptToken(token)
      } catch (error) {
        logger.warn('Failed to decrypt individual token in batch', error)
        return null
      }
    })
  )
}

/**
 * Encrypt a token for database storage
 * Wraps encryptToken with error handling suitable for database operations
 *
 * @param token - Plain text token
 * @returns Encrypted token ready for database storage
 */
export async function encryptTokenForStorage(token: string | null | undefined): Promise<string | null> {
  if (!token) {
    return null
  }

  try {
    return await encryptToken(token)
  } catch (error) {
    logger.error('Failed to encrypt token for storage', error)
    throw error
  }
}

/**
 * Verify encryption is working (for health checks)
 *
 * @throws Error if encryption/decryption fails
 */
export async function verifyEncryptionWorking(): Promise<boolean> {
  try {
    const testToken = 'test-token-' + Date.now()
    const encrypted = await encryptToken(testToken)
    const decrypted = await decryptToken(encrypted)

    const isWorking = decrypted === testToken

    if (!isWorking) {
      logger.error('Encryption verification failed: decrypted token does not match original')
      return false
    }

    logger.info('Encryption verification successful')
    return true
  } catch (error) {
    logger.error('Encryption verification failed', error)
    return false
  }
}

/**
 * Type for social account with encrypted tokens
 */
export interface EncryptedSocialAccount {
  id: string
  user_id: string
  platform: string
  access_token_encrypted: string
  refresh_token_encrypted: string | null
  account_id: string
  account_username: string
  connected_at: string
  expires_at: string | null
}

/**
 * Type for social account with decrypted tokens
 */
export interface DecryptedSocialAccount {
  id: string
  user_id: string
  platform: string
  access_token: string
  refresh_token: string | null
  account_id: string
  account_username: string
  connected_at: string
  expires_at: string | null
}

/**
 * Decrypt all tokens in a social account object
 *
 * @param account - Encrypted social account from database
 * @returns Social account with decrypted tokens
 */
export async function decryptSocialAccount(
  account: EncryptedSocialAccount
): Promise<DecryptedSocialAccount> {
  const [accessToken, refreshToken] = await Promise.all([
    decryptToken(account.access_token_encrypted),
    account.refresh_token_encrypted ? decryptToken(account.refresh_token_encrypted) : null,
  ])

  return {
    ...account,
    access_token: accessToken,
    refresh_token: refreshToken,
  }
}

/**
 * Decrypt multiple social accounts
 *
 * @param accounts - Array of encrypted social accounts
 * @returns Array of social accounts with decrypted tokens
 */
export async function decryptSocialAccountsBatch(
  accounts: EncryptedSocialAccount[]
): Promise<DecryptedSocialAccount[]> {
  return Promise.all(accounts.map((account) => decryptSocialAccount(account)))
}

/**
 * Migration helper: Check if tokens need encryption
 * Returns count of unencrypted tokens still in table
 */
export async function getUnencryptedTokenCount(): Promise<number> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data, error } = await supabase
      .from('social_accounts')
      .select('count', { count: 'exact' })
      .not('access_token', 'is', null)
      .is('access_token_encrypted', null)

    if (error) {
      throw error
    }

    return data?.[0]?.count || 0
  } catch (error) {
    logger.error('Failed to count unencrypted tokens', error)
    throw error
  }
}

/**
 * Health check function for encryption system
 * Can be called periodically to ensure encryption is working
 */
export async function healthCheckEncryption(): Promise<{
  healthy: boolean
  message: string
  unencryptedCount?: number
}> {
  try {
    const isWorking = await verifyEncryptionWorking()

    if (!isWorking) {
      return {
        healthy: false,
        message: 'Encryption verification failed',
      }
    }

    const unencryptedCount = await getUnencryptedTokenCount()

    if (unencryptedCount > 0) {
      logger.warn(`Found ${unencryptedCount} unencrypted tokens in database`)
      return {
        healthy: true,
        message: `Encryption working but ${unencryptedCount} legacy unencrypted tokens detected`,
        unencryptedCount,
      }
    }

    return {
      healthy: true,
      message: 'Encryption system healthy',
      unencryptedCount: 0,
    }
  } catch (error) {
    logger.error('Health check failed', error)
    return {
      healthy: false,
      message: `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
