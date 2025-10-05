# Refactor Roadmap
**Project**: Repurpose MVP
**Created**: October 4, 2025
**Status**: ⏸️ Awaiting Phase 0 Approval

---

## Overview

This roadmap provides a phased approach to cleaning up the Repurpose codebase systematically. Based on comprehensive audit findings (see AUDIT_REPORT.md), we've identified 26 issues across 4 severity levels.

**Total Estimated Time**: 20-25 hours
**Critical Path Time**: 4-6 hours (must complete before production)

---

## Phase Checklist

- [x] **Phase 0**: Audit & Infrastructure Setup ✅ COMPLETE
- [ ] **Phase 1**: Critical Fixes (4-6 hours) 🚨 START HERE
- [ ] **Phase 2**: Test Coverage (4-6 hours)
- [ ] **Phase 3**: Code Quality & Refactoring (8-10 hours)
- [ ] **Phase 4**: Documentation & Polish (2-3 hours)

---

## Phase 0: Audit & Infrastructure Setup ✅

**Status**: ✅ **COMPLETE**
**Duration**: 1 hour
**Date Completed**: October 4, 2025

### Deliverables Created:
- ✅ AUDIT_REPORT.md - Comprehensive code audit with severity ratings
- ✅ CURRENT_STATE.md - Documentation of working features
- ✅ CLAUDE.md - Project tech stack and patterns
- ✅ .claude/settings.json - Safety hooks configured
- ✅ .claude/commands/ - 7 rescue command files
- ✅ REFACTOR_ROADMAP.md - This file

### Findings Summary:
- **5 Critical Issues** - Security vulnerabilities requiring immediate fix
- **8 High Priority Issues** - Functionality and quality improvements
- **9 Medium Priority Issues** - Code maintainability
- **4 Low Priority Issues** - Polish and developer experience

---

## Phase 1: Critical Fixes 🚨

**Target**: Make the code work reliably and securely
**Duration**: 4-6 hours
**Prerequisites**: Phase 0 complete ✅
**Status**: ⏸️ **AWAITING APPROVAL TO START**

### Priority Order (Must Fix Before Production)

#### 1.1 - CRIT-001: Environment Variable Exposure 🔴
**File**: `.env.local`, `.env.production.local`
**Time**: 2 hours (including key rotation)
**Severity**: CRITICAL

**Tasks**:
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Verify `.env.production.local` is in `.gitignore`
- [ ] Remove from git: `git rm --cached .env.local .env.production.local`
- [ ] Rotate ALL compromised API keys:
  - [ ] Rotate `OPENAI_API_KEY` (platform.openai.com)
  - [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard)
  - [ ] Rotate `TWITTER_CLIENT_SECRET` (Twitter developer portal)
  - [ ] Rotate `LINKEDIN_CLIENT_SECRET` (LinkedIn developer portal)
  - [ ] Rotate `QSTASH_TOKEN` (Upstash console)
- [ ] Update keys in Vercel environment variables
- [ ] Test all OAuth flows with new keys
- [ ] Commit: "fix(security): remove secrets from git and rotate keys"

**Verification**:
```bash
# Ensure files are gitignored
git status  # Should NOT show .env.local or .env.production.local

# Verify old keys don't work
# (Test with old API key - should return 401)
```

**Done Criteria**: ✅ No secrets in git history, all keys rotated, app works with new keys

---

#### 1.2 - CRIT-003: Insecure OAuth PKCE Implementation 🔴
**File**: `lib/twitter.ts:20-21, 42`
**Time**: 45 minutes
**Severity**: CRITICAL

**Tasks**:
- [ ] Install crypto for random code verifier generation
- [ ] Create `generateCodeVerifier()` function
- [ ] Create `generateCodeChallenge(verifier)` function using SHA256
- [ ] Store verifier in session/cookies during auth initiation
- [ ] Retrieve verifier from session in callback
- [ ] Change `code_challenge_method` from `'plain'` to `'S256'`
- [ ] Test Twitter OAuth flow end-to-end
- [ ] Commit: "fix(security): implement secure PKCE for Twitter OAuth"

**Code Changes**:
```typescript
// lib/twitter.ts
import { randomBytes, createHash } from 'crypto'

export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256')
    .update(verifier)
    .digest('base64url')
}

export function getTwitterAuthUrl(state: string, codeVerifier: string): string {
  const challenge = generateCodeChallenge(codeVerifier)
  // ... use challenge instead of 'challenge'
  authUrl.searchParams.append('code_challenge', challenge)
  authUrl.searchParams.append('code_challenge_method', 'S256')
}
```

