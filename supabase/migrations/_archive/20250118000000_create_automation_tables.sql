-- Repurpose AI - Automation Tables Migration
-- Created: 2025-01-18
-- Purpose: Add tables and columns needed for n8n workflow automation

-- ============================================================================
-- TABLE: scheduled_posts
-- Purpose: Stores posts scheduled for future publishing with automation metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
  content TEXT NOT NULL,
  original_content TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'published', 'failed', 'flagged')),

  -- Automation metadata
  ai_reviewed BOOLEAN DEFAULT false,
  ai_review_data JSONB,
  engagement_score INTEGER,
  ai_detection_risk TEXT CHECK (ai_detection_risk IN ('low', 'medium', 'high')),

  compliance_checked BOOLEAN DEFAULT false,
  compliant BOOLEAN,
  compliance_data JSONB,
  safe_to_publish BOOLEAN DEFAULT true,
  requires_human_review BOOLEAN DEFAULT false,

  -- Error tracking
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,

  -- QStash integration
  qstash_message_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_ai_reviewed ON scheduled_posts(ai_reviewed);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_compliance_checked ON scheduled_posts(compliance_checked);

-- ============================================================================
-- TABLE: published_posts
-- Purpose: Tracks successfully published posts with platform metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
  content TEXT NOT NULL,

  -- Platform metadata
  platform_post_id TEXT UNIQUE, -- ID from Twitter/LinkedIn/Instagram API
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'deleted', 'failed')),

  -- Performance metrics
  metrics JSONB, -- Stores likes, shares, comments, impressions

  -- Link to original scheduled post
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_published_posts_user_id ON published_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_published_posts_platform ON published_posts(platform);
CREATE INDEX IF NOT EXISTS idx_published_posts_platform_post_id ON published_posts(platform_post_id);
CREATE INDEX IF NOT EXISTS idx_published_posts_published_at ON published_posts(published_at);

-- ============================================================================
-- TABLE: engagement_queue
-- Purpose: Stores social media mentions/comments for review and response
-- ============================================================================
CREATE TABLE IF NOT EXISTS engagement_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES published_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),

  -- Engagement details
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('mention', 'comment', 'reply', 'quote', 'retweet')),
  engagement_id TEXT UNIQUE, -- Platform's ID for this engagement

  -- Author information
  author_name TEXT,
  author_username TEXT,
  author_id TEXT, -- Platform's author ID

  -- Content
  text TEXT,

  -- AI Analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT CHECK (category IN ('question', 'feedback', 'appreciation', 'complaint', 'spam', 'general')),

  requires_reply BOOLEAN DEFAULT false,
  suggested_reply TEXT,
  analysis_data JSONB,

  -- Response tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'ignored', 'escalated')),
  replied_at TIMESTAMPTZ,
  reply_text TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_engagement_queue_post_id ON engagement_queue(post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_queue_status ON engagement_queue(status);
CREATE INDEX IF NOT EXISTS idx_engagement_queue_priority ON engagement_queue(priority);
CREATE INDEX IF NOT EXISTS idx_engagement_queue_engagement_id ON engagement_queue(engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_queue_created_at ON engagement_queue(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Purpose: Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_queue ENABLE ROW LEVEL SECURITY;

-- scheduled_posts policies
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can bypass RLS for automation
CREATE POLICY "Service role can manage all scheduled posts"
  ON scheduled_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- published_posts policies
CREATE POLICY "Users can view their own published posts"
  ON published_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own published posts"
  ON published_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all published posts"
  ON published_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- engagement_queue policies
CREATE POLICY "Users can view their own engagement"
  ON engagement_queue FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM published_posts WHERE id = engagement_queue.post_id
    )
  );

CREATE POLICY "Service role can manage all engagement"
  ON engagement_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- Purpose: Automatically update the updated_at timestamp
-- ============================================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_published_posts_updated_at
  BEFORE UPDATE ON published_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagement_queue_updated_at
  BEFORE UPDATE ON engagement_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to create test data
-- ============================================================================

-- INSERT INTO scheduled_posts (user_id, platform, content, original_content, scheduled_time, status)
-- VALUES (
--   auth.uid(),
--   'twitter',
--   'Test post for automation',
--   'Original test content',
--   NOW() + INTERVAL '1 hour',
--   'pending'
-- );

-- ============================================================================
-- GRANTS (for service role)
-- ============================================================================

GRANT ALL ON scheduled_posts TO service_role;
GRANT ALL ON published_posts TO service_role;
GRANT ALL ON engagement_queue TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Created tables:';
  RAISE NOTICE '  - scheduled_posts (% rows)', (SELECT COUNT(*) FROM scheduled_posts);
  RAISE NOTICE '  - published_posts (% rows)', (SELECT COUNT(*) FROM published_posts);
  RAISE NOTICE '  - engagement_queue (% rows)', (SELECT COUNT(*) FROM engagement_queue);
END $$;
