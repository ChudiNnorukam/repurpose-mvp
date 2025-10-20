#!/usr/bin/env node

/**
 * Simple Encryption Test
 * Tests core encryption functionality
 */

import crypto from 'crypto'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

// Inline encryption functions for testing
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32)
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters')
}

const KEY = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'))
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv, { authTagLength: AUTH_TAG_LENGTH })
  let encrypted = cipher.update(text, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

function decrypt(encryptedText) {
  const [ivB64, authTagB64, encryptedB64] = encryptedText.split(':')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}

console.log('🧪 Testing Encryption\n')

let passed = 0
let failed = 0

// Test 1: Basic encryption/decryption
console.log('Test 1: Basic Encryption/Decryption')
try {
  const original = 'my-oauth-token-12345'
  const encrypted = encrypt(original)
  const decrypted = decrypt(encrypted)

  if (decrypted === original) {
    console.log('  ✅ PASS - Encryption/decryption works')
    console.log(`     Original:  ${original}`)
    console.log(`     Encrypted: ${encrypted.substring(0, 50)}...`)
    console.log(`     Decrypted: ${decrypted}`)
    passed++
  } else {
    throw new Error('Mismatch')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 2: Random IV
console.log('\nTest 2: Random IV (Different Outputs)')
try {
  const token = 'same-token'
  const enc1 = encrypt(token)
  const enc2 = encrypt(token)

  if (enc1 !== enc2) {
    const dec1 = decrypt(enc1)
    const dec2 = decrypt(enc2)

    if (dec1 === token && dec2 === token) {
      console.log('  ✅ PASS - Random IV works, both decrypt correctly')
      passed++
    } else {
      throw new Error('Decryption failed')
    }
  } else {
    throw new Error('IV not random')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 3: Tampering detection
console.log('\nTest 3: Tampering Detection')
try {
  const encrypted = encrypt('secret')
  const parts = encrypted.split(':')
  parts[2] = parts[2].substring(0, 10) + 'XXXXX' // Tamper
  const tampered = parts.join(':')

  let caught = false
  try {
    decrypt(tampered)
  } catch {
    caught = true
  }

  if (caught) {
    console.log('  ✅ PASS - Tampering detected')
    passed++
  } else {
    throw new Error('Tampering not detected')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 4: Long text
console.log('\nTest 4: Long Text Encryption')
try {
  const long = 'x'.repeat(2000)
  const encrypted = encrypt(long)
  const decrypted = decrypt(encrypted)

  if (decrypted === long) {
    console.log(`  ✅ PASS - Encrypted ${long.length} characters`)
    passed++
  } else {
    throw new Error('Long text failed')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

console.log('\n' + '='.repeat(50))
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='.repeat(50))

if (failed === 0) {
  console.log('🎉 All tests passed!\n')
  process.exit(0)
} else {
  console.log('⚠️  Some tests failed\n')
  process.exit(1)
}
