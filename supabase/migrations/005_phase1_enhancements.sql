-- Phase 1: Critical Enhancements Migration
-- Adds support for: drafts, editing, bulk operations, notifications, user preferences

-- ============================================================================
-- 1. Enhance Posts Table
-- ============================================================================

-- Add missing columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS qstash_message_id TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for draft filtering
CREATE INDEX IF NOT EXISTS idx_posts_is_draft ON posts(user_id, is_draft) WHERE is_draft = true;
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at DESC);

-- ============================================================================
-- 2. User Preferences Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT true,
  failure_alerts BOOLEAN DEFAULT true,
  success_notifications BOOLEAN DEFAULT false,
  best_time_suggestions BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  default_tone TEXT DEFAULT 'professional' CHECK (default_tone IN ('professional', 'casual', 'friendly', 'authoritative', 'enthusiastic')),
  auto_schedule_queue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Notifications Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('post_failed', 'post_published', 'token_expired', 'daily_digest', 'info', 'warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Allow server-side inserts

-- ============================================================================
-- 4. Add updated_at trigger for posts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Bulk operations helper function
-- ============================================================================

-- Function to bulk update post scheduled times
CREATE OR REPLACE FUNCTION bulk_reschedule_posts(
  post_ids UUID[],
  new_scheduled_time TIMESTAMPTZ,
  requesting_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update all posts owned by the user
  UPDATE posts
  SET
    scheduled_time = new_scheduled_time,
    updated_at = NOW()
  WHERE
    id = ANY(post_ids)
    AND user_id = requesting_user_id
    AND status = 'scheduled';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE user_preferences IS 'User-specific settings and preferences for the dashboard';
COMMENT ON TABLE notifications IS 'In-app notifications for users about post status and system events';
COMMENT ON COLUMN posts.is_draft IS 'True if post is saved as draft, not scheduled';
COMMENT ON COLUMN posts.parent_post_id IS 'Reference to original post if this is a duplicate/variant';
COMMENT ON COLUMN posts.tone IS 'Tone used for AI adaptation (professional, casual, etc.)';
COMMENT ON COLUMN posts.qstash_message_id IS 'QStash message ID for scheduled posts';
