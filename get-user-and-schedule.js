const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(
  'https://qdmmztwgfqvajhrnikho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbW16dHdnZnF2YWpocm5pa2hvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMzOTk4NCwiZXhwIjoyMDc0OTE1OTg0fQ.dsskzkVSIOjxmw1U2tMB4usTxIt5mQltPGc-mDdGel4'
);

async function getUserAndSchedule() {
  console.log('1️⃣ Getting user ID for nnorukamchudi@gmail.com...\n');

  // Get user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('Error getting users:', userError);
    return;
  }

  const user = users.find(u => u.email === 'nnorukamchudi@gmail.com');

  if (!user) {
    console.error('❌ User not found!');
    return;
  }

  console.log(`✅ Found user: ${user.email}`);
  console.log(`   User ID: ${user.id}\n`);

  // Check if Twitter is connected
  console.log('2️⃣ Checking Twitter connection...\n');
  const { data: account, error: accountError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', 'twitter')
    .single();

  if (accountError || !account) {
    console.error('❌ Twitter account not connected!');
    console.error('Please connect Twitter first at: https://repurpose-orpin.vercel.app/connections');
    return;
  }

  console.log(`✅ Twitter connected: @${account.account_username}\n`);

  // Schedule post for 1 minute from now
  const scheduledTime = new Date(Date.now() + 60000).toISOString();

  console.log('3️⃣ Scheduling test post...\n');
  console.log(`   Scheduled for: ${scheduledTime}`);
  console.log(`   Content: "Test post from Claude Code - autopost verification 🤖"\n`);

  const response = await fetch('https://repurpose-orpin.vercel.app/api/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform: 'twitter',
      content: 'Test post from Claude Code - autopost verification 🤖 #AutomationTest',
      originalContent: 'Testing autopost functionality',
      scheduledTime: scheduledTime,
      userId: user.id
    })
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ POST SCHEDULED SUCCESSFULLY!\n');
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('\n📅 Post will execute in 1 minute');
    console.log('🐦 Check your Twitter feed in 60 seconds!');
    console.log(`📊 Post ID: ${data.post?.id}`);
    console.log(`📡 QStash Message ID: ${data.qstashMessageId}`);
  } else {
    console.log('❌ FAILED TO SCHEDULE\n');
    console.log('Status:', response.status);
    console.log('Error:', JSON.stringify(data, null, 2));
  }
}

getUserAndSchedule().catch(console.error);
