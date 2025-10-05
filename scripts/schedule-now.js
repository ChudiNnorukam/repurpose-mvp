// Schedule a post NOW to Twitter
const fetch = require('node-fetch');

async function scheduleNow() {
  // Schedule for 30 seconds from now
  const scheduledTime = new Date(Date.now() + 30000).toISOString();

  console.log('🚀 Scheduling test post to Twitter...');
  console.log(`Scheduled time: ${scheduledTime}`);

  const response = await fetch('https://repurpose-orpin.vercel.app/api/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform: 'twitter',
      content: 'Test post from Claude Code - verifying autopost functionality works! 🤖',
      originalContent: 'Testing autopost',
      scheduledTime: scheduledTime,
      // Need to get actual user ID - this is a placeholder
      userId: 'NEED_ACTUAL_USER_ID'
    })
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Post scheduled successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('\nPost will execute in 30 seconds. Check your Twitter!');
  } else {
    console.log('❌ Failed to schedule:');
    console.log('Error:', JSON.stringify(data, null, 2));
  }
}

scheduleNow().catch(console.error);