**Verification**:
- [ ] Can connect Twitter account
- [ ] Code verifier is random each time
- [ ] Tokens are successfully obtained

**Done Criteria**: ✅ Twitter OAuth uses cryptographically secure PKCE

---

#### 1.3 - CRIT-002: Missing Authentication on /api/adapt 🔴
**File**: `app/api/adapt/route.ts:7`
**Time**: 20 minutes
**Severity**: CRITICAL

**Tasks**:
- [ ] Import `createClient` from `@/lib/supabase/server`
- [ ] Add auth check at start of POST handler
- [ ] Return 401 if user not authenticated
- [ ] Test: Unauthenticated request returns 401
- [ ] Test: Authenticated request works
- [ ] Commit: "fix(security): add authentication to /api/adapt endpoint"

**Code Changes**:
```typescript
// app/api/adapt/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Add auth check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Continue with existing logic...
```

**Verification**:
```bash
# Test unauthenticated
curl https://your-app.com/api/adapt -d '{"content":"test"}'
# Should return 401

# Test authenticated (with valid session cookie)
# Should return 200 with adapted content
```

**Done Criteria**: ✅ Only authenticated users can adapt content

---

#### 1.4 - CRIT-004: Token Refresh Error Handling 🔴
**File**: `app/api/post/execute/route.ts:72-78`
**Time**: 30 minutes
**Severity**: CRITICAL

**Tasks**:
- [ ] Remove fallback to expired token
- [ ] Mark post as failed if token refresh fails
- [ ] Return 401 error with clear message
- [ ] Add test: Post fails when token refresh fails
- [ ] Test: User is notified to reconnect account
- [ ] Commit: "fix(auth): handle token refresh failures properly"

**Code Changes**:
```typescript
// app/api/post/execute/route.ts
try {
  accessToken = await refreshIfNeeded(socialAccount, platform)
  console.log(`✅ Access token refreshed for ${platform}`)
} catch (refreshError: any) {
  console.error(`❌ Token refresh failed for ${platform}:`, refreshError)

  // Mark post as failed instead of proceeding with expired token
  await supabase
    .from("posts")
    .update({
      status: "failed",
      error_message: `Authentication expired. Please reconnect your ${platform} account in Settings > Connections`,
    })
    .eq("id", postId)

  return NextResponse.json(
    {
      error: `Authentication expired for ${platform}. Please reconnect your account.`,
      requiresReauth: true,
      platform
    },
    { status: 401 }
  )
}
```

**Verification**:
- [ ] Simulate expired token
- [ ] Post is marked "failed" in database
- [ ] Error message guides user to reconnect account

**Done Criteria**: ✅ Failed token refreshes don't silently fail

---

#### 1.5 - CRIT-005: Update Database TypeScript Types 🔴
**File**: `lib/supabase.ts:36-119`
**Time**: 20 minutes
**Severity**: HIGH (borderline CRITICAL)

**Tasks**:
- [ ] Run `supabase gen types typescript > lib/database.types.ts`
- [ ] Add missing fields to manual types:
  - `social_accounts.refresh_token`
  - `social_accounts.expires_at`
  - `posts.error_message`
  - `posts.qstash_message_id`
- [ ] Update imports to use generated types
- [ ] Fix TypeScript errors
- [ ] Commit: "fix(types): update database types to match schema"

**Code Changes**:
```typescript
// lib/supabase.ts
import { Database } from './database.types'

// Or manually update:
social_accounts: {
  Row: {
    id: string
    user_id: string
    platform: 'twitter' | 'linkedin' | 'instagram'
    access_token: string
    refresh_token: string | null  // ✅ Added
    expires_at: string | null     // ✅ Added
    account_username: string
    connected_at: string
  }
  // ... Insert and Update types
}

posts: {
  Row: {
    id: string
    user_id: string
    original_content: string
    platform: 'twitter' | 'linkedin' | 'instagram'
    adapted_content: string
    scheduled_time: string | null
    status: 'draft' | 'scheduled' | 'posted' | 'failed'
    posted_at: string | null
    error_message: string | null      // ✅ Added
    qstash_message_id: string | null  // ✅ Added
    created_at: string
  }
  // ... Insert and Update types
}
```

