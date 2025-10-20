#!/usr/bin/env node

/**
 * Test LinkedIn OAuth Functions
 * Tests state generation, URL building, and OAuth utilities
 */

import crypto from 'crypto'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

console.log('🧪 Testing LinkedIn OAuth Functions\n')

let passed = 0
let failed = 0

function generateState() {
  return crypto.randomBytes(32).toString('base64url')
}

function getLinkedInAuthUrl({ state, redirectUri }) {
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.LINKEDIN_CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'openid profile email w_member_social')
  url.searchParams.set('state', state)
  return url.toString()
}

// Test 1: State Generation
console.log('Test 1: State Generation')
try {
  const state1 = generateState()
  const state2 = generateState()

  if (state1 && state2 && state1 !== state2 && state1.length > 30) {
    console.log('  ✅ PASS - State tokens generated and unique')
    console.log(`     State 1: ${state1.substring(0, 30)}... (${state1.length} chars)`)
    console.log(`     State 2: ${state2.substring(0, 30)}... (${state2.length} chars)`)
    passed++
  } else {
    throw new Error('State generation failed')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 2: Authorization URL Generation
console.log('\nTest 2: Authorization URL Generation')
try {
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback'

  const authUrl = getLinkedInAuthUrl({ state, redirectUri })

  const url = new URL(authUrl)

  const requiredParams = [
    'response_type',
    'client_id',
    'redirect_uri',
    'scope',
    'state'
  ]

  const missingParams = requiredParams.filter(param => !url.searchParams.has(param))

  if (missingParams.length === 0) {
    console.log('  ✅ PASS - All required parameters present')
    console.log(`     URL: ${authUrl.substring(0, 80)}...`)
    console.log(`     Host: ${url.hostname}`)
    passed++
  } else {
    throw new Error(`Missing parameters: ${missingParams.join(', ')}`)
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 3: Environment Variables
console.log('\nTest 3: Environment Variables')
try {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (clientId && clientSecret) {
    console.log('  ✅ PASS - LinkedIn credentials configured')
    console.log(`     Client ID: ${clientId.substring(0, 15)}...`)
    console.log(`     Secret:    ${clientSecret ? '[REDACTED]' : 'MISSING'}`)
    passed++
  } else {
    throw new Error('Missing LinkedIn credentials')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 4: OAuth Scopes
console.log('\nTest 4: OAuth Scopes')
try {
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback'

  const authUrl = getLinkedInAuthUrl({ state, redirectUri })
  const url = new URL(authUrl)
  const scopes = url.searchParams.get('scope').split(' ')

  const requiredScopes = ['openid', 'profile', 'email', 'w_member_social']
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

// Test 5: Response Type
console.log('\nTest 5: Response Type')
try {
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback'

  const authUrl = getLinkedInAuthUrl({ state, redirectUri })
  const url = new URL(authUrl)

  if (url.searchParams.get('response_type') === 'code') {
    console.log('  ✅ PASS - Response type is "code" (authorization code flow)')
    passed++
  } else {
    throw new Error('Wrong response type')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

// Test 6: URL Format
console.log('\nTest 6: URL Format')
try {
  const state = generateState()
  const redirectUri = 'http://localhost:3000/api/auth/linkedin/callback'

  const authUrl = getLinkedInAuthUrl({ state, redirectUri })
  const url = new URL(authUrl)

  if (url.protocol === 'https:' &&
      url.hostname === 'www.linkedin.com' &&
      url.pathname === '/oauth/v2/authorization') {
    console.log('  ✅ PASS - Correct LinkedIn authorization endpoint')
    console.log(`     Endpoint: ${url.origin}${url.pathname}`)
    passed++
  } else {
    throw new Error('Wrong endpoint')
  }
} catch (error) {
  console.log('  ❌ FAIL:', error.message)
  failed++
}

console.log('\n' + '='.repeat(50))
console.log(`Results: ${passed} passed, ${failed} failed`)
console.log('='.repeat(50))

if (failed === 0) {
  console.log('🎉 All LinkedIn OAuth tests passed!\n')
  process.exit(0)
} else {
  console.log('⚠️  Some tests failed\n')
  process.exit(1)
}
