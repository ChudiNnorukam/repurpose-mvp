-- ============================================================================
-- RLS Policies Verification Script for Repurpose MVP
-- ============================================================================
-- This script checks that Row Level Security (RLS) is properly configured
-- Run this in Supabase SQL Editor to verify your security setup
-- ============================================================================

-- Check if RLS is enabled on critical tables
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('posts', 'social_accounts')
ORDER BY tablename;

-- Expected output: rls_enabled should be 't' (true) for both tables

-- ============================================================================
-- View all policies on the posts table
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'posts'
ORDER BY policyname;

-- ============================================================================
-- View all policies on the social_accounts table
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'social_accounts'
ORDER BY policyname;

-- ============================================================================
-- EXPECTED POLICIES
-- ============================================================================
--
-- For 'posts' table:
--   Policy Name: "Users can only access their own posts"
--   Command: ALL
--   Using: (auth.uid() = user_id)
--
-- For 'social_accounts' table:
--   Policy Name: "Users can only access their own accounts"
--   Command: ALL
--   Using: (auth.uid() = user_id)
--
-- ============================================================================

-- ============================================================================
-- CREATE POLICIES IF MISSING (run only if policies don't exist)
-- ============================================================================

-- Enable RLS on posts table if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on social_accounts table if not already enabled
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for posts table (DROP first if exists)
DROP POLICY IF EXISTS "Users can only access their own posts" ON public.posts;

CREATE POLICY "Users can only access their own posts"
ON public.posts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for social_accounts table (DROP first if exists)
DROP POLICY IF EXISTS "Users can only access their own accounts" ON public.social_accounts;

CREATE POLICY "Users can only access their own accounts"
ON public.social_accounts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Test RLS policies (optional - run with different users)
-- ============================================================================

-- Test 1: Try to SELECT all posts (should only return your posts)
SELECT COUNT(*) FROM public.posts;

-- Test 2: Try to SELECT all social accounts (should only return your accounts)
SELECT COUNT(*) FROM public.social_accounts;

-- Test 3: Try to INSERT a post with a different user_id (should fail)
-- INSERT INTO public.posts (user_id, platform, content, status)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'twitter', 'Test', 'draft');
-- Expected: ERROR - new row violates row-level security policy

-- ============================================================================
-- Verify service role bypasses RLS (for admin operations)
-- ============================================================================
-- Note: Service role key bypasses RLS by default
-- This is used in API routes with getSupabaseAdmin()
-- Regular API routes use user's JWT which respects RLS

SELECT
  'RLS Verification Complete' AS status,
  'Check output above to ensure policies exist' AS next_step;
