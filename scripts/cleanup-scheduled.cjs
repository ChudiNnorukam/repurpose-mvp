// Direct database cleanup script - deletes all scheduled posts for a user
// Run from repurpose directory: node scripts/cleanup-scheduled.js <USER_ID>

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const USER_ID = process.argv[2];

if (!USER_ID) {
  console.error('❌ Error: USER_ID is required');
  console.error('Usage: node scripts/cleanup-scheduled.js <USER_ID>');
  process.exit(1);
}

// Read from .env.local
const envPath = '/Users/chudinnorukam/Downloads/Repurpose MVP /repurpose/.env.local';
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🗑️  Deleting all scheduled posts for user...\n');
  console.log(`User ID: ${USER_ID}`);
  console.log(`Supabase URL: ${supabaseUrl}\n`);

  // Delete all scheduled posts for this user
  const { data, error, count } = await supabase
    .from('posts')
    .delete({ count: 'exact' })
    .eq('user_id', USER_ID)
    .eq('status', 'scheduled');

  if (error) {
    console.error('❌ Error deleting posts:', error.message);
    process.exit(1);
  }

  console.log(`✅ Deleted ${count} scheduled posts`);
  console.log('\nNow run:');
  console.log(`cd "/Users/chudinnorukam/Downloads/Repurpose MVP "`);
  console.log(`node auto-schedule-30days.js ${USER_ID}`);
}

main().catch(console.error);
