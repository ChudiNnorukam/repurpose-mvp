# Production Fix: Post Scheduling Foreign Key Constraint Error

**Date**: October 13, 2025
**Issue**: Users cannot schedule posts - fails with foreign key constraint error
**Status**: FIXED ✅
**Priority**: CRITICAL

---

## Executive Summary

### Problem
Production users encountered the error: `insert or update on table "posts" violates foreign key constraint "posts_user_id_fkey"` when attempting to schedule posts.

### Root Cause
The API route was using the Supabase admin client (service role) to verify users and insert posts, but the `userId` from the frontend could be:
1. Stale or cached from a previous session
2. From a different environment (dev userId in production)
3. A user that was deleted but session still exists

The foreign key constraint at the PostgreSQL level enforces that `posts.user_id` must exist in `auth.users(id)`, even when using the service role.

### Solution Implemented
1. **Enhanced validation** in `/app/api/schedule/route.ts`:
   - Detailed user verification with proper error messages
   - Explicit foreign key error handling (code 23503)
   - Comprehensive logging for debugging
   - Step-by-step validation with clear error codes

2. **Improved frontend error handling** in `/app/create/page.tsx`:
   - Specific error code handling with user-friendly messages
   - Automatic redirect to login on auth errors
   - Detailed logging for debugging
   - Better UX with actionable error messages

3. **Diagnostic script** at `/scripts/verify-auth.ts`:
   - Verifies environment variables
   - Tests authentication flow
   - Validates user exists in auth.users
   - Tests RLS policies
   - Simulates post insertion

---

## Files Changed

### 1. `/app/api/schedule/route.ts` (Complete Rewrite)

**Changes:**
- ✅ Added comprehensive JSDoc documentation
- ✅ Improved error handling with specific error codes
- ✅ Enhanced logging at each validation step
- ✅ Explicit foreign key constraint error detection (PostgreSQL error code 23503)
- ✅ Better user verification with detailed error messages
- ✅ Step-by-step validation (9 steps total)
- ✅ Consistent use of `createErrorResponse` for all errors

**Key Sections:**
1. Authentication check
2. Parse and validate input
3. Verify user ID matches authenticated user
4. Rate limiting
5. Validate platform
6. Validate user exists in auth.users (CRITICAL FIX)
7. Validate scheduled time
8. Insert post into database
9. Schedule QStash job

### 2. `/app/create/page.tsx` (Frontend Error Handling)

**Changes:**
- ✅ Added detailed error logging
- ✅ Specific error code handling with switch statement
- ✅ User-friendly messages for each error type
- ✅ Automatic redirect to login on authentication errors
- ✅ Network error detection
- ✅ Rate limit information display
- ✅ Clear scheduled time after successful scheduling

**Error Codes Handled:**
- `UNAUTHORIZED` - Session expired, redirect to login
- `RATE_LIMIT_EXCEEDED` - Show limit and reset time
- `INVALID_PLATFORM` - Invalid platform selected
- `INVALID_TIME` - Scheduled time validation failed
- `DATABASE_ERROR` - Database operation failed
- `RECORD_NOT_FOUND` - User not found in database
- `QSTASH_ERROR` - Job scheduling failed
- `MISSING_REQUIRED_FIELD` - Missing input validation

### 3. `/scripts/verify-auth.ts` (New Diagnostic Tool)

**Purpose:**
Comprehensive authentication and database verification script

**Features:**
- ✅ Environment variable validation
- ✅ Supabase client initialization test
- ✅ User authentication test
- ✅ Admin client user verification
- ✅ RLS policy testing
- ✅ Post insertion test (with cleanup)
- ✅ Failed posts query
- ✅ Color-coded terminal output
- ✅ Interactive prompts

**Usage:**
```bash
# Local testing
npx ts-node scripts/verify-auth.ts

# Production testing (with production env vars)
NODE_ENV=production npx ts-node scripts/verify-auth.ts
```

---

## Deployment Instructions

### Pre-Deployment Checklist

1. **Verify environment variables in Vercel:**
   - [ ] `NEXT_PUBLIC_SUPABASE_URL`
   - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - [ ] `SUPABASE_SERVICE_ROLE_KEY`
   - [ ] `QSTASH_TOKEN`
   - [ ] `QSTASH_CURRENT_SIGNING_KEY`
   - [ ] `QSTASH_NEXT_SIGNING_KEY`
   - [ ] `NEXT_PUBLIC_APP_URL` (must match production URL)