**Verification**:
- [ ] No TypeScript errors
- [ ] All database queries type-check correctly

**Done Criteria**: ✅ TypeScript types match actual database schema

---

### Phase 1 Summary

**Total Time**: 4-6 hours
**Issues Fixed**: 5 critical security/functionality issues
**Tests Added**: 0 (tests come in Phase 2)
**Commits**: 5 separate commits (one per issue)

**Checkpoint**: After Phase 1, run full test suite. If all tests pass, create git tag:
```bash
git tag phase-1-complete
git push origin phase-1-complete
```

**Before Proceeding to Phase 2**: Get approval from team/user that critical fixes are working correctly.

---

## Phase 2: Test Coverage

**Target**: Safety net before refactoring
**Duration**: 4-6 hours
**Prerequisites**: Phase 1 complete
**Status**: ⏸️ **PENDING**

### Why Tests Before Refactoring?

We need tests to ensure refactoring doesn't break functionality. Tests will:
- Catch regressions immediately
- Document expected behavior
- Enable confident refactoring
- Reveal hidden bugs

### Testing Priority Order

#### 2.1 - Core Business Logic Tests (2 hours)

**Files to Test**:
- [ ] `lib/qstash.ts` - schedulePostJob function
- [ ] `lib/social-media/refresh.ts` - refreshIfNeeded function
- [ ] `lib/twitter.ts` - OAuth and posting functions
- [ ] `lib/linkedin.ts` - OAuth and posting functions

**Test Cases for `lib/qstash.ts`**:
```typescript
// lib/__tests__/qstash.test.ts
describe('schedulePostJob', () => {
  it('throws error if scheduled time is in the past', async () => {
    const pastDate = new Date(Date.now() - 1000)
    await expect(schedulePostJob({...}, pastDate)).rejects.toThrow('must be in the future')
  })

  it('calculates correct delay in seconds', async () => {
    const futureDate = new Date(Date.now() + 60000) // 60 seconds
    // Mock QStash API
    // Verify delay is ~60 seconds
  })

  it('throws error if NEXT_PUBLIC_APP_URL not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    await expect(schedulePostJob({...}, futureDate)).rejects.toThrow('not set')
  })

  it('returns QStash message ID on success', async () => {
    const messageId = await schedulePostJob({...}, futureDate)
    expect(messageId).toBeTruthy()
  })
})
```

**Command**: `/add-tests lib/qstash.ts`

---

#### 2.2 - API Endpoint Tests (1.5 hours)

**Endpoints to Test**:
- [ ] `app/api/schedule/route.ts`
- [ ] `app/api/adapt/route.ts`
- [ ] `app/api/post/execute/route.ts`

**Test Cases for `/api/schedule`**:
```typescript
// app/api/schedule/__tests__/route.test.ts
import { POST } from '../route'

describe('POST /api/schedule', () => {
  it('returns 401 if user not authenticated', async () => {
    const request = new Request('http://localhost/api/schedule', {
      method: 'POST',
      body: JSON.stringify({ platform: 'twitter', content: 'test' })
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 400 if platform missing', async () => {
    // Mock authenticated user
    const response = await POST(mockRequest({ content: 'test' }))
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('platform')
  })

  it('returns 400 if scheduled time is in past', async () => {
    const pastTime = new Date(Date.now() - 1000).toISOString()
    const response = await POST(mockRequest({
      platform: 'twitter',
      content: 'test',
      scheduledTime: pastTime
    }))
    expect(response.status).toBe(400)
  })

  it('successfully schedules post', async () => {
    const futureTime = new Date(Date.now() + 60000).toISOString()
    const response = await POST(mockRequest({
      platform: 'twitter',
      content: 'test',
      scheduledTime: futureTime,
      userId: 'test-user-id'
    }))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.post).toBeTruthy()
  })
})
```

**Command**: `/add-tests app/api/schedule/route.ts`

---

#### 2.3 - Integration Tests (30 minutes)

**Test Complete User Flows**:
- [ ] Content adaptation flow (original → adapted content)
- [ ] Post scheduling flow (adapt → schedule → QStash)
- [ ] OAuth connection flow (init → callback → token storage)

