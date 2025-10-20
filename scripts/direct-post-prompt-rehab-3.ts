#!/usr/bin/env tsx
/**
 * Direct Post to LinkedIn and Twitter
 * Uses OAuth tokens from database to post directly
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const LINKEDIN_POST = `🎯 Prompt Rehab #3: Stop Saying "Make It Better"

Most people waste time with vague prompts:
❌ "Improve this email"
❌ "Make this landing page better"
❌ "Fix this prompt"

Here's what actually works:

💡 THE BETTER PROMPT:

"You are a senior product copywriter who writes for impatient founders. Here's the text: [PASTE].

Do exactly three things:
1. Cut length by ~30% while keeping the core benefit
2. Replace any passive phrasing with active verbs
3. Provide 2 subject/headline options and a 1-line A/B hypothesis (what to test, KPI)

Return: a JSON object with keys options (array), revised (string), hypothesis (string). No extra commentary."

🔥 Why This Wins:

→ Role + voice = useful priors (expert judgment, not guessing)
→ Precise tasks stop the model from wandering
→ JSON output = paste-ready into tools or prod
→ A/B hypothesis turns aesthetics into measurable experiments

📋 Your 5-Point Rehab Checklist:

1. Role (who it should sound like)
2. Goal (what problem to solve)
3. Constraints (length, words to include/avoid)
4. Output format (exact structure)
5. Acceptance test (how you'll measure success)

Drop your prompt below and I'll show you the rehab version 👇

#PromptEngineering #AI #ProductivityHacks #ContentCreation`;

const TWITTER_POST = `Stop saying "make it better" to AI 🛑

Better prompts have:
→ Role (senior copywriter)
→ Goal (cut 30%, active voice)
→ Format (return JSON)
→ Test (A/B hypothesis)

Turns vague requests into experiments 🧪

#PromptEngineering #AItools`;

async function postToLinkedIn(accessToken: string, content: string) {
  console.log('\n📤 Posting to LinkedIn...');

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: 'urn:li:person:AUTHOR_ID', // Will be replaced with actual user ID
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn API error: ${error}`);
  }

  return await response.json();
}

async function postToTwitter(accessToken: string, accessSecret: string, content: string) {
  console.log('\n📤 Posting to Twitter...');

  // Twitter API v2 requires OAuth 2.0
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🚀 Direct Posting - Prompt Rehab #3\n');

  // Initialize Supabase admin client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get the user's social accounts
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*');

    if (error) throw error;
    if (!accounts || accounts.length === 0) {
      throw new Error('No social accounts found. Please connect via OAuth first.');
    }

    console.log(`Found ${accounts.length} connected account(s)\n`);

    const linkedinAccount = accounts.find((a: any) => a.platform === 'linkedin');
    const twitterAccount = accounts.find((a: any) => a.platform === 'twitter');

    if (!linkedinAccount) {
      console.warn('⚠️  LinkedIn not connected');
    } else {
      console.log('✅ LinkedIn connected');
      console.log('   Account:', linkedinAccount.platform_user_id);
      // Would post here if we had the full implementation
      console.log('   📝 LinkedIn post ready (OAuth posting would happen here)');
    }

    if (!twitterAccount) {
      console.warn('⚠️  Twitter not connected');
    } else {
      console.log('✅ Twitter connected');
      console.log('   Account:', twitterAccount.platform_user_id);
      // Would post here if we had the full implementation
      console.log('   📝 Twitter post ready (OAuth posting would happen here)');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 POSTS PREPARED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('LinkedIn post (' + LINKEDIN_POST.length + ' chars):');
    console.log(LINKEDIN_POST.substring(0, 200) + '...\n');

    console.log('Twitter post (' + TWITTER_POST.length + ' chars):');
    console.log(TWITTER_POST + '\n');

    console.log('💡 To complete posting:');
    console.log('   1. Copy the posts above');
    console.log('   2. Post manually to LinkedIn and Twitter');
    console.log('   OR implement full OAuth posting in lib/linkedin.ts and lib/twitter.ts');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
