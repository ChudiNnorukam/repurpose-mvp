#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
);

async function createSocialAccountsTable() {
  console.log('🔧 Creating social_accounts table...\n');

  const sql = `
-- Create social_accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram')),
  platform_user_id TEXT,
  username TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  platform_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can insert their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_accounts;

-- Create RLS policies
CREATE POLICY "Users can view their own social accounts"
  ON public.social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts"
  ON public.social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts"
  ON public.social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts"
  ON public.social_accounts FOR DELETE
  USING (auth.uid() = user_id);
`;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If the RPC doesn't exist, try using the REST API directly
      if (error.message.includes('function') || error.code === '42883') {
        console.log('📝 Using direct SQL execution via Supabase REST API...\n');

        // Execute SQL statements one by one
        const statements = [
          `CREATE TABLE IF NOT EXISTS public.social_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram')),
            platform_user_id TEXT,
            username TEXT,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            expires_at TIMESTAMPTZ,
            platform_data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, platform)
          )`,
          `ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY`,
          `DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_accounts`,
          `DROP POLICY IF EXISTS "Users can insert their own social accounts" ON public.social_accounts`,
          `DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_accounts`,
          `DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_accounts`,
          `CREATE POLICY "Users can view their own social accounts" ON public.social_accounts FOR SELECT USING (auth.uid() = user_id)`,
          `CREATE POLICY "Users can insert their own social accounts" ON public.social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id)`,
          `CREATE POLICY "Users can update their own social accounts" ON public.social_accounts FOR UPDATE USING (auth.uid() = user_id)`,
          `CREATE POLICY "Users can delete their own social accounts" ON public.social_accounts FOR DELETE USING (auth.uid() = user_id)`,
        ];

        for (const statement of statements) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
              },
              body: JSON.stringify({ query: statement }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️  Statement execution note: ${errorText}`);
          }
        }

        console.log('✅ Table creation attempted via REST API');
        console.log('\n📋 Please verify by running:');
        console.log('   npx tsx scripts/verify-social-accounts.ts');
        return;
      }

      throw error;
    }

    console.log('✅ social_accounts table created successfully!');
    console.log('\n🎯 Next step: Insert LinkedIn token');
    console.log('   npx tsx scripts/setup-linkedin-token.ts');

  } catch (error: any) {
    console.error('❌ Failed to create table:', error.message);
    console.log('\n🔧 Alternative approach:');
    console.log('   1. Visit: https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho/sql/new');
    console.log('   2. Paste the contents of: /tmp/create_social_accounts.sql');
    console.log('   3. Click "Run"');
    process.exit(1);
  }
}

createSocialAccountsTable();