**Example Flow Test**:
```typescript
// tests/integration/content-adaptation.test.ts
describe('Content Adaptation Flow', () => {
  it('adapts content for multiple platforms', async () => {
    const user = await createTestUser()
    const token = await getAuthToken(user)

    // Call /api/adapt
    const response = await fetch('/api/adapt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Original content here',
        tone: 'professional',
        platforms: ['twitter', 'linkedin']
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.adaptedContent).toHaveLength(2)
    expect(data.adaptedContent[0].platform).toBe('twitter')
    expect(data.adaptedContent[0].content.length).toBeLessThanOrEqual(280)
    expect(data.adaptedContent[1].platform).toBe('linkedin')
  })
})
```

---

#### 2.4 - Edge Case & Error Scenario Tests (1 hour)

**Critical Error Scenarios**:
- [ ] OpenAI API returns 429 (rate limit)
- [ ] QStash API is down
- [ ] Database connection fails
- [ ] Twitter API returns 401 (expired token)
- [ ] LinkedIn API returns 500 (server error)
- [ ] Network timeout

**Example Error Test**:
```typescript
describe('Error Scenarios', () => {
  it('handles OpenAI rate limiting gracefully', async () => {
    // Mock OpenAI to return 429
    mockOpenAI.mockRejectedValueOnce({ status: 429 })

    const response = await fetch('/api/adapt', {
      method: 'POST',
      body: JSON.stringify({ content: 'test', tone: 'professional', platforms: ['twitter'] })
    })

    expect(response.status).toBe(429)
    const data = await response.json()
    expect(data.error).toContain('rate limit')
  })
})
```

---

### Phase 2 Deliverables

**Files Created**:
- `lib/__tests__/qstash.test.ts`
- `lib/__tests__/twitter.test.ts`
- `lib/__tests__/linkedin.test.ts`
- `lib/social-media/__tests__/refresh.test.ts`
- `app/api/schedule/__tests__/route.test.ts`
- `app/api/adapt/__tests__/route.test.ts`
- `app/api/post/__tests__/execute.test.ts`
- `tests/integration/content-flow.test.ts`
- `tests/integration/scheduling-flow.test.ts`

**Test Coverage Target**: 70%+ for critical paths

**Commits**: One per test file (8-9 commits)

**Checkpoint**: After Phase 2, run full test suite:
```bash
npm test
# All tests should pass
```

---

## Phase 3: Code Quality & Refactoring

**Target**: Make code maintainable
**Duration**: 8-10 hours
**Prerequisites**: Phase 1 + Phase 2 complete
**Status**: ⏸️ **PENDING**

### Now We Can Refactor Safely (Tests Protect Us!)

#### 3.1 - Extract Duplicated Code (2 hours)

**Identified Duplications**:

1. **Platform type definitions** (4 locations)
   - [ ] Create `lib/types.ts` with shared types
   - [ ] Replace all duplicate type definitions
   - [ ] Update imports

2. **Error response patterns** (12 locations)
   - [ ] Create `lib/api/errors.ts` with `ApiError` type
   - [ ] Create `createErrorResponse()` helper
   - [ ] Standardize all API error responses

3. **Supabase client creation** (multiple patterns)
   - [ ] Consolidate client creation patterns
   - [ ] Document when to use client vs server vs admin

**Code Changes**:
```typescript
// lib/types.ts
export type Platform = "twitter" | "linkedin" | "instagram"
export type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'

// lib/api/errors.ts
export type ApiError = {
  error: string
  code: string
  details?: string
}

export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(process.env.NODE_ENV !== 'production' && details ? { details } : {})
    },
    { status }
  )
}
```

**Command**: `/refactor-safe lib/types.ts` (create new file first)

---

#### 3.2 - Break Down Complex Functions (3 hours)

**Target Files**:

1. **`app/create/page.tsx`** (366 lines - too large)
   - [ ] Extract `useContentAdaptation` hook (lines 121-161)
   - [ ] Extract `usePostScheduling` hook (lines 76-119)
   - [ ] Extract `PlatformSelector` component (lines 244-273)
   - [ ] Extract `AdaptedContentCard` component (lines 307-358)
   - [ ] Reduce main component to <150 lines

2. **`app/api/schedule/route.ts`** (149 lines)
   - [ ] Extract `validateScheduleInput()` function
   - [ ] Extract `verifyUserExists()` function
   - [ ] Keep main handler focused on orchestration

