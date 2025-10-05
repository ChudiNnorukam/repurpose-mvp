# Code Audit Report
**Project**: Repurpose - Social Media Content Adaptation Platform
**Audit Date**: October 4, 2025
**Total Files Analyzed**: 32 TypeScript/TSX files
**Lines of Code**: ~3,500 LOC (excluding node_modules)

---

## Executive Summary

This Next.js 15 application enables users to adapt content across Twitter, LinkedIn, and Instagram using AI (OpenAI GPT-4), with scheduling capabilities via QStash and Supabase backend. The codebase shows signs of rapid prototyping with several critical issues requiring immediate attention before production use.

**Overall Health**: ⚠️ **MODERATE RISK** - Functional but needs security hardening and error handling improvements.

---

## Critical Issues (Fix Immediately)

### CRIT-001: Environment Variable Exposure Risk
**Location**: Multiple `.env*` files in repository root
**Severity**: CRITICAL
**Files**:
- `.env.local` - Contains secrets, committed to git (Line in git status)
- `.env.production.local` - Contains production secrets, committed to git

**Issue**: Environment files containing API keys and secrets are being tracked in git repository.

**Risk**:
- API keys for OpenAI, Supabase, Twitter, LinkedIn, QStash exposed in version control
- If pushed to public repo = immediate credential compromise
- Historical git commits contain secrets even if files are deleted

**Fix**:
1. Immediately verify `.env.local` and `.env.production.local` are in `.gitignore`
2. Remove from git history: `git rm --cached .env.local .env.production.local`
3. Rotate ALL API keys that were committed:
   - `OPENAI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TWITTER_CLIENT_SECRET`
   - `LINKEDIN_CLIENT_SECRET`
   - `QSTASH_TOKEN`
4. Use environment variable management service (Vercel env vars, AWS Secrets Manager)

**Complexity**: Moderate (1-2 hours including key rotation)

---

### CRIT-002: Missing Authentication on Content Adaptation API
**Location**: `app/api/adapt/route.ts:7-65`
**Severity**: CRITICAL
**Issue**: No user authentication check in the `/api/adapt` endpoint.

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, tone, platforms } = body
    // ❌ NO AUTH CHECK - anyone can call this and consume OpenAI credits
