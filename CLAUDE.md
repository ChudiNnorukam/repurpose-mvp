# Repurpose - Social Media Content Adaptation Platform

**Project Type**: Next.js 15 SaaS Application
**Primary Purpose**: AI-powered content adaptation and scheduling for multiple social media platforms
**Tech Stack**: Next.js 15 + TypeScript + Supabase + OpenAI + QStash

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.22
- **Build Tool**: Turbopack (Next.js built-in)
- **Components**: Custom components + class-variance-authority for variants

### Backend
- **Runtime**: Node.js (serverless via Vercel)
- **API**: Next.js API Routes (`app/api/*/route.ts`)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Job Scheduling**: Upstash QStash
- **AI**: OpenAI GPT-4 (`gpt-4o` model)

### External Services
- **OpenAI** - Content adaptation via GPT-4
- **Supabase** - Authentication + PostgreSQL database
- **Upstash QStash** - Delayed job execution for scheduled posts
- **Twitter API v2** - OAuth + Tweet posting
- **LinkedIn API** - OAuth + UGC post publishing
- **Vercel** - Hosting and deployment

### DevOps
- **Deployment**: Vercel
- **Version Control**: Git
- **Environment**: `.env.local` for local, Vercel env vars for production
- **Testing**: Playwright (E2E tests)

---

## Project Structure

```
repurpose/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── adapt/route.ts        # Content adaptation endpoint
│   │   ├── schedule/route.ts     # Post scheduling endpoint
│   │   ├── post/
│   │   │   ├── execute/route.ts  # QStash callback for post execution
│   │   │   └── retry/route.ts    # Manual retry endpoint
│   │   ├── auth/                 # OAuth callbacks
│   │   │   ├── twitter/
│   │   │   │   ├── route.ts      # Initiate Twitter OAuth
│   │   │   │   └── callback/route.ts
│   │   │   ├── linkedin/
│   │   │   │   └── callback/route.ts
│   │   │   ├── init-twitter/route.ts
│   │   │   └── init-linkedin/route.ts
│   │   ├── templates/generate/route.ts
│   │   └── cron/process-recurring-posts/route.ts
│   ├── (pages)/
│   │   ├── page.tsx              # Landing page
│   │   ├── landing/page.tsx      # Alternative landing
│   │   ├── login/page.tsx        # Login page
│   │   ├── signup/page.tsx       # Signup page
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── create/page.tsx       # Main content creation UI
│   │   ├── posts/page.tsx        # Post management
│   │   ├── connections/page.tsx  # Social account connections
│   │   ├── templates/page.tsx    # Content templates
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   └── layout.tsx                # Root layout
├── lib/                          # Shared libraries
│   ├── supabase.ts               # Supabase client setup
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase client
│   │   └── server.ts             # Server-side SSR client
│   ├── anthropic.ts              # OpenAI integration (misnamed - uses OpenAI)
│   ├── twitter.ts                # Twitter API helpers
│   ├── linkedin.ts               # LinkedIn API helpers
│   ├── qstash.ts                 # QStash job scheduling
│   └── social-media/
│       └── refresh.ts            # OAuth token refresh logic
├── components/
│   └── ui/
│       └── button.tsx            # Reusable button component
├── public/                       # Static assets
├── tests/                        # Playwright E2E tests
│   ├── hero.spec.ts
│   ├── check-auth.spec.ts
│   ├── schedule-debug.spec.ts
│   ├── schedule-with-login.spec.ts
│   └── capture-schedule-error.spec.ts
├── .env.local                    # Local environment variables (⚠️ NOT in .gitignore)
├── .env.production.local         # Production env vars (⚠️ NOT in .gitignore)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
├── playwright.config.ts
└── README.md
```

---

## Commands

