---
name: Repurpose AI App Developer
version: 1.0.0
created: 2025-10-19
updated: 2025-10-19
status: available
tier: 1
domain: Feature Development & Integration
keywords: [implement, add, build, create, API, OAuth, Supabase, QStash, Stripe, n8n]
---

# Repurpose AI App Developer Skill

**Purpose:** Build production-ready Repurpose features integrating content repurposing, social media APIs, payments, AI generation, and workflow automation.

**Version:** 1.0.0
**Status:** Available
**Tier:** 1 - Foundation Domain

---

## 📋 Core Integration Patterns

### 1. Supabase (Database & Auth)

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only
SUPABASE_DATABASE_PASSWORD=xxxxx # Direct DB access
```

**Key Patterns:**
- User authentication with Supabase Auth
- Row-level security (RLS) policies for data isolation
- Real-time subscriptions for live updates
- Secure file storage for media

**RLS Security Checklist:**
- [ ] Enable RLS on all tables containing user data
- [ ] Test policies with `auth.uid()` matching
- [ ] Verify service role policies are restrictive
- [ ] Document RLS strategy per table

**Common Implementation:**
```typescript
// lib/supabase/server.ts - Server-side only
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// app/api/protected/route.ts - Validate user
const { data: { user } } = await supabase.auth.getUser()
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
```

---

### 2. OpenAI Integration

**Environment Variable:**
```bash
OPENAI_API_KEY=sk-proj-... # Server-side only
```

**Key Capabilities:**
- Content repurposing and summarization (GPT-4o)
- Social media caption generation
- Image generation (DALL-E)
- Token counting for cost estimation

**Security Requirements:**
- [ ] Store API key server-side only (never in .env.local client)
- [ ] Use API route `/api/adapt` for generation requests
- [ ] Implement rate limiting (5-10 req/min per user)
- [ ] Add input validation before API call
- [ ] Log API usage for billing accuracy

**Common Pattern:**
```typescript
// lib/openai/repurpose.ts - Server-side only
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function repurposeForTwitter(content: string) {
  // Always validate input
  if (!content || content.length === 0) {
    throw new Error('Content cannot be empty')
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a social media expert. Create engaging Twitter content."
      },
      {
        role: "user",
        content: `Convert to Twitter (max 280 chars per tweet):\n\n${content}`
      }
    ],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!)
}
```

---

### 3. Twitter Integration (OAuth 2.0 PKCE)

**Environment Variables:**
```bash
TWITTER_CLIENT_ID=xxxxx
TWITTER_CLIENT_SECRET=xxxxx # Server-side only
TWITTER_BEARER_TOKEN=xxxxx   # For app-only auth
```

**OAuth PKCE Flow (RFC 7636 Compliant):**
1. Generate code_challenge and state (client-side)
2. Redirect to Twitter auth endpoint
3. User authorizes, Twitter redirects with code
4. Exchange code + code_verifier for tokens (server-side)
5. Store tokens in `social_accounts` table with encryption

**Security Checklist:**
- [ ] Use PKCE flow (code_challenge_method=S256)
- [ ] Validate state parameter to prevent CSRF
- [ ] Encrypt tokens before storing (consider pgcrypto)
- [ ] Implement token refresh logic
- [ ] Set token expiration in database
- [ ] Validate scopes: tweet.read, tweet.write, offline.access

**Implementation Example:**
```typescript
// app/api/auth/twitter/route.ts
import { TwitterApi } from 'twitter-api-v2'

export async function GET(request: Request) {
  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  })

  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    {
      scope: [
        'tweet.read',
        'tweet.write',
        'users.read',
        'offline.access'
      ]
    }
  )

  // Store codeVerifier and state securely (session/DB)
  return Response.redirect(url)
}