```

**Risk**:
- Unauthenticated users can make requests
- OpenAI API costs can be abused
- No rate limiting = potential DoS

**Fix**:
```typescript
export async function POST(request: NextRequest) {
  // Add auth check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Continue with existing logic...
```

**Complexity**: Simple (15 minutes)

---

### CRIT-003: Hardcoded OAuth Code Verifier (Security Vulnerability)
**Location**: `lib/twitter.ts:20-21, 42`
**Severity**: CRITICAL
**Issue**: Using hardcoded `'challenge'` as PKCE code verifier instead of cryptographically random string.

```typescript
authUrl.searchParams.append('code_challenge', 'challenge')  // ❌ INSECURE
authUrl.searchParams.append('code_challenge_method', 'plain')

// Later...
const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
  code,
  codeVerifier: 'challenge',  // ❌ Same hardcoded value
```

**Risk**:
- OAuth2 PKCE security completely bypassed
- Attackers can intercept authorization codes and exchange them for tokens
- Violates Twitter OAuth 2.0 security requirements

**Fix**:
```typescript
// Generate cryptographically secure code verifier
import { randomBytes } from 'crypto'

export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

// Store verifier in session/cookies, retrieve during callback
// Use proper code_challenge_method: 'S256' with SHA256 hash
```

**Complexity**: Moderate (30 minutes + testing)

---

### CRIT-004: Unhandled Promise Rejections in Token Refresh
**Location**: `app/api/post/execute/route.ts:72-78`
**Severity**: CRITICAL
**Issue**: Token refresh failure falls back to expired token without checking if token is actually valid.

```typescript
try {
  accessToken = await refreshIfNeeded(socialAccount, platform)
  console.log(`✅ Access token refreshed for ${platform}`)
} catch (refreshError: any) {
  console.error(`❌ Token refresh failed for ${platform}:`, refreshError)
  accessToken = socialAccount.access_token // ❌ Falls back to potentially expired token
}

// Then attempts to post with possibly expired token (lines 85-103)
// This will fail silently if token is expired
```

**Risk**:
- Posts fail to publish but marked as "attempted"
- No user notification of auth failure
- Users think post is scheduled but it never publishes

**Fix**:
```typescript
try {
  accessToken = await refreshIfNeeded(socialAccount, platform)
} catch (refreshError: any) {
  // Mark post as failed and notify user
  await supabase
    .from("posts")
    .update({
      status: "failed",
      error_message: `Authentication expired. Please reconnect your ${platform} account`,
    })
    .eq("id", postId)

  return NextResponse.json(
    { error: `Authentication expired for ${platform}` },
    { status: 401 }
  )
}
```

**Complexity**: Simple (20 minutes)

---

### CRIT-005: Type Safety Violation - Database Types Incomplete
**Location**: `lib/supabase.ts:36-119`
**Severity**: HIGH (Borderline CRITICAL)
**Issue**: Database type definitions are incomplete and don't match actual database schema.

**Missing fields**:
- `social_accounts.refresh_token` (used in code but not in types)
- `social_accounts.expires_at` (needed for token expiry tracking)
- `posts.error_message` (used in code but not in types)
- `posts.qstash_message_id` (referenced in schedule endpoint)

**Risk**:
- TypeScript won't catch database schema mismatches
- Silent runtime errors
- Data integrity issues

**Fix**: Update `Database` type to match actual Supabase schema (run `supabase gen types typescript`)

**Complexity**: Simple (15 minutes)

---

## High Priority Issues

### HIGH-001: No Rate Limiting on Expensive AI Operations
**Location**: `app/api/adapt/route.ts`, `app/api/schedule/route.ts`
**Severity**: HIGH
**Issue**: No rate limiting on API endpoints that consume external resources.

**Impact**:
- OpenAI API cost abuse (each adapt call = GPT-4 call = $$$)
- QStash message quota exhaustion
- Potential bill shock

**Fix**: Implement rate limiting using Upstash Redis or Vercel's built-in rate limiting:
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
})
```

**Complexity**: Moderate (30 minutes)

---

### HIGH-002: Inconsistent Error Handling Patterns
**Location**: Multiple API routes
**Severity**: HIGH
**Issue**: Mix of error handling approaches - some return error details, some don't, inconsistent status codes.

**Examples**:
- `app/api/schedule/route.ts:84` - Returns detailed error: `insertError.message`
- `app/api/adapt/route.ts:60` - Generic error: "Failed to adapt content"
- Some return `error.message`, some return `error.details`

**Risk**:
- Difficulty debugging in production
- Potential information leakage to users
- Inconsistent user experience

**Fix**: Standardize error responses with error codes:
```typescript
type ApiError = {
  error: string          // User-facing message
  code: string           // Error code (e.g., 'AUTH_EXPIRED')
  details?: string       // Dev-only details (omit in production)
}
```

**Complexity**: Moderate (1 hour across all endpoints)

---

### HIGH-003: Missing Input Sanitization
**Location**: `app/api/adapt/route.ts:10`, `app/create/page.tsx:91-105`
**Severity**: HIGH
**Issue**: User content passed directly to OpenAI API without sanitization or length checks.

**Risk**:
- Prompt injection attacks (user crafts malicious prompts)
- Excessive token usage (user sends 10,000 char content)
- Billing abuse

**Fix**:
```typescript
// Validate content length BEFORE API call
const MAX_CONTENT_LENGTH = 5000
if (content.length > MAX_CONTENT_LENGTH) {
  return NextResponse.json(
    { error: `Content too long. Maximum ${MAX_CONTENT_LENGTH} characters.` },
    { status: 400 }
  )
}

// Sanitize content (remove special chars that could manipulate prompts)
const sanitizedContent = content
  .replace(/```/g, '')  // Remove code blocks
  .replace(/\{system\}/gi, '')  // Remove system tags
  .trim()
