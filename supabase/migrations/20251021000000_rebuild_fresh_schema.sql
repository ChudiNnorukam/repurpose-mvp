-- =====================================================
-- REPURPOSE AI - FRESH REBUILD SCHEMA
-- Twitter & LinkedIn Content Repurposing Platform
-- Version: 3.0.0
-- Date: 2025-10-21
-- =====================================================

-- Clean slate: Drop all existing tables
DROP TABLE IF EXISTS content_analytics CASCADE;
DROP TABLE IF EXISTS content_insights CASCADE;
DROP TABLE IF EXISTS optimal_posting_times CASCADE;
DROP TABLE IF EXISTS posting_schedule CASCADE;
DROP TABLE IF EXISTS linkedin_carousels CASCADE;
DROP TABLE IF EXISTS twitter_threads CASCADE;
DROP TABLE IF EXISTS carousel_templates CASCADE;
DROP TABLE IF EXISTS repurposed_content CASCADE;
DROP TABLE IF EXISTS content_sources CASCADE;
DROP TABLE IF EXISTS social_accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User info
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMPTZ,

  -- Usage limits
  monthly_content_limit INTEGER DEFAULT 10,
  monthly_content_used INTEGER DEFAULT 0,
  limit_resets_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Settings
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- CONTENT SOURCE TABLES
-- =====================================================

-- Content sources (blog posts, videos, podcasts, PDFs)
CREATE TABLE content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Source details
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'text', 'youtube', 'podcast', 'pdf', 'upload')),
  source_url TEXT,
  original_content TEXT NOT NULL,

  -- Metadata
  title TEXT,
  author TEXT,
  published_date DATE,
  word_count INTEGER,
  reading_time_minutes INTEGER,

  -- AI Analysis
  summary TEXT,
  key_insights JSONB, -- [{insight: "...", importance: 0.9}]
  topics TEXT[], -- ["AI", "Marketing", "Leadership"]
  tone TEXT CHECK (tone IN ('professional', 'casual', 'technical', 'inspirational')),

  -- Status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
  processing_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own content sources"
  ON content_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content sources"
  ON content_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content sources"
  ON content_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content sources"
  ON content_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_content_sources_user_status ON content_sources(user_id, processing_status);
CREATE INDEX idx_content_sources_created ON content_sources(created_at DESC);

-- =====================================================
-- REPURPOSED CONTENT TABLES
-- =====================================================

-- Repurposed content (Twitter & LinkedIn specific)
CREATE TABLE repurposed_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,

  -- Platform specifics
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'twitter_thread',
    'twitter_single',
    'linkedin_post',
    'linkedin_carousel',
    'linkedin_article'
  )),

  -- Content structure
  content_data JSONB NOT NULL,
  /* For Twitter threads:
  {
    "tweets": [
      {"text": "Tweet 1...", "media_urls": []},
      {"text": "Tweet 2...", "media_urls": []}
    ],
    "hook": "Attention-grabbing first tweet",
    "cta": "Final call to action"
  }

  For LinkedIn posts:
  {
    "post": "Full post text...",
    "headline": "Optional headline",
    "media_urls": [],
    "document_url": "For carousels"
  }
  */

  -- Optimization
  hashtags TEXT[],
  mentions TEXT[], -- @usernames to tag

  -- AI metadata
  engagement_score DECIMAL(3,2), -- Predicted 0.00-1.00
  target_audience TEXT, -- "Founders", "Marketers", "Developers"
  optimal_posting_time TIME,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'posted', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE repurposed_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own repurposed content"
  ON repurposed_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own repurposed content"
  ON repurposed_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repurposed content"
  ON repurposed_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own repurposed content"
  ON repurposed_content FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_repurposed_content_user ON repurposed_content(user_id, status);
CREATE INDEX idx_repurposed_content_source ON repurposed_content(source_id);
CREATE INDEX idx_repurposed_content_platform ON repurposed_content(platform, status);
CREATE INDEX idx_repurposed_content_created ON repurposed_content(created_at DESC);

-- =====================================================
-- PLATFORM-SPECIFIC TABLES
-- =====================================================

-- Twitter-specific threading data
CREATE TABLE twitter_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES repurposed_content(id) ON DELETE CASCADE,

  -- Thread structure
  thread_tweets JSONB NOT NULL, -- Array of tweets with metadata
  total_tweets INTEGER NOT NULL,

  -- Thread characteristics
  thread_type TEXT CHECK (thread_type IN ('educational', 'storytelling', 'listicle', 'tips', 'analysis')),
  has_hook BOOLEAN DEFAULT TRUE,
  has_cta BOOLEAN DEFAULT TRUE,

  -- Performance prediction
  predicted_impressions INTEGER,
  predicted_engagement_rate DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE twitter_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own twitter threads"
  ON twitter_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM repurposed_content
      WHERE repurposed_content.id = twitter_threads.content_id
      AND repurposed_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own twitter threads"
  ON twitter_threads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repurposed_content
      WHERE repurposed_content.id = content_id
      AND repurposed_content.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_twitter_threads_content ON twitter_threads(content_id);