// app/api/auth/twitter/callback/route.ts - Validate callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Validate state to prevent CSRF
  // Exchange code for tokens using stored codeVerifier
  // Store encrypted tokens in social_accounts table
}
```

---

### 4. LinkedIn Integration (OAuth 2.0)

**Environment Variables:**
```bash
LINKEDIN_CLIENT_ID=xxxxx
LINKEDIN_CLIENT_SECRET=xxxxx # Server-side only
LINKEDIN_OAUTH2_ACCESS_TOKEN=xxxxx
```

**Key Implementation:**
- OAuth 2.0 authorization code flow
- UGC API for user profile posts
- Rich media support (images, videos, documents)
- Scope: `openid profile email w_member_social`

**Security Checklist:**
- [ ] Use authorization code flow (not implicit)
- [ ] Validate state parameter
- [ ] Refresh tokens before expiration (check expires_at)
- [ ] Store encrypted tokens with user_id reference
- [ ] Implement API rate limiting (LinkedIn: 100 req/hour)

**LinkedIn UGC Post Pattern:**
```typescript
// lib/linkedin/post.ts
export async function postToLinkedIn(
  accessToken: string,
  userId: string,
  content: string
) {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`)
  }

  return await response.json()
}
```

---

### 5. Stripe Integration

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_... # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook verification
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Client-side safe
```

**Key Patterns:**
- Subscription billing
- One-time payments
- Webhook event handling
- Customer portal integration

**Security Checklist:**
- [ ] Never expose STRIPE_SECRET_KEY to client
- [ ] Verify webhook signatures before processing
- [ ] Use customer_reference_id to track users
- [ ] Implement idempotency for payment operations
- [ ] Log all payment events for audit trail

**Webhook Verification:**
```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Process webhook event
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful payment
      break
  }

  return Response.json({ received: true })
}
```

---

### 6. QStash Scheduled Jobs

**Environment Variables:**
```bash
QSTASH_URL=https://qstash.io # API endpoint
QSTASH_TOKEN=xxxxx # Authentication
QSTASH_CURRENT_SIGNING_KEY=xxxxx # Webhook signature (current)
QSTASH_NEXT_SIGNING_KEY=xxxxx # Webhook signature (next, for rotation)
```

**Key Limitations (Free Tier):**
- Max 3 retries per job
- 30-second execution timeout
- 100KB message size limit

**Common Patterns:**
- Schedule content posting at future times
- Delayed job processing (5s - 1 year)
- Cron jobs for recurring tasks

**Schedule Post Example:**
```typescript
// lib/qstash/schedule.ts
import { Client } from '@upstash/qstash'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
})