```

**Complexity**: Simple (20 minutes)

---

### HIGH-004: LinkedIn API Version Deprecated
**Location**: `lib/linkedin.ts:95-102`
**Severity**: HIGH
**Issue**: Using deprecated LinkedIn UGC Posts API (`/v2/ugcPosts`).

```typescript
const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  // This endpoint is being phased out
```

**Risk**:
- API will stop working when LinkedIn deprecates v2 UGC
- LinkedIn recommends using `/rest/posts` (v3)

**Fix**: Migrate to LinkedIn v3 Posts API:
```typescript
const response = await fetch('https://api.linkedin.com/rest/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'LinkedIn-Version': '202405',  // API versioning
  },
  body: JSON.stringify({
    author: `urn:li:person:${userData.sub}`,
    commentary: content,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'PUBLISHED',
  }),
})
```

**Complexity**: Moderate (45 minutes + testing)

---

## Medium Priority Issues

### MED-001: Client-Side Supabase Client Exposed
**Location**: `lib/supabase.ts:16`, used in `app/create/page.tsx:4`
**Severity**: MEDIUM
**Issue**: Using client-side Supabase client in client components without proper RLS policies.

**Risk**: If RLS (Row Level Security) policies are misconfigured, users could access other users' data.

**Fix**:
1. Verify RLS policies are enabled on all tables
2. Use server actions for sensitive operations instead of client-side calls
3. Move auth checks server-side

**Complexity**: Moderate (review RLS policies + refactor auth)

---

### MED-002: No Retry Logic for QStash Failures
**Location**: `app/api/schedule/route.ts:90-137`
**Severity**: MEDIUM
**Issue**: If QStash scheduling fails, post is marked failed permanently.

**Fix**: Implement retry with exponential backoff for transient failures.

**Complexity**: Moderate (30 minutes)

---

### MED-003: Timezone Handling Comments Suggest Confusion
**Location**: `app/create/page.tsx:88-92, 336-346`
**Severity**: MEDIUM
**Issue**: Comments indicate potential timezone bugs were recently fixed, but implementation is fragile.

```typescript
// Convert datetime-local to ISO string with user's timezone
// datetime-local gives "2025-10-03T14:23" (no timezone info)
// new Date() interprets this as LOCAL time, then toISOString() converts to UTC properly
```

**Risk**: Timezone edge cases (DST transitions, user traveling, server vs client timezone)

**Fix**: Use a proper datetime library (date-fns-tz, luxon) and explicitly track user timezone.

**Complexity**: Moderate (1 hour)

---

### MED-004: Debug Files in Production Build
**Location**: Root directory
**Severity**: MEDIUM
**Files**:
- `check-posts.js`
- `get-user-and-schedule.js`
- `schedule-now.js`
- `schedule-test.sh`
- `test-schedule.sh`
- `debug-create-page.png`
- `debug-dashboard.png`

**Issue**: Debug/test scripts committed to repo.

**Fix**:
1. Add to `.gitignore`: `*.debug.*, debug-*, *-test.sh, check-*.js`
2. Move test scripts to `scripts/` directory
3. Remove images from repo (use proper issue tracking)

**Complexity**: Simple (10 minutes)

---

### MED-005: Magic Strings for Platform Types
**Location**: Multiple files
**Severity**: MEDIUM
**Issue**: Platform types defined inconsistently across files.

```typescript
// lib/twitter.ts:5 - No type export
type Platform = "twitter" | "linkedin" | "instagram"

// app/api/schedule/route.ts:5 - Duplicate definition
type Platform = "twitter" | "linkedin" | "instagram"

