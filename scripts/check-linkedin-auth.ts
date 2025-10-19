#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function checkLinkedInAuth() {
  console.log('🔍 Checking LinkedIn OAuth status...\n');

  // Get user
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users!.users[0].id;
  
  // Check for LinkedIn social account
  const { data: account, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'linkedin')
    .maybeSingle();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!account) {
    console.log('❌ No LinkedIn account connected!');
    console.log('\n🔧 ACTION REQUIRED:');
    console.log('   1. Visit: https://repurpose-orpin.vercel.app/connections');
    console.log('   2. Click "Connect LinkedIn"');
    console.log('   3. Authorize the app\n');
    return;
  }

  console.log('✅ LinkedIn account connected!');
  console.log(`   Platform User ID: ${account.platform_user_id}`);
  console.log(`   Username: ${account.username || 'N/A'}`);
  console.log(`   Has Access Token: ${!!account.access_token}`);
  console.log(`   Has Refresh Token: ${!!account.refresh_token}`);
  console.log(`   Token Expires: ${account.expires_at || 'N/A'}\n`);
  
  // Check if token is expired
  if (account.expires_at) {
    const expiresAt = new Date(account.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      console.log('⚠️  Access token is EXPIRED');
      console.log('   The system will attempt to refresh it automatically');
      console.log('   If refresh fails, reconnect at /connections\n');
    } else {
      console.log(`✅ Token is valid (expires in ${Math.floor((expiresAt.getTime() - now.getTime()) / 1000 / 60)} minutes)\n`);
    }
  }
}

checkLinkedInAuth();
