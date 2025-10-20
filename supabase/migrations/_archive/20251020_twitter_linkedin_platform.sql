-- Twitter & LinkedIn Content Repurposing Platform
-- Complete database schema

-- Drop existing tables if they exist (for fresh rebuild)
DROP TABLE IF EXISTS content_analytics CASCADE;
DROP TABLE IF EXISTS content_insights CASCADE;
DROP TABLE IF EXISTS optimal_posting_times CASCADE;
DROP TABLE IF EXISTS linkedin_carousels CASCADE;
DROP TABLE IF EXISTS carousel_templates CASCADE;
DROP TABLE IF EXISTS twitter_threads CASCADE;
DROP TABLE IF EXISTS posting_schedule CASCADE;
DROP TABLE IF EXISTS repurposed_content CASCADE;
DROP TABLE IF EXISTS content_sources CASCADE;
DROP TABLE IF EXISTS social_accounts CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Content sources table
CREATE TABLE content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

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
  key_insights JSONB DEFAULT '[]'::jsonb, -- [{insight: "...", importance: 0.9}]
  topics TEXT[] DEFAULT ARRAY[]::TEXT[], -- ["AI", "Marketing", "Leadership"]
  tone TEXT CHECK (tone IN ('professional', 'casual', 'technical', 'inspirational')),

  -- Status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'ready', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social accounts table (Twitter & LinkedIn)
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

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

  -- OAuth tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),

  -- Account limits (API rate limits)
  daily_post_limit INTEGER DEFAULT 50,
  posts_today INTEGER DEFAULT 0,
  limit_resets_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, platform, platform_user_id)
);

-- Repurposed content table
CREATE TABLE repurposed_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES content_sources(id) ON DELETE CASCADE,

  -- Platform specifics
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'twitter_thread',
    'twitter_single',
    'linkedin_post',
    'linkedin_carousel',
    'linkedin_article'
  )),

  -- Content structure (JSON for flexibility)
  content_data JSONB NOT NULL,

  -- Optimization
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentions TEXT[] DEFAULT ARRAY[]::TEXT[], -- @usernames

  -- AI metadata
  engagement_score DECIMAL(3,2) DEFAULT 0.5, -- Predicted 0.00-1.00
  target_audience TEXT, -- "Founders", "Marketers", "Developers"
  optimal_posting_time TIME,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'scheduled', 'posted', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Twitter threads table
CREATE TABLE twitter_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES repurposed_content(id) ON DELETE CASCADE NOT NULL,

  -- Thread structure
  thread_tweets JSONB NOT NULL, -- Array of tweets with metadata
  total_tweets INTEGER NOT NULL,

  -- Thread characteristics
  thread_type TEXT CHECK (thread_type IN ('educational', 'storytelling', 'listicle', 'tips', 'analysis')),
  has_hook BOOLEAN DEFAULT TRUE,
  has_cta BOOLEAN DEFAULT TRUE,

  -- Performance prediction
  predicted_impressions INTEGER DEFAULT 0,
  predicted_engagement_rate DECIMAL(5,2) DEFAULT 0.0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LinkedIn carousel templates
CREATE TABLE carousel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,

  -- Design configuration
  template_config JSONB NOT NULL,

  preview_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LinkedIn carousels
CREATE TABLE linkedin_carousels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES repurposed_content(id) ON DELETE CASCADE NOT NULL,

  -- Carousel structure
  slides JSONB NOT NULL, -- [{title, content, design_template}]
  total_slides INTEGER NOT NULL,

  -- Design settings
  template_id UUID REFERENCES carousel_templates(id),
  brand_colors JSONB,

  -- Generated PDF
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posting schedule
CREATE TABLE posting_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES repurposed_content(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- For Twitter threads - stagger timing
  thread_delay_seconds INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'posted', 'failed', 'cancelled')),

  -- Posted details
  posted_at TIMESTAMPTZ,
  platform_post_id TEXT, -- Twitter tweet ID or LinkedIn post URN
  platform_post_url TEXT,

  -- For Twitter threads - track all tweet IDs
  thread_tweet_ids JSONB DEFAULT '[]'::jsonb, -- [{tweet_id, tweet_url, posted_at}]

  -- Performance
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance analytics
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES posting_schedule(id) ON DELETE CASCADE NOT NULL,

  date DATE NOT NULL,
  platform TEXT NOT NULL,

  -- Metrics
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,

  -- Twitter-specific
  retweets INTEGER DEFAULT 0,
  quote_tweets INTEGER DEFAULT 0,

  -- LinkedIn-specific
  reactions JSONB DEFAULT '{"like": 0, "celebrate": 0, "love": 0, "insightful": 0, "funny": 0}'::jsonb,

  -- Calculated metrics
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(schedule_id, date)
);

-- Content performance insights
CREATE TABLE content_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES repurposed_content(id) ON DELETE CASCADE NOT NULL,

  -- Performance analysis
  actual_engagement_score DECIMAL(3,2),
  prediction_accuracy DECIMAL(3,2),

  -- What worked
  successful_elements JSONB,

  -- AI recommendations for future
  recommendations JSONB,

  -- Comparison to similar content
  percentile_rank INTEGER, -- 0-100

  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimal posting times
CREATE TABLE optimal_posting_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,

  platform TEXT NOT NULL,

  -- Time analysis
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week < 7), -- 0-6
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day < 24), -- 0-23

  -- Performance at this time
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_impressions INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,

  -- Confidence score
  confidence DECIMAL(3,2) DEFAULT 0, -- 0.00-1.00

  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, account_id, platform, day_of_week, hour_of_day)
);

-- Create indexes for performance
CREATE INDEX idx_content_sources_user_status ON content_sources(user_id, processing_status);
CREATE INDEX idx_repurposed_content_source ON repurposed_content(source_id);
CREATE INDEX idx_repurposed_content_platform ON repurposed_content(platform, status);
CREATE INDEX idx_repurposed_content_user ON repurposed_content(user_id, created_at DESC);
CREATE INDEX idx_posting_schedule_scheduled ON posting_schedule(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_posting_schedule_account ON posting_schedule(account_id, status);
CREATE INDEX idx_posting_schedule_user ON posting_schedule(user_id, created_at DESC);
CREATE INDEX idx_content_analytics_schedule ON content_analytics(schedule_id, date DESC);
CREATE INDEX idx_content_analytics_date ON content_analytics(date, platform);
CREATE INDEX idx_optimal_times_user ON optimal_posting_times(user_id, platform);
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id, platform);

-- Enable RLS on all tables
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE repurposed_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimal_posting_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see/edit their own data
CREATE POLICY "Users can view own content_sources"
  ON content_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create content_sources"
  ON content_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_sources"
  ON content_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social_accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create social_accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social_accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own repurposed_content"
  ON repurposed_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create repurposed_content"
  ON repurposed_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own repurposed_content"
  ON repurposed_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own twitter_threads"
  ON twitter_threads FOR SELECT
  USING (EXISTS(SELECT 1 FROM repurposed_content WHERE id = content_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own linkedin_carousels"
  ON linkedin_carousels FOR SELECT
  USING (EXISTS(SELECT 1 FROM repurposed_content WHERE id = content_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own posting_schedule"
  ON posting_schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create posting_schedule"
  ON posting_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posting_schedule"
  ON posting_schedule FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content_analytics"
  ON content_analytics FOR SELECT
  USING (EXISTS(SELECT 1 FROM posting_schedule WHERE id = schedule_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own optimal_posting_times"
  ON optimal_posting_times FOR SELECT
  USING (auth.uid() = user_id);
