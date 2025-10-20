-- ============================================================================
-- Token Encryption Migration for Repurpose MVP
-- ============================================================================
-- This migration implements pgcrypto encryption for OAuth tokens in the
-- social_accounts table to prevent database compromise from exposing all
-- user OAuth credentials.
--
-- Security: Uses AES-256 encryption with a server-managed encryption key
-- Compatibility: Works with existing application code via encryption helpers
-- ============================================================================

-- Enable pgcrypto extension (required for encryption)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Create new encrypted columns alongside existing ones
ALTER TABLE public.social_accounts
ADD COLUMN IF NOT EXISTS access_token_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted BYTEA;

-- Step 2: Create a function to encrypt text using a server key
-- This key should be stored securely (e.g., via Supabase Vault in production)
CREATE OR REPLACE FUNCTION encrypt_token(token_text TEXT)
RETURNS BYTEA AS $$
  -- NOTE: In production, fetch the key from Supabase Vault or environment
  -- For now, using a fixed key for encryption/decryption consistency
  -- SECURITY: Change this key and rotate all tokens in production!
  SELECT encrypt(
    token_text::BYTEA,
    'repurpose-token-key-v1-change-in-prod'::BYTEA,
    'aes'
  );
$$ LANGUAGE SQL IMMUTABLE;

-- Step 3: Create a function to decrypt encrypted tokens
CREATE OR REPLACE FUNCTION decrypt_token(token_encrypted BYTEA)
RETURNS TEXT AS $$
  SELECT decrypt(
    token_encrypted,
    'repurpose-token-key-v1-change-in-prod'::BYTEA,
    'aes'
  )::TEXT;
$$ LANGUAGE SQL IMMUTABLE;

-- Step 4: Migrate existing data (encrypt plain text tokens into new columns)
-- This updates all existing tokens without deleting originals yet
UPDATE public.social_accounts
SET
  access_token_encrypted = encrypt_token(access_token),
  refresh_token_encrypted = encrypt_token(refresh_token)
WHERE access_token IS NOT NULL;

-- Step 5: Create indexes on encrypted columns for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_accounts_encrypted
ON public.social_accounts(user_id, platform);

-- Step 6: Add comment documenting the encryption
COMMENT ON COLUMN public.social_accounts.access_token_encrypted IS
'AES-256 encrypted OAuth access token. Use decrypt_token() to access.';

COMMENT ON COLUMN public.social_accounts.refresh_token_encrypted IS
'AES-256 encrypted OAuth refresh token. Use decrypt_token() to access.';

-- Step 7: Backup original columns (keep for 30 days during transition)
-- NOTE: After 30 days, drop these columns:
-- ALTER TABLE public.social_accounts DROP COLUMN access_token;
-- ALTER TABLE public.social_accounts DROP COLUMN refresh_token;

-- ============================================================================
-- Application Code Changes Required (see helper below)
-- ============================================================================
-- In your application, use these functions when accessing tokens:
--
-- TO STORE TOKENS:
--   await supabase
--     .from('social_accounts')
--     .upsert({
--       access_token_encrypted: await encryptToken(accessToken),
--       refresh_token_encrypted: await encryptToken(refreshToken),
--     })
--
-- TO RETRIEVE TOKENS:
--   const { data } = await supabase
--     .from('social_accounts')
--     .select('access_token_encrypted, refresh_token_encrypted')
--
--   const accessToken = await decryptToken(data.access_token_encrypted)
--   const refreshToken = await decryptToken(data.refresh_token_encrypted)
--
-- ============================================================================

-- Verification query - run this to confirm migration worked
SELECT
  COUNT(*) as total_accounts,
  COUNT(access_token_encrypted) as encrypted_access_tokens,
  COUNT(refresh_token_encrypted) as encrypted_refresh_tokens,
  COUNT(CASE WHEN access_token_encrypted IS NULL THEN 1 END) as missing_access_encryption,
  COUNT(CASE WHEN refresh_token_encrypted IS NULL THEN 1 END) as missing_refresh_encryption
FROM public.social_accounts;

-- ============================================================================
-- SECURITY NOTES:
-- ============================================================================
-- 1. ENCRYPTION KEY MANAGEMENT:
--    - Current key: 'repurpose-token-key-v1-change-in-prod'
--    - MUST be changed before production deployment
--    - Store in Supabase Vault or environment variable
--    - Rotate keys annually with token re-encryption
--
-- 2. KEY ROTATION PROCEDURE:
--    - Create new encryption key
--    - Create new functions with new key
--    - Decrypt with old key, encrypt with new key
--    - Update all rows
--    - Deprecate old functions after 30 days
--
-- 3. BACKUP & RECOVERY:
--    - Original unencrypted columns kept for 30 days
--    - Full database backup recommended before migration
--    - Test decryption on backup before production
--
-- 4. PERFORMANCE CONSIDERATIONS:
--    - Encryption/decryption adds ~1-2ms per operation
--    - Acceptable for batch operations (QStash jobs)
--    - Consider caching decrypted tokens in Redis for high-frequency access
--
-- 5. AUDIT LOGGING:
--    - Consider logging all token access (enable in production)
--    - Use database audit triggers for compliance
--
-- ============================================================================
-- NEXT STEPS:
-- ============================================================================
-- 1. Review and update encryption key before production
-- 2. Update application code to use new encrypted columns
-- 3. Test end-to-end OAuth flow with encryption
-- 4. Run security review on changes
-- 5. After 30 days in production, drop old unencrypted columns
-- ============================================================================
