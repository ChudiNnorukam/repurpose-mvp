# Repurpose AI - n8n Automation Setup Guide

**For Beginners** | Complete setup in 30-45 minutes

---

## Overview

This guide will help you set up **n8n workflows** to automate your Repurpose AI content strategy. You'll connect n8n to your Supabase database, OpenAI, Twitter, and LinkedIn to achieve 90% hands-off operation.

**What you'll automate:**
- ✅ Daily content scheduling (6-hour intervals)
- ✅ AI content optimization before publishing
- ✅ Compliance checks (Twitter/LinkedIn policies, GDPR)
- ✅ Engagement monitoring (mentions, comments, replies)
- ✅ Analytics collection and insights
- ✅ Smart reply suggestions

---

## Prerequisites

- [ ] Repurpose AI project deployed on Vercel
- [ ] Supabase project with database tables
- [ ] OpenAI API key
- [ ] Twitter API access (OAuth 2.0)
- [ ] LinkedIn API access (OAuth 2.0)
- [ ] n8n account (Starter plan - $20/month or self-hosted free)

---

## Step 1: Set Up n8n Account

### Option A: n8n Cloud (Recommended for Beginners)
1. Go to [n8n.cloud](https://n8n.io/cloud/)
2. Sign up for Starter plan ($20/month)
3. Create a new instance
4. Wait 2-3 minutes for provisioning
5. Access your n8n dashboard at `https://[your-instance].app.n8n.cloud`

### Option B: Self-Hosted (Free, Requires Docker)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
Then visit `http://localhost:5678`

---

## Step 2: Configure Credentials

n8n uses "credentials" to securely store API keys and OAuth tokens. You'll need to set up 5 credentials.

### 2.1 Supabase API Credentials

1. In n8n, click **Credentials** → **New**
2. Search for "Supabase"
3. Enter:
   - **Host:** Your Supabase URL (e.g., `https://qdmmztwgfqvajhrnikho.supabase.co`)
   - **Service Role Secret:** From Supabase Dashboard → Project Settings → API → `service_role` key
4. Click **Create**
5. Name it: `Supabase API`

**Where to find:**
- Supabase Dashboard → Settings → API → Project URL
- Supabase Dashboard → Settings → API → Project API keys → `service_role`

---

### 2.2 OpenAI API Credentials

1. In n8n, click **Credentials** → **New**
2. Search for "OpenAI"
3. Enter:
   - **API Key:** Your OpenAI API key (starts with `sk-proj-...`)
4. Click **Create**
5. Name it: `OpenAI API`

**Where to get:**
- [OpenAI Platform](https://platform.openai.com/api-keys)
- Click "Create new secret key"
- Copy immediately (only shown once)

---

### 2.3 Twitter OAuth2 API Credentials

1. In n8n, click **Credentials** → **New**
2. Search for "Twitter OAuth2 API"
3. You'll see a **Redirect URL** (copy this for step 4)
4. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
5. Select your app → Settings → User authentication settings
6. Add the n8n redirect URL to **Callback URLs**
7. Copy your **Client ID** and **Client Secret**
8. Back in n8n, enter:
   - **Client ID:** From Twitter app
   - **Client Secret:** From Twitter app
   - **Auth URI:** `https://twitter.com/i/oauth2/authorize`
   - **Access Token URI:** `https://api.twitter.com/2/oauth2/token`
   - **Scope:** `tweet.read tweet.write users.read offline.access`
9. Click **Connect my account** → Authorize with Twitter
10. Name it: `Twitter OAuth2 API`

---

### 2.4 LinkedIn OAuth2 API Credentials

1. In n8n, click **Credentials** → **New**
2. Search for "LinkedIn OAuth2 API"
3. You'll see a **Redirect URL** (copy this)
4. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
5. Select your app → Auth → Add redirect URL (paste n8n's URL)
6. Copy **Client ID** and **Client Secret**
7. Back in n8n, enter credentials
8. Set **Scope:** `w_member_social r_liteprofile r_emailaddress`
9. Click **Connect my account** → Authorize with LinkedIn
10. Name it: `LinkedIn OAuth2 API`

---

### 2.5 Slack Webhook (Optional - For Alerts)

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app → "From scratch"
3. Enable **Incoming Webhooks**
4. Add webhook to your channel
5. Copy the webhook URL (e.g., `https://hooks.slack.com/services/...`)
6. **Don't add this to n8n credentials** - we'll use an environment variable instead

Add to your **n8n environment variables:**
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**For n8n Cloud:**
- Settings → Environment Variables → Add new
- Name: `SLACK_WEBHOOK_URL`
- Value: Your webhook URL

**For self-hosted:**
- Add to your `docker run` command or `.env` file

---

## Step 3: Import Workflows

### Import All 4 Workflows

1. In n8n, click **Workflows** → **Import from File**
2. Select each JSON file from the `n8n-workflows/` folder:
   - `1-auto-scheduler.json`
   - `2-content-personalizer.json`
   - `3-quality-gate.json`
   - `4-engagement-monitor.json`
3. After importing, click on each workflow
4. Assign the credentials you created in Step 2:
   - Supabase nodes → Select "Supabase API"
   - OpenAI nodes → Select "OpenAI API"
   - HTTP Request nodes (Twitter) → Select "Twitter OAuth2 API"
   - HTTP Request nodes (LinkedIn) → Select "LinkedIn OAuth2 API"

---

## Step 4: Update Database Schema

The workflows expect these Supabase tables to exist. Run this SQL in Supabase SQL Editor:

```sql
-- Add new columns to scheduled_posts table
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS ai_reviewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_review_data JSONB,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_detection_risk TEXT,
ADD COLUMN IF NOT EXISTS compliance_checked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS compliant BOOLEAN,
ADD COLUMN IF NOT EXISTS compliance_data JSONB,
ADD COLUMN IF NOT EXISTS safe_to_publish BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_human_review BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create published_posts table (tracks successfully published posts)
CREATE TABLE IF NOT EXISTS published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  platform_post_id TEXT, -- ID from Twitter/LinkedIn API
  published_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published',
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create engagement_queue table (stores mentions/comments for review)
CREATE TABLE IF NOT EXISTS engagement_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES published_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  engagement_type TEXT NOT NULL, -- mention, comment, reply
  author_name TEXT,
  author_username TEXT,
  text TEXT,
  sentiment TEXT, -- positive, neutral, negative
  priority TEXT, -- high, medium, low
  requires_reply BOOLEAN DEFAULT false,
  suggested_reply TEXT,
  category TEXT, -- question, feedback, appreciation, complaint, spam
  analysis_data JSONB,
  status TEXT DEFAULT 'pending', -- pending, replied, ignored
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own published posts"
  ON published_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own engagement"
  ON engagement_queue FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM published_posts WHERE id = engagement_queue.post_id));
```

---

## Step 5: Test Each Workflow

### Test 1: Auto-Scheduler

1. Open `1-auto-scheduler` workflow
2. Create a test post in Supabase:
```sql
INSERT INTO scheduled_posts (user_id, platform, content, original_content, scheduled_time, status)
VALUES (
  'YOUR_USER_ID',
  'twitter',
  'Test post from n8n automation',
  'Original test content',
  NOW() + INTERVAL '10 minutes',
  'pending'
);
```
3. In n8n workflow, click **Execute Workflow** button
4. Check execution log - should show "Success"
5. Verify in Supabase that post status changed to `scheduled`

### Test 2: Content Personalizer

1. Add test column to your post:
```sql
UPDATE scheduled_posts
SET ai_reviewed = false
WHERE id = 'YOUR_TEST_POST_ID';
```
2. Execute `2-content-personalizer` workflow
3. Check that `ai_reviewed` = true and `engagement_score` is populated

### Test 3: Quality Gate

1. Execute `3-quality-gate` workflow
2. Check logs - should see compliance check results
3. Verify `compliance_checked` = true in database

### Test 4: Engagement Monitor

1. This requires actual published posts with engagement
2. For now, just execute to verify no errors
3. Will populate `engagement_queue` when real mentions appear

---

## Step 6: Activate Workflows

Once tests pass, activate the workflows:

1. Open each workflow
2. Toggle **Active** switch to ON (top-right corner)
3. Confirm activation

**Schedules:**
- **Auto-Scheduler:** Every 6 hours
- **Content Personalizer:** Every 12 hours
- **Quality Gate:** Every 4 hours
- **Engagement Monitor:** Every 2 hours

---

## Step 7: Monitor & Adjust

### View Execution Logs

1. Click **Executions** in left sidebar
2. See all workflow runs, success/failure status
3. Click any execution to see detailed logs

### Common Issues

**Issue: "Missing credentials"**
- Solution: Assign credentials to each node (click node → Credentials dropdown → Select)

**Issue: "Supabase: Row not found"**
- Solution: Ensure test data exists in `scheduled_posts` table

**Issue: "OpenAI API Error: Rate limit"**
- Solution: Reduce workflow frequency or upgrade OpenAI tier

**Issue: "Twitter API 401 Unauthorized"**
- Solution: Re-authenticate Twitter OAuth2 credentials

**Issue: "Slack webhook not working"**
- Solution: Verify `SLACK_WEBHOOK_URL` environment variable is set

---

## Step 8: Database Monitoring

Create a simple monitoring query in Supabase:

```sql
-- Daily automation stats
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE ai_reviewed = true) as ai_reviewed_count,
  COUNT(*) FILTER (WHERE compliance_checked = true) as compliance_checked_count,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
  COUNT(*) FILTER (WHERE status = 'published') as published_count
FROM scheduled_posts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Next Steps

### Phase 2 (Optional Enhancements)
- Auto-responder workflow (draft replies, human approval before sending)
- Analytics dashboard (Next.js page showing engagement metrics)
- A/B testing workflow (test content variants)

### Phase 3 (Advanced)
- Dynamic content generation (Claude analyzes trending topics)
- Sentiment tracking dashboard
- Automated reporting (weekly email summaries)

---

## Environment Variables Reference

Add these to your Vercel project and n8n environment:

```bash
# Vercel (Repurpose AI)
NEXT_PUBLIC_APP_URL=https://repurpose-orpin.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://qdmmztwgfqvajhrnikho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-proj-...
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
QSTASH_TOKEN=your_qstash_token

# n8n Environment Variables
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## Support & Troubleshooting

**n8n Community Forum:** https://community.n8n.io/
**n8n Documentation:** https://docs.n8n.io/
**Twitter API Docs:** https://developer.twitter.com/en/docs/twitter-api
**LinkedIn API Docs:** https://learn.microsoft.com/en-us/linkedin/

**Quick Diagnostics:**
```bash
# Check if workflows are active
# n8n Dashboard → Workflows → Filter by "Active"

# Check execution history
# n8n Dashboard → Executions → Last 24 hours

# Test credentials
# n8n Dashboard → Credentials → Test connection
```

---

## Workflow Architecture

```
Content Calendar (Supabase)
  ↓
Auto-Scheduler (every 6h)
  → Fetches pending posts
  → Calls /api/schedule
  → Updates QStash
  ↓
Content Personalizer (every 12h)
  → AI reviews content
  → Optimizes for engagement
  → Updates posts
  ↓
Quality Gate (every 4h)
  → Compliance check
  → Flags violations
  → Sends critical alerts
  ↓
Publishing (via QStash/Repurpose API)
  ↓
Engagement Monitor (every 2h)
  → Fetches mentions/comments
  → AI analyzes sentiment
  → Suggests replies
  → Saves to queue
```

---

**Setup Complete!** 🎉

You now have a fully automated content pipeline. Check your Slack for alerts and monitor the n8n execution logs for the first few days to ensure everything runs smoothly.

**Estimated hands-off operation:** 90%
**Manual intervention needed:** ~5-10% (high-priority engagement, critical compliance flags)

---

*Last Updated: January 2025*
*Version: 1.0.0*
