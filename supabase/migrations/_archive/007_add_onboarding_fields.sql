-- Add onboarding fields to user_preferences table
-- Migration: 007_add_onboarding_fields
-- Created: 2025-10-17

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_steps_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS show_welcome_modal BOOLEAN DEFAULT TRUE;

-- Add index for performance on onboarding queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding 
ON user_preferences(onboarding_completed, user_id);

-- Add comment for documentation
COMMENT ON COLUMN user_preferences.onboarding_completed IS 'Whether user has completed all onboarding steps';
COMMENT ON COLUMN user_preferences.onboarding_started_at IS 'When user first started onboarding';
COMMENT ON COLUMN user_preferences.onboarding_completed_at IS 'When user completed all onboarding steps';
COMMENT ON COLUMN user_preferences.onboarding_steps_completed IS 'Array of completed step IDs';
COMMENT ON COLUMN user_preferences.show_welcome_modal IS 'Whether to show welcome modal on next visit';
