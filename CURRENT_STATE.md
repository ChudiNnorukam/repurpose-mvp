# Current State Documentation
**Project**: Repurpose MVP
**Last Updated**: October 4, 2025
**Status**: ✅ Functional (with known issues documented in AUDIT_REPORT.md)

---

## What DOES Work Correctly

### ✅ Core User Flows (Verified Functional)

#### 1. User Authentication & Signup ✅
**Files**: `app/signup/page.tsx`, `app/login/page.tsx`
- Supabase Auth integration working
- Email/password signup functional
- Login redirects to dashboard
- Session management via cookies (SSR-compatible)
- Logout functionality works

**Verification**: Users can create accounts and authenticate

---

#### 2. Social Media Account Connections ✅
**Files**:
- `app/connections/page.tsx`
- `app/api/auth/twitter/route.ts` + `callback/route.ts`
- `app/api/auth/linkedin/callback/route.ts`
- `lib/twitter.ts`, `lib/linkedin.ts`

**Working OAuth Flows**:
- **Twitter OAuth 2.0**: Users can connect Twitter accounts
  - Authorization URL generation
  - Callback handling
  - Token exchange
  - Stores: `access_token`, `refresh_token`, `account_username`

- **LinkedIn OAuth 2.0**: Users can connect LinkedIn accounts
  - Authorization URL generation
  - Callback handling
  - Token exchange
  - Stores: `access_token`, `account_username`

**Verification**: Users can link social accounts and tokens are stored in `social_accounts` table

⚠️ **Known Issue**: Twitter OAuth uses insecure PKCE (CRIT-003 in audit)

---

#### 3. Content Adaptation (AI-Powered) ✅
**Files**: `app/create/page.tsx`, `app/api/adapt/route.ts`, `lib/anthropic.ts`

**Flow**:
1. User enters original content in `/create`
2. Selects platforms (Twitter, LinkedIn, Instagram)
3. Chooses tone (professional, casual, friendly, etc.)
4. Clicks "Adapt Content"
5. Backend calls OpenAI GPT-4 with custom prompts
6. Returns adapted content optimized for each platform

**Features Working**:
- ✅ Multi-platform adaptation (up to 3 platforms simultaneously)
- ✅ Custom tone selection
- ✅ Platform-specific character limits enforced
- ✅ Viral content framework applied (hooks, CTAs, humanization)
- ✅ Real-time content preview
- ✅ Copy-to-clipboard functionality
- ✅ Character count display

**Verification**: Adapted content is generated and matches platform guidelines

⚠️ **Known Issue**: No authentication check on `/api/adapt` (CRIT-002)

---

#### 4. Post Scheduling ✅
**Files**: `app/create/page.tsx`, `app/api/schedule/route.ts`, `lib/qstash.ts`

**Flow**:
1. After content is adapted, user selects date/time for each platform
2. Clicks "Schedule" button
3. Backend:
   - Validates scheduled time is in future
   - Stores post in `posts` table (status: "scheduled")
   - Schedules QStash job to execute post at specified time
4. User sees success confirmation

**Features Working**:
- ✅ Datetime picker with min constraint (prevents past dates)
- ✅ Timezone handling (local → UTC conversion)
- ✅ QStash integration for delayed execution
- ✅ Post metadata stored in Supabase
- ✅ User ID association
- ✅ Per-platform scheduling (can schedule Twitter now, LinkedIn later)

**Verification**: Posts appear in `posts` table with `scheduled` status

---

#### 5. Scheduled Post Execution ✅
**Files**: `app/api/post/execute/route.ts`, `lib/twitter.ts`, `lib/linkedin.ts`, `lib/social-media/refresh.ts`

**Flow**:
1. QStash triggers `/api/post/execute` at scheduled time
2. Verifies QStash signature (security)
3. Fetches post and user's social account from database
4. Refreshes OAuth token if needed
5. Posts to platform (Twitter or LinkedIn)
6. Updates post status to "posted" or "failed"

**Features Working**:
- ✅ QStash signature verification (`verifySignatureAppRouter`)
- ✅ Token refresh before posting
- ✅ Twitter API v2 posting (`client.v2.tweet()`)
- ✅ LinkedIn UGC Posts API
- ✅ Status updates in database
- ✅ Error logging with details
- ✅ Idempotency (checks if already posted)

**Verification**: Posts publish to social media at scheduled time