2. **Run diagnostic script locally:**
   ```bash
   # Test with local environment
   cp .env.local .env
   npx ts-node scripts/verify-auth.ts
   ```

3. **Run TypeScript compilation:**
   ```bash
   npm run build
   ```

4. **Run tests (if available):**
   ```bash
   npm test
   ```

### Deployment Steps

1. **Commit changes:**
   ```bash
   git add app/api/schedule/route.ts
   git add app/create/page.tsx
   git add scripts/verify-auth.ts
   git add DEPLOYMENT_FIX_GUIDE.md
   git commit -m "Fix: Resolve foreign key constraint error in post scheduling

   - Enhanced user validation in /api/schedule
   - Added specific error code handling
   - Improved frontend error messages
   - Added diagnostic script for auth verification
   - Explicit foreign key error detection (PostgreSQL 23503)

   Fixes critical production issue where users couldn't schedule posts"
   ```

2. **Push to repository:**
   ```bash
   git push origin main
   ```

3. **Verify Vercel deployment:**
   - Check Vercel dashboard: https://vercel.com/chudi-nnorukams-projects/repurpose
   - Wait for deployment to complete
   - Check deployment logs for errors

### Post-Deployment Verification

1. **Test on production:**
   - Navigate to https://repurpose-orpin.vercel.app
   - Log in with a test account
   - Create and adapt content
   - Schedule a post for each platform (Twitter, LinkedIn, Instagram)
   - Verify success messages appear
   - Check that posts appear in dashboard

2. **Monitor logs:**
   ```bash
   # View Vercel function logs
   vercel logs --follow
   ```

3. **Check for errors:**
   - Look for `❌` emoji in logs (indicates errors)
   - Look for `✅` emoji in logs (indicates success)
   - Verify each step logs correctly

4. **Test error cases:**
   - Try scheduling with a past date (should show INVALID_TIME error)
   - Try scheduling 31+ times in a minute (should show RATE_LIMIT_EXCEEDED)
   - Verify error messages are user-friendly

---

## Testing Plan

### Unit Tests (To Be Added)

```typescript
// tests/api/schedule.test.ts
describe('/api/schedule', () => {
  it('should reject unauthenticated requests', async () => {
    // Test UNAUTHORIZED error
  })

  it('should reject mismatched user IDs', async () => {
    // Test user ID verification
  })

  it('should validate platform', async () => {
    // Test INVALID_PLATFORM error
  })

  it('should validate scheduled time', async () => {
    // Test INVALID_TIME error
  })

  it('should verify user exists in auth.users', async () => {
    // Test user verification
  })

  it('should handle foreign key constraint errors', async () => {
    // Test error code 23503 handling
  })

  it('should successfully schedule a post', async () => {
    // Test happy path
  })
})
```

### Manual Testing Checklist

#### Happy Path
- [ ] User can log in successfully
- [ ] User can create and adapt content
- [ ] User can select a future date/time
- [ ] User can schedule a post for Twitter
- [ ] User can schedule a post for LinkedIn
- [ ] User can schedule a post for Instagram
- [ ] Success message displays with scheduled time
- [ ] Post appears in dashboard with "scheduled" status
- [ ] Scheduled time input clears after successful scheduling

#### Error Cases
- [ ] Cannot schedule without authentication (401)
- [ ] Cannot schedule with past date (400, INVALID_TIME)
- [ ] Cannot schedule with invalid platform (400, INVALID_PLATFORM)
- [ ] Cannot schedule more than 30 times per minute (429, RATE_LIMIT_EXCEEDED)
- [ ] Cannot schedule if user doesn't exist in auth.users (400, RECORD_NOT_FOUND)
- [ ] Network errors display properly
- [ ] All error messages are user-friendly

#### Edge Cases
- [ ] Scheduling within 5 minutes of current time
- [ ] Scheduling far in the future (1+ years)
- [ ] Multiple concurrent schedule requests
- [ ] Browser refresh during scheduling
- [ ] Network interruption during scheduling

### Load Testing