### Development
```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production with Turbopack
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing
```bash
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run tests with browser UI
npx playwright test --debug            # Debug mode
npx playwright show-report             # View test report
```

### Database
```bash
# Supabase CLI commands (if using locally)
supabase link --project-ref <project-id>
supabase db pull                       # Pull schema from remote
supabase gen types typescript          # Generate TypeScript types
```

### Deployment
```bash
# Vercel deployment (automatic on git push to main)
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
```

---

## Code Patterns & Conventions

### API Routes Pattern
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate input
    if (!body.field) {
      return NextResponse.json(
        { error: "Field is required" },
        { status: 400 }
      )
    }

    // 2. Process
    const result = await doSomething(body)

    // 3. Return success
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error("Error in /api/example:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error.message
      },
      { status: 500 }
    )
  }
}
```

### Authentication Pattern
```typescript
// In page components (client-side)
'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  router.push('/login')
  return
}
```

```typescript
// In API routes (server-side with admin access)
import { getSupabaseAdmin } from '@/lib/supabase'

const supabaseClient = getSupabaseAdmin()
const { data: authUser, error: userError } =
  await supabaseClient.auth.admin.getUserById(userId)
```

### OAuth Pattern
```typescript
// 1. Generate auth URL with state
const state = randomBytes(16).toString('hex')
const authUrl = getTwitterAuthUrl(state)
// Store state in session/cookies

// 2. In callback, verify state matches
const { code, state } = await request.json()
// Verify state matches stored value

// 3. Exchange code for tokens
const { accessToken, refreshToken } = await getTwitterAccessToken(code)

// 4. Store in database
await supabase.from('social_accounts').insert({
  user_id: userId,
  platform: 'twitter',
  access_token: accessToken,
  refresh_token: refreshToken
})
```

### Content Adaptation Pattern
```typescript
// User submits content → Adapt for platforms → Display results
const adaptedContent = await Promise.all(
  platforms.map(async (platform) => {
    const adapted = await adaptContentForPlatform({
      content,
      platform,
      tone
    })
    return { platform, content: adapted }
  })
)
```

### Scheduling Pattern
```typescript
// 1. Store post in database
const { data: post } = await supabase
  .from('posts')
  .insert({
    user_id: userId,
    platform,
    adapted_content: content,
    scheduled_time: scheduledTime,
    status: 'scheduled'
  })
  .select()
  .single()

// 2. Schedule QStash job
const delay = (scheduledDate.getTime() - Date.now()) / 1000
await schedulePostJob({
  postId: post.id,
  platform,
  content,
  userId
}, scheduledDate)

// 3. QStash calls /api/post/execute at scheduled time
// 4. Endpoint publishes post and updates status
```

---

## Database Schema

### Tables

#### `auth.users` (Supabase Auth - managed)
- `id` (uuid, pk)
- `email` (text)
- `created_at` (timestamp)

#### `public.social_accounts`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES auth.users(id)
platform          text ('twitter' | 'linkedin' | 'instagram')
access_token      text
refresh_token     text (nullable)
expires_at        timestamptz (nullable)
account_username  text
connected_at      timestamptz DEFAULT now()
```

#### `public.posts`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES auth.users(id)
platform          text ('twitter' | 'linkedin' | 'instagram')
original_content  text
adapted_content   text
scheduled_time    timestamptz (nullable)
status            text ('draft' | 'scheduled' | 'posted' | 'failed')
posted_at         timestamptz (nullable)
error_message     text (nullable)
qstash_message_id text (nullable)
created_at        timestamptz DEFAULT now()
```

---

## Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Twitter OAuth 2.0
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# LinkedIn OAuth 2.0
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
```

---

## Known Issues & Gotchas

### 🚨 Critical Security Issues (See AUDIT_REPORT.md)
1. **CRIT-001**: `.env.local` and `.env.production.local` contain secrets and are in git
2. **CRIT-002**: `/api/adapt` has no authentication check
3. **CRIT-003**: Twitter OAuth uses hardcoded PKCE verifier (insecure)
4. **CRIT-004**: Token refresh failures fall back to expired tokens
5. **CRIT-005**: Database TypeScript types incomplete

### ⚠️ Common Pitfalls

**1. File naming is misleading**
- `lib/anthropic.ts` actually uses OpenAI, not Anthropic Claude
- Consider renaming to `lib/openai.ts`

**2. Timezone handling is fragile**
- `datetime-local` input gives local time without timezone
- Conversion to UTC happens client-side
- Server assumes UTC
- Test across timezones and DST transitions

**3. QStash signature verification**
- Must use `verifySignatureAppRouter` wrapper
- Don't call handler directly
- Signature verification prevents replay attacks

**4. Supabase SSR vs Client**
- Pages use `lib/supabase.ts` (client-side)
- API routes use `lib/supabase/server.ts` or `getSupabaseAdmin()`
- Don't mix client and server instances

**5. Token refresh timing**
- Twitter tokens expire in 2 hours
- LinkedIn tokens expire in 60 days
- Refresh happens just-in-time before posting
- No background token refresh implemented

**6. Error handling inconsistency**
- Some endpoints return `{ error }`, some return `{ error, details }`
- Console.log used instead of proper logging
- Standardize error responses (see HIGH-002 in audit)

---

## Testing Approach

### E2E Tests (Playwright)
**Location**: `tests/`
**Run**: `npx playwright test`
**Coverage**: Landing page, auth flows, scheduling

**Note**: Current tests appear to be debug scripts (names include "-debug")
Need refactoring to proper assertions (see TEST-002 in audit)

### Unit Tests
**Status**: ❌ None exist
**Needed for**:
- OAuth token exchange (`lib/twitter.ts`, `lib/linkedin.ts`)
- Token refresh logic (`lib/social-media/refresh.ts`)
- Content adaptation (`lib/anthropic.ts`)
- QStash scheduling (`lib/qstash.ts`)

**Recommended**: Add Jest + Testing Library

---

## Development Workflow

### 1. Local Development
```bash
# Start dev server
npm run dev

# Access at http://localhost:3000

# Set up local environment
cp .env.example .env.local
# Fill in API keys
```

### 2. Testing OAuth Flows Locally
```bash
# Use ngrok for localhost tunnels (OAuth callbacks need public URLs)
ngrok http 3000

# Update NEXT_PUBLIC_APP_URL in .env.local
NEXT_PUBLIC_APP_URL=https://[random].ngrok.io

# Update OAuth callback URLs in Twitter/LinkedIn developer consoles
```

### 3. Database Changes
```bash
# If using Supabase locally
supabase db pull

# Generate TypeScript types after schema changes
supabase gen types typescript --local > lib/database.types.ts
```

### 4. Deployment
```bash
# Push to main branch → Vercel auto-deploys

# Or manual deploy
vercel --prod
```

---

## Performance Considerations

### Response Times
- Content adaptation: 3-5s (OpenAI API latency)
- Post scheduling: 500-800ms (DB + QStash)
- Post execution: 1-2s (token refresh + platform API)

### Cost Drivers
- **OpenAI API**: ~$0.01 per adaptation (GPT-4 pricing)
- **QStash**: First 500 messages/month free, then $1/10k
- **Supabase**: Free tier (500MB DB, 50K monthly active users)
- **Vercel**: Hobby plan includes 100GB bandwidth

### Optimization Opportunities
- ✅ Already using `Promise.all` for parallel platform adaptation
- ❌ No caching of adapted content
- ❌ No retry logic for transient failures
- ❌ No rate limiting (see HIGH-001 in audit)

---

## Monitoring & Observability

### Current State
- ❌ No error tracking (Sentry, Rollbar)
- ❌ No performance monitoring
- ❌ No alerting
- ✅ Console.log statements (not ideal for production)

### Recommended
- Add Sentry for error tracking
- Enable Vercel Analytics
- Set up alerts for critical failures
- Use structured logging (Pino, Winston)

See **ARCH-001** in AUDIT_REPORT.md

---

## Security Best Practices

### Authentication
- ✅ Using Supabase Auth (industry standard)
- ✅ SSR-compatible cookie-based sessions
- ⚠️ Missing auth checks on some API routes (see CRIT-002)

### Authorization
- ⚠️ Assuming RLS policies are configured (verify in Supabase)
- ✅ Using service role key only on server-side
- ❌ No rate limiting (see HIGH-001)

### OAuth Security
- ⚠️ Twitter PKCE implementation is insecure (see CRIT-003)
- ✅ LinkedIn OAuth is standard
- ✅ State parameter used to prevent CSRF
- ⚠️ State validation not implemented in callbacks

### API Security
- ✅ QStash signature verification prevents unauthorized calls
- ❌ No input sanitization on user content (see HIGH-003)
- ❌ No length limits on user input

---

## Debugging Tips

### Check if user is authenticated
```typescript
// In browser console (on client pages)
const { data } = await supabase.auth.getUser()
console.log(data.user)
```

### Check scheduled posts
```sql
-- In Supabase SQL Editor
SELECT * FROM posts
WHERE status = 'scheduled'
ORDER BY scheduled_time ASC;
```

### Check social account connections
```sql
SELECT
  u.email,
  sa.platform,
  sa.account_username,
  sa.connected_at
