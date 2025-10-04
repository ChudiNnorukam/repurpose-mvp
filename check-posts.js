// Quick script to check posts in database
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://qdmmztwgfqvajhrnikho.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'REPLACE_WITH_SERVICE_ROLE_KEY'
)

async function checkPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\n📊 Found ${posts.length} recent posts:\n`)

  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.platform.toUpperCase()} - Status: ${post.status}`)
    console.log(`   Scheduled: ${post.scheduled_time}`)
    console.log(`   Content: ${post.adapted_content.substring(0, 50)}...`)
    if (post.error_message) {
      console.log(`   ❌ Error: ${post.error_message}`)
    }
    if (post.posted_at) {
      console.log(`   ✅ Posted at: ${post.posted_at}`)
    }
    console.log('')
  })
}

checkPosts()