3. **`lib/anthropic.ts`** (170 lines)
   - [ ] Extract `platformGuidelines` to separate file
   - [ ] Extract `toneGuidelines` to separate file
   - [ ] Consider renaming file to `lib/openai.ts` (more accurate)

**Example Refactoring**:
```typescript
// Before: app/create/page.tsx (366 lines)
export default function CreatePage() {
  // All logic in one component
}

// After: Extracted hooks
// hooks/useContentAdaptation.ts
export function useContentAdaptation() {
  const [adapting, setAdapting] = useState(false)
  const [adaptedContent, setAdaptedContent] = useState([])

  const adaptContent = async (content, tone, platforms) => {
    setAdapting(true)
    try {
      const response = await fetch('/api/adapt', {
        method: 'POST',
        body: JSON.stringify({ content, tone, platforms })
      })
      const data = await response.json()
      setAdaptedContent(data.adaptedContent)
    } finally {
      setAdapting(false)
    }
  }

  return { adapting, adaptedContent, adaptContent }
}

// app/create/page.tsx (reduced to ~150 lines)
export default function CreatePage() {
  const { adapting, adaptedContent, adaptContent } = useContentAdaptation()
  const { scheduling, schedulePost } = usePostScheduling()
  // Much cleaner!
}
```

**Command**: `/refactor-safe app/create/page.tsx`

---

#### 3.3 - Improve Naming & Add Types (1 hour)

**Vague Names to Fix**:
- [ ] `lib/anthropic.ts` → `lib/content-adaptation.ts` (or `lib/openai.ts`)
- [ ] `useEffect(() => { checkUser() })` → `useAuthRedirect()`
- [ ] `handleAdaptContent` → `adaptContentForPlatforms`
- [ ] `post` variable → `scheduledPost` (more specific)

**Missing Type Annotations**:
- [ ] Add types to all function parameters
- [ ] Add return types to all exported functions
- [ ] Remove `any` types (currently 10+ instances)

**Example**:
```typescript
// Before
const handleSchedulePost = async (platform) => {
  const post = adaptedContent.find(item => item.platform === platform)
  // ...
}

// After
const schedulePostForPlatform = async (platform: Platform): Promise<void> => {
  const platformPost = adaptedContent.find(item => item.platform === platform)
  if (!platformPost) {
    throw new Error(`No adapted content found for ${platform}`)
  }
  // ...
}
```

---

#### 3.4 - Add Missing Error Handling (1 hour)

**Functions Missing try/catch**:
- [ ] `lib/linkedin.ts:45` - getLinkedInUser (no error handling)
- [ ] `lib/twitter.ts:53` - getTwitterUser (no error handling)
- [ ] `app/create/page.tsx:37` - checkUser (error handling exists but could be better)

**Add Retry Logic**:
- [ ] QStash scheduling failures (transient network errors)
- [ ] OpenAI API rate limits (exponential backoff)

---

#### 3.5 - Organize File Structure (1 hour)

**Current Structure Issues**:
- Debug files in root (should be in `scripts/`)
- No `hooks/` directory (custom hooks in components)
- No `utils/` directory (helper functions scattered)

**Proposed Structure**:
```
repurpose/
├── app/
├── lib/
│   ├── api/
│   │   └── errors.ts       # Centralized error handling
│   ├── content-adaptation.ts  # Renamed from anthropic.ts
│   ├── types.ts            # Shared type definitions
│   └── ...
├── hooks/
│   ├── useContentAdaptation.ts
│   ├── usePostScheduling.ts
│   └── useAuthRedirect.ts
├── utils/
│   ├── datetime.ts         # Timezone helpers
│   └── validation.ts       # Input validation
├── scripts/                # Debug/test scripts
│   ├── check-posts.js
│   ├── schedule-test.sh
│   └── ...
└── ...
```

**Tasks**:
- [ ] Create `hooks/` directory
- [ ] Create `utils/` directory
- [ ] Create `lib/api/` directory
- [ ] Create `scripts/` directory
- [ ] Move files to appropriate locations
- [ ] Update all imports

---

### Phase 3 Summary

