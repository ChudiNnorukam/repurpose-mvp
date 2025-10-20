import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env
import dotenv from 'dotenv'
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting fresh database migration...\n')

  try {
    // Read migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20251021000000_rebuild_fresh_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log(`📏 Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`)

    console.log('⚠️  WARNING: This will DROP ALL existing tables!')
    console.log('⏳ Executing migration...\n')

    // Execute via postgres connection string
    const { createConnection } = await import('postgres')
    const postgres = createConnection(process.env.DATABASE_URL ||
      `postgresql://postgres.qdmmztwgfqvajhrnikho:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`)

    await postgres.query(migrationSQL)

    console.log('\n✅ Migration executed successfully!\n')

    // Verify tables
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations')
      .order('table_name')

    if (tables && tables.length > 0) {
      console.log(`📋 Verified ${tables.length} tables created:`)
      tables.forEach(t => console.log(`   ✅ ${t.table_name}`))
      console.log()
    }

    console.log('🎉 Fresh database schema deployed!')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()
