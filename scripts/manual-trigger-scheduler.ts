#!/usr/bin/env tsx
/**
 * Manually trigger the Auto-Scheduler workflow logic
 * Simulates what n8n does: fetch pending posts and call schedule-internal API
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function manualTrigger() {
  console.log('🚀 Manually triggering Auto-Scheduler workflow...\n');

  // Step 1: Get pending posts (simulating "Get Pending Posts" node)
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending');

  if (error) {
    console.error('❌ Error fetching pending posts:', error);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('📭 No pending posts found');
    process.exit(0);
  }

  console.log(`✅ Found ${posts.length} pending post(s)\n`);

  // Step 2: Call schedule-internal API for each post (simulating "Call Schedule API" node)
  for (const post of posts) {
    console.log(`📤 Scheduling post ${post.id}...`);
    console.log(`   Platform: ${post.platform}`);
    console.log(`   Scheduled for: ${post.scheduled_time}`);

    const response = await fetch('https://repurpose-orpin.vercel.app/api/schedule-internal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: post.id,
        userId: post.user_id,
        platform: post.platform,
        content: post.content,
        scheduledTime: post.scheduled_time,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Successfully scheduled!`);
      console.log(`   QStash Message ID: ${result.messageId}`);
      console.log(`   Scheduled for: ${result.scheduledFor}\n`);
    } else {
      console.error(`❌ Failed to schedule:`);
      console.error(`   Error: ${result.error}`);
      console.error(`   Message: ${result.message}\n`);
    }
  }

  console.log('🎯 Done! Check:');
  console.log('   1. Database: Posts should have status="scheduled" and qstash_message_id');
  console.log('   2. QStash Dashboard: https://console.upstash.com/qstash');
  console.log('   3. LinkedIn: Wait for scheduled time and check for published post');
}

manualTrigger();
