# 🚀 Complete End-to-End Test Guide

**Goal**: Verify the full automation stack works from database → n8n → QStash → LinkedIn

---

## ✅ Pre-Flight Checklist

Before testing, ensure:

1. **LinkedIn App Configured** (5 minutes):
   - Visit: https://www.linkedin.com/developers/apps
   - Create or select your app
   - **Redirect URLs**: Add `https://repurpose-orpin.vercel.app/api/auth/linkedin/callback`
   - **Products**: Enable "Sign In with LinkedIn using OpenID Connect" AND "Share on LinkedIn"
   - Copy Client ID and Secret

2. **Vercel Environment Variables Set**:
   ```bash
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_secret_here
   ```
   - Go to: https://vercel.com/chudi-nnorukams-projects/repurpose/settings/environment-variables
   - Add both variables for Production, Preview, and Development
   - Redeploy after adding

3. **Deployment Complete**:
   - Latest commit deployed: `85ae4e4`
   - Check: https://vercel.com/chudi-nnorukams-projects/repurpose/deployments

---

## 🎯 TEST 1: OAuth Connection (2 minutes)

**Automated Way**:
```bash
open "https://repurpose-orpin.vercel.app/connections"
```

**Manual Steps**:
1. Visit `/connections` page
2. Click **"Connect LinkedIn"** button
3. LinkedIn OAuth popup appears
4. Click **"Allow"** to authorize
5. Redirected back to `/connections` with success message
6. **Verify**: Green checkmark next to LinkedIn

**Expected Result**: ✅ LinkedIn connected, token stored in database

---

## 🎯 TEST 2: Immediate Test Post (30 seconds)

Once LinkedIn is connected, run this script:

```bash
npm run test:immediate-post
```

This will:
1. Create a test post in database
2. Schedule it for 30 seconds from now
3. Trigger QStash scheduling
4. Wait and verify it posted to LinkedIn

**Manual Alternative**:
```bash
# 1. Create post
npx tsx scripts/create-immediate-post.ts

# 2. Schedule it
npx tsx scripts/schedule-immediate-test.ts

# 3. Check LinkedIn in 30 seconds
open "https://www.linkedin.com/feed/"
```

**Expected Result**: 
- ✅ QStash message queued
- ✅ Post appears on LinkedIn in ~30 seconds
- ✅ Database shows post status = 'published'

---

## 🎯 TEST 3: Full n8n Workflow (5 minutes)

This tests the complete automation including n8n:

```bash
# 1. Create pending post
npm run create-post

# 2. Manually trigger n8n Auto-Scheduler
# Visit: https://chudinnorukam.app.n8n.cloud/workflows
# Click "Repurpose Auto-Scheduler" → "Execute Workflow"

# 3. Wait 2 minutes
# 4. Check LinkedIn feed
```

**Expected Flow**:
```
Pending Post (DB)
  ↓
n8n Auto-Scheduler (every 6 hours)
  ↓
/api/schedule-internal (Bearer auth ✅)
  ↓
QStash (schedules job)
  ↓
/api/post/execute (30s later)
  ↓
LinkedIn UGC API (posts content)
  ↓
Published Post (LinkedIn + DB)
```

---

## 📊 Verification Commands

**Check if LinkedIn connected**:
```bash
npx tsx scripts/check-linkedin-auth.ts
```

**Check post status**:
```bash
npx tsx scripts/check-post-status.ts
```

**Check QStash queue**:
```bash
open "https://console.upstash.com/qstash"
```

**Check Vercel logs**:
```bash
open "https://vercel.com/chudi-nnorukams-projects/repurpose/logs"
```

---

## 🐛 Troubleshooting

### Error: `invalid_scope_error`

**Cause**: LinkedIn products not enabled

**Fix**:
1. Go to https://www.linkedin.com/developers/apps/YOUR_APP_ID/auth
2. Enable **"Sign In with LinkedIn using OpenID Connect"**
3. Enable **"Share on LinkedIn"**
4. Wait 5 minutes for LinkedIn to propagate changes
5. Try OAuth again

### Error: `Missing Authorization header`

**Cause**: n8n workflow not sending Bearer token

**Fix**: Already fixed in workflow ID `1WdrKyqjBkxOCZy8`

### Error: `No LinkedIn account connected`

**Cause**: OAuth not completed

**Fix**: Complete TEST 1 first

### Error: `Token expired`

**Solution**: Automatic! The system will refresh the token automatically.

---

## 🎉 Success Criteria

All tests pass when you see:

- ✅ LinkedIn connected on `/connections` page
- ✅ Test post appears on your LinkedIn feed
- ✅ Database shows `status='published'`
- ✅ QStash dashboard shows successful execution
- ✅ Vercel logs show no errors

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Schedule Real Content**:
   ```bash
   npm run create-post  # Edit content in scripts/create-post.ts
   ```

2. **Batch Schedule 30 Days**:
   ```bash
   npm run batch-create  # Creates 30 posts at optimal times
   ```

3. **Monitor Automation**:
   - n8n runs every 6 hours automatically
   - Check `/dashboard` for analytics
   - Check QStash for upcoming posts

4. **Add More Platforms**:
   - Twitter OAuth (similar to LinkedIn)
   - Instagram (requires Facebook Business account)

---

**Created**: January 18, 2025  
**Last Updated**: January 18, 2025  
**Status**: ✅ Ready for Testing