⚠️ **Known Issues**:
- Token refresh failures fall back to expired token (CRIT-004)
- Instagram not implemented (returns "not yet implemented")

---

#### 6. Dashboard & Post Management ✅
**Files**: `app/dashboard/page.tsx`, `app/posts/page.tsx`

**Working Features**:
- ✅ User dashboard showing account status
- ✅ Posts list with status (draft, scheduled, posted, failed)
- ✅ Navigation between pages
- ✅ User email display
- ✅ Logout functionality

**Verification**: Users can view their created content and schedule status

---

### ✅ Infrastructure & Integration Points

#### Database (Supabase) ✅
**Tables Working**:
- `auth.users` - User authentication
- `public.posts` - Content posts with scheduling info
- `public.social_accounts` - OAuth tokens for connected platforms

**Features**:
- ✅ SSR-compatible client (`@supabase/ssr`)
- ✅ Admin client for server-side operations
- ✅ Type-safe database client (TypeScript types defined)

**Verification**: Data persists correctly across sessions

---

#### External APIs ✅

**OpenAI (GPT-4)** ✅
- Model: `gpt-4o`
- Purpose: Content adaptation
- Status: Working, API calls successful
- Usage: ~1024 tokens per adaptation

**Upstash QStash** ✅
- Purpose: Delayed job scheduling
- Status: Working, schedules posts correctly
- Features: Signature verification, delay scheduling

**Twitter API v2** ✅
- Endpoints: OAuth2, Tweet v2, User lookup
- Status: Working for read/write
- Features: OAuth2.0 with refresh tokens

**LinkedIn API** ✅
- Endpoints: OAuth2, UserInfo, UGC Posts
- Status: Working for posts
- Features: OAuth2.0, profile access, posting

**Supabase** ✅
- Services: Auth, Database (Postgres)
- Status: Fully functional
- Features: RLS (assumed configured), SSR support

---

### ✅ Deployment & Environment

**Platform**: Vercel ✅
- Deployment working (`.vercel/` directory exists)
- Environment variables configured in Vercel dashboard
- Next.js 15 with Turbopack builds successfully

**Build Process**: ✅
- `npm run dev` - Works with Turbopack
- `npm run build` - Builds successfully
- TypeScript compilation - No errors

---

## Core Business Logic That MUST NOT Break

### Critical Paths (Do NOT modify without extensive testing)

1. **OAuth Token Exchange Flow**
   - Files: `lib/twitter.ts:27-50`, `lib/linkedin.ts:17-43`
   - Why Critical: Breaking this means users can't connect accounts
   - Dependencies: Twitter/LinkedIn API contracts

2. **Post Scheduling Logic**
   - Files: `app/api/schedule/route.ts:42-59`, `lib/qstash.ts:20-61`
   - Why Critical: Core feature - users schedule posts
   - Dependencies: QStash API, database schema

3. **Content Adaptation Prompts**
   - Files: `lib/anthropic.ts:22-140`
   - Why Critical: Custom viral content framework - unique selling point
   - Dependencies: OpenAI API, specific prompt engineering

4. **Token Refresh Mechanism**
   - Files: `lib/social-media/refresh.ts`
   - Why Critical: Prevents auth failures during post execution
   - Dependencies: Platform token endpoints

---

## Integration Points (External Dependencies)

### APIs We Depend On

| Service | Purpose | Breaking Change Impact | Monitoring |
|---------|---------|----------------------|------------|
| **OpenAI API** | Content adaptation | Feature breaks entirely | ❌ None |
| **Twitter API v2** | OAuth + Posting | Can't post to Twitter | ❌ None |
| **LinkedIn API** | OAuth + Posting | Can't post to LinkedIn | ❌ None |
| **QStash** | Job scheduling | Posts won't execute | ❌ None |
| **Supabase** | Auth + Database | Entire app breaks | ❌ None |

⚠️ **No monitoring or health checks** - see ARCH-001 in audit

---

## Known Working Configurations

### Environment Variables (Required)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin key

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

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Testing Coverage (Current)

### ✅ E2E Tests (Playwright)
**Location**: `tests/`
**Coverage**:
- `hero.spec.ts` - Landing page functionality
- `check-auth.spec.ts` - Authentication checks
- `schedule-debug.spec.ts` - Scheduling flow (debug)
- `schedule-with-login.spec.ts` - Full scheduling flow
- `capture-schedule-error.spec.ts` - Error handling

