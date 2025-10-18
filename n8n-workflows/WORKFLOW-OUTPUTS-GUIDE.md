# n8n Workflow Outputs - What Each Workflow Does

**Purpose**: Understand what each workflow does and how to check results
**Last Updated**: January 18, 2025

---

## 📊 How to Check Workflow Outputs

### Method 1: n8n Execution Logs (Detailed)

1. Visit: https://chudinnorukam.app.n8n.cloud/executions
2. You'll see a list of all workflow runs
3. Click any execution to see:
   - ✅ **Green nodes** = successful steps
   - ❌ **Red nodes** = errors
   - **Node data** = click any node to see input/output

**What to look for**:
- **Input tab**: Data going INTO the node
- **Output tab**: Data coming OUT of the node
- **JSON tab**: Raw data structure

### Method 2: Database (Results)

Run this in Supabase SQL Editor to see what workflows changed:

```sql
-- See recent workflow activity
SELECT
  platform,
  LEFT(content, 50) as content_preview,
  status,
  ai_reviewed,
  ai_detection_risk,
  engagement_score,
  compliance_checked,
  compliant,
  safe_to_publish,
  requires_human_review,
  updated_at
FROM scheduled_posts
ORDER BY updated_at DESC
LIMIT 10;
```

### Method 3: Workflow Canvas (Live)

1. Open any workflow: https://chudinnorukam.app.n8n.cloud/workflows
2. Click "Execute Workflow"
3. Watch nodes turn green as they process
4. Click each node to see live data

---

## 🔍 Workflow #1: Auto-Scheduler

**What it does**: Schedules pending posts via QStash (so they publish at the right time)

**Runs**: Every 6 hours

**Step-by-step**:

1. **Schedule Trigger** (every 6 hours)
   - Output: `{ timestamp: "2025-01-18T10:00:00Z" }`

2. **Get Pending Posts** (Supabase query)
   - SQL: `SELECT * FROM scheduled_posts WHERE status = 'pending'`
   - Output: Array of posts
   ```json
   [
     {
       "id": "uuid-here",
       "platform": "twitter",
       "content": "Your tweet content",
       "scheduled_time": "2025-01-19T14:00:00Z"
     }
   ]
   ```

3. **Call Schedule API** (HTTP Request)
   - URL: `https://repurpose-orpin.vercel.app/api/schedule`
   - Method: POST
   - Body: Post data
   - Output:
   ```json
   {
     "success": true,
     "qstash_message_id": "msg_abc123",
     "scheduled_for": "2025-01-19T14:00:00Z"
   }
   ```

4. **Check for Errors** (If node)
   - If error exists → log it
   - If success → update status

5. **Update Post Status** (Supabase update)
   - SQL: `UPDATE scheduled_posts SET status = 'scheduled', qstash_message_id = $1`
   - Output: Updated post record

**What changed in database**:
```sql
-- Before
status = 'pending'
qstash_message_id = NULL

-- After
status = 'scheduled'
qstash_message_id = 'msg_abc123'
```

**Check results**:
```sql
SELECT
  COUNT(*) as total_scheduled,
  COUNT(qstash_message_id) as with_qstash_id
FROM scheduled_posts
WHERE status = 'scheduled';
```

---

## ✨ Workflow #2: Content Personalizer

**What it does**: AI reviews posts and removes AI detection patterns, improves engagement

**Runs**: Every 12 hours

**Step-by-step**:

1. **Get Unreviewed Posts** (Supabase query)
   - SQL: `SELECT * FROM scheduled_posts WHERE ai_reviewed = false`
   - Output: Posts that need AI review

2. **AI Content Review** (OpenAI GPT-4o)
   - Input:
   ```json
   {
     "platform": "twitter",
     "content": "Excited to delve into AI trends and unlock opportunities."
   }
   ```
   - Prompt: "Remove AI detection patterns (delve, unlock, leverage, etc.)"
   - Output:
   ```json
   {
     "improved_content": "Excited to explore AI trends and discover new opportunities.",
     "changes_made": ["Removed 'delve'", "Replaced 'unlock' with 'discover'"],
     "ai_detection_risk": "low",
     "engagement_score": 78,
     "reasoning": "Original had 2 AI patterns. Improved readability."
   }
   ```

3. **Parse AI Response** (Code node)
   - Extracts JSON from AI response
   - Validates structure
   - Output: Clean JSON object

4. **Check If Improved** (If node)
   - If `improved_content !== original_content` → Update content
   - Else → Just mark as reviewed

5. **Update Content** (Supabase update - if improved)
   - SQL:
   ```sql
   UPDATE scheduled_posts SET
     content = $improved_content,
     ai_reviewed = true,
     ai_review_data = $full_response,
     engagement_score = $score,
     ai_detection_risk = $risk
   ```

6. **Mark as Reviewed** (Supabase update - if not improved)
   - SQL: `UPDATE scheduled_posts SET ai_reviewed = true`

