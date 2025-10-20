/**
 * Token Encryption Utilities
 *
 * AES-256-GCM encryption for OAuth tokens stored in database.
 *
 * Security features:
 * - AES-256-GCM (authenticated encryption)
 * - Random IV for each encryption
 * - Authentication tag prevents tampering
 * - Base64 encoding for database storage
 *
 * Usage:
 *   const encrypted = encrypt('my-oauth-token')
 *   const decrypted = decrypt(encrypted)
 */

import crypto from 'crypto'

// Get encryption key from environment
// IMPORTANT: Must be 32 bytes (64 hex characters) for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32)

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters')
}

// Ensure key is exactly 32 bytes
const KEY = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'))

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits

/**
 * Encrypt a string using AES-256-GCM
 *
 * @param text - Plain text to encrypt (e.g., OAuth access token)
 * @returns Encrypted string in format: iv:authTag:ciphertext (base64)
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty string')
  }

  try {
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv, {
      authTagLength: AUTH_TAG_LENGTH
    })

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')

    // Get auth tag
    const authTag = cipher.getAuthTag()

    // Return in format: iv:authTag:ciphertext
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`

  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt token')
  }
}

/**
 * Decrypt a string using AES-256-GCM
 *
 * @param encryptedText - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty string')
  }

  try {
    // Parse encrypted text
    const parts = encryptedText.split(':')

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format')
    }

    const [ivB64, authTagB64, encryptedB64] = parts

    // Convert from base64
    const iv = Buffer.from(ivB64, 'base64')
    const authTag = Buffer.from(authTagB64, 'base64')
    const encrypted = Buffer.from(encryptedB64, 'base64')

    // Validate lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length')
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length')
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv, {
      authTagLength: AUTH_TAG_LENGTH
    })

    // Set auth tag
    decipher.setAuthTag(authTag)

    // Decrypt
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')

  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt token - token may be corrupted or tampered with')
  }
}

/**
 * Check if a string is encrypted (has correct format)
 *
 * @param text - String to check
 * @returns True if string appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }

  const parts = text.split(':')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

/**
 * Generate a secure encryption key
 * Use this to generate ENCRYPTION_KEY for .env file
 *
 * @returns 32-byte random hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token for comparison (one-way)
 * Useful for checking if token has changed without storing plain text
 *
 * @param token - Token to hash
 * @returns SHA-256 hash (hex)
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

// Export for testing
export const __testing = {
  KEY,
  ALGORITHM,
  IV_LENGTH,
  AUTH_TAG_LENGTH
}
