-- Onboarding Fields Migration Template
-- Use this template when adding user onboarding functionality to any project

-- ============================================================================
-- TABLE: user_preferences (or similar user settings table)
-- ============================================================================

-- Add onboarding tracking columns
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_steps_completed JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS show_welcome_modal BOOLEAN DEFAULT TRUE;

-- ============================================================================
-- INDEXES: Performance optimization for onboarding queries
-- ============================================================================

-- Composite index for filtering active onboarding users
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding 
ON user_preferences(onboarding_completed, user_id);

-- Optional: Index for querying by start date
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_started 
ON user_preferences(onboarding_started_at) 
WHERE onboarding_started_at IS NOT NULL;

-- ============================================================================
-- COMMENTS: Documentation for future developers
-- ============================================================================

COMMENT ON COLUMN user_preferences.onboarding_completed 
IS 'Whether user has completed all onboarding steps';

COMMENT ON COLUMN user_preferences.onboarding_started_at 
IS 'When user first started onboarding (first interaction with onboarding UI)';

COMMENT ON COLUMN user_preferences.onboarding_completed_at 
IS 'When user completed all onboarding steps (last step marked complete)';

COMMENT ON COLUMN user_preferences.onboarding_steps_completed 
IS 'Array of completed step IDs (e.g., ["connect_account", "create_post", "schedule_post"])';

COMMENT ON COLUMN user_preferences.show_welcome_modal 
IS 'Whether to show welcome modal on next visit (dismissed = false)';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Query: Find users who started but haven't completed onboarding
-- SELECT user_id, onboarding_started_at, onboarding_steps_completed 
-- FROM user_preferences 
-- WHERE onboarding_completed = FALSE 
--   AND onboarding_started_at IS NOT NULL
-- ORDER BY onboarding_started_at DESC;

-- Query: Onboarding completion rate by date
-- SELECT 
--   DATE(onboarding_started_at) as start_date,
--   COUNT(*) as started,
--   COUNT(*) FILTER (WHERE onboarding_completed = TRUE) as completed,
--   ROUND(100.0 * COUNT(*) FILTER (WHERE onboarding_completed = TRUE) / COUNT(*), 2) as completion_rate
-- FROM user_preferences
-- WHERE onboarding_started_at IS NOT NULL
-- GROUP BY DATE(onboarding_started_at)
-- ORDER BY start_date DESC;

-- Query: Average time to complete onboarding
-- SELECT AVG(onboarding_completed_at - onboarding_started_at) as avg_time_to_complete
-- FROM user_preferences
-- WHERE onboarding_completed = TRUE;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP INDEX IF EXISTS idx_user_preferences_onboarding;
-- DROP INDEX IF EXISTS idx_user_preferences_onboarding_started;
-- ALTER TABLE user_preferences 
--   DROP COLUMN IF EXISTS onboarding_completed,
--   DROP COLUMN IF EXISTS onboarding_started_at,
--   DROP COLUMN IF EXISTS onboarding_completed_at,
--   DROP COLUMN IF EXISTS onboarding_steps_completed,
--   DROP COLUMN IF EXISTS show_welcome_modal;
