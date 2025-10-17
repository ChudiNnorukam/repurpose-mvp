-- Add expires_at column to social_accounts table
-- This column tracks when OAuth tokens expire, enabling automatic refresh logic

ALTER TABLE social_accounts
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN social_accounts.expires_at IS 'Timestamp when the access token expires (for OAuth token refresh)';
