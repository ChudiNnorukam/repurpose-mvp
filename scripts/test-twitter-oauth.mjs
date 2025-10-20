#!/usr/bin/env node

/**
 * Test Twitter OAuth Functions
 * Tests PKCE generation, URL building, and OAuth utilities
 */

import crypto from 'crypto'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

console.log('🧪 Testing Twitter OAuth Functions\n')

let passed = 0
let failed = 0

// Inline PKCE functions
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return { codeVerifier, codeChallenge }
}

function generateState() {
  return crypto.randomBytes(32).toString('base64url')
}

function getTwitterAuthUrl({ codeChallenge, state, redirectUri }) {
  const url = new URL('https://twitter.com/i/oauth2/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.TWITTER_CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

// Test 1: PKCE Generation
console.log('Test 1: PKCE Generation')
try {
  const { codeVerifier, codeChallenge } = generatePKCE()

  if (codeVerifier && codeChallenge) {
    console.log('  ✅ PASS - PKCE codes generated')
    console.log(`     Code Verifier:  ${codeVerifier.substring(0, 30)}... (${codeVerifier.length} chars)`)
    console.log(`     Code Challenge: ${codeChallenge.substring(0, 30)}... (${codeChallenge.length} chars)`)

    // Verify code challenge is SHA256 of verifier
    const expectedChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')

    if (expectedChallenge === codeChallenge) {
      console.log('  ✅ Code challenge correctly computed')
      passed++
    } else {
      throw new Error('Code challenge mismatch')
    }
  } else {
    throw new Error('Missing codes')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 2: PKCE Uniqueness
console.log('\nTest 2: PKCE Uniqueness')
try {
  const pkce1 = generatePKCE()
  const pkce2 = generatePKCE()

  if (pkce1.codeVerifier !== pkce2.codeVerifier &&
      pkce1.codeChallenge !== pkce2.codeChallenge) {
    console.log('  ✅ PASS - PKCE codes are unique per generation')
    passed++
  } else {
    throw new Error('PKCE codes not unique')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 3: State Generation
console.log('\nTest 3: State Generation')
try {
  const state1 = generateState()
  const state2 = generateState()

  if (state1 && state2 && state1 !== state2) {
    console.log('  ✅ PASS - State tokens are unique')
    console.log(`     State 1: ${state1.substring(0, 30)}...`)
    console.log(`     State 2: ${state2.substring(0, 30)}...`)
    passed++
  } else {
    throw new Error('State generation failed')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 4: Authorization URL Generation
console.log('\nTest 4: Authorization URL Generation')
try {
  const { codeChallenge } = generatePKCE()
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/twitter/callback'

  const authUrl = getTwitterAuthUrl({ codeChallenge, state, redirectUri })

  const url = new URL(authUrl)

  const requiredParams = [
    'response_type',
    'client_id',
    'redirect_uri',
    'scope',
    'state',
    'code_challenge',
    'code_challenge_method'
  ]

  const missingParams = requiredParams.filter(param => !url.searchParams.has(param))

  if (missingParams.length === 0) {
    console.log('  ✅ PASS - All required parameters present')
    console.log(`     URL: ${authUrl.substring(0, 80)}...`)
    console.log(`     Host: ${url.hostname}`)
    console.log(`     Params: ${url.searchParams.toString().substring(0, 50)}...`)

    // Verify PKCE method
    if (url.searchParams.get('code_challenge_method') === 'S256') {
      console.log('  ✅ PKCE method is S256')
      passed++
    } else {
      throw new Error('Wrong PKCE method')
    }
  } else {
    throw new Error(`Missing parameters: ${missingParams.join(', ')}`)
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 5: Environment Variables
console.log('\nTest 5: Environment Variables')
try {
  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET

  if (clientId && clientSecret) {
    console.log('  ✅ PASS - Twitter credentials configured')
    console.log(`     Client ID: ${clientId.substring(0, 20)}...`)
    console.log(`     Secret:    ${clientSecret ? '[REDACTED]' : 'MISSING'}`)
    passed++
  } else {
    throw new Error('Missing Twitter credentials')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 6: URL Scopes
console.log('\nTest 6: OAuth Scopes')
try {
  const { codeChallenge } = generatePKCE()
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/twitter/callback'

  const authUrl = getTwitterAuthUrl({ codeChallenge, state, redirectUri })
  const url = new URL(authUrl)
  const scopes = url.searchParams.get('scope').split(' ')

  const requiredScopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
  const hasAllScopes = requiredScopes.every(scope => scopes.includes(scope))

  if (hasAllScopes) {
    console.log('  ✅ PASS - All required scopes present')
    console.log(`     Scopes: ${scopes.join(', ')}`)
    passed++
  } else {
    throw new Error('Missing required scopes')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

console.log('\n' + '='.repeat(50))
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='.repeat(50))

if (failed === 0) {
  console.log('🎉 All Twitter OAuth tests passed!\n')
  process.exit(0)
} else {
  console.log('⚠️  Some tests failed\n')
  process.exit(1)
}
