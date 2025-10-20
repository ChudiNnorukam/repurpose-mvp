#!/usr/bin/env node

/**
 * Master Test Runner
 * Runs all test suites and provides summary
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const tests = [
  {
    name: 'Encryption Utilities',
    script: 'test-encryption-simple.mjs',
    icon: '🔐'
  },
  {
    name: 'Twitter OAuth',
    script: 'test-twitter-oauth.mjs',
    icon: '🐦'
  },
  {
    name: 'LinkedIn OAuth',
    script: 'test-linkedin-oauth.mjs',
    icon: '💼'
  }
]

console.log('🧪 Running All Test Suites')
console.log('='.repeat(60))
console.log()

const results = []

async function runTest(test) {
  return new Promise((resolve) => {
    const scriptPath = join(__dirname, test.script)

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env
    })

    child.on('close', (code) => {
      resolve({
        name: test.name,
        icon: test.icon,
        passed: code === 0
      })
    })
  })
}

// Run tests sequentially
for (const test of tests) {
  console.log(`${test.icon} Running: ${test.name}...`)
  console.log()

  const result = await runTest(test)
  results.push(result)

  console.log()
  console.log('-'.repeat(60))
  console.log()
}

// Summary
console.log('📊 Test Summary')
console.log('='.repeat(60))

let totalPassed = 0
let totalFailed = 0

results.forEach(result => {
  const status = result.passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${result.icon} ${result.name}: ${status}`)

  if (result.passed) {
    totalPassed++
  } else {
    totalFailed++
  }
})

console.log()
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed`)

if (totalFailed === 0) {
  console.log()
  console.log('🎉 All test suites passed!')
  console.log()
  console.log('✅ Encryption working')
  console.log('✅ Twitter OAuth ready')
  console.log('✅ LinkedIn OAuth ready')
  console.log()
  process.exit(0)
} else {
  console.log()
  console.log('⚠️  Some test suites failed')
  console.log()
  process.exit(1)
}
