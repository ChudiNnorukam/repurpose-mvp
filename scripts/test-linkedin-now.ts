#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

const TEST_CONTENT = `🧪 **LIVE TEST - Automated Content Distribution**

This post was automatically:
✅ Created in Supabase database
✅ Scheduled via n8n workflow automation
✅ Queued in QStash message system
✅ Published to LinkedIn via OAuth 2.0

**Tech Stack:**
• n8n Cloud - Workflow orchestration
• QStash - Reliable message queue
• Supabase - PostgreSQL database
• Next.js 15 - API infrastructure
• LinkedIn UGC API - Publishing

If you're reading this, the complete automation pipeline works end-to-end! 🎉

#Automation #n8n #QStash #Supabase #BuildInPublic #DevOps`;

async function testLinkedInNow() {
  console.log('🚀 Creating immediate test post for LinkedIn...\n');

  // Get user
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users!.users[0].id;
  console.log(`✅ User ID: ${userId}`);

  // Verify LinkedIn connection
  const { data: socialAccount, error: accountError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'linkedin')
    .maybeSingle();

  if (accountError || !socialAccount) {
    console.error('❌ No LinkedIn connection found!');
    console.log('\n🔧 Fix:');
    console.log('   npx tsx scripts/insert-linkedin-token.ts');
    process.exit(1);
  }

  console.log(`✅ LinkedIn connection verified (token ${socialAccount.access_token.substring(0, 20)}...)`);

  // Schedule for 30 seconds from now
  const scheduledTime = new Date(Date.now() + 30 * 1000);
  console.log(`⏰ Scheduled for: ${scheduledTime.toISOString()}`);

  // Create post in scheduled_posts table
  const { data: post, error: postError } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: userId,
      platform: 'linkedin',
      content: TEST_CONTENT,
      scheduled_time: scheduledTime.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (postError || !post) {
    console.error('❌ Failed to create post:', postError);
    process.exit(1);
  }

  console.log(`✅ Post created in database: ${post.id}`);

  // Call the scheduling API
  console.log('\n📤 Calling /api/schedule-internal to queue with QStash...');

  const response = await fetch('https://repurpose-orpin.vercel.app/api/schedule-internal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postId: post.id,
      userId: userId,
      platform: 'linkedin',
      content: TEST_CONTENT,
      scheduledTime: scheduledTime.toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Schedule API failed:', errorText);
    process.exit(1);
  }

  const result = await response.json();
  console.log('✅ QStash job scheduled!');
  console.log(`   Message ID: ${result.messageId}`);
  console.log(`   Execution time: ${scheduledTime.toLocaleString()}`);

  console.log('\n⏳ Waiting 35 seconds for post to publish...');

  // Wait for execution
  await new Promise(resolve => setTimeout(resolve, 35000));

  // Check if it was published
  const { data: updatedPost } = await supabase
    .from('scheduled_posts')
    .select('status, posted_at, post_url, error_message')
    .eq('id', post.id)
    .single();

  console.log('\n📊 Post Status:', updatedPost);

  if (updatedPost?.status === 'posted') {
    console.log('\n🎉 SUCCESS! Post was published to LinkedIn!');
    console.log(`   View here: ${updatedPost.post_url}`);
    console.log('\n✅ Complete automation workflow verified!');
  } else if (updatedPost?.status === 'failed') {
    console.log('\n❌ Post failed to publish');
    console.log(`   Error: ${updatedPost.error_message}`);
  } else {
    console.log('\n⏳ Post still processing (status: ' + updatedPost?.status + ')');
    console.log('   Check QStash logs: https://console.upstash.com/qstash');
    console.log('   Check Vercel logs: https://vercel.com/chudi-nnorukams-projects/repurpose/logs');
  }
}

testLinkedInNow();
