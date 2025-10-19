#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function checkStatus() {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('id', 'd31de848-4f47-45f6-b392-97a0cff7af53')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('\n✅ Post Status:\n');
  console.log(`   ID: ${data.id}`);
  console.log(`   Platform: ${data.platform}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Scheduled Time: ${data.scheduled_time}`);
  console.log(`   QStash Message ID: ${data.qstash_message_id || 'N/A'}`);
  console.log(`   Created At: ${data.created_at}`);
  console.log(`   Updated At: ${data.updated_at}`);
  console.log('');
}

checkStatus();