**What changed in database**:
```sql
-- Before
content = "Excited to delve into AI trends"
ai_reviewed = false
ai_review_data = NULL
engagement_score = NULL
ai_detection_risk = NULL

-- After
content = "Excited to explore AI trends" -- IMPROVED!
ai_reviewed = true
ai_review_data = { "changes_made": [...], "reasoning": "..." }
engagement_score = 78
ai_detection_risk = "low"
```

**Check results**:
```sql
SELECT
  original_content,
  content as improved_content,
  ai_detection_risk,
  engagement_score,
  ai_review_data->>'reasoning' as ai_reasoning
FROM scheduled_posts
WHERE ai_reviewed = true
ORDER BY updated_at DESC
LIMIT 5;
```

---

## 🔍 Workflow #3: Quality Gate

**What it does**: Checks if posts comply with Twitter/LinkedIn policies and GDPR

**Runs**: Every 4 hours

**Step-by-step**:

1. **Get Unchecked Posts** (Supabase query)
   - SQL: `SELECT * FROM scheduled_posts WHERE compliance_checked = false`
   - Output: Posts that need compliance review

2. **AI Compliance Check** (OpenAI GPT-4o)
   - Input:
   ```json
   {
     "platform": "twitter",
     "content": "Follow me for tips! DM for free consultation!"
   }
   ```
   - Prompt: "Check Twitter API policy, LinkedIn standards, GDPR compliance"
   - Output:
   ```json
   {
     "compliant": false,
     "violations": [
       {
         "rule": "Twitter spam policy",
         "severity": "medium",
         "issue": "Follow-for-follow pattern detected"
       }
     ],
     "safe_to_publish": false,
     "requires_human_review": true,
     "suggested_fix": "Remove 'Follow me' and focus on value proposition",
     "reasoning": "Contains engagement bait pattern"
   }
   ```

3. **Parse Compliance Response** (Code node)
   - Extracts and validates JSON
   - Categorizes severity (low/medium/high/critical)

4. **Check If Safe** (If node)
   - If `compliant = true && safe_to_publish = true` → Mark compliant
   - Else → Flag for review

5. **Mark Compliant** (Supabase update - if safe)
   - SQL:
   ```sql
   UPDATE scheduled_posts SET
     compliance_checked = true,
     compliant = true,
     safe_to_publish = true
   ```

6. **Flag for Review** (Supabase update - if violations)
   - SQL:
   ```sql
   UPDATE scheduled_posts SET
     compliance_checked = true,
     compliant = false,
     compliance_data = $violations,
     safe_to_publish = false,
     requires_human_review = true
   ```

7. **Check If Critical** (If node)
   - If `severity = 'critical'` → Send Slack alert

8. **Send Critical Alert** (Slack webhook - optional)
   - Sends notification to your Slack channel
   - Includes: violation details, suggested fix

**What changed in database**:
```sql
-- Before
compliance_checked = false
compliant = NULL
compliance_data = NULL
safe_to_publish = true
requires_human_review = false

-- After (if violations found)
compliance_checked = true
compliant = false
compliance_data = { "violations": [...], "suggested_fix": "..." }
safe_to_publish = false
requires_human_review = true
```

**Check results**:
```sql
-- See posts that need review
SELECT
  platform,
  LEFT(content, 50) as content,
  compliant,
  safe_to_publish,
  requires_human_review,
  compliance_data->>'suggested_fix' as fix
FROM scheduled_posts
WHERE compliance_checked = true
  AND requires_human_review = true
ORDER BY updated_at DESC;
```

---

## 💬 Workflow #4: Engagement Monitor (Optional - Needs OAuth)

**What it does**: Monitors Twitter/LinkedIn for mentions and comments, AI analyzes sentiment

**Runs**: Every 2 hours

**Requires**: Twitter OAuth2 + LinkedIn OAuth2 credentials

**Step-by-step**:

1. **Get Recent Published Posts** (Supabase query)
   - SQL: `SELECT * FROM published_posts WHERE published_at >= NOW() - INTERVAL '3 days'`
   - Output: Recently published posts

2. **Route By Platform** (If node)
   - If Twitter → Get Twitter mentions
   - If LinkedIn → Get LinkedIn comments

3. **Get Twitter Engagement** (Twitter API)
   - API: `GET https://api.twitter.com/2/tweets/{id}/mentions`
   - Output:
   ```json
   {
     "data": [
       {
         "id": "tweet_id",
         "text": "@yourhandle Great post! How did you implement this?",
         "author_id": "user123",
         "created_at": "2025-01-18T10:30:00Z"
       }
     ]
   }
   ```

4. **Parse Engagement Data** (Code node)
   - Extracts mentions/comments
   - Normalizes format across platforms

