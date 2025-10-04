# Repurpose MVP - Autoposting Feature Audit

## Problem Statement
The autoposting/scheduling feature is not working on production (https://repurpose-orpin.vercel.app). When users try to schedule posts to Twitter/LinkedIn, nothing happens or errors occur silently.

## Current Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.4 with App Router, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Job Scheduler**: Upstash QStash for delayed job execution
- **Hosting**: Vercel
- **OAuth**: Twitter OAuth 2.0, LinkedIn OAuth 2.0

### Data Flow
1. User logs in via Supabase Auth
2. User connects social accounts (Twitter/LinkedIn) via OAuth - tokens stored in `social_accounts` table
3. User generates content via OpenAI API (`/api/adapt`)
4. User schedules post via `/api/schedule`
5. Schedule API saves post to `posts` table with status 'scheduled'
6. Schedule API creates QStash job with delay
7. QStash calls `/api/post/execute` at scheduled time
8. Execute API posts to social media platform using stored OAuth tokens
9. Execute API updates post status to 'posted' or 'failed'

## Current Issues Identified

### 1. **Foreign Key Constraint Error**
- **Error**: `insert or update on table "posts" violates foreign key constraint "posts_user_id_fkey"`
- **Location**: `/app/api/schedule/route.ts` line 64-75
- **Cause**: User ID sent from frontend may not exist in `auth.users` table
- **Impact**: Posts cannot be inserted into database

### 2. **Datetime-local Timezone Bug**
- **Error**: Users cannot select times within next 7 hours
- **Location**: `/app/create/page.tsx` line 336
- **Cause**: `min` attribute uses UTC time but datetime-local expects local time
- **Status**: Fixed in latest commit (c62ae1b) but may not be deployed correctly

### 3. **Generic Error Messages**
- **Issue**: Frontend shows generic "Failed to schedule post" without details
- **Location**: Multiple API routes return generic errors
- **Impact**: Impossible to debug issues from user perspective

### 4. **QStash Configuration Unknown**
- **Unknown**: Whether QStash environment variables are correctly set on production
- **Variables Required**:
  - `QSTASH_TOKEN`
  - `QSTASH_CURRENT_SIGNING_KEY`
  - `QSTASH_NEXT_SIGNING_KEY`
  - `NEXT_PUBLIC_APP_URL`
- **Impact**: Jobs may be scheduled but never execute

### 5. **OAuth Token Validity**
- **Unknown**: Whether stored OAuth tokens are still valid
- **Issue**: Tokens may have expired, causing posting to fail
- **Impact**: Even if scheduling works, actual posting will fail

### 6. **Supabase RLS Policies**
- **Issue**: RLS policies require `auth.uid()` but API uses service role
- **Location**: `supabase-schema.sql` lines 63-82
- **Potential Issue**: Service role should bypass RLS, but configuration may be incorrect

## File Structure

### Key Files

#### API Routes
- `/app/api/schedule/route.ts` - Schedules posts and creates QStash jobs
- `/app/api/post/execute/route.ts` - Executes scheduled posts (called by QStash)
- `/app/api/post/retry/route.ts` - Retries failed posts
- `/app/api/adapt/route.ts` - Generates adapted content via OpenAI

#### Frontend Pages
- `/app/create/page.tsx` - Content creation and scheduling interface
- `/app/dashboard/page.tsx` - View scheduled/posted content
- `/app/posts/page.tsx` - Manage posts

#### Libraries
- `/lib/supabase.ts` - Supabase client and admin setup
- `/lib/qstash.ts` - QStash client wrapper
- `/lib/social-media/twitter.ts` - Twitter API integration
- `/lib/social-media/linkedin.ts` - LinkedIn API integration

#### Database
- `/supabase-schema.sql` - Database schema with RLS policies
- `/supabase/migrations/004_content_templates.sql` - Content templates migration

## Environment Variables

### Required for Production
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://qdmmztwgfqvajhrnikho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]

# QStash
QSTASH_TOKEN=[token]
QSTASH_CURRENT_SIGNING_KEY=[current key]
QSTASH_NEXT_SIGNING_KEY=[next key]

# App
NEXT_PUBLIC_APP_URL=https://repurpose-orpin.vercel.app

# OAuth
TWITTER_CLIENT_ID=[client id]
TWITTER_CLIENT_SECRET=[client secret]
LINKEDIN_CLIENT_ID=[client id]
LINKEDIN_CLIENT_SECRET=[client secret]

# OpenAI
OPENAI_API_KEY=[api key]
```

## Database Schema

### posts table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  original_content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
  adapted_content TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### social_accounts table
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  account_username TEXT NOT NULL,
  account_id TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);
```

## Recent Changes (Last 3 Hours)

### Commit c62ae1b - "Fix datetime-local min attribute timezone bug"
- Fixed timezone conversion for datetime-local input
- Changed from `new Date().toISOString().slice(0, 16)` to local time formatting

### Commit 19a5061 - "Add detailed error logging to schedule endpoint"
- Added comprehensive error logging for database insert errors
- Return specific error messages instead of generic "Failed to schedule post"

### Commit d777f58 - Earlier fixes
- QStash error handling improvements
- Timezone validation with 5-minute grace period

## Testing Results

### Localhost
- ✅ QStash scheduling works
- ✅ Jobs execute successfully
- ✅ Posts are marked as 'posted'

### Production
- ❌ Foreign key constraint error when scheduling
- ❌ User reports "nothing happened"
- ❌ No posts appearing in dashboard after scheduling attempt

## Questions to Answer

1. **User Authentication**: Is the logged-in user's ID actually in the `auth.users` table on production Supabase?
2. **Environment Variables**: Are ALL required env vars set on Vercel production (not preview)?
3. **QStash Endpoint**: Can QStash reach `https://repurpose-orpin.vercel.app/api/post/execute`?
4. **OAuth Tokens**: Are the stored OAuth tokens still valid? Do they need refresh?
5. **Deployment**: Is auto-deployment from GitHub to Vercel configured? Latest code may not be deployed.
6. **RLS Bypass**: Is the service role key correctly bypassing RLS policies?
7. **Database State**: Are there any existing failed posts causing issues?

## Debugging Steps Needed

### Step 1: Verify User Exists
Check if logged-in user actually exists in `auth.users`:
```sql
SELECT id, email FROM auth.users WHERE email = '[user email]';
```

### Step 2: Verify Environment Variables
Check Vercel dashboard → Settings → Environment Variables → Production

### Step 3: Test API Endpoint Directly
```bash
curl -X POST https://repurpose-orpin.vercel.app/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "content": "Test",
    "originalContent": "Test",
    "scheduledTime": "2025-10-04T12:00:00.000Z",
    "userId": "[actual user id from database]"
  }'
```

### Step 4: Check OAuth Token Validity
Query social_accounts table and test if tokens work:
```sql
SELECT platform, account_username, connected_at FROM social_accounts WHERE user_id = '[user id]';
```

### Step 5: Verify QStash Configuration
Check QStash dashboard at https://console.upstash.com/qstash

### Step 6: Check Deployment Status
Verify latest commits are deployed:
```bash
vercel ls
```

## Proposed Solutions

### Option A: Complete Reset
1. Drop and recreate `posts` table
2. Clear all QStash jobs
3. Reconnect all social accounts
4. Redeploy with fresh environment variables
5. Test with single post scheduling

### Option B: Systematic Debug
1. Fix user authentication issue first
2. Verify all environment variables are set
3. Test scheduling with actual user ID
4. Monitor QStash execution
5. Fix any OAuth token refresh issues

### Option C: Simplify Architecture
1. Remove QStash, use Vercel Cron instead
2. Store posts with scheduled time
3. Cron job checks every minute for posts to publish
4. Simpler, more debuggable architecture

## Code Snippets for GPT Context

### Current Schedule API
```typescript
// /app/api/schedule/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { platform, content, originalContent, scheduledTime, userId } = body

  // Uses service role to bypass RLS
  const supabaseClient = getSupabaseAdmin()

  // Insert post
  const { data: post, error: insertError } = await supabaseClient
    .from('posts')
    .insert({
      user_id: userId,
      platform: platform,
      original_content: originalContent || content,
      adapted_content: content,
      scheduled_time: scheduledTime,
      status: 'scheduled',
    })
    .select()
    .single()

  // Schedule QStash job
  const messageId = await schedulePostJob({
    postId: post.id,
    platform,
    content,
    userId
  }, scheduledDate)
}
```

### Current QStash Client
```typescript
// /lib/qstash.ts
export async function schedulePostJob(jobData, scheduledTime) {
  const delay = Math.floor((scheduledTime.getTime() - Date.now()) / 1000)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const callbackUrl = `${baseUrl}/api/post/execute`

  const response = await qstash.publishJSON({
    url: callbackUrl,
    body: jobData,
    delay: delay,
  })

  return response.messageId
}
```

### Current Execute API
```typescript
// /app/api/post/execute/route.ts
export async function POST(request: NextRequest) {
  const { postId, platform, content, userId } = await request.json()

  // Get OAuth tokens
  const { data: account } = await supabase
    .from('social_accounts')
    .select('access_token, refresh_token')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  // Post to social media
  if (platform === 'twitter') {
    await postToTwitter(content, account.access_token)
  } else if (platform === 'linkedin') {
    await postToLinkedIn(content, account.access_token)
  }

  // Update post status
  await supabase
    .from('posts')
    .update({ status: 'posted', posted_at: new Date() })
    .eq('id', postId)
}
```

## What GPT Should Provide

Please create a detailed, step-by-step implementation plan that:

1. **Diagnoses the root cause** of the scheduling failure
2. **Provides exact commands** to verify each component (database, env vars, OAuth, QStash)
3. **Gives specific code changes** needed to fix the issues
4. **Includes testing steps** to verify each fix
5. **Provides rollback plan** if something goes wrong
6. **Considers both quick fixes and long-term architecture improvements**

The plan should be detailed enough that a developer can copy-paste commands and code snippets without having to figure out implementation details.

## Additional Context

- User is logged into production site
- User has connected Twitter and LinkedIn accounts (OAuth completed successfully)
- User can generate content successfully (OpenAI API works)
- Scheduling worked on localhost in testing
- Production deployment is on Vercel
- Database is hosted on Supabase (project ID: qdmmztwgfqvajhrnikho)
- No error messages visible to user when scheduling fails
- Browser console shows extension error (unrelated): "Unchecked runtime.lastError: The message port closed before a response was received"

## Success Criteria

The autoposting feature will be considered working when:
1. User can schedule a post for a future time
2. Post appears in dashboard with 'scheduled' status
3. Post is automatically published to social media at scheduled time
4. Post status updates to 'posted' with timestamp
5. Any errors are clearly visible to user with actionable messages
