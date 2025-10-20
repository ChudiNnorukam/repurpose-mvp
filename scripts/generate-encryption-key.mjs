#!/usr/bin/env node

/**
 * Generate a secure encryption key for AES-256
 *
 * Usage: node scripts/generate-encryption-key.mjs
 *
 * Add the generated key to your .env.local:
 * ENCRYPTION_KEY=<generated-key>
 */

import crypto from 'crypto'

const key = crypto.randomBytes(32).toString('hex')

console.log('\n🔐 Generated Encryption Key (AES-256):\n')
console.log(key)
console.log('\n📝 Add this to your .env.local file:')
console.log(`ENCRYPTION_KEY=${key}`)
console.log('\n⚠️  IMPORTANT:')
console.log('  - Keep this key secret')
console.log('  - Never commit to git')
console.log('  - Use same key across all environments')
console.log('  - Rotating key will invalidate all encrypted tokens\n')