-- LinkedIn-specific carousel data
CREATE TABLE linkedin_carousels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES repurposed_content(id) ON DELETE CASCADE,

  -- Carousel structure
  slides JSONB NOT NULL, -- [{title, content, design_template}]
  total_slides INTEGER NOT NULL,

  -- Design settings
  template_id UUID,
  brand_colors JSONB, -- {primary: "#...", secondary: "#..."}

  -- Generated PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE linkedin_carousels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own linkedin carousels"
  ON linkedin_carousels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM repurposed_content
      WHERE repurposed_content.id = linkedin_carousels.content_id
      AND repurposed_content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own linkedin carousels"
  ON linkedin_carousels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repurposed_content
      WHERE repurposed_content.id = content_id
      AND repurposed_content.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_linkedin_carousels_content ON linkedin_carousels(content_id);

-- Carousel design templates
CREATE TABLE carousel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,

  -- Design configuration
  template_config JSONB NOT NULL,
  /* {
    "layout": "text-heavy" | "visual" | "balanced",
    "font_primary": "Inter",
    "font_secondary": "Roboto",
    "color_scheme": {...},
    "slide_ratio": "1:1" | "4:5"
  } */

  preview_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_system_template BOOLEAN DEFAULT FALSE,

  times_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE carousel_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own and system templates"
  ON carousel_templates FOR SELECT
  USING (user_id = auth.uid() OR is_system_template = TRUE);

CREATE POLICY "Users can create own templates"
  ON carousel_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON carousel_templates FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_carousel_templates_user ON carousel_templates(user_id);
CREATE INDEX idx_carousel_templates_system ON carousel_templates(is_system_template) WHERE is_system_template = TRUE;

-- =====================================================
-- SOCIAL ACCOUNTS TABLE
-- =====================================================

-- Social accounts (Twitter & LinkedIn only)
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Platform details
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  account_type TEXT CHECK (account_type IN ('personal', 'company_page')),

  -- Platform identifiers
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  platform_name TEXT,
  profile_image_url TEXT,

  -- For LinkedIn company pages
  company_page_id TEXT,
  company_name TEXT,

  -- OAuth tokens (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],

  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  verification_error TEXT,

  -- Account limits (Twitter/LinkedIn API limits)
  daily_post_limit INTEGER DEFAULT 50,
  posts_today INTEGER DEFAULT 0,
  limit_resets_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day'),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, platform_user_id)
);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(user_id, platform, is_active);

-- =====================================================
-- SCHEDULING TABLES
-- =====================================================

-- Posting schedule
CREATE TABLE posting_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES repurposed_content(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- For Twitter threads - stagger timing
  thread_delay_seconds INTEGER DEFAULT 0, -- Delay between tweets

  -- QStash
  qstash_message_id TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'posted', 'failed', 'cancelled')),

  -- Posted details
  posted_at TIMESTAMPTZ,
  platform_post_id TEXT, -- Twitter tweet ID or LinkedIn post URN
  platform_post_url TEXT,

  -- For Twitter threads - track all tweet IDs
  thread_tweet_ids JSONB, -- [{tweet_id, tweet_url, posted_at}]

  -- Performance
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posting_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own posting schedule"
  ON posting_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posting schedule"
  ON posting_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posting schedule"
  ON posting_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posting schedule"
  ON posting_schedule FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_posting_schedule_user ON posting_schedule(user_id, status);
