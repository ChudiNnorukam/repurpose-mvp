# 🚀 Ready to Deploy - Quick Start Guide

**Status**: ✅ All code changes committed
**Commit**: `4469312` - feat: implement missing API endpoints, middleware, and Sentry integration

---

## ⚡ Quick Deploy (5 Steps - 20 Minutes Total)

### Step 1: Push to GitHub (1 minute)
```bash
git push origin main
```
This triggers automatic Vercel deployment.

---

### Step 2: Set Up Upstash Redis (5 minutes) ⚠️ REQUIRED

**Why**: Enables rate limiting to prevent API abuse

1. Go to https://console.upstash.com/redis
2. Sign in (or create free account)
3. Click **"Create Database"**
   - Name: `repurpose-rate-limit`
   - Type: **Regional**
   - Region: Choose closest to your Vercel deployment
4. Click **"REST API"** tab
5. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
6. Add to Vercel:
   - Go to https://vercel.com/dashboard
   - Select `repurpose` project
   - Settings → Environment Variables
   - Add both variables for **Production**, **Preview**, and **Development**
7. Redeploy (Vercel dashboard → Deployments → ... → Redeploy)

**Cost**: FREE (10,000 commands/day)

---

### Step 3: Verify RLS Policies (2 minutes) ⚠️ REQUIRED

**Why**: Ensures data isolation between users

1. Go to https://supabase.com/dashboard
2. Select your project → **SQL Editor**
3. Open [supabase/verify-rls-policies.sql](supabase/verify-rls-policies.sql)
4. Copy entire contents
5. Paste into SQL Editor
6. Click **RUN**
7. Verify output shows:
   ```
   posts | rls_enabled: t
   social_accounts | rls_enabled: t
   ```

---

### Step 4: Set Up Sentry (5 minutes) - OPTIONAL

**Why**: Production error tracking

1. Go to https://sentry.io/signup/
2. Create project → **Next.js**
3. Copy DSN
4. Add to Vercel Environment Variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_AUTH_TOKEN=... (for source maps)
   ```
5. Update [next.config.ts](next.config.ts):
   - Line 25: Set `org` to your Sentry org
   - Line 26: Set `project` to your Sentry project name
6. Commit and push:
   ```bash
   git add next.config.ts
   git commit -m "chore: configure Sentry org and project"
   git push origin main
   ```

**Cost**: FREE (5,000 errors/month)

**Skip if**: You don't need error tracking right now

---

### Step 5: Test Production (7 minutes)

After deployment completes:

1. **Test Authentication**
   - Visit https://your-domain.vercel.app
   - Try to access /dashboard (should redirect to /login)
   - Login → Should reach /dashboard

2. **Test Rate Limiting**
   ```bash
   # Make 11 requests to /api/adapt
   # 11th should return rate limit error
   ```

3. **Test OAuth Flows**
   - Go to /connections
   - Click "Connect Twitter"
   - Verify OAuth flow works
   - Repeat for LinkedIn

4. **Test Posts**
   - Go to /create
   - Create and adapt content
   - Schedule a post
   - Check /posts list

---

## 📋 Pre-Flight Checklist

Before pushing to production:

- [x] All code committed (commit `4469312`)
- [x] Build passing (verified locally)
- [ ] Upstash Redis configured ← **DO THIS NOW**
- [ ] RLS policies verified ← **DO THIS NOW**
- [ ] Sentry configured (optional)
- [ ] OAuth callback URLs updated
- [ ] Environment variables set in Vercel

---

## 🔥 Deploy Commands

```bash
# Push to trigger deployment
git push origin main

# Watch deployment
# Go to: https://vercel.com/dashboard

# Check logs after deployment
vercel logs --prod
```

---

## ⚠️ Important Notes

### OAuth Callback URLs
Update these in developer consoles:

**Twitter**: https://developer.twitter.com/en/portal/dashboard
- Callback URL: `https://your-domain.vercel.app/api/auth/twitter/callback`

**LinkedIn**: https://www.linkedin.com/developers/apps
- Redirect URL: `https://your-domain.vercel.app/api/auth/linkedin/callback`

### Environment Variables Required

From [.env.example](.env.example):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `TWITTER_CLIENT_ID`
- ✅ `TWITTER_CLIENT_SECRET`
- ✅ `LINKEDIN_CLIENT_ID`
- ✅ `LINKEDIN_CLIENT_SECRET`
- ✅ `QSTASH_TOKEN`
- ✅ `QSTASH_CURRENT_SIGNING_KEY`
- ✅ `QSTASH_NEXT_SIGNING_KEY`
- ⚠️ `UPSTASH_REDIS_REST_URL` ← **ADD THIS**
- ⚠️ `UPSTASH_REDIS_REST_TOKEN` ← **ADD THIS**
- 🔵 `NEXT_PUBLIC_SENTRY_DSN` (optional)

---

## 🐛 Troubleshooting

### Build Fails
```bash
npm run build
# Fix any errors shown
```

### Rate Limiting Not Working
- Check Redis credentials in Vercel
- Look for warning in logs: "Rate limiting disabled"
- Verify Redis database is active in Upstash

### OAuth Fails
- Update callback URLs in Twitter/LinkedIn consoles
- Use production URL (not localhost)
- Check client ID and secret in Vercel

### Posts Not Executing
- Verify QStash credentials
- Check QStash dashboard for failed jobs
- Ensure signing keys are correct

---

## 📊 Monitor After Deployment

**First 24 Hours**:
1. Check Vercel logs every hour
2. Test all critical flows
3. Monitor error rate (should be <1%)
4. Watch for rate limit warnings

**Vercel Dashboard** → Analytics:
- Error rate
- Response times
- Function invocations

**Supabase Dashboard** → Database:
- Query performance
- Auth user count
- Storage usage

**Upstash Dashboard** → Redis:
- Commands per day (stay under 10k)

**Sentry** (if configured):
- Error frequency
- Performance issues

---

## 🔄 Rollback Plan

If critical issues occur:

### Option 1: Revert via Git
```bash
git revert 4469312
git push origin main
```

### Option 2: Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Option 3: Disable Features
```bash
# Remove middleware temporarily
git mv middleware.ts middleware.ts.bak
git commit -m "chore: temporarily disable middleware"
git push origin main
```

---

## ✅ Success Criteria

Deployment is successful when:

- ✅ Build completes without errors
- ✅ All routes accessible
- ✅ Authentication redirects work
- ✅ Rate limiting active (no warnings)
- ✅ OAuth flows complete successfully
- ✅ Posts can be created and scheduled
- ✅ No critical errors in logs

---

## 📚 Full Documentation

- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - Detailed setup guide
- **[SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md)** - Architecture reference
- **[CLAUDE.md](CLAUDE.md)** - Developer guide
- **[.env.example](.env.example)** - Environment variables

---

## 🎯 Next Steps After Deploy

1. **Monitor for 24 hours** - Check logs regularly
2. **Test with real users** - Beta testing
3. **Set up alerts** - Error rate, response time
4. **Plan next iteration** - Feature improvements

---

**🚀 Ready to deploy! Start with Step 1: `git push origin main`**

**⚠️ Don't forget**: Set up Upstash Redis and verify RLS policies (Steps 2 & 3)
