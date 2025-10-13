#!/usr/bin/env tsx

import { randomUUID } from 'crypto'
import chalk from 'chalk'
import ora from 'ora'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

type Platform = 'twitter' | 'linkedin' | 'instagram'

interface Options {
  baseUrl: string
  immediate: boolean
  futureOffsetMinutes: number
  cleanup: boolean
  platform: Platform
}

interface ScheduledPostSummary {
  id: string
  scheduled_time: string | null
  status: string
  qstash_message_id: string | null
}

const DEFAULT_PLATFORM: Platform = 'twitter'

function parseArgs(argv: string[]): Options {
  const options: Options = {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000',
    immediate: argv.includes('--immediate'),
    futureOffsetMinutes: 30,
    cleanup: !argv.includes('--no-cleanup'),
    platform: DEFAULT_PLATFORM,
  }

  for (const arg of argv) {
    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.split('=')[1].replace(/\/$/, '')
    } else if (arg.startsWith('--future=')) {
      options.futureOffsetMinutes = Number(arg.split('=')[1]) || options.futureOffsetMinutes
    } else if (arg.startsWith('--platform=')) {
      const platform = arg.split('=')[1] as Platform
      if (['twitter', 'linkedin', 'instagram'].includes(platform)) {
        options.platform = platform
      }
    }
  }

  if (!options.immediate && !argv.some((arg) => arg.startsWith('--future='))) {
    options.immediate = true
  }

  return options
}

async function createSupabaseClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey || !serviceRole) {
    throw new Error('Missing Supabase environment variables.')
  }

  const anonClient = createClient(url, anonKey)
  const adminClient = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  return { anonClient, adminClient, projectRef: new URL(url).hostname.split('.')[0] }
}

async function createTestUser(admin: SupabaseClient) {
  const email = `autopost-test-${Date.now()}@example.com`
  const password = `Autopost!${Math.random().toString(16).slice(2, 10)}`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`)
  }

  return {
    id: data.user.id,
    email,
    password,
  }
}

async function seedSocialAccount(admin: SupabaseClient, userId: string, platform: Platform) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await admin.from('social_accounts').insert({
    user_id: userId,
    platform,
    access_token: `test-token-${randomUUID()}`,
    refresh_token: `test-refresh-${randomUUID()}`,
    expires_at: expiresAt,
    account_username: `autopost_${platform}_bot`,
    account_id: randomUUID(),
  })

  if (error) {
    throw new Error(`Unable to seed social account: ${error.message}`)
  }
}

async function signIn(
  anon: SupabaseClient,
  projectRef: string,
  email: string,
  password: string,
) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`)
  }

  const access = data.session.access_token
  const refresh = data.session.refresh_token
  const cookieHeader = `sb-${projectRef}-auth-token=${access}; sb-${projectRef}-refresh-token=${refresh}`

  return {
    session: data.session,
    cookieHeader,
  }
}

