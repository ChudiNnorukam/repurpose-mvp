#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

const TEST_CONTENT = `🧪 Test Post - Automated via n8n + QStash

This is a test of the complete automation workflow:
✅ Created in Supabase
✅ Scheduled via n8n Auto-Scheduler
✅ Queued in QStash
✅ Published to LinkedIn automatically

If you're seeing this, the entire system works! 🎉

#Automation #n8n #QStash #BuildInPublic`;

async function scheduleImmediateTest() {
  console.log('🚀 Creating and scheduling immediate test post...\n');

  // Get user
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users!.users[0].id;
  
  // Schedule for 30 seconds from now
  const scheduledTime = new Date(Date.now() + 30 * 1000);
  
  console.log(`⏱️  Will execute in: 30 seconds`);
  console.log(`   Scheduled time: ${scheduledTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PDT\n`);

  // Create post
  const { data: post } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: userId,
      platform: 'linkedin',
      content: TEST_CONTENT,
      original_content: 'Test Post - Immediate Execution',
      scheduled_time: scheduledTime.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  console.log(`✅ Post created: ${post!.id}\n`);

  // Schedule with QStash
  console.log('📤 Scheduling with QStash...');
  
  const response = await fetch('https://repurpose-orpin.vercel.app/api/schedule-internal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId: post!.id,
      userId: userId,
      platform: 'linkedin',
      content: TEST_CONTENT,
      scheduledTime: scheduledTime.toISOString(),
    }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log(`✅ Successfully scheduled!`);
    console.log(`   QStash Message ID: ${result.messageId}\n`);
    
    console.log('🎯 TIMELINE:');
    console.log(`   NOW: Post queued in QStash`);
    console.log(`   +30s: QStash calls /api/post/execute`);
    console.log(`   +31s: Post published to LinkedIn\n`);
    
    console.log('📊 Check:');
    console.log('   • QStash: https://console.upstash.com/qstash');
    console.log('   • LinkedIn: Your feed in ~30 seconds');
    console.log('   • Vercel Logs: https://vercel.com/chudi-nnorukams-projects/repurpose/logs\n');
    
    console.log('⏳ Waiting 35 seconds to verify execution...');
    
    // Wait 35 seconds
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // Check if post was published
    const { data: publishedPosts } = await supabase
      .from('published_posts')
      .select('*')
      .eq('scheduled_post_id', post!.id)
      .maybeSingle();
    
    if (publishedPosts) {
      console.log('\n🎉 SUCCESS! Post was published to LinkedIn!');
      console.log(`   Platform Post ID: ${publishedPosts.platform_post_id}`);
      console.log(`   Published At: ${publishedPosts.published_at}`);
    } else {
      console.log('\n⏳ Post may still be processing... Check LinkedIn manually.');
      console.log('   (Sometimes LinkedIn API has delays)');
    }
    
  } else {
    console.error(`❌ Failed to schedule:`);
    console.error(`   Error: ${result.error}`);
    console.error(`   Message: ${result.message}`);
  }
}

scheduleImmediateTest();