**Total Time**: 8-10 hours
**Files Refactored**: ~15 files
**New Files Created**: ~8 files (hooks, utils, types)
**Commits**: 12-15 commits (incremental refactoring)
**Test Coverage**: Maintain 70%+ (tests ensure refactoring didn't break anything)

**Checkpoint**: After Phase 3, run full test suite. All tests must still pass.

---

## Phase 4: Documentation & Polish

**Target**: Make code understandable
**Duration**: 2-3 hours
**Prerequisites**: Phase 1 + 2 + 3 complete
**Status**: ⏸️ **PENDING**

### 4.1 - Format Entire Codebase (15 minutes)

**Tasks**:
- [ ] Run Prettier on all files: `npx prettier --write .`
- [ ] Fix ESLint auto-fixable issues: `npx eslint --fix .`
- [ ] Organize imports
- [ ] Remove unused imports
- [ ] Commit: "style: format entire codebase"

**Command**: `/format-all`

---

### 4.2 - Add JSDoc Documentation (1 hour)

**Functions Needing Docs**:
- [ ] All exported functions in `lib/`
- [ ] All API route handlers
- [ ] All custom hooks

**Example**:
```typescript
/**
 * Schedules a post to be published at a future time via QStash
 *
 * @param jobData - Post metadata including platform, content, and user ID
 * @param scheduledTime - When to publish the post (must be in future)
 * @returns QStash message ID for tracking the scheduled job
 * @throws {Error} If scheduled time is in the past
 * @throws {Error} If NEXT_PUBLIC_APP_URL environment variable is not set
 * @throws {Error} If QStash API call fails
 *
 * @example
 * const messageId = await schedulePostJob(
 *   { postId: '123', platform: 'twitter', content: 'Hello', userId: 'user-1' },
 *   new Date('2025-12-31T23:59:59Z')
 * )
 */
export async function schedulePostJob(
  jobData: SchedulePostJob,
  scheduledTime: Date
): Promise<string> {
  // ...
}
```

---

### 4.3 - Replace console.log with Proper Logging (30 minutes)

**Current State**: ~30 console.log statements

**Tasks**:
- [ ] Install logging library: `npm install pino`
- [ ] Create `lib/logger.ts`
- [ ] Replace all console.log with logger
- [ ] Add log levels (info, warn, error)
- [ ] Configure for production (JSON format)

**Code**:
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined
})

// Usage
logger.info('Post scheduled successfully', { postId, platform })
logger.error('QStash scheduling failed', { error: error.message })
```

---

### 4.4 - Remove Dead Code (15 minutes)

**Files to Remove**:
- [ ] Commented-out code blocks (search for `// `)
- [ ] Unused imports (ESLint will flag)
- [ ] Debug scripts from root (move to `scripts/`)
- [ ] Old test files (if any)
- [ ] Screenshots in root (`debug-*.png`)

---

### 4.5 - Update CLAUDE.md (15 minutes)

**Updates Needed**:
- [ ] Document new file structure
- [ ] Update patterns section with hooks
- [ ] Document error handling patterns
- [ ] Add logging guidelines
- [ ] Update "Known Issues" (many will be fixed)

---

### 4.6 - Create Missing Documentation (30 minutes)

**Files to Create/Update**:
- [ ] README.md - Setup instructions, deployment guide
- [ ] CONTRIBUTING.md - How to contribute
- [ ] API.md - API endpoint documentation
- [ ] `.env.example` - Update with new required variables

**Example README Section**:
```markdown
## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Fill in API keys (see [Setup Guide](./docs/SETUP.md))
5. Run development server: `npm run dev`
6. Open http://localhost:3000

## Running Tests

```bash
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npx playwright test       # E2E tests
```
```

---

### Phase 4 Summary

**Total Time**: 2-3 hours
**Changes**: Documentation, formatting, cleanup
**Commits**: 5-6 commits
**Final Result**: Clean, well-documented, production-ready codebase

---

## Deployment Checklist (After All Phases)

### Pre-Deployment Verification

- [ ] **All phases complete**
  - [ ] Phase 1: Critical fixes ✅
  - [ ] Phase 2: Test coverage ✅
  - [ ] Phase 3: Refactoring ✅
  - [ ] Phase 4: Documentation ✅

- [ ] **Tests passing**
  - [ ] Unit tests: `npm test`
  - [ ] E2E tests: `npx playwright test`
  - [ ] No TypeScript errors: `npm run build`

- [ ] **Security audit**
  - [ ] No secrets in git
  - [ ] All API keys rotated
  - [ ] Environment variables in Vercel
  - [ ] Rate limiting enabled
  - [ ] Input validation in place