FROM social_accounts sa
JOIN auth.users u ON u.id = sa.user_id;
```

### Check QStash jobs
```bash
# Visit Upstash console
# https://console.upstash.com/qstash
# View scheduled messages and execution logs
```

### Debug OAuth failures
```typescript
// In OAuth callback route, add detailed logging
console.log('OAuth callback received:', {
  code: request.nextUrl.searchParams.get('code'),
  state: request.nextUrl.searchParams.get('state'),
  error: request.nextUrl.searchParams.get('error'),
})
```

---

## Deployment Checklist

### Before Production Deploy
- [ ] Fix CRIT-001: Remove secrets from git, rotate keys
- [ ] Fix CRIT-002: Add auth to `/api/adapt`
- [ ] Fix CRIT-003: Implement secure Twitter PKCE
- [ ] Fix CRIT-004: Handle token refresh failures properly
- [ ] Fix CRIT-005: Update database TypeScript types
- [ ] Add rate limiting (HIGH-001)
- [ ] Add error tracking (Sentry)
- [ ] Verify RLS policies are enabled
- [ ] Test all OAuth flows on production URLs
- [ ] Update OAuth callback URLs in developer consoles

### Environment Variable Setup (Production)
```bash
# In Vercel dashboard → Project → Settings → Environment Variables
# Add all variables from .env.example
# DO NOT commit .env files to git
```

---

## Support & Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
- [QStash Docs](https://upstash.com/docs/qstash)

### Troubleshooting
- **OAuth not working**: Check callback URLs match exactly
- **Posts not executing**: Check QStash dashboard for errors
- **Content adaptation fails**: Verify OpenAI API key and quota
- **Database errors**: Check RLS policies in Supabase

---

## Maintenance Tasks

### Weekly
- [ ] Check QStash message queue (no stuck jobs)
- [ ] Review failed posts and retry if needed
- [ ] Monitor OpenAI API usage and costs

### Monthly
- [ ] Review error logs for patterns
- [ ] Check for API deprecations (Twitter, LinkedIn)
- [ ] Update dependencies (`npm outdated`)
- [ ] Rotate OAuth client secrets (security best practice)

### Quarterly
- [ ] Review and optimize database queries
- [ ] Analyze user behavior for feature improvements
- [ ] Update content adaptation prompts based on performance

---

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer async/await over promises
- Use meaningful variable names
- Add JSDoc comments for exported functions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/description

# Make changes, commit
git commit -m "feat: add feature description"

# Push and create PR
git push origin feature/description
```

### Commit Message Format
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code structure
test: add tests
chore: update dependencies
```

---

## Quick Reference

### Type Definitions
```typescript
type Platform = "twitter" | "linkedin" | "instagram"
type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'
type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'
```

### Important File Locations
- API Routes: `app/api/*/route.ts`
- Database Client: `lib/supabase.ts`
- OAuth Helpers: `lib/twitter.ts`, `lib/linkedin.ts`
- Content AI: `lib/anthropic.ts` (uses OpenAI)
- Job Scheduler: `lib/qstash.ts`

---

**Last Updated**: October 4, 2025
**Version**: 0.1.0 (MVP)
**Status**: Functional with known security issues (see AUDIT_REPORT.md)
