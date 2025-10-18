# 🚀 Production Deployment Checklist
## Content Calendar System - Final Steps

---

## ✅ What's Already Done

- [x] Code committed and pushed (commit b8217d2, 2648194)
- [x] Vercel deployment triggered
- [x] Supabase SQL Editor opened for you

---

## 📋 Steps to Complete (5 minutes)

### **Step 1: Run Database Migration** (2 minutes)

The Supabase SQL Editor should be open in your browser. If not, click here:
👉 https://supabase.com/dashboard/project/qdmmztwgfqvajhrnikho/sql/new

**Copy and paste this SQL**:

```sql
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
  content_type TEXT NOT NULL,
  topic_theme TEXT NOT NULL,
  hook TEXT NOT NULL,
  key_points JSONB DEFAULT '[]'::jsonb,
  full_content TEXT,
  cta TEXT,
  
  -- Metadata
  hashtags TEXT[],
  seo_keywords TEXT[],
  estimated_engagement_score INTEGER CHECK (estimated_engagement_score BETWEEN 1 AND 10),
  ai_detection_risk TEXT CHECK (ai_detection_risk IN ('low', 'medium', 'high')),
  
  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  actual_engagement JSONB,
  
  -- Research metadata
  content_pillar TEXT,
  week_number INTEGER,
  day_of_week INTEGER,
  
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
```

**Then click "Run" button** (bottom right)

You should see: ✅ Success. No rows returned

---

### **Step 2: Wait for Vercel Deployment** (1-2 minutes)

Check deployment status:
👉 https://vercel.com/chudi-nnorukams-projects/repurpose/deployments

Wait for "Ready" status (green checkmark).

---

### **Step 3: Import 90-Day Calendar** (1 minute)

Once deployment is ready:

1. Visit: https://repurpose-orpin.vercel.app/content-calendar
2. Log in if needed
3. Click **"Import 90-Day Calendar"** button
4. Wait for success message: "✅ Imported 245 calendar entries!"

---

### **Step 4: Verify Import** (30 seconds)

You should see:
- 245 content entries in the dashboard
- Posts grouped by week (1-13)
- LinkedIn and Twitter posts mixed
- Engagement scores (8-9/10) displayed
- Status: "draft" for all entries

---

## 🎯 What You'll Have After This

**In Supabase**:
- ✅ `content_calendar` table with 245 entries
- ✅ RLS policies (only you can see your content)
- ✅ Performance indexes
- ✅ Analytics summary view

**On Production Site**:
- ✅ /content-calendar dashboard
- ✅ All 245 posts ready to schedule
- ✅ Week 1 content ready to copy (16 posts)
- ✅ Full 90-day roadmap visible

---

## 🚀 Next Step After Import

**Launch Week 1** (Monday, Oct 21):

1. Read: `content-strategy/week1-content-FULLY-WRITTEN.md`
2. Copy posts to LinkedIn/Twitter (or use Buffer to schedule)
3. Post first LinkedIn Story Arc at 9:00 AM EST
4. Follow daily routine (30-45 min/day)

---

## 📊 Expected Results (90 Days)

- **Followers**: +600 to +1,650 (LinkedIn + Twitter)
- **Impressions**: 50K to 135K total
- **Engagement**: 3-5% average
- **Signups**: 50-200 for Repurpose MVP

---

## ❓ Troubleshooting

**If SQL migration fails**:
- Check error message in Supabase
- Likely: Table already exists (safe to ignore)
- Solution: Run `DROP TABLE IF EXISTS content_calendar CASCADE;` first

**If import fails**:
- Check browser console for errors
- Verify you're logged in
- Check Supabase table exists: Database > Tables > content_calendar

**If deployment is slow**:
- Vercel can take 2-5 minutes
- Check: https://vercel.com/chudi-nnorukams-projects/repurpose
- Look for green "Ready" checkmark

---

## 🎉 You're Almost There!

**Just 3 steps**:
1. ✅ Run SQL in Supabase (2 min)
2. ⏳ Wait for Vercel deployment (1-2 min)
3. 🚀 Click "Import" button (1 min)

**Then you're LIVE with your 90-day content strategy! 🎯**
