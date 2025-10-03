require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const migration = fs.readFileSync('./supabase/migrations/004_content_templates.sql', 'utf8')

async function runMigration() {
  console.log('Running migration...\n')

  // Execute the entire migration as one SQL block
  const { data, error } = await supabase.rpc('exec', { sql: migration })

  if (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  console.log('✅ Migration completed successfully!')
}

runMigration()
