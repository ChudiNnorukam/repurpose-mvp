# Example: Post Scheduling with QStash

## Overview

**Feature**: Schedule social media posts for future execution using QStash delayed jobs  
**Pattern**: API Route → QStash → Callback Handler → Platform API  
**Time**: 30 minutes  
**Complexity**: Medium

## User Request

> "Allow users to schedule posts for specific times instead of posting immediately"

## Architecture

```
User schedules post
    ↓
POST /api/schedule
├── Validate auth + input
├── Insert post to DB (status: scheduled)
├── Schedule QStash delayed job
└── Return success
    ↓
[Wait until scheduled time]
    ↓
QStash → POST /api/post/execute
├── Verify signature
├── Get post from DB
├── Refresh OAuth tokens (if needed)
├── Post to platform
└── Update status (posted/failed)
```

## Implementation

### 1. Scheduling Endpoint

**File**: `app/api/schedule/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse input
    const { platform, content, scheduledTime } = await request.json()

    // 3. Validate scheduled time is in future
    const scheduledDate = new Date(scheduledTime)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // 4. Insert post to database
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        platform,
        adapted_content: content,
        scheduled_time: scheduledTime,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // 5. Calculate delay in seconds
    const delay = Math.floor((scheduledDate.getTime() - Date.now()) / 1000)

    // 6. Schedule QStash job
    const { messageId } = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`,
      body: {
        postId: post.id,
        userId: user.id,
        platform
      },
      delay // seconds until execution
    })

    // 7. Store QStash message ID
    await supabase
      .from('posts')
      .update({ qstash_message_id: messageId })
      .eq('id', post.id)

    return NextResponse.json({
      success: true,
      postId: post.id,
      scheduledTime,
      messageId
    })
  } catch (error: any) {
    console.error('Scheduling error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
```

### 2. Execution Handler (QStash Callback)

**File**: `app/api/post/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Client } from '@upstash/qstash'
import { postToTwitter } from '@/lib/twitter'
import { postToLinkedIn } from '@/lib/linkedin'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

export async function POST(request: NextRequest) {
  try {
    // 1. Verify QStash signature
    const body = await request.text()
    const signature = request.headers.get('upstash-signature')

    const isValid = await qstash.verify({
      signature: signature!,
      body
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Parse payload
    const { postId, userId, platform } = JSON.parse(body)

    // 3. Get post from database
    const supabase = await createClient()
    const { data: post } = await supabase
      .from('posts')
      .select('*, social_accounts(*)')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 4. Get social account credentials
    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single()

    if (!account) {
      await supabase
        .from('posts')
        .update({
          status: 'failed',
          error_message: 'No connected account'
        })
        .eq('id', postId)
      
      return NextResponse.json({ error: 'No account connected' }, { status: 400 })
    }

    // 5. Refresh OAuth tokens if needed
    if (new Date(account.expires_at) < new Date()) {
      // Token expired, refresh it
      const refreshedTokens = await refreshToken(platform, account.refresh_token)
      
      await supabase
        .from('social_accounts')
        .update({
          access_token: refreshedTokens.access_token,
          expires_at: new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString()
        })
        .eq('id', account.id)
      
      account.access_token = refreshedTokens.access_token
    }

    // 6. Post to platform
    let platformPostId
    
    if (platform === 'twitter') {
      const result = await postToTwitter(post.adapted_content, account.access_token)
      platformPostId = result.data.id
    } else if (platform === 'linkedin') {
      const result = await postToLinkedIn(post.adapted_content, account.access_token, account.account_id)
      platformPostId = result.id
    }

    // 7. Update post status
    await supabase
      .from('posts')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
        platform_post_id: platformPostId
      })
      .eq('id', postId)

    return NextResponse.json({
      success: true,
      postId,
      platformPostId
    })
  } catch (error: any) {
    console.error('Execution error:', error)

    // Mark post as failed
    const supabase = await createClient()
    await supabase
      .from('posts')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', postId)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### 3. Helper: OAuth Token Refresh

**File**: `lib/social-media/refresh.ts`

```typescript
async function refreshToken(platform: string, refreshToken: string) {
  if (platform === 'twitter') {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    })

    return await response.json()
  }
  
  // Similar for LinkedIn...
}
```

## Key Patterns

### 1. Delay Calculation
```typescript
const scheduledDate = new Date(scheduledTime)
const now = new Date()
const delayInSeconds = Math.floor((scheduledDate.getTime() - now.getTime()) / 1000)
```

### 2. QStash Job Scheduling
```typescript
const { messageId } = await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`,
  body: { postId, userId, platform },
  delay: delayInSeconds
})
```

### 3. Signature Verification
```typescript
const isValid = await qstash.verify({
  signature: request.headers.get('upstash-signature')!,
  body: await request.text()
})

if (!isValid) return NextResponse.json({ error: 'Invalid' }, { status: 401 })
```

### 4. Token Refresh Logic
```typescript
if (new Date(account.expires_at) < new Date()) {
  const refreshed = await refreshToken(platform, account.refresh_token)
  // Update database with new tokens
}
```

## Testing

```typescript
// tests/scheduling.spec.ts
test('schedule post for future time', async ({ page }) => {
  // Schedule 1 hour from now
  const scheduledTime = new Date(Date.now() + 60 * 60 * 1000)
  
  await page.goto('/create')
  await page.fill('textarea', 'Test scheduled post')
  await page.fill('input[type=datetime-local]', scheduledTime.toISOString().slice(0, 16))
  await page.click('button:has-text("Schedule")')

  await expect(page.locator('text=Post scheduled')).toBeVisible()
  
  // Verify in database
  const post = await getPostFromDB()
  expect(post.status).toBe('scheduled')
  expect(post.qstash_message_id).toBeTruthy()
})
```

## Common Issues & Solutions

### Issue 1: QStash jobs not executing

**Symptom**: Post stays in "scheduled" status past scheduled time

**Diagnosis**:
```bash
# Check QStash dashboard
https://console.upstash.com/qstash

# Verify callback URL is accessible
curl -X POST https://your-app.vercel.app/api/post/execute
```

**Solutions**:
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check QStash signing keys are set
- Ensure `/api/post/execute` is not blocked by middleware
- Increase Vercel function timeout (30s minimum)

### Issue 2: Token refresh fails

**Symptom**: Posts fail with "Unauthorized" after token expiration

**Solution**:
```typescript
// Always check token expiration BEFORE posting
if (new Date(account.expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
  // Refresh if expires in < 5 minutes
  await refreshToken()
}
```

## Performance

- **Scheduling latency**: < 500ms (database + QStash)
- **Execution latency**: 2-5s (token refresh + platform API)
- **Reliability**: 99.9% (QStash SLA)
- **Max delay**: 7 days (QStash limit)

## Related Files

- `app/api/schedule/route.ts:9-198`
- `app/api/post/execute/route.ts`
- `lib/qstash.ts:31-70`
- `lib/social-media/refresh.ts`
