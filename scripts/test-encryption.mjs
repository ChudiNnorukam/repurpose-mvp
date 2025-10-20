#!/usr/bin/env node

/**
 * Test Encryption Utilities
 *
 * Tests AES-256-GCM encryption/decryption
 *
 * Usage: node scripts/test-encryption.mjs
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment
dotenv.config({ path: join(__dirname, '../.env.local') })

// Import encryption functions
const { encrypt, decrypt, isEncrypted, hashToken, generateEncryptionKey } = await import('../lib/crypto/encryption.ts')

console.log('🧪 Testing Encryption Utilities\n')
console.log('=' .repeat(60))

let passedTests = 0
let failedTests = 0

// Test 1: Basic encryption/decryption
console.log('\n✅ Test 1: Basic Encryption/Decryption')
try {
  const original = 'my-secret-oauth-token-12345'
  const encrypted = encrypt(original)
  const decrypted = decrypt(encrypted)

  if (decrypted === original) {
    console.log('   ✓ Encryption and decryption successful')
    console.log(`   Original:  ${original}`)
    console.log(`   Encrypted: ${encrypted.substring(0, 50)}...`)
    console.log(`   Decrypted: ${decrypted}`)
    passedTests++
  } else {
    throw new Error('Decrypted text does not match original')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 2: Encrypted format validation
console.log('\n✅ Test 2: Encrypted Format Validation')
try {
  const token = 'test-token-123'
  const encrypted = encrypt(token)
  const parts = encrypted.split(':')

  if (parts.length === 3) {
    console.log('   ✓ Correct format (iv:authTag:ciphertext)')
    console.log(`   Parts: ${parts.length}`)
    passedTests++
  } else {
    throw new Error(`Wrong format, got ${parts.length} parts`)
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 3: Multiple encryptions produce different outputs
console.log('\n✅ Test 3: Random IV (Different Outputs)')
try {
  const token = 'same-token'
  const encrypted1 = encrypt(token)
  const encrypted2 = encrypt(token)

  if (encrypted1 !== encrypted2) {
    console.log('   ✓ Different encrypted outputs (random IV works)')
    console.log(`   First:  ${encrypted1.substring(0, 40)}...`)
    console.log(`   Second: ${encrypted2.substring(0, 40)}...`)

    // But both should decrypt to same value
    const decrypted1 = decrypt(encrypted1)
    const decrypted2 = decrypt(encrypted2)

    if (decrypted1 === token && decrypted2 === token) {
      console.log('   ✓ Both decrypt to original value')
      passedTests++
    } else {
      throw new Error('Decryption mismatch')
    }
  } else {
    throw new Error('Encrypted outputs are identical (IV not random)')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 4: Tampering detection
console.log('\n✅ Test 4: Tampering Detection')
try {
  const token = 'secure-token'
  const encrypted = encrypt(token)

  // Tamper with encrypted data
  const parts = encrypted.split(':')
  parts[2] = parts[2].substring(0, parts[2].length - 5) + 'XXXXX' // Modify ciphertext
  const tampered = parts.join(':')

  let caught = false
  try {
    decrypt(tampered)
  } catch (error) {
    caught = true
  }

  if (caught) {
    console.log('   ✓ Tampering detected and prevented')
    passedTests++
  } else {
    throw new Error('Tampering was not detected!')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 5: isEncrypted function
console.log('\n✅ Test 5: isEncrypted Detection')
try {
  const plaintext = 'plain-text-token'
  const encrypted = encrypt('encrypted-token')

  if (!isEncrypted(plaintext) && isEncrypted(encrypted)) {
    console.log('   ✓ Correctly identifies encrypted vs plaintext')
    console.log(`   Plain:     ${plaintext} → ${isEncrypted(plaintext)}`)
    console.log(`   Encrypted: ${encrypted.substring(0, 30)}... → ${isEncrypted(encrypted)}`)
    passedTests++
  } else {
    throw new Error('isEncrypted detection failed')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 6: Hash function
console.log('\n✅ Test 6: Token Hashing')
try {
  const token = 'my-access-token'
  const hash1 = hashToken(token)
  const hash2 = hashToken(token)
  const hash3 = hashToken('different-token')

  if (hash1 === hash2 && hash1 !== hash3) {
    console.log('   ✓ Consistent hashing')
    console.log(`   Token:      ${token}`)
    console.log(`   Hash:       ${hash1}`)
    console.log(`   Same hash:  ${hash1 === hash2}`)
    console.log(`   Diff token: ${hash3.substring(0, 20)}...`)
    passedTests++
  } else {
    throw new Error('Hashing inconsistent')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 7: Empty string handling
console.log('\n✅ Test 7: Error Handling')
try {
  let errorCaught = false
  try {
    encrypt('')
  } catch (error) {
    errorCaught = true
  }

  if (errorCaught) {
    console.log('   ✓ Correctly rejects empty strings')
    passedTests++
  } else {
    throw new Error('Should have thrown error for empty string')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Test 8: Long text encryption
console.log('\n✅ Test 8: Long Text Encryption')
try {
  const longToken = 'a'.repeat(1000) + 'secret-data' + 'b'.repeat(1000)
  const encrypted = encrypt(longToken)
  const decrypted = decrypt(encrypted)

  if (decrypted === longToken) {
    console.log('   ✓ Successfully encrypted/decrypted long text')
    console.log(`   Length: ${longToken.length} characters`)
    passedTests++
  } else {
    throw new Error('Long text encryption failed')
  }
} catch (error) {
  console.error('   ✗ Failed:', error.message)
  failedTests++
}

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Test Summary')
console.log('='.repeat(60))
console.log(`✅ Passed: ${passedTests}`)
console.log(`❌ Failed: ${failedTests}`)
console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`)

if (failedTests === 0) {
  console.log('\n🎉 All encryption tests passed!')
  console.log('✅ AES-256-GCM encryption is working correctly\n')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed. Review errors above.\n')
  process.exit(1)
}
