require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = '332b63c1-b1f7-4a07-9eba-6817ce3803ac';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

(async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('platform', 'linkedin')
    .order('scheduled_time', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`\nLinkedIn posts found: ${data.length}\n`);
    data.forEach(post => {
      console.log('---');
      console.log('ID:', post.id);
      console.log('Scheduled:', post.scheduled_time);
      console.log('Status:', post.status);
      console.log('Content preview:', post.adapted_content.substring(0, 100) + '...');
      console.log('');
    });
  }
})();