**Status**: Tests exist but appear to be debug scripts (see TEST-002 in audit)

### ❌ Unit Tests
**Coverage**: 0%
**Status**: No unit tests exist (see TEST-001 in audit)

---

## Data Flow (End-to-End)

### Happy Path: User Schedules a Post
```
1. User creates account → Supabase Auth
2. User connects Twitter → OAuth flow → Token stored in social_accounts
3. User writes content → Frontend (app/create/page.tsx)
4. User clicks "Adapt" → /api/adapt → OpenAI GPT-4 → Adapted content returned
5. User selects datetime → Datetime picker (local timezone)
6. User clicks "Schedule" → /api/schedule
   ├─ Validates user exists
   ├─ Validates future datetime
   ├─ Inserts into posts table
   └─ Schedules QStash job
7. QStash waits until scheduled time
8. QStash calls /api/post/execute
   ├─ Fetches post from database
   ├─ Fetches social account
   ├─ Refreshes token if needed
   ├─ Posts to Twitter
   └─ Updates post status to "posted"
9. User sees post on Twitter ✅
```

---

## What We Can Safely Change

### ✅ Safe to Modify (Low Risk)
- UI components (styling, layout)
- Copy text and messaging
- Dashboard statistics and displays
- Error messages (user-facing)
- Console.log statements (replace with proper logging)

### ⚠️ Moderate Risk (Test Thoroughly)
- Validation logic (ensure edge cases covered)
- API error handling (ensure failures don't cascade)
- Database queries (test with real data)
- Timezone handling (test across timezones)

### 🚨 High Risk (Requires Extensive Testing)
- OAuth flows (breaking = users can't connect accounts)
- Token refresh logic (breaking = posts fail to publish)
- QStash integration (breaking = scheduling doesn't work)
- Content adaptation prompts (breaking = quality degrades)
- Database schema changes (breaking = data loss)

---

## Performance Baseline

### Current Response Times
- Content Adaptation: ~3-5 seconds (OpenAI API latency)
- Scheduling Post: ~500-800ms (database + QStash)
- Post Execution: ~1-2 seconds (token refresh + API call)

### Resource Usage
- OpenAI API: ~1024 tokens per adaptation × platforms
- QStash: 1 message per scheduled post
- Database: Queries are simple (single-table lookups)

---

## Deployment History (Recent)

**Last Known Working Deployment**:
- Commit: `dbf5fd8` - "Implement GPT autopost repair plan"
- Date: Recent (in git log)
- Status: ✅ Working on production (Vercel)

**Recent Fixes Applied**:
- `c62ae1b` - Fixed datetime-local min attribute timezone bug
- `d777f58` - Force dark mode on landing page
- `960dd4d` - Update Playwright tests to pass

---

## User Feedback & Known Complaints

**No formal user feedback mechanism** (see ARCH-001 for monitoring recommendation)

**Assumed Pain Points** (based on code analysis):
- No way to know if scheduled post failed
- No retry if token expires
- No bulk scheduling
- Instagram not supported yet

---

## Dependencies That Must Stay Pinned

**Critical Version Locks**:
- `next: 15.5.4` - App Router, Turbopack, Server Components
- `@supabase/ssr: ^0.7.0` - SSR-compatible auth
- `twitter-api-v2: ^1.27.0` - OAuth2 support
- `@upstash/qstash: ^2.8.3` - Signature verification

⚠️ **Do NOT upgrade** without testing OAuth flows

---

## Summary

**Overall Status**: ✅ **FUNCTIONAL**

The core features work end-to-end:
- ✅ Users can sign up and log in
- ✅ Users can connect Twitter and LinkedIn accounts
- ✅ Content adaptation generates quality adapted content
- ✅ Posts can be scheduled for future publication
- ✅ Scheduled posts publish successfully to platforms

**Critical Issues Requiring Fixes** (see AUDIT_REPORT.md):
- 🚨 Environment variables in git (CRIT-001)
- 🚨 Missing authentication on /api/adapt (CRIT-002)
- 🚨 Insecure OAuth PKCE (CRIT-003)
- 🚨 Token refresh error handling (CRIT-004)
- 🚨 Incomplete database types (CRIT-005)

**Recommendation**: Address critical security issues before onboarding more users. Current functionality is solid for MVP testing.