export async function schedulePost(
  jobId: string,
  scheduledAt: Date,
  maxRetries: number = 3 // Free tier limit
) {
  const delaySeconds = Math.floor((scheduledAt.getTime() - Date.now()) / 1000)

  if (delaySeconds < 0) {
    throw new Error('Cannot schedule in the past')
  }

  await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/process`,
    body: { jobId },
    delay: delaySeconds,
    retries: maxRetries,
  })
}

// Job processor with signature verification
import { verifySignature } from '@upstash/qstash/nextjs'

async function handler(request: Request) {
  const { jobId } = await request.json()

  // Fetch job and execute
  // Update job status in database

  return Response.json({ success: true })
}

export const POST = verifySignature(handler)
```

---

### 7. n8n Workflow Integration

**Environment Variables:**
```bash
N8N_API_KEY=xxxxx # For API authentication
N8N_INSTANCE_URL=https://n8n.example.com # Your instance
THESYS_API_KEY=xxxxx # Alternative workflow platform
```

**Common Patterns:**
- Trigger workflows from Repurpose
- Complex multi-step automation
- AI agent orchestration
- Webhook-based triggers

**Trigger Workflow:**
```typescript
// lib/n8n/trigger.ts
export async function triggerWorkflow(
  workflowId: string,
  data: Record<string, any>
) {
  const response = await fetch(
    `${process.env.N8N_INSTANCE_URL}/webhook/${workflowId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    throw new Error(`Workflow error: ${response.status}`)
  }

  return await response.json()
}
```

---

## 🏗️ Complete Feature Example: Content Repurposing

```typescript
// app/api/repurpose/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { repurposeForTwitter, repurposeForLinkedIn } from '@/lib/openai/repurpose'
import { schedulePost } from '@/lib/qstash/schedule'

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Validate input
  const { content, platforms, scheduledAt } = await request.json()

  if (!content || !platforms) {
    return Response.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // 3. Create job record (RLS protects user_id filtering)
  const { data: job, error: jobError } = await supabase
    .from('repurpose_jobs')
    .insert({
      user_id: user.id,
      source_content: content,
      target_platforms: platforms,
      status: 'processing',
      scheduled_at: scheduledAt,
    })
    .select()
    .single()

  if (jobError) {
    return Response.json({ error: 'Failed to create job' }, { status: 500 })
  }

  // 4. Generate AI content
  const generatedContent: any = {}

  try {
    if (platforms.includes('twitter')) {
      generatedContent.twitter = await repurposeForTwitter(content)
    }

    if (platforms.includes('linkedin')) {
      generatedContent.linkedin = await repurposeForLinkedIn(content)
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }

  // 5. Update job with generated content
  await supabase
    .from('repurpose_jobs')
    .update({
      ai_generated_content: generatedContent,
      status: 'ready',
    })
    .eq('id', job.id)

  // 6. Schedule posting if time provided
  if (scheduledAt) {
    try {
      await schedulePost(job.id, new Date(scheduledAt))
    } catch (error) {
      // Log error but don't fail entire request
      console.error('Failed to schedule post:', error)
    }
  }

  return Response.json({ job })
}
```

---

## 🔒 Security Best Practices

### Environment Variables
- **NEVER** commit `.env` files to git
- Use `.env.example` with placeholder values
- Rotate API keys regularly
- Different keys for dev/staging/production

### Secret Key Storage
- **Client-side safe:** NEXT_PUBLIC_* variables
- **Server-side only:** OpenAI, Stripe, QStash, social secrets
- **Database encryption:** Use pgcrypto for tokens
- **Never log:** Secrets in console or logs

### API Security
- Validate all user input before API calls
- Use API routes for sensitive operations
- Implement rate limiting (see Upstash Redis)
- Verify webhook signatures (Stripe, QStash)
- Add CORS headers if needed

### Database Security
- Enable RLS on all tables with user data
- Test RLS policies with different users
- Use service role only for admin operations
- Never expose service role key to client

### OAuth Security
- Use PKCE flow for public clients
- Validate state parameter for CSRF protection
- Encrypt tokens in database
- Implement token refresh before expiration
- Clear tokens on logout

---

## 🧪 Testing Patterns

### Unit Tests - API Routes
```typescript
// app/api/repurpose/__tests__/repurpose.test.ts
describe('POST /api/repurpose', () => {
  it('should repurpose content for Twitter', async () => {
    const response = await fetch('/api/repurpose', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Long article...',
        platforms: ['twitter'],
        scheduledAt: new Date(),
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.job).toBeDefined()
  })
})
```

### Integration Tests - OAuth Flow
```typescript
// __tests__/integration/oauth-twitter.test.ts
describe('Twitter OAuth Flow', () => {
  it('should complete OAuth 2.0 PKCE flow', async () => {
    // 1. Initiate auth
    const authResponse = await fetch('/api/auth/twitter')
    expect(authResponse.status).toBe(302)

    // 2. Simulate callback with code
    const callbackResponse = await fetch(
      '/api/auth/twitter/callback?code=xxx&state=yyy'
    )

    // 3. Verify tokens stored securely
    expect(callbackResponse.status).toBe(200)
  })
})
```

### E2E Tests - Content Generation
```typescript
// playwright/e2e/repurpose.spec.ts
test('should generate and schedule content', async ({ page }) => {
  await page.goto('/dashboard')
  await page.fill('[name="content"]', 'Test content')
  await page.check('[data-platform="twitter"]')
  await page.click('button:has-text("Generate")')

  await expect(page).toHaveURL(/.*repurpose.*/)
  await expect(page.locator('[data-test="generated-content"]')).toBeVisible()
})
```

---

## ✅ Implementation Checklist

### Pre-Implementation
- [ ] All environment variables configured locally
- [ ] Supabase project created and linked
- [ ] OAuth apps created on Twitter/LinkedIn
- [ ] Stripe account setup with webhook endpoint
- [ ] QStash token obtained
- [ ] n8n workflow created (if needed)

### During Implementation
- [ ] Use TypeScript for type safety
- [ ] Implement proper error handling
- [ ] Add input validation on all endpoints
- [ ] Verify webhook signatures
- [ ] Encrypt sensitive data in database
- [ ] Implement rate limiting
- [ ] Add security headers to API routes

### Before Deployment
- [ ] All environment variables set in Vercel
- [ ] RLS policies enabled and tested
- [ ] Webhook URLs updated for production domain
- [ ] Rate limiting configured per user
- [ ] Error monitoring (Sentry/LogRocket) setup
- [ ] Database backups configured
- [ ] Security audit completed

---

## 🎯 Common Patterns by Feature

### Pattern: Simple Content Generation
```
User Input → /api/adapt (OpenAI) → Response
Time: 2-5s
```

### Pattern: Scheduled Social Posting
```
User Input → /api/schedule → QStash → /api/post/execute → Platform
Time: Configurable (5s - 1 year)
```

### Pattern: OAuth Connection
```
User → Twitter/LinkedIn → Callback → Token Storage → API Access
Time: 30s
```

### Pattern: Batch Generation (30 Days)
```
User → /api/batch/generate → Process Multiple → Schedule All → QStash
Time: 60-90s initial, posts over 30 days
```

---

## 🔗 References

- **Supabase Docs:** https://supabase.com/docs
- **OpenAI API:** https://platform.openai.com/docs
- **Twitter API v2:** https://developer.twitter.com/en/docs/twitter-api
- **LinkedIn API:** https://learn.microsoft.com/en-us/linkedin/
- **Stripe Docs:** https://stripe.com/docs
- **QStash Docs:** https://upstash.com/docs/qstash
- **n8n Docs:** https://docs.n8n.io
- **RFC 7636 (PKCE):** https://tools.ietf.org/html/rfc7636

---

## 📝 Version History

- **v1.0.0** (Oct 19, 2025): Initial release
  - Core integrations documented
  - Security patterns established
  - Example implementations provided
  - Testing patterns included

---

**Skill Status:** ✅ Available and Production-Ready
**Last Updated:** October 19, 2025