- [ ] **Production environment**
  - [ ] All env vars set in Vercel
  - [ ] OAuth callback URLs updated
  - [ ] Supabase RLS policies verified
  - [ ] QStash webhook URL configured

### Deploy to Production

```bash
# Tag the release
git tag v1.0.0-production-ready
git push origin v1.0.0-production-ready

# Deploy via Vercel
vercel --prod

# Verify deployment
curl https://your-app.vercel.app/api/health  # If you added health check
```

### Post-Deployment Verification

- [ ] Landing page loads
- [ ] User can sign up
- [ ] User can log in
- [ ] OAuth connections work (Twitter, LinkedIn)
- [ ] Content adaptation works
- [ ] Post scheduling works
- [ ] Scheduled posts execute correctly
- [ ] Error tracking reports to Sentry

---

## Progress Tracking

Use this section to track progress through each phase:

```
Phase 1: [░░░░░░░░░░] 0% (0/5 issues fixed)
Phase 2: [░░░░░░░░░░] 0% (0/9 test files created)
Phase 3: [░░░░░░░░░░] 0% (0/15 refactorings complete)
Phase 4: [░░░░░░░░░░] 0% (0/6 documentation tasks done)

Overall: [▓░░░░░░░░░] 25% (Phase 0 complete)
```

Update this section as you complete tasks!

---

## Emergency Rollback Plan

If something goes wrong during refactoring:

### Quick Rollback
```bash
# Return to pre-rescue state
git checkout pre-rescue-backup

# Or rollback to specific phase
git checkout phase-1-complete
```

### Selective Rollback
```bash
# Revert specific commits
git revert <commit-hash>

# Or use /rewind in Claude Code
# (Esc Esc → select checkpoint)
```

---

## Success Metrics

### Before Rescue (Baseline)
- Critical Issues: 5
- Test Coverage: 0%
- TypeScript Errors: 0 (but types incomplete)
- Console.log Statements: ~30
- Files >200 lines: 4
- Average Function Length: 25 lines

### After Rescue (Target)
- Critical Issues: 0 ✅
- Test Coverage: >70% ✅
- TypeScript Errors: 0 with complete types ✅
- Console.log Statements: 0 (replaced with logger) ✅
- Files >200 lines: 0 (all refactored) ✅
- Average Function Length: <15 lines ✅

---

## Next Session Planning

### Session 1: Phase 1 (CRITICAL FIXES)
**Time**: 4-6 hours
**Focus**: Security vulnerabilities
**Goal**: Production-safe code

### Session 2: Phase 2 (TESTS)
**Time**: 4-6 hours
**Focus**: Test coverage
**Goal**: Safety net for refactoring

### Session 3: Phase 3 (REFACTOR)
**Time**: 8-10 hours (split into 2-3 sessions)
**Focus**: Code quality
**Goal**: Maintainable codebase

### Session 4: Phase 4 (POLISH)
**Time**: 2-3 hours
**Focus**: Documentation
**Goal**: Professional, documented code

---

## Team Assignments (If Applicable)

**Phase 1 (Critical)**: Senior dev + security review
**Phase 2 (Tests)**: Can be parallelized:
- Developer A: API route tests
- Developer B: Library function tests
- Developer C: Integration tests

**Phase 3 (Refactor)**: Can be parallelized by file:
- Developer A: `app/create/page.tsx`
- Developer B: API routes
- Developer C: Library utilities

**Phase 4 (Docs)**: Junior dev or technical writer

---

## Questions & Decisions

**Q: Should we fix all HIGH priority issues in Phase 1?**
A: No. Phase 1 focuses only on CRITICAL. HIGH issues can wait for Phase 3 after tests are in place.

**Q: What if Phase 2 tests reveal new bugs?**
A: GOOD! Note the bugs but don't fix yet. Fix them in Phase 3 with tests protecting you.

**Q: Can we skip Phase 2 and go straight to refactoring?**
A: NO. Tests are essential. Refactoring without tests is dangerous.

**Q: How do we handle production hotfixes during refactoring?**
A: Create a separate hotfix branch from `main`. Merge hotfix to both `main` and `refactor` branch.

---

**Last Updated**: October 4, 2025
**Current Phase**: Phase 0 Complete ✅
**Next Phase**: Phase 1 - Awaiting Approval to Start
**Total Progress**: 25% (Phase 0 only)
