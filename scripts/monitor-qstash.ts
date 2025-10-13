#!/usr/bin/env tsx

import { createHmac } from 'crypto'
import chalk from 'chalk'

interface Options {
  watch: boolean
  interval: number
  json: boolean
  baseUrl: string
}

interface MonitorSnapshot {
  fetchedAt: string
  pendingCount: number
  deadLetterCount: number
  samplePending: any[]
  sampleDeadLetter: any[]
  signatureTest: {
    status: number
    ok: boolean
    details: string
  }
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    watch: argv.includes('--watch'),
    interval: 30,
    json: argv.includes('--json'),
    baseUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000',
  }

  for (const arg of argv) {
    if (arg.startsWith('--interval=')) {
      options.interval = Math.max(5, Number(arg.split('=')[1]) || options.interval)
    } else if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.split('=')[1].replace(/\/$/, '')
    }
  }

  return options
}

function ensureEnv(variable: string): string {
  const value = process.env[variable]
  if (!value) {
    throw new Error(`Missing environment variable: ${variable}`)
  }
  return value
}

async function fetchQstash(endpoint: string, token: string) {
  const response = await fetch(`https://qstash.upstash.io${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`QStash ${endpoint} failed with ${response.status}`)
  }

  return response.json()
}

function createSignatureBody(
  signingKey: string,
  body: string,
  timestamp: number,
): string {
  const hmac = createHmac('sha256', signingKey)
  hmac.update(`${timestamp}.${body}`)
  const digest = hmac.digest('hex')
  return `t=${timestamp},v1=${digest}`
}

async function testSignature(baseUrl: string, signingKey: string) {
  const payload = JSON.stringify({
    postId: `test-${Date.now()}`,
    platform: 'twitter',
    content: 'signature verification',
    userId: '00000000-0000-0000-0000-000000000000',
  })
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = createSignatureBody(signingKey, payload, timestamp)

  const response = await fetch(`${baseUrl}/api/post/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Upstash-Signature': signature,
    },
    body: payload,
  })

  const ok = response.status !== 401 && response.status !== 403
  const details =
    response.status === 404
      ? 'Signature accepted (404 Post not found as expected)'
      : `Received ${response.status}`

  return {
    status: response.status,
    ok,
    details,
  }
}

async function captureSnapshot(options: Options): Promise<MonitorSnapshot> {
  const token = ensureEnv('QSTASH_TOKEN')
  const currentSigningKey = ensureEnv('QSTASH_CURRENT_SIGNING_KEY')

  const pending = await fetchQstash('/v2/messages', token)
  const dlq = await fetchQstash('/v2/dead-letter', token)
  const signatureTest = await testSignature(options.baseUrl, currentSigningKey)

  return {
    fetchedAt: new Date().toISOString(),
    pendingCount: pending?.items?.length ?? 0,
    deadLetterCount: dlq?.items?.length ?? 0,
    samplePending: pending?.items?.slice?.(0, 5) ?? [],
    sampleDeadLetter: dlq?.items?.slice?.(0, 5) ?? [],
    signatureTest,
  }
}

function renderSnapshot(snapshot: MonitorSnapshot) {
  console.log(chalk.cyan(`\nQStash Monitor @ ${snapshot.fetchedAt}`))
  console.log(
    `${chalk.green('Pending')}: ${snapshot.pendingCount} • ${chalk.red('Dead-letter')}: ${snapshot.deadLetterCount}`,
  )
  console.log(chalk.gray(`Signature test → ${snapshot.signatureTest.details}`))

  if (snapshot.samplePending.length) {
    console.log(chalk.green('\nPending sample:'))
    console.table(
      snapshot.samplePending.map((item: any) => ({
        id: item.messageId,
        endpoint: item.endpoint,
        delay: item.delay,
        notBefore: item.notBefore,
      })),
    )
  }

  if (snapshot.sampleDeadLetter.length) {
    console.log(chalk.red('\nDead-letter sample:'))
    console.table(
      snapshot.sampleDeadLetter.map((item: any) => ({
        id: item.messageId,
        endpoint: item.endpoint,
        error: item.error,
        deliveredAt: item.deliveredAt,
      })),
    )
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (!options.json) {
    console.log(chalk.bold(`QStash Monitor • Base URL: ${options.baseUrl}`))
  }

  const run = async () => {
    try {
      const snapshot = await captureSnapshot(options)
      if (options.json) {
        console.log(JSON.stringify(snapshot, null, 2))
      } else {
        renderSnapshot(snapshot)
      }
    } catch (error: any) {
      console.error(chalk.red(`Monitor failed: ${error.message}`))
      if (options.watch) {
        console.error(chalk.yellow('Retrying on next interval...'))
      } else {
        process.exitCode = 1
      }
    }
  }

  await run()

  if (options.watch) {
    console.log(chalk.gray(`\nWatching QStash every ${options.interval}s. Press Ctrl+C to stop.`))
    setInterval(run, options.interval * 1000)
  }
}

main().catch((error) => {
  console.error(chalk.red(error.message))
  process.exitCode = 1
})