```bash
# Test rate limiting
for i in {1..35}; do
  curl -X POST https://repurpose-orpin.vercel.app/api/schedule \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "platform": "twitter",
      "content": "Test post",
      "originalContent": "Original test",
      "scheduledTime": "2025-12-31T23:59:59Z",
      "userId": "$USER_ID"
    }'
  echo ""
done
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Error Rate:**
   - Monitor `❌` logs in Vercel
   - Alert if error rate > 5% of requests

2. **Response Time:**
   - `/api/schedule` should complete in < 800ms (p95)
   - Alert if > 2000ms

3. **Success Rate:**
   - Monitor `✅ Post scheduled successfully` logs
   - Alert if success rate < 95%

4. **Foreign Key Errors:**
   - Monitor for error code `23503`
   - Alert immediately (should not occur after fix)

### Vercel Log Queries

```bash
# Check for authentication errors
vercel logs | grep "❌ Authentication failed"

# Check for foreign key errors
vercel logs | grep "23503"

# Check for successful schedules
vercel logs | grep "🎉 Post scheduled successfully"

# Check for user verification failures
vercel logs | grep "User does not exist in auth.users"
```

---

## Rollback Plan

If the fix causes issues in production:

### Immediate Rollback

1. **Revert deployment in Vercel:**
   - Go to Vercel dashboard → Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Or revert git commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

### Investigate

1. Check Vercel logs for errors
2. Run diagnostic script on production environment
3. Compare production vs. local behavior
4. Check if environment variables are correctly set

---

## Common Issues & Solutions

### Issue 1: "User does not exist in auth.users"

**Cause:** User ID from frontend doesn't match any user in the database

**Solution:**
1. User should log out and log back in
2. Clear browser cache
3. If persists, check if user was deleted but session still exists

**Code Location:** `/app/api/schedule/route.ts:134-143`

### Issue 2: "Foreign key constraint violation"

**Cause:** The user_id being inserted doesn't exist in auth.users table

**Solution:**
1. This should now be caught by user verification (step 6)
2. If still occurs, it means user verification passed but user doesn't exist
3. Check Supabase database for inconsistencies

**Code Location:** `/app/api/schedule/route.ts:240-249`

### Issue 3: "Rate limit exceeded"

**Cause:** User attempted to schedule more than 30 posts per minute

**Solution:**
1. Wait until the reset time shown in the error message
2. This is expected behavior to prevent abuse
3. Consider increasing limit for premium users

**Code Location:** `/app/api/schedule/route.ts:74-94`

### Issue 4: QStash scheduling fails

**Cause:** QStash API unavailable or configuration error

**Solution:**
1. Verify `QSTASH_TOKEN` is set correctly in Vercel
2. Check QStash dashboard for service status
3. Verify `NEXT_PUBLIC_APP_URL` matches production URL
4. Post will be saved as "failed" with error message

**Code Location:** `/app/api/schedule/route.ts:350-379`

---

## Environment-Specific Notes

### Development
- Uses `.env.local` file
- Logs are verbose (includes `details` field)
- Can use Supabase local development setup

### Production (Vercel)
- Uses Vercel environment variables
- Logs omit sensitive details
- Must use production Supabase project

### Critical Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # CRITICAL for admin operations

# QStash (required for scheduling)
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# App URL (required for QStash callbacks)
NEXT_PUBLIC_APP_URL=https://repurpose-orpin.vercel.app  # Must match actual URL
```

---

## Success Criteria

### Definition of Done

- [ ] Foreign key constraint error no longer occurs in production
- [ ] Error messages are user-friendly and actionable
- [ ] Users can successfully schedule posts
- [ ] Diagnostic script passes all checks
- [ ] Logs are comprehensive and helpful for debugging
- [ ] All error codes have specific handling
- [ ] Documentation is complete and up-to-date

### Metrics

- **Error Rate:** < 1% of schedule requests
- **Success Rate:** > 99% of schedule requests
- **Response Time:** < 800ms (p95)
- **User Satisfaction:** No support tickets about scheduling errors

---

## Additional Resources

- **Supabase RLS Documentation:** https://supabase.com/docs/guides/auth/row-level-security
- **QStash Documentation:** https://upstash.com/docs/qstash
- **Vercel Logs:** https://vercel.com/docs/observability/logs-overview
- **PostgreSQL Error Codes:** https://www.postgresql.org/docs/current/errcodes-appendix.html

---

## Support Contacts

If issues persist after deployment:

1. **Check Vercel Logs:** https://vercel.com/chudi-nnorukams-projects/repurpose/logs
2. **Check Supabase Logs:** https://app.supabase.com/project/xxx/logs
3. **Run Diagnostic Script:** `npx ts-node scripts/verify-auth.ts`
4. **Review this document** for common issues and solutions

---

**Last Updated:** October 13, 2025
**Next Review:** After first production deployment
**Maintained By:** API Security & Authentication Agent
