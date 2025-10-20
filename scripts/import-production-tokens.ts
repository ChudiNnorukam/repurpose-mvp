#!/usr/bin/env tsx
/**
 * Import OAuth Tokens from Production to Local Database
 * Use this to copy connected accounts from production Supabase to local
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  console.log('📥 Importing OAuth tokens from production to local database...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  // Get your user ID (you'll need to provide this)
  const YOUR_USER_ID = '332b63c1-b1f7-4a07-9eba-6817ce3803ac'
  
  console.log(`Checking for connected accounts for user: ${YOUR_USER_ID}\n`)
  
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', YOUR_USER_ID)
  
  if (error) {
    console.error('❌ Error fetching accounts:', error)
    process.exit(1)
  }
  
  if (!accounts || accounts.length === 0) {
    console.log('⚠️  No connected accounts found in production database.')
    console.log('\nTo fix this:')
    console.log('1. Go to https://repurpose-orpin.vercel.app/connections')
    console.log('2. Connect Twitter and LinkedIn')
    console.log('3. Run this script again\n')
    process.exit(0)
  }
  
  console.log(`✅ Found ${accounts.length} connected account(s) in production:\n`)
  
  accounts.forEach(account => {
    console.log(`  - ${account.platform}: ${account.account_username}`)
    console.log(`    Token: ${account.access_token?.substring(0, 20)}...`)
    console.log(`    Connected: ${new Date(account.connected_at).toLocaleString()}\n`)
  })
  
  console.log('✅ Tokens are ready to use!')
  console.log('\nℹ️  Note: These tokens are already in your Supabase database.')
  console.log('Since you\'re using the same Supabase instance for both local and production,')
  console.log('the tokens are automatically available locally.\n')
  
  console.log('You can now run the posting script!')
}

main()