async function scheduleViaApi(
  baseUrl: string,
  cookieHeader: string,
  userId: string,
  platform: Platform,
  minutesFromNow: number,
) {
  const scheduledDate = new Date(Date.now() + minutesFromNow * 60 * 1000)
  const body = {
    platform,
    content: `Automated scheduling test message (${platform}) @ ${scheduledDate.toISOString()}`,
    originalContent: 'Automated scheduling flow verification content.',
    scheduledTime: scheduledDate.toISOString(),
    userId,
    metadata: {
      requestSource: 'script:test-scheduling-flow',
      timezoneOffsetMinutes: scheduledDate.getTimezoneOffset() * -1,
    },
  }

  const response = await fetch(`${baseUrl}/api/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))
  const traceId = response.headers.get('x-trace-id')

  if (!response.ok) {
    throw new Error(
      `Schedule API failed (${response.status}) ${payload.error ?? response.statusText} ${traceId ? `(trace: ${traceId})` : ''}`,
    )
  }

  return {
    payload,
    traceId,
  }
}

async function fetchScheduledPosts(admin: SupabaseClient, userId: string): Promise<ScheduledPostSummary[]> {
  const { data, error } = await admin
    .from('posts')
    .select('id, scheduled_time, status, qstash_message_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(`Unable to fetch posts: ${error.message}`)
  }

  return data as ScheduledPostSummary[]
}

async function markPostAsExecuted(
  admin: SupabaseClient,
  postId: string,
  platform: Platform,
) {
  const executedAt = new Date().toISOString()
  const { error } = await admin
    .from('posts')
    .update({
      status: 'posted',
      posted_at: executedAt,
      error_message: null,
    })
    .eq('id', postId)

  if (error) {
    throw new Error(`Failed to mark post ${postId} as executed: ${error.message}`)
  }

  return executedAt
}

async function cleanup(
  admin: SupabaseClient,
  userId: string,
  platform: Platform,
  email: string,
) {
  await admin.from('posts').delete().eq('user_id', userId)
  await admin.from('social_accounts').delete().eq('user_id', userId).eq('platform', platform)
  await admin.auth.admin.deleteUser(userId)
  console.log(chalk.gray(`Cleaned up test artifacts for ${email}.`))
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  console.log(chalk.bold(`Autopost scheduling E2E • ${new Date().toISOString()}`))
  console.log(chalk.gray(`Base URL: ${options.baseUrl}`))
  console.log(chalk.gray(`Platform: ${options.platform}`))

  const spinner = ora('Bootstrapping Supabase clients').start()
  const { anonClient, adminClient, projectRef } = await createSupabaseClients()
  spinner.succeed('Supabase clients ready')

  const userSpinner = ora('Creating disposable test user').start()
  const user = await createTestUser(adminClient)
  userSpinner.succeed(`Test user created (${user.email})`)

  try {
    const socialSpinner = ora(`Connecting mock ${options.platform} account`).start()
    await seedSocialAccount(adminClient, user.id, options.platform)
    socialSpinner.succeed('Mock social account connected')

    const authSpinner = ora('Signing in to obtain auth cookies').start()
    const { cookieHeader } = await signIn(anonClient, projectRef, user.email, user.password)
    authSpinner.succeed('Session established')

    const scheduledPosts: Array<{ label: string; result: any }> = []

    if (options.immediate) {
      const immediateSpinner = ora('Scheduling immediate post (+2 minutes)').start()
      const result = await scheduleViaApi(
        options.baseUrl,
        cookieHeader,
        user.id,
        options.platform,
        2,
      )
      immediateSpinner.succeed(`Immediate post scheduled (trace ${result.traceId ?? 'n/a'})`)
      scheduledPosts.push({ label: 'immediate', result })
    }

    const futureSpinner = ora(`Scheduling future post (+${options.futureOffsetMinutes} minutes)`).start()
    const futureResult = await scheduleViaApi(
      options.baseUrl,
      cookieHeader,
      user.id,
      options.platform,
      options.futureOffsetMinutes,
    )
    futureSpinner.succeed(`Future post scheduled (trace ${futureResult.traceId ?? 'n/a'})`)
    scheduledPosts.push({ label: 'future', result: futureResult })

    const verifySpinner = ora('Verifying posts persisted & QStash message IDs saved').start()
    const posts = await fetchScheduledPosts(adminClient, user.id)
    verifySpinner.succeed(`Fetched ${posts.length} recent posts`)

    const firstPost = posts.find((post) => post.status === 'scheduled')
    if (!firstPost) {
      throw new Error('Scheduled post not found in database.')
    }

    if (!firstPost.qstash_message_id) {
      throw new Error('Scheduled post missing QStash message ID.')
    }

    const executeSpinner = ora('Marking first scheduled post as executed (manual bypass)').start()
    const executedAt = await markPostAsExecuted(adminClient, firstPost.id, options.platform)
    executeSpinner.succeed(`Post ${firstPost.id} marked as posted at ${executedAt}`)

    console.log(chalk.green('\nE2E flow completed successfully.'))
    console.table(
      posts.map((post) => ({
        id: post.id,
        scheduled_for: post.scheduled_time,
        status: post.status,
        qstash_message_id: post.qstash_message_id ?? '∅',
      })),
    )
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Scheduling flow failed: ${error.message}`))
    throw error
  } finally {
    if (options.cleanup) {
      await cleanup(adminClient, user.id, options.platform, user.email)
    } else {
      console.log(chalk.yellow('Skipping cleanup (--no-cleanup supplied). Remember to remove test artifacts manually.'))
    }
  }
}

main().catch(() => {
  process.exitCode = 1
})
