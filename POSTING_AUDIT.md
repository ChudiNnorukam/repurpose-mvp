# Auto-Posting Infrastructure Audit

## Overview
Comprehensive audit of the Twitter and LinkedIn auto-posting functionality.

---

## ✅ Architecture Overview

### Flow Diagram
```
User creates post → /api/schedule → Supabase DB → QStash schedules job
                                                        ↓
                    ← /api/post/execute ← QStash triggers at scheduled time
                             ↓
                    Check tokens → Refresh if needed → Post to platform → Update DB
```

---

## 1. Scheduling Flow (`/api/schedule`)

### ✅ What Works Well
- **Rate limiting**: 30 requests/minute per user (prevents abuse)
- **User verification**: Checks auth.users table before proceeding
- **Validation**: Ensures scheduled time is in future (with 5min grace period)
- **Database insertion**: Creates post record with proper RLS
- **QStash integration**: Schedules delayed job with proper callback URL
- **Error handling**: Marks post as "failed" if QStash scheduling fails
- **Logging**: Comprehensive console logs for debugging

### ⚠️ Potential Issues

1. **Missing `qstash_message_id` in DB**
   - **Problem**: Schedule route doesn't save QStash message ID to database
   - **Impact**: Can't cancel/reschedule posts later (needed for edit feature)
   - **Fix**: Line 136 returns `qstashMessageId` but doesn't UPDATE posts table

2. **No tone tracking**
   - Migration added `tone` column but schedule route doesn't save it
   - Should pass tone from Create page to API

3. **Timezone confusion**
   - Frontend sends datetime-local (local time)
   - Backend converts to ISO (UTC)
   - Potential for user confusion if not handled properly

### 🔧 Recommended Fixes

```typescript
// app/api/schedule/route.ts - After line 126
const { error: updateError } = await supabaseClient
  .from("posts")
  .update({ qstash_message_id: messageId })
  .eq("id", post.id)

if (updateError) {
  console.warn('Failed to save QStash message ID:', updateError)
}
```

---

## 2. Execution Flow (`/api/post/execute`)

### ✅ What Works Well
- **QStash signature verification**: Prevents unauthorized execution
- **Duplicate prevention**: Checks if already posted
- **Token refresh**: Automatically refreshes expired tokens
- **Error handling**: Marks posts as failed with descriptive errors
- **Platform-specific logic**: Properly routes to Twitter/LinkedIn APIs
- **Database updates**: Tracks posted_at and error_message

### ⚠️ Potential Issues

1. **Instagram not implemented**
   - Currently just logs warning and marks as failed
   - Should not allow Instagram scheduling in UI

2. **Token refresh failures**
   - If refresh fails, returns existing (potentially expired) token
   - Better to throw error and require re-authentication

3. **No retry mechanism**
   - If posting fails due to transient error (network, rate limit), no automatic retry
   - User must manually retry from UI

4. **Missing analytics tracking**
   - Successful posts don't create post_analytics record
   - Can't track performance later

### 🔧 Recommended Fixes

```typescript
// lib/social-media/refresh.ts - Line 66
if (!res.ok) {
  const errorText = await res.text()
  logger.error('Token refresh failed', { platform, error: errorText })
  // Instead of returning old token, throw error
  throw new Error(`Token expired. Please reconnect your ${platform} account.`)
}

// app/api/post/execute/route.ts - After line 132
// Add analytics initialization
if (postSuccess) {
  await supabase.from('post_analytics').insert({
    post_id: postId,
    user_id: userId,
    platform,
    impressions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    engagement_rate: 0.00
  })
}
```

---

## 3. Twitter Integration

### ✅ What Works Well
- **OAuth 2.0 with PKCE**: Secure authorization flow
- **Token refresh**: Properly implemented with new refresh token rotation
- **API v2**: Uses latest Twitter API
- **Scopes**: Correct permissions (tweet.read, tweet.write, offline.access)

### ⚠️ Potential Issues

1. **Character limit not enforced**
   - Twitter has 280 char limit
   - Should validate before scheduling

2. **Thread support missing**
   - If content > 280 chars, should split into thread
   - Currently just fails

3. **Media attachments not supported**
   - Can't post images/videos yet

### 📋 Testing Checklist

- [ ] Connect Twitter account from /connections
- [ ] Verify tokens stored in social_accounts table
- [ ] Schedule a post for 2 minutes in future
- [ ] Check QStash dashboard for scheduled job
- [ ] Wait for execution and verify post appears on Twitter
- [ ] Check post status updates to "posted"
- [ ] Test with 300+ char content (should fail gracefully)
- [ ] Disconnect and reconnect account
- [ ] Test token refresh after expiry

