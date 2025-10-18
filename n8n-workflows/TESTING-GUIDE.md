# n8n Workflows - Testing Guide

**Purpose**: Verify all 4 workflows are working correctly
**Time**: 15-20 minutes
**Prerequisites**: ✅ Database migrated, ✅ OpenAI credential added

---

## Quick Test (5 minutes)

### Step 1: Create Test Data

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL in `/scripts/test-n8n-workflows.sql`
3. This creates 3 test posts to trigger different workflows

### Step 2: Manual Workflow Execution

Visit: https://chudinnorukam.app.n8n.cloud/workflows

**Test each workflow**:

1. **Auto-Scheduler**
   - Open workflow
   - Click "Execute Workflow" (top right)
   - Should find and process pending posts
   - ✅ Success: Calls `/api/schedule` endpoint
   - ⏱️ Expected time: 5-10 seconds

2. **Content Personalizer**
   - Open workflow
   - Click "Execute Workflow"
   - Should find posts with `ai_reviewed = false`
   - ✅ Success: AI analyzes content, updates `ai_review_data`
   - ⏱️ Expected time: 15-30 seconds (GPT-4o processing)

3. **Quality Gate**
   - Open workflow
   - Click "Execute Workflow"
   - Should find posts with `compliance_checked = false`
   - ✅ Success: AI checks compliance, updates `compliance_data`
   - ⏱️ Expected time: 15-30 seconds

4. **Engagement Monitor** (Optional - needs OAuth)
   - Skip for now if you haven't set up Twitter/LinkedIn OAuth
   - Will be tested after OAuth credentials are added

---

## Verify Results

### Check Workflow Executions

Visit: https://chudinnorukam.app.n8n.cloud/executions

You should see 3 successful executions (green checkmarks).

**Click each execution to see**:
- Input data (posts from database)
- Processing steps
- Output data
- Any errors

### Check Database Updates

Run this in Supabase SQL Editor:

```sql
SELECT
  platform,
  LEFT(content, 40) as content,
  status,
  ai_reviewed,
  ai_detection_risk,
  compliance_checked,
  compliant,
  safe_to_publish
FROM scheduled_posts
ORDER BY created_at DESC
LIMIT 5;
```

**Expected results**:
- `ai_reviewed` = `true` (Content Personalizer ran)
- `compliance_checked` = `true` (Quality Gate ran)
- `ai_detection_risk` = `low` / `medium` / `high`
- `compliant` = `true` / `false`

---

## Automated Testing (Scheduled Execution)

Your workflows are now running automatically:

| Workflow | Schedule | Next Run |
|----------|----------|----------|
| Auto-Scheduler | Every 6 hours | Check n8n dashboard |
| Content Personalizer | Every 12 hours | Check n8n dashboard |
| Quality Gate | Every 4 hours | Check n8n dashboard |
| Engagement Monitor | Every 2 hours | (needs OAuth) |

**Monitor executions**:
- Visit: https://chudinnorukam.app.n8n.cloud/executions
- Filter by workflow name
- Check for failures (red X)

---

## Common Issues & Solutions

### ❌ Issue: "No items to process"

**Cause**: No pending posts in database
**Solution**: Run test data SQL or create posts via your app

### ❌ Issue: "Credential not found"

**Cause**: Workflow can't find OpenAI/Supabase credential
**Solution**:
1. Open workflow in n8n
2. Click on AI node (e.g., "AI Content Review")
3. Re-select credential from dropdown
4. Save workflow

### ❌ Issue: "OpenAI API error"

**Cause**: Invalid API key or rate limit
**Solution**:
1. Check API key in n8n Credentials
2. Verify OpenAI account has credits
3. Check rate limits: https://platform.openai.com/usage

### ❌ Issue: "Supabase RLS policy error"

**Cause**: Service role key not configured
**Solution**:
1. Open n8n → Credentials → "Supabase API"
2. Verify "Service Role" key is used (not anon key)
3. Should start with `eyJhbGciOiJIUzI1NiIs...`

### ❌ Issue: "Twitter/LinkedIn API error"

**Cause**: OAuth not configured (Engagement Monitor)
**Solution**: See README-SETUP.md Step 3 for OAuth setup

---

## Success Criteria

✅ **Phase 1 Complete** when:
- [x] All 3 core workflows execute successfully
- [x] Test posts are processed (ai_reviewed, compliance_checked = true)
- [x] No errors in execution logs
- [x] Database columns updated correctly

✅ **Phase 2 Complete** when (optional):
- [ ] OAuth credentials added (Twitter, LinkedIn)
- [ ] Engagement Monitor executes successfully
- [ ] Test engagement data appears in engagement_queue table

---

## Next Steps After Testing

Once all tests pass:

1. **Delete test data** (optional):
   ```sql
   DELETE FROM scheduled_posts WHERE content LIKE '%test%';
   ```

2. **Start using real data**:
   - Create posts via your Repurpose app
   - Workflows will process them automatically

3. **Monitor daily**:
   - Check n8n executions dashboard
   - Review flagged posts (requires_human_review = true)
   - Respond to high-priority engagements

4. **Phase 2 (Optional - Engagement Automation)**:
   - Set up Twitter OAuth
   - Set up LinkedIn OAuth
   - Configure Slack webhook for alerts
   - Test Engagement Monitor workflow

---

## Support

**Issues with workflows**: Check AUDIT-REPORT.md for troubleshooting
**Setup questions**: See README-SETUP.md
**n8n documentation**: https://docs.n8n.io
**Supabase docs**: https://supabase.com/docs

---

**Last Updated**: January 18, 2025
**Status**: Phase 1 Ready for Testing
