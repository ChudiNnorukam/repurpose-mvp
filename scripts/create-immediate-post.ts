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

async function createImmediatePost() {
  console.log('🚀 Creating immediate test post...\n');

  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users?.users?.length) {
    console.error('❌ Error fetching users:', userError);
    process.exit(1);
  }

  const userId = users.users[0].id;
  
  // Schedule for 30 seconds from now
  const scheduledTime = new Date(Date.now() + 30 * 1000);
  
  console.log(`✅ User ID: ${userId}`);
  console.log(`⏱️  Scheduled for: ${scheduledTime.toISOString()}`);
  console.log(`   (Your local time: ${scheduledTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PDT)`);
  console.log(`   (In 30 seconds from now)\n`);

  const { data, error } = await supabase
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

  if (error) {
    console.error('❌ Error creating post:', error);
    process.exit(1);
  }

  console.log('✅ Post created successfully!');
  console.log(`   ID: ${data.id}`);
  console.log(`   Platform: ${data.platform}`);
  console.log(`   Status: ${data.status}\n`);
  
  console.log('📋 Post ID for scheduling:', data.id);
  console.log('');
  
  return data;
}

createImmediatePost().then(post => {
  console.log('🎯 Next: Scheduling this post with QStash...\n');
  process.exit(0);
});
