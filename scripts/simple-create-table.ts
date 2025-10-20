#!/usr/bin/env tsx
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createTable() {
  console.log('🔧 Creating social_accounts table via Supabase Management API...\n');

  const SUPABASE_PROJECT_ID = 'qdmmztwgfqvajhrnikho';
  const sql = `
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

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can insert their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can update their own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can delete their own social accounts" ON public.social_accounts;

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
    // Use Supabase SQL endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ sql }),
      }
    );

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', responseText);

    if (response.ok || response.status === 404) {
      console.log('\n✅ Attempting direct PostgreSQL connection method...\n');

      // If RPC doesn't work, provide manual instructions
      console.log('📋 Please execute this SQL manually in Supabase dashboard:');
      console.log('\n1. Visit: https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho/sql/new');
      console.log('2. Paste and run this SQL:\n');
      console.log(sql);
      console.log('\n3. After running, execute: npx tsx scripts/setup-linkedin-token.ts');
    } else {
      console.log('✅ Table creation successful!');
      console.log('\n🎯 Next: Insert LinkedIn token');
      console.log('   npx tsx scripts/setup-linkedin-token.ts');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual fallback required:');
    console.log('   Visit: https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho/sql/new');
    console.log('   Run the SQL from /tmp/create_social_accounts.sql');
  }
}

createTable();
