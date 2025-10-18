-- Content Calendar Integration for 90-Day Strategy
-- Migration: 008_add_content_calendar_system
-- Created: 2025-10-17

-- 1. Create content_calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'both')),
  
  -- Content
  content_type TEXT NOT NULL, -- 'Story Arc', 'Thread', 'Listicle', etc.
  topic_theme TEXT NOT NULL,
  hook TEXT NOT NULL, -- First line
  key_points JSONB DEFAULT '[]'::jsonb,
  full_content TEXT,
  cta TEXT,
  
  -- Metadata
  hashtags TEXT[], -- For LinkedIn
  seo_keywords TEXT[],
  estimated_engagement_score INTEGER CHECK (estimated_engagement_score BETWEEN 1 AND 10),
  ai_detection_risk TEXT CHECK (ai_detection_risk IN ('low', 'medium', 'high')),
  
  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  actual_engagement JSONB, -- Store likes, comments, shares, impressions
  
  -- Research metadata
  content_pillar TEXT, -- 'Product Development', 'Content Marketing', etc.
  week_number INTEGER,
  day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add RLS policies
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar"
  ON content_calendar FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar items"
  ON content_calendar FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar items"
  ON content_calendar FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar items"
  ON content_calendar FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_user_date 
  ON content_calendar(user_id, scheduled_date DESC);

CREATE INDEX IF NOT EXISTS idx_content_calendar_status 
  ON content_calendar(status, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_content_calendar_platform 
  ON content_calendar(platform, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_content_calendar_week 
  ON content_calendar(week_number, day_of_week);

-- 4. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_content_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_calendar_updated_at
  BEFORE UPDATE ON content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_content_calendar_updated_at();

-- 5. Add helpful views
CREATE OR REPLACE VIEW content_calendar_summary AS
SELECT 
  user_id,
  DATE_TRUNC('week', scheduled_date) AS week_start,
  COUNT(*) AS total_posts,
  COUNT(*) FILTER (WHERE status = 'published') AS published_count,
  COUNT(*) FILTER (WHERE platform = 'linkedin') AS linkedin_count,
  COUNT(*) FILTER (WHERE platform = 'twitter') AS twitter_count,
  ROUND(AVG(estimated_engagement_score), 1) AS avg_engagement_score
FROM content_calendar
GROUP BY user_id, week_start
ORDER BY week_start DESC;

-- 6. Add comments for documentation
COMMENT ON TABLE content_calendar IS 'Stores 90-day content calendar entries from research-backed strategy';
COMMENT ON COLUMN content_calendar.content_type IS 'Format type: Story Arc, Thread, Listicle, Case Study, etc.';
COMMENT ON COLUMN content_calendar.ai_detection_risk IS 'Risk of AI detection (low = <20%, medium = 20-50%, high = >50%)';
COMMENT ON COLUMN content_calendar.actual_engagement IS 'JSON with {likes, comments, shares, impressions, ctr}';
COMMENT ON COLUMN content_calendar.content_pillar IS 'Theme category from research: Product Dev, Marketing, Indie Hacking, Technical, Personal Brand, Industry';
