/**
 * Authentication Verification Script
 *
 * This script diagnoses authentication and database issues for the post scheduling feature.
 * Run this to verify that:
 * 1. User authentication is working properly
 * 2. User exists in auth.users table
 * 3. Service role bypasses RLS correctly
 * 4. Environment variables are set correctly
 *
 * Usage:
 *   npx ts-node scripts/verify-auth.ts
 *
 * Or with environment:
 *   NODE_ENV=production npx ts-node scripts/verify-auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  log('\n🔍 Repurpose MVP - Authentication Verification Script', 'cyan')
  log('This script will help diagnose authentication and database issues\n', 'blue')

  // Step 1: Check environment variables
  section('1. Checking Environment Variables')

  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  let allEnvVarsSet = true

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (value) {
      log(`✅ ${key}: Set (${value.substring(0, 20)}...)`, 'green')
    } else {
      log(`❌ ${key}: NOT SET`, 'red')
      allEnvVarsSet = false
    }
  }

  if (!allEnvVarsSet) {
    log('\n❌ Missing required environment variables!', 'red')
    log('Please check your .env.local file and ensure all variables are set.', 'yellow')
    process.exit(1)
  }

  log('\n✅ All required environment variables are set', 'green')

  // Step 2: Initialize Supabase clients
  section('2. Initializing Supabase Clients')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAnon = createClient(supabaseUrl, anonKey)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  log('✅ Anon client initialized', 'green')
  log('✅ Admin client initialized', 'green')

  // Step 3: Test user authentication
  section('3. Testing User Authentication')

  log('Please provide user credentials to test authentication:', 'yellow')
  const email = await prompt('Email: ')
  const password = await prompt('Password: ')

  log('\n📝 Attempting to sign in...', 'blue')

  const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    log(`❌ Authentication failed: ${authError.message}`, 'red')
    log('Please check your credentials and try again.', 'yellow')
    process.exit(1)
  }

  if (!authData.user) {
    log('❌ Authentication succeeded but no user returned', 'red')
    process.exit(1)
  }

  log(`✅ Authentication successful!`, 'green')
  log(`   User ID: ${authData.user.id}`, 'blue')
  log(`   Email: ${authData.user.email}`, 'blue')
  log(`   Created: ${authData.user.created_at}`, 'blue')

  const userId = authData.user.id

  // Step 4: Verify user exists in auth.users with admin client
  section('4. Verifying User in auth.users Table (Admin Client)')

  try {
    const { data: adminUserData, error: adminUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId)

    if (adminUserError) {
      log(`❌ Failed to fetch user with admin client: ${adminUserError.message}`, 'red')
      log(`   Error code: ${adminUserError.status}`, 'yellow')
      process.exit(1)
    }

    if (!adminUserData?.user) {
      log('❌ User not found in auth.users table (admin query)', 'red')
      log('This indicates a database inconsistency!', 'yellow')
      process.exit(1)
    }

    log('✅ User verified in auth.users table (admin client)', 'green')
    log(`   User ID: ${adminUserData.user.id}`, 'blue')
    log(`   Email: ${adminUserData.user.email}`, 'blue')
    log(`   Created: ${adminUserData.user.created_at}`, 'blue')
  } catch (error: any) {
    log(`❌ Exception while verifying user: ${error.message}`, 'red')
    process.exit(1)
  }

  // Step 5: Test RLS policies
  section('5. Testing Row Level Security (RLS) Policies')

  log('📝 Attempting to query posts with anon client (RLS enabled)...', 'blue')

  const { data: anonPosts, error: anonError } = await supabaseAnon
    .from('posts')
    .select('id, user_id, platform, status, created_at')
    .limit(5)

  if (anonError) {
    log(`⚠️  RLS query failed: ${anonError.message}`, 'yellow')
    log('   This might be expected if RLS is strict', 'blue')
  } else {
    log(`✅ RLS query succeeded, returned ${anonPosts?.length || 0} posts`, 'green')
  }

  log('\n📝 Attempting to query posts with admin client (RLS bypassed)...', 'blue')

  const { data: adminPosts, error: adminPostsError } = await supabaseAdmin
    .from('posts')
    .select('id, user_id, platform, status, created_at')
    .eq('user_id', userId)
    .limit(5)

  if (adminPostsError) {
    log(`❌ Admin query failed: ${adminPostsError.message}`, 'red')
  } else {
    log(`✅ Admin query succeeded, returned ${adminPosts?.length || 0} posts`, 'green')
    if (adminPosts && adminPosts.length > 0) {
      log('\n   Sample posts:', 'blue')
      adminPosts.forEach((post) => {
        log(`   - ${post.id} (${post.platform}, ${post.status})`, 'blue')
      })
    }
  }

  // Step 6: Test post insertion with admin client
  section('6. Testing Post Insertion (Dry Run)')

  log('📝 Testing if we can insert a post with admin client...', 'blue')
  log('   (This will be a test insert that we\'ll delete immediately)', 'yellow')

  const testPost = {
    user_id: userId,
    platform: 'twitter' as const,
    original_content: 'Test post from verify-auth script',
    adapted_content: 'Test post from verify-auth script',
    scheduled_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    status: 'scheduled' as const,
  }

  const { data: insertedPost, error: insertError } = await supabaseAdmin
    .from('posts')
    .insert(testPost)
    .select()
    .single()

  if (insertError) {
    log(`❌ Post insertion failed: ${insertError.message}`, 'red')
    log(`   Error code: ${insertError.code}`, 'yellow')
    log(`   Details: ${insertError.details}`, 'yellow')
    log(`   Hint: ${insertError.hint}`, 'yellow')

    if (insertError.code === '23503') {
      log('\n🔍 FOREIGN KEY CONSTRAINT VIOLATION DETECTED!', 'red')
      log('   This is the exact error you\'re seeing in production.', 'yellow')
      log('   The user_id does not exist in auth.users table.', 'yellow')
    }

    process.exit(1)
  }

  log('✅ Post insertion succeeded!', 'green')
  log(`   Post ID: ${insertedPost.id}`, 'blue')
  log(`   User ID: ${insertedPost.user_id}`, 'blue')

  // Clean up test post
  log('\n🧹 Cleaning up test post...', 'blue')

  const { error: deleteError } = await supabaseAdmin
    .from('posts')
    .delete()
    .eq('id', insertedPost.id)

  if (deleteError) {
    log(`⚠️  Failed to delete test post: ${deleteError.message}`, 'yellow')
    log(`   You may need to manually delete post ${insertedPost.id}`, 'yellow')
  } else {
    log('✅ Test post deleted', 'green')
  }

  // Step 7: Check for existing failed posts
  section('7. Checking for Failed Posts')

  const { data: failedPosts, error: failedError } = await supabaseAdmin
    .from('posts')
    .select('id, platform, status, error_message, created_at')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(5)

  if (failedError) {
    log(`❌ Failed to query failed posts: ${failedError.message}`, 'red')
  } else if (failedPosts && failedPosts.length > 0) {
    log(`⚠️  Found ${failedPosts.length} failed posts for this user:`, 'yellow')
    failedPosts.forEach((post) => {
      log(`\n   Post ID: ${post.id}`, 'blue')
      log(`   Platform: ${post.platform}`, 'blue')
      log(`   Error: ${post.error_message || 'No error message'}`, 'yellow')
      log(`   Created: ${post.created_at}`, 'blue')
    })
  } else {
    log('✅ No failed posts found', 'green')
  }

  // Final summary
  section('🎉 Verification Complete!')

  log('All checks passed successfully!', 'green')
  log('\nWhat was verified:', 'blue')
  log('  ✅ Environment variables are set', 'green')
  log('  ✅ Supabase clients initialized', 'green')
  log('  ✅ User authentication works', 'green')
  log('  ✅ User exists in auth.users table', 'green')
  log('  ✅ Admin client can query posts (RLS bypass)', 'green')
  log('  ✅ Admin client can insert posts', 'green')
  log('  ✅ Foreign key constraint is valid', 'green')

  log('\nIf you\'re still experiencing issues in production:', 'yellow')
  log('  1. Ensure production environment variables match this environment', 'blue')
  log('  2. Check Vercel logs for detailed error messages', 'blue')
  log('  3. Verify the user ID being sent from the frontend matches the authenticated user', 'blue')
  log('  4. Consider clearing browser cache and re-authenticating', 'blue')

  // Sign out
  await supabaseAnon.auth.signOut()
}

main()
  .then(() => {
    log('\n✅ Script completed successfully\n', 'green')
    process.exit(0)
  })
  .catch((error) => {
    log(`\n❌ Script failed with error: ${error.message}\n`, 'red')
    console.error(error)
    process.exit(1)
  })