// app/create/page.tsx:9 - Another duplicate
type Platform = 'twitter' | 'linkedin' | 'instagram'
```

**Fix**: Create `lib/types.ts` with shared types:
```typescript
// lib/types.ts
export type Platform = "twitter" | "linkedin" | "instagram"
export type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'
```

**Complexity**: Simple (15 minutes)

---

## Style & Formatting Issues (Low Priority)

### LOW-001: Inconsistent Import Ordering
**Severity**: LOW
**Issue**: Mix of absolute (`@/lib/*`) and relative imports without consistent pattern.

**Fix**: Use ESLint rule `import/order` for consistent sorting.

**Complexity**: Simple (5 minutes config + auto-fix)

---

### LOW-002: Console.log Statements in Production Code
**Severity**: LOW
**Locations**:
- `app/api/schedule/route.ts:106, 121, 34, 47`
- `app/api/post/execute/route.ts:20, 32, 38, 54, 74, 89, 94, 100`
- `lib/qstash.ts:38, 50, 54`

**Issue**: ~30 console.log statements in API routes (production logs get expensive on serverless).

**Fix**: Use proper logging library (Pino, Winston) with log levels and structured logging.

**Complexity**: Moderate (30 minutes)

---

### LOW-003: Missing JSDoc Comments
**Severity**: LOW
**Issue**: Exported functions lack documentation.

**Fix**: Add JSDoc to all exported functions:
```typescript
/**
 * Schedules a post to be published at a future time via QStash
 * @param jobData - Post metadata including platform and content
 * @param scheduledTime - When to publish (must be future)
 * @returns QStash message ID for tracking
 * @throws {Error} If scheduled time is in the past or QStash fails
 */