5. **AI Engagement Analysis** (OpenAI GPT-4o)
   - Input:
   ```json
   {
     "platform": "twitter",
     "author": "John Doe (@johndoe)",
     "text": "Great post! How did you implement this?"
   }
   ```
   - Prompt: "Analyze sentiment, priority, suggest reply"
   - Output:
   ```json
   {
     "sentiment": "positive",
     "priority": "high",
     "requires_reply": true,
     "suggested_reply": "Thanks John! I used Next.js 15 with Supabase. Happy to share more details - what specific part are you interested in?",
     "category": "question",
     "reasoning": "Direct question from engaged follower, high-value interaction"
   }
   ```

6. **Save To Engagement Queue** (Supabase insert)
   - SQL:
   ```sql
   INSERT INTO engagement_queue (
     post_id,
     platform,
     engagement_type,
     author_name,
     text,
     sentiment,
     priority,
     requires_reply,
     suggested_reply,
     category,
     status
   ) VALUES (...)
   ```

7. **Check If High Priority** (If node)
   - If `priority = 'high'` → Send Slack alert

8. **Send High Priority Alert** (Slack webhook - optional)
   - Alerts you about important engagement
   - Includes suggested reply

**What appears in database**:
```sql
-- New row in engagement_queue
SELECT
  platform,
  author_name,
  LEFT(text, 50) as message,
  sentiment,
  priority,
  category,
  requires_reply,
  LEFT(suggested_reply, 50) as suggested_reply
FROM engagement_queue
WHERE status = 'pending'
ORDER BY created_at DESC;
```

**Check results**:
```sql
-- High-priority engagements to respond to
SELECT
  platform,
  author_name,
  text,
  suggested_reply,
  created_at
FROM engagement_queue
WHERE priority = 'high'
  AND status = 'pending'
ORDER BY created_at DESC;
```

---

## 📊 Dashboard Queries (Quick Health Check)

Run these in Supabase SQL Editor to see overall status:

### Overall Automation Health
```sql
SELECT
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
  COUNT(*) FILTER (WHERE ai_reviewed = true) as ai_reviewed,
  COUNT(*) FILTER (WHERE compliance_checked = true) as compliance_checked,
  COUNT(*) FILTER (WHERE requires_human_review = true) as needs_review
FROM scheduled_posts;
```

### Recent Workflow Activity
```sql
SELECT
  DATE_TRUNC('hour', updated_at) as hour,
  COUNT(*) as posts_processed,
  COUNT(*) FILTER (WHERE ai_reviewed = true) as ai_reviewed,
  COUNT(*) FILTER (WHERE compliance_checked = true) as compliance_checked
FROM scheduled_posts
WHERE updated_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Posts Needing Attention
```sql
SELECT
  platform,
  LEFT(content, 60) as content,
  CASE
    WHEN NOT compliant THEN 'Compliance violation'
    WHEN ai_detection_risk = 'high' THEN 'High AI detection risk'
    WHEN requires_human_review THEN 'Flagged for review'
  END as reason,
  compliance_data->>'suggested_fix' as suggested_fix
FROM scheduled_posts
WHERE requires_human_review = true
   OR compliant = false
   OR ai_detection_risk = 'high'
ORDER BY updated_at DESC;
```

---

## 🎯 What Success Looks Like

After workflows run, you should see:

### Auto-Scheduler Success
- ✅ Posts with `status = 'scheduled'`
- ✅ `qstash_message_id` populated
- ✅ No error messages in execution log

### Content Personalizer Success
- ✅ Posts with `ai_reviewed = true`
- ✅ `ai_detection_risk` set (low/medium/high)
- ✅ `engagement_score` populated (0-100)
- ✅ Some posts have improved content (AI patterns removed)

### Quality Gate Success
- ✅ Posts with `compliance_checked = true`
- ✅ `compliant = true` for most posts
- ✅ `safe_to_publish = true` for most posts
- ✅ Few posts with `requires_human_review = true`

### Engagement Monitor Success (when OAuth added)
- ✅ Rows in `engagement_queue` table
- ✅ High-priority mentions flagged
- ✅ Suggested replies generated

---

## 🚨 What to Watch For

### Red Flags
- ❌ Many posts with `requires_human_review = true` (>20%)
- ❌ All posts flagged as `compliant = false`
- ❌ High AI detection risk on all posts
- ❌ Workflow executions failing repeatedly

### Normal Patterns
- ✅ ~5-10% of posts need human review (good!)
- ✅ Some AI improvements, some posts left as-is
- ✅ Occasional compliance warnings (learning from them)
- ✅ Most executions succeed

---

## 📞 Need Help?

**Check execution logs**: https://chudinnorukam.app.n8n.cloud/executions
**Run health check query**: See "Overall Automation Health" above
**Review audit report**: `n8n-workflows/AUDIT-REPORT.md`

---

**Last Updated**: January 18, 2025
**Next**: Run test workflows and check these outputs!
