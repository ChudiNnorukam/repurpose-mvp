#!/usr/bin/env tsx
/**
 * CLI tool to create posts directly in Supabase
 * Usage: npm run create-post
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMPT_REHAB_3 = `Prompt Rehab #3 — Context is your cheat code

Most people prompt like they're texting a coworker.
Short. Vague. Assuming the AI knows the backstory.

It doesn't.

❌ "Write a LinkedIn post about AI workflows."
❌ "Draft an email to my team."
❌ "Summarize this article."

You're sending the AI into a room blindfolded.
No wonder it gives you generic nonsense.

Here's the unlock: context isn't extra work, it's the whole game 👇

✅ "You're a developer advocate writing for CTOs at B2B SaaS companies. Draft a 200-word LinkedIn post about n8n automation workflows. Tone: technical but approachable. Hook: start with a pain point about manual processes. End with a question to drive engagement."

Why it works:
• "Developer advocate for CTOs" = audience + authority.
• "200 words" = precise output constraint.
• "Tone: technical but approachable" = voice guardrails.
• "Hook / end with" = structure blueprint.
• You've given it a job description, not just a task.

The more context you front-load, the less editing you do later.
Think of it like briefing a freelancer: if you skip the brief, you get 5 rounds of revisions.

#PromptEngineering #AIWorkflows #DevTools #BuildInPublic #LearningInPublic #n8n`;

async function createPost() {
  console.log('🚀 Creating Prompt Rehab #3 post...\n');

  // Get first user ID
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError || !users?.users?.length) {
    console.error('❌ Error fetching users:', userError);
    process.exit(1);
  }

  const userId = users.users[0].id;
  console.log(`✅ User ID: ${userId}`);

  // Schedule for 2 minutes from now
  const scheduledTime = new Date(Date.now() + 2 * 60 * 1000);
  console.log(`⏱️  Scheduled for: ${scheduledTime.toISOString()}`);
  console.log(`   (Your local time: ${scheduledTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PDT)\n`);

  // Insert post
  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: userId,
      platform: 'linkedin',
      content: PROMPT_REHAB_3,
      original_content: 'Prompt Rehab #3 — Context is your cheat code',
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
  console.log('\n📊 Post details:');
  console.log(`   ID: ${data.id}`);
  console.log(`   Platform: ${data.platform}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Scheduled: ${data.scheduled_time}`);
  console.log(`\n📝 Content preview:`);
  console.log(`   ${PROMPT_REHAB_3.substring(0, 100)}...`);

  console.log('\n🎯 Next steps:');
  console.log('   1. Run Auto-Scheduler workflow in n8n (or wait for next 6-hour cycle)');
  console.log('   2. Check QStash dashboard for scheduled message');
  console.log('   3. Wait 2 minutes and check LinkedIn for published post');
  console.log('\n   Run: npm run trigger-scheduler');
}

createPost();