export async function schedulePostJob(...)
```

**Complexity**: Moderate (1 hour for all functions)

---

### LOW-004: Unused Imports
**Severity**: LOW
**Location**: `lib/linkedin.ts:1` - `randomBytes` imported but never used

**Fix**: Run ESLint with `no-unused-vars` rule enabled and auto-fix.

**Complexity**: Simple (2 minutes)

---

## Testing Gaps

### TEST-001: No Unit Tests for Critical Business Logic
**Severity**: HIGH
**Issue**: Zero unit tests found (no `*.test.ts` or `*.spec.ts` except Playwright E2E).

**Critical untested code**:
- Token refresh logic (`lib/social-media/refresh.ts`)
- Content adaptation (`lib/anthropic.ts`)
- QStash scheduling (`lib/qstash.ts`)
- OAuth flows (`lib/twitter.ts`, `lib/linkedin.ts`)

**Fix**: Add Jest + test coverage for critical paths:
```typescript
// lib/__tests__/qstash.test.ts
describe('schedulePostJob', () => {
  it('throws error if scheduled time is in the past', async () => {
    const pastDate = new Date(Date.now() - 1000)
    await expect(schedulePostJob({...}, pastDate)).rejects.toThrow()
  })
})
```

**Complexity**: Complex (4-6 hours for comprehensive coverage)

---

### TEST-002: E2E Tests Are Debug Scripts, Not Proper Tests
**Severity**: MEDIUM
**Location**: `tests/schedule-debug.spec.ts`, `tests/capture-schedule-error.spec.ts`
**Issue**: Tests named "*-debug" suggest they're temporary debugging tools, not assertions.

**Fix**: Refactor to proper test assertions:
```typescript
test('should schedule post successfully', async ({ page }) => {
  // Setup
  await page.goto('/create')
  await page.fill('[name="content"]', 'Test content')

  // Act
  await page.click('button:text("Schedule")')

  // Assert
  await expect(page.locator('.success-message')).toBeVisible()

  // Verify in database
  const post = await getPostFromDB()
  expect(post.status).toBe('scheduled')
})
```

**Complexity**: Moderate (2 hours)

---

### TEST-003: No Error Scenario Testing
**Severity**: MEDIUM
**Issue**: No tests for:
- Token expiry/refresh failures
- QStash downtime
- OpenAI API failures
- Network timeouts

**Fix**: Add integration tests with mocked failures.

**Complexity**: Moderate (2 hours)

---

## Architecture & Design Issues

### ARCH-001: No Monitoring or Observability
**Severity**: HIGH
**Issue**: No error tracking (Sentry), no performance monitoring (Vercel Analytics), no alerting.

**Risk**: Production issues go unnoticed until users complain.

**Fix**:
1. Add Sentry for error tracking
2. Enable Vercel Analytics
3. Set up alerts for API failures

**Complexity**: Simple (30 minutes setup)

---

### ARCH-002: Tight Coupling Between UI and API Logic
**Severity**: MEDIUM
**Location**: `app/create/page.tsx` - 366 lines mixing UI, state, and API calls

**Fix**: Extract hooks/services:
```typescript
// hooks/useContentAdaptation.ts
export function useContentAdaptation() {
  const [adapting, setAdapting] = useState(false)

  const adaptContent = async (content, tone, platforms) => {
    // API call logic here
  }

  return { adapting, adaptContent }
}
```

**Complexity**: Moderate (1 hour refactoring)

---

## Performance Issues

### PERF-001: Sequential API Calls in Content Adaptation
**Location**: `lib/anthropic.ts:57-170` called via `app/api/adapt/route.ts:35`
**Severity**: MEDIUM
**Issue**: Adapting content for 3 platforms takes 3x time (sequential await in Promise.all).

**Current behavior**:
```typescript
const adaptedContent = await Promise.all(
  platforms.map(async (platform) => {
    const adaptedText = await adaptContentForPlatform(...)  // Each waits for OpenAI
  })
)
```

**Good news**: Already using `Promise.all` correctly! This is actually optimal.

**Potential optimization**: Use streaming responses for faster perceived performance.

**Complexity**: N/A (already optimized)

---

## Summary Statistics

| Severity | Count | Must Fix Before Production |
|----------|-------|---------------------------|
| **CRITICAL** | 5 | ✅ YES |
| **HIGH** | 8 | ⚠️ RECOMMENDED |
| **MEDIUM** | 9 | 🔵 Nice to have |
| **LOW** | 4 | ⏸️ Optional |

---

## Recommendations Priority Order

**Before ANY production deployment:**
1. ✅ CRIT-001: Remove secrets from git, rotate keys
2. ✅ CRIT-003: Fix OAuth PKCE security (Twitter)
3. ✅ CRIT-002: Add authentication to `/api/adapt`
4. ✅ CRIT-004: Handle token refresh failures properly
5. ✅ HIGH-001: Implement rate limiting

**Before scaling to users:**
6. HIGH-002: Standardize error handling
7. HIGH-003: Input sanitization and length limits
8. ARCH-001: Add monitoring (Sentry)
9. TEST-001: Unit tests for critical paths

**Ongoing improvements:**
10. MED-* issues (code quality, maintainability)
11. LOW-* issues (polish, developer experience)

---

## Positive Findings ✅

**What's working well:**
- ✅ Good TypeScript usage overall
- ✅ Proper async/await patterns
- ✅ Environment variable validation in most places
- ✅ QStash signature verification (`verifySignatureAppRouter`)
- ✅ Supabase integration using SSR package (modern approach)
- ✅ Error handling exists (though inconsistent)
- ✅ Using Next.js 15 App Router correctly
- ✅ Separation of concerns (lib/ vs app/)

---

## Next Steps

1. Review this audit with the team
2. Prioritize critical fixes (CRIT-001 through CRIT-005)
3. Create Phase 1 implementation plan
4. Run tests after each fix
5. Deploy to staging for validation

**Estimated Time to Address Critical Issues**: 4-6 hours
**Estimated Time for Full Cleanup**: 20-25 hours
