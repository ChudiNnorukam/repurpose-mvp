#!/usr/bin/env tsx
/**
 * Quickly setup LinkedIn token from env var
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function setupLinkedInToken() {
  console.log('🔧 Setting up LinkedIn token from .env.local...\n');

  const token = process.env.LINKEDIN_OAUTH2_ACCESS_TOKEN;
  if (!token) {
    console.error('❌ LINKEDIN_OAUTH2_ACCESS_TOKEN not found in .env.local');
    process.exit(1);
  }

  // Get first user
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users!.users[0].id;

  console.log(`✅ User ID: ${userId}`);
  console.log(`✅ Token length: ${token.length} characters\n`);

  // Check if LinkedIn account already exists
  const { data: existing } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'linkedin')
    .maybeSingle();

  if (existing) {
    console.log('⚠️  LinkedIn account already exists, updating token...');
    
    const { error } = await supabase
      .from('social_accounts')
      .update({
        access_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('❌ Error updating:', error);
      process.exit(1);
    }

    console.log('✅ Token updated successfully!\n');
  } else {
    console.log('📝 Creating new LinkedIn account entry...');
    
    const { error } = await supabase
      .from('social_accounts')
      .insert({
        user_id: userId,
        platform: 'linkedin',
        platform_user_id: 'manual-token',
        access_token: token,
        username: 'LinkedIn User',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      });

    if (error) {
      console.error('❌ Error inserting:', error);
      process.exit(1);
    }

    console.log('✅ LinkedIn account created successfully!\n');
  }

  console.log('🎯 Ready to post! Run:');
  console.log('   npx tsx scripts/test-linkedin-post.ts\n');
}

setupLinkedInToken();
