import crypto from 'crypto'

// AES-256 encryption for sensitive data (OAuth tokens)
const algorithm = 'aes-256-gcm'
const keyLength = 32 // 256 bits

// Generate or retrieve encryption key from environment
function getEncryptionKey(): Buffer {
  const keyStr = process.env.ENCRYPTION_KEY
  if (!keyStr) {
    throw new Error('ENCRYPTION_KEY not set in environment variables')
  }

  // If key is a hex string, convert it. Otherwise use it as-is (base64)
  if (keyStr.match(/^[0-9a-f]+$/i) && keyStr.length === 64) {
    return Buffer.from(keyStr, 'hex')
  }

  // Base64 encoded key
  const buffer = Buffer.from(keyStr, 'base64')
  if (buffer.length !== keyLength) {
    throw new Error(`Encryption key must be ${keyLength} bytes, got ${buffer.length}`)
  }
  return buffer
}

export interface EncryptedData {
  ciphertext: string
  iv: string
  tag: string
}

/**
 * Encrypt sensitive data (OAuth tokens, API keys)
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  const tag = cipher.getAuthTag()

  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encrypted: EncryptedData | string): string {
  // Handle both object and stringified JSON formats
  const data: EncryptedData = typeof encrypted === 'string'
    ? JSON.parse(encrypted)
    : encrypted

  const key = getEncryptionKey()
  const iv = Buffer.from(data.iv, 'hex')
  const tag = Buffer.from(data.tag, 'hex')
  const ciphertext = Buffer.from(data.ciphertext, 'hex')

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)

  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}

/**
 * Generate a random encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(keyLength).toString('hex')
}
