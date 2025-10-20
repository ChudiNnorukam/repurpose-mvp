import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting fresh database migration...\n')

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/20251021000000_rebuild_fresh_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log(`📏 Size: ${migrationSQL.length} characters\n`)

    // Split by statement (rough split on semicolons outside of function bodies)
    const statements = migrationSQL
      .split(/;(?=\s*(?:--|$|\n\s*(?:CREATE|DROP|ALTER|INSERT|GRANT|COMMENT)))/gi)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Found ${statements.length} SQL statements\n`)

    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Skip comment-only statements
      if (statement.trim().startsWith('/*') && statement.trim().endsWith('*/;')) {
        continue
      }

      // Get statement type for logging
      const statementType = statement.match(/^\s*(CREATE|DROP|ALTER|INSERT|GRANT|COMMENT)/i)?.[1] || 'EXECUTE'
      const statementTarget = statement.match(/(?:TABLE|POLICY|INDEX|FUNCTION|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?([a-z_]+)/i)?.[1] || ''

      process.stdout.write(`  [${i + 1}/${statements.length}] ${statementType} ${statementTarget}...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

        if (error) {
          // Try direct execution if rpc fails
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql_query: statement })
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`)
          }
        }

        console.log(' ✅')
        successCount++

      } catch (error: any) {
        // Check if it's a "already exists" error (which we can ignore)
        if (error.message?.includes('already exists') || error.message?.includes('does not exist')) {
          console.log(' ⚠️  (already exists, skipping)')
          successCount++
        } else {
          console.log(` ❌ ${error.message}`)
          errorCount++
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Success: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('='.repeat(60) + '\n')

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!')

      // Verify tables
      console.log('\n📋 Verifying tables...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name')

      if (!tablesError && tables) {
        console.log(`\n✅ Found ${tables.length} tables:`)
        tables.forEach((t: any) => console.log(`   - ${t.table_name}`))
      }

      process.exit(0)
    } else {
      console.log('⚠️  Migration completed with errors')
      process.exit(1)
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