---

## 4. LinkedIn Integration

### ✅ What Works Well
- **OAuth 2.0**: Standard authorization flow
- **UGC Posts API**: Uses correct v2 API endpoint
- **User info**: Properly fetches and caches author URN
- **Visibility**: Posts are public by default

### ⚠️ Potential Issues

1. **No refresh token**
   - LinkedIn OAuth doesn't return refresh token by default
   - Need `r_liteprofile` scope for longer-lived access
   - Tokens expire after 60 days

2. **API version outdated**
   - Using UGC Posts API (v2)
   - LinkedIn recommends Posts API (v3) for new integrations
   - v2 still works but may be deprecated

3. **No media support**
   - Can't post images/articles yet
   - Need to implement media upload flow

4. **Rate limits unknown**
   - LinkedIn doesn't publish clear rate limits
   - Could hit limits without warning

### 🔧 Recommended Fixes

```typescript
// lib/linkedin.ts - Update auth URL (line 10)
authUrl.searchParams.append('scope', 'openid profile email w_member_social r_liteprofile')

// This might enable refresh tokens (need to test)
```

### 📋 Testing Checklist

- [ ] Connect LinkedIn account from /connections
- [ ] Verify tokens stored in social_accounts table
- [ ] Schedule a post for 2 minutes in future
- [ ] Wait for execution and verify post appears on LinkedIn feed
- [ ] Check post status updates to "posted"
- [ ] Test with very long content (3000+ chars)
- [ ] Test special characters and emojis
- [ ] Test with URLs (should auto-preview)
- [ ] Wait 60+ days and test token expiry (manual intervention needed)

---

## 5. QStash Configuration

### ✅ What Works Well
- **Delay scheduling**: Properly calculates delay in seconds
- **Signature verification**: Uses Upstash's verification middleware
- **JSON payloads**: Clean data structure
- **Callback URL**: Correctly formed with base URL

### ⚠️ Potential Issues

1. **Environment variable dependency**
   - Requires `NEXT_PUBLIC_APP_URL` to be set correctly
   - In development: http://localhost:3001
   - In production: https://repurpose-orpin.vercel.app
   - If misconfigured, QStash can't reach callback

2. **No retry configuration**
   - QStash default is 3 retries
   - Could customize for critical posts

3. **Max delay limit**
   - QStash has max delay (need to verify limit)
   - Scheduling far in future might fail

### 🔧 Verification Steps

```bash
# Check QStash dashboard
open "https://console.upstash.com/qstash"

# Verify environment variables
echo $NEXT_PUBLIC_APP_URL
echo $QSTASH_TOKEN

# Test QStash connectivity
curl -X POST https://qstash.upstash.io/v2/publish/https://repurpose-orpin.vercel.app/api/post/execute \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId":"test","platform":"twitter","content":"test","userId":"test"}'
```

---

## 6. Database Schema

### ✅ Tables Used
```sql
posts (
  id, user_id, platform, original_content, adapted_content,
  scheduled_time, status, posted_at, error_message,
  qstash_message_id, tone, is_draft, created_at, updated_at
)

social_accounts (
  id, user_id, platform, access_token, refresh_token,
  account_username, account_id, connected_at
)
```

### ⚠️ Missing Features

1. **No post history versioning**
   - Can't track edits to scheduled posts
   - Should use `parent_post_id` column

2. **No platform_post_id**
   - After posting, don't save Twitter/LinkedIn post ID
   - Can't link back to actual post
   - Can't fetch analytics later

### 🔧 Recommended Schema Changes

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_post_id TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform_post_url TEXT;

-- Save these after successful posting
UPDATE posts SET
  platform_post_id = '123456789',
  platform_post_url = 'https://twitter.com/user/status/123456789'
WHERE id = $postId;
```

---

## 7. Error Handling & Logging

### ✅ Current Logging
- Console logs in all API routes
- Logger utility with structured logging
- Error messages saved to database

### ⚠️ Gaps

1. **No centralized error tracking**
   - Should integrate Sentry or similar
   - Hard to debug production issues

2. **No notification system**
   - Users don't know when posts fail
   - Should send email/in-app notification

3. **Logs not persisted**
   - Vercel logs rotate quickly
   - Need long-term log storage

### 🔧 Recommended Additions

```typescript
// lib/sentry.ts (optional)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})

