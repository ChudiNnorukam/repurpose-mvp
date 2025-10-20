#!/usr/bin/env tsx
/**
 * Execute Posting Workflow - Prompt Rehab #3
 * Actually posts to Twitter and LinkedIn using OAuth tokens
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { postTweet } from '../lib/twitter';
import { postToLinkedIn } from '../lib/linkedin';

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

async function main() {
  console.log('🚀 Executing Posting Workflow - Prompt Rehab #3\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get social accounts
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*');

    if (error) throw error;
    if (!accounts || accounts.length === 0) {
      throw new Error('No social accounts found. Please connect via OAuth at http://localhost:3000/connections');
    }

    console.log(`Found ${accounts.length} connected account(s)\n`);

    const twitterAccount = accounts.find((a: any) => a.platform === 'twitter');
    const linkedinAccount = accounts.find((a: any) => a.platform === 'linkedin');

    let twitterResult, linkedinResult;

    // Post to Twitter
    if (twitterAccount && twitterAccount.access_token) {
      try {
        console.log('📤 Posting to Twitter...');
        console.log(`   Content: "${TWITTER_POST.substring(0, 50)}..."`);
        console.log(`   Length: ${TWITTER_POST.length} characters\n`);

        twitterResult = await postTweet(twitterAccount.access_token, TWITTER_POST);

        console.log('✅ SUCCESS! Posted to Twitter');
        console.log(`   Tweet ID: ${twitterResult.tweetId}`);
        console.log(`   URL: ${twitterResult.url}\n`);
      } catch (err) {
        console.error('❌ Failed to post to Twitter:', err);
      }
    } else {
      console.log('⚠️  Twitter NOT connected');
      console.log('   → Go to http://localhost:3000/connections to connect\n');
    }

    // Post to LinkedIn
    if (linkedinAccount && linkedinAccount.access_token) {
      try {
        console.log('📤 Posting to LinkedIn...');
        console.log(`   Content length: ${LINKEDIN_POST.length} characters\n`);

        linkedinResult = await postToLinkedIn(linkedinAccount.access_token, LINKEDIN_POST);

        console.log('✅ SUCCESS! Posted to LinkedIn');
        console.log(`   Post ID: ${linkedinResult.id}`);
        console.log(`   URL: ${linkedinResult.url}\n`);
      } catch (err) {
        console.error('❌ Failed to post to LinkedIn:', err);
      }
    } else {
      console.log('⚠️  LinkedIn NOT connected');
      console.log('   → Go to http://localhost:3000/connections to connect\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 WORKFLOW SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (twitterResult) {
      console.log(`✅ Twitter: POSTED`);
      console.log(`   View: ${twitterResult.url}`);
    } else {
      console.log(`❌ Twitter: Not posted`);
    }

    if (linkedinResult) {
      console.log(`✅ LinkedIn: POSTED`);
      console.log(`   View: ${linkedinResult.url}`);
    } else {
      console.log(`❌ LinkedIn: Not posted (connect at /connections)`);
    }

    console.log('\n🎉 Workflow complete!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
