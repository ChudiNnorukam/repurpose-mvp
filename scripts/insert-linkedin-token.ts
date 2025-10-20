#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function insertLinkedInToken() {
  console.log('🔧 Inserting LinkedIn access token into social_accounts...\n');

  // Get the first user (you)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError || !users || users.users.length === 0) {
    console.error('❌ No users found:', userError);
    process.exit(1);
  }

  const userId = users.users[0].id;
  console.log(`✅ Found user: ${userId}`);

  // Get the LinkedIn token from env
  const linkedinToken = process.env.LINKEDIN_OAUTH2_ACCESS_TOKEN;

  if (!linkedinToken) {
    console.error('❌ LINKEDIN_OAUTH2_ACCESS_TOKEN not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Found LinkedIn token (${linkedinToken.length} chars)`);

  // Insert or update the social account (timestamps have defaults)
  const { data, error } = await supabase
    .from('social_accounts')
    .upsert({
      user_id: userId,
      platform: 'linkedin',
      access_token: linkedinToken,
    }, {
      onConflict: 'user_id,platform'
    })
    .select();

  if (error) {
    console.error('❌ Failed to insert token:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Did you run the SQL in Supabase dashboard?');
    console.log('   2. Check: https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho/editor');
    console.log('   3. Verify "social_accounts" table exists');
    process.exit(1);
  }

  console.log('✅ LinkedIn token inserted successfully!');
  console.log('\n📊 Stored data:', JSON.stringify(data, null, 2));

  console.log('\n🎯 Next step: Run immediate test post');
  console.log('   npx tsx scripts/test-linkedin-now.ts');
}

insertLinkedInToken();
