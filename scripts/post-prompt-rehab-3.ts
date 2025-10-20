#!/usr/bin/env tsx
/**
 * Post Prompt Rehab #3 to LinkedIn and Twitter
 *
 * This script:
 * 1. Adapts the content for each platform
 * 2. Posts immediately to both platforms
 */

const PROMPT_REHAB_3 = `Prompt Rehab #3 — Stop saying "make it better"

Bad prompt:

"Improve this email / landing page / prompt."

Better prompt:

"You are a senior product copywriter who writes for impatient founders. Here's the text: [PASTE]. Do exactly three things:

Cut length by ~30% while keeping the core benefit.

Replace any passive phrasing with active verbs.

Provide 2 subject/headline options and a 1-line A/B hypothesis (what to test, KPI).
Return: a JSON object with keys options (array), revised (string), hypothesis (string). No extra commentary."

Why this wins:

Role + voice = useful priors (expert judgment, not guessing).

Precise tasks stop the model from wandering.

JSON output = paste-ready into tools or prod.

A/B hypothesis turns aesthetics into measurable experiments.

Tiny rehab checklist to copy next time:

Role (who it should sound like)

Goal (what problem to solve)

Constraints (length, words to include/avoid)

Output format (exact structure)

Acceptance test (how you'll measure success)

Drop your actual prompt or text below and I'll rehab it into a paste-ready prompt you can feed the model.`;

const API_BASE = 'http://localhost:3000/api';

async function adaptContent(originalContent: string, platform: 'linkedin' | 'twitter') {
  console.log(`\n🔄 Adapting content for ${platform.toUpperCase()}...`);

  const response = await fetch(`${API_BASE}/adapt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: originalContent,
      platform,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to adapt for ${platform}: ${error}`);
  }

  const data = await response.json();
  return data.adaptedContent;
}

async function postContent(content: string, platform: 'linkedin' | 'twitter') {
  console.log(`\n📤 Posting to ${platform.toUpperCase()}...`);

  const response = await fetch(`${API_BASE}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      originalContent: PROMPT_REHAB_3,
      platform,
      scheduledTime: new Date().toISOString(), // Post now
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post to ${platform}: ${error}`);
  }

  const data = await response.json();
  return data;
}

async function main() {
  console.log('🚀 Starting Prompt Rehab #3 workflow...\n');
  console.log('Original content length:', PROMPT_REHAB_3.length, 'characters');

  try {
    // Step 1: Adapt for LinkedIn
    const linkedinContent = await adaptContent(PROMPT_REHAB_3, 'linkedin');
    console.log('\n✅ LinkedIn adaptation complete');
    console.log('Length:', linkedinContent.length, 'characters');
    console.log('Preview:', linkedinContent.substring(0, 200) + '...');

    // Step 2: Adapt for Twitter
    const twitterContent = await adaptContent(PROMPT_REHAB_3, 'twitter');
    console.log('\n✅ Twitter adaptation complete');
    console.log('Length:', twitterContent.length, 'characters');
    console.log('Content:', twitterContent);

    // Step 3: Post to LinkedIn
    const linkedinResult = await postContent(linkedinContent, 'linkedin');
    console.log('\n✅ Posted to LinkedIn');
    console.log('Post ID:', linkedinResult.postId);

    // Step 4: Post to Twitter
    const twitterResult = await postContent(twitterContent, 'twitter');
    console.log('\n✅ Posted to Twitter');
    console.log('Post ID:', twitterResult.postId);

    console.log('\n🎉 SUCCESS! Prompt Rehab #3 posted to both platforms!');
    console.log('\nCheck your posts:');
    console.log('- LinkedIn: Check your profile');
    console.log('- Twitter: Check your profile');
    console.log('\nView in app: http://localhost:3000/posts');

  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : error);
    console.error('\n💡 TIP: Make sure you are:');
    console.error('  1. Logged into the app at http://localhost:3000');
    console.error('  2. Connected to LinkedIn and Twitter via OAuth');
    console.error('  3. Have the dev server running (npm run dev)');
    process.exit(1);
  }
}

main();