// Use in API routes
try {
  // ... posting logic
} catch (error) {
  Sentry.captureException(error, {
    contexts: {
      post: { id: postId, platform },
    },
  })
  throw error
}
```

---

## 8. Testing Strategy

### Manual Testing Script

1. **Setup** (one-time)
   - [ ] Verify env vars: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
   - [ ] Verify env vars: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
   - [ ] Verify env vars: `QSTASH_TOKEN`, `NEXT_PUBLIC_APP_URL`
   - [ ] Connect Twitter account
   - [ ] Connect LinkedIn account

2. **Twitter Flow**
   ```bash
   # Schedule a test post for 2 minutes from now
   curl -X POST http://localhost:3001/api/schedule \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "twitter",
       "content": "Test post from Repurpose AI",
       "originalContent": "Original test",
       "scheduledTime": "2025-10-05T20:30:00.000Z",
       "userId": "YOUR_USER_ID"
     }'

   # Check database
   # SELECT * FROM posts WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 1;

   # Wait 2 minutes and check Twitter feed
   # Verify post status changed to "posted"
   ```

3. **LinkedIn Flow** (same as above, change platform to "linkedin")

4. **Edge Cases**
   - [ ] Schedule post in past (should fail)
   - [ ] Schedule without connected account (should fail)
   - [ ] Schedule with expired token (should refresh)
   - [ ] Post with special characters: `@#$%^&*()[]{}|\`
   - [ ] Post with emojis: 🚀✨🎉
   - [ ] Post with URLs
   - [ ] Post with 280+ chars (Twitter should fail)
   - [ ] Post with 3000+ chars (LinkedIn should work)

### Automated Testing

```typescript
// tests/posting.test.ts
describe('Auto-posting flow', () => {
  it('should schedule a Twitter post', async () => {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      body: JSON.stringify({
        platform: 'twitter',
        content: 'Test',
        scheduledTime: new Date(Date.now() + 120000).toISOString(),
        userId: testUserId
      })
    })
    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.qstashMessageId).toBeDefined()
  })
})
```

---

## 9. Known Issues & Workarounds

| Issue | Impact | Workaround | Priority |
|-------|--------|------------|----------|
| QStash message ID not saved | Can't cancel/edit posts | Manual DB update | **HIGH** |
| LinkedIn token expires after 60 days | Users need to reconnect | Email notification | **MEDIUM** |
| No thread support for Twitter | Long posts fail | Warn user in UI | **MEDIUM** |
| No media attachments | Can't post images | Phase 2 feature | **LOW** |
| No analytics tracking | Can't measure performance | Phase 2 feature | **LOW** |
| Instagram not implemented | UI allows selection but fails | Disable in UI | **HIGH** |

---

## 10. Production Readiness Checklist

### Before Launch
- [ ] Fix QStash message ID saving
- [ ] Disable Instagram in UI (until implemented)
- [ ] Add character limit validation for Twitter
- [ ] Add notification system for failed posts
- [ ] Test token refresh flow thoroughly
- [ ] Set up error monitoring (Sentry)
- [ ] Document rate limits for users
- [ ] Create user-facing troubleshooting guide

### Nice to Have
- [ ] Implement automatic retries for transient failures
- [ ] Add preview before posting
- [ ] Support for Twitter threads
- [ ] Support for LinkedIn articles
- [ ] Media upload support
- [ ] Analytics fetching cron job
- [ ] Webhook for real-time post status updates

---

## 11. Debugging Tools

### View QStash Queue
```bash
# List all scheduled messages
curl -X GET https://qstash.upstash.io/v2/messages \
  -H "Authorization: Bearer $QSTASH_TOKEN"
```

### Manual Post Execution (bypass QStash)
```bash
# Directly call /api/post/execute for testing
curl -X POST http://localhost:3001/api/post/execute \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "YOUR_POST_ID",
    "platform": "twitter",
    "content": "Test",
    "userId": "YOUR_USER_ID"
  }'
```

### Check Token Status
```sql
-- See all connected accounts and token ages
SELECT
  platform,
  account_username,
  connected_at,
  CASE
    WHEN refresh_token IS NOT NULL THEN 'Has refresh token'
    ELSE 'No refresh token'
  END as refresh_status,
  DATE_PART('day', NOW() - connected_at::timestamp) as days_since_connected
FROM social_accounts
WHERE user_id = 'YOUR_USER_ID';
```

---

## Summary

**Overall Assessment**: 🟢 **GOOD** - Core functionality is solid

**Strengths**:
- Secure OAuth flows with PKCE
- Proper token refresh for Twitter
- QStash integration working
- Good error handling and logging

**Critical Fixes Needed**:
1. Save QStash message ID to enable edit/cancel
2. Disable Instagram until implemented
3. Add Twitter character limit validation

**Recommended Enhancements**:
1. Better token expiry handling
2. User notifications for failures
3. Analytics tracking
4. Media upload support (Phase 2)

**Next Steps**: Create debugging API endpoint and test posting flow end-to-end.