CREATE INDEX idx_posting_schedule_scheduled ON posting_schedule(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_posting_schedule_account ON posting_schedule(account_id, status);
CREATE INDEX idx_posting_schedule_content ON posting_schedule(content_id);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Performance analytics
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES posting_schedule(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  platform TEXT NOT NULL,

  -- Metrics
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0, -- Retweets or LinkedIn shares
  saves INTEGER DEFAULT 0, -- Bookmarks or LinkedIn saves
  link_clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,

  -- Twitter-specific
  retweets INTEGER DEFAULT 0,
  quote_tweets INTEGER DEFAULT 0,

  -- LinkedIn-specific
  reactions JSONB, -- {like: 10, celebrate: 5, love: 3}

  -- Calculated metrics
  engagement_rate DECIMAL(5,2),
  click_through_rate DECIMAL(5,2),

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(schedule_id, date)
);

-- Enable RLS
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own content analytics"
  ON content_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posting_schedule
      WHERE posting_schedule.id = content_analytics.schedule_id
      AND posting_schedule.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_content_analytics_schedule ON content_analytics(schedule_id, date DESC);
CREATE INDEX idx_content_analytics_date ON content_analytics(date DESC);

-- Content performance insights
CREATE TABLE content_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES repurposed_content(id) ON DELETE CASCADE,

  -- Performance analysis
  actual_engagement_score DECIMAL(3,2),
  prediction_accuracy DECIMAL(3,2), -- How close was AI prediction

  -- What worked
  successful_elements JSONB,
  /* {
    "hook_effectiveness": 0.85,
    "hashtag_performance": {...},
    "posting_time_optimal": true,
    "content_length_optimal": true
  } */

  -- AI recommendations for future
  recommendations JSONB,
  /* {
    "suggested_improvements": ["Add more data points", "Use stronger CTA"],
    "successful_patterns": ["Question-based hooks work well"],
    "avoid": ["Too many hashtags"]
  } */

  -- Comparison to similar content
  percentile_rank INTEGER, -- 0-100, how it ranks vs user's other content

  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own content insights"
  ON content_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM repurposed_content
      WHERE repurposed_content.id = content_insights.content_id
      AND repurposed_content.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_content_insights_content ON content_insights(content_id);

-- Posting time optimization data
CREATE TABLE optimal_posting_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,

  -- Time analysis
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0-6 (Sunday-Saturday)
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23), -- 0-23

  -- Performance at this time
  avg_engagement_rate DECIMAL(5,2),
  avg_impressions INTEGER,
  posts_count INTEGER DEFAULT 0,

  -- Confidence score
  confidence DECIMAL(3,2), -- 0.00-1.00

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, account_id, platform, day_of_week, hour_of_day)
);

-- Enable RLS
ALTER TABLE optimal_posting_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own optimal posting times"
  ON optimal_posting_times FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own optimal posting times"
  ON optimal_posting_times FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own optimal posting times"
  ON optimal_posting_times FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_optimal_times_user ON optimal_posting_times(user_id, platform);
CREATE INDEX idx_optimal_times_account ON optimal_posting_times(account_id, platform);
CREATE INDEX idx_optimal_times_score ON optimal_posting_times(user_id, platform, avg_engagement_rate DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sources_updated_at BEFORE UPDATE ON content_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repurposed_content_updated_at BEFORE UPDATE ON repurposed_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posting_schedule_updated_at BEFORE UPDATE ON posting_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset daily posting limits
CREATE OR REPLACE FUNCTION reset_daily_posting_limits()
RETURNS void AS $$
BEGIN
  UPDATE social_accounts
  SET
    posts_today = 0,
    limit_resets_at = NOW() + INTERVAL '1 day'
  WHERE limit_resets_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly content usage
CREATE OR REPLACE FUNCTION reset_monthly_content_usage()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    monthly_content_used = 0,
    limit_resets_at = NOW() + INTERVAL '30 days'
  WHERE limit_resets_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- System carousel templates
INSERT INTO carousel_templates (id, user_id, name, template_config, is_system_template, is_default) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  NULL,
  'Professional Minimal',
  '{"layout":"text-heavy","font_primary":"Inter","font_secondary":"Roboto","color_scheme":{"primary":"#1e293b","secondary":"#64748b","accent":"#3b82f6"},"slide_ratio":"1:1"}',
  TRUE,
  TRUE
),
(
  'a2222222-2222-2222-2222-222222222222',
  NULL,
  'Bold & Visual',
  '{"layout":"visual","font_primary":"Plus Jakarta Sans","font_secondary":"Inter","color_scheme":{"primary":"#0f172a","secondary":"#8b5cf6","accent":"#ec4899"},"slide_ratio":"1:1"}',
  TRUE,
  FALSE
),
(
  'a3333333-3333-3333-3333-333333333333',
  NULL,
  'Balanced Modern',
  '{"layout":"balanced","font_primary":"DM Sans","font_secondary":"Inter","color_scheme":{"primary":"#111827","secondary":"#6366f1","accent":"#10b981"},"slide_ratio":"4:5"}',
  TRUE,
  FALSE
);

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE content_sources IS 'Original content sources (blog posts, videos, podcasts, PDFs)';
COMMENT ON TABLE repurposed_content IS 'AI-generated content optimized for Twitter and LinkedIn';
COMMENT ON TABLE twitter_threads IS 'Twitter-specific thread metadata and structure';
COMMENT ON TABLE linkedin_carousels IS 'LinkedIn carousel slide data and PDF URLs';
COMMENT ON TABLE carousel_templates IS 'Design templates for LinkedIn carousels';
COMMENT ON TABLE social_accounts IS 'Connected Twitter and LinkedIn accounts with encrypted OAuth tokens';
COMMENT ON TABLE posting_schedule IS 'Scheduled posts with QStash integration';
COMMENT ON TABLE content_analytics IS 'Performance metrics from Twitter and LinkedIn APIs';
COMMENT ON TABLE content_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE optimal_posting_times IS 'Machine learning data for optimal posting time prediction';
