---
description: Systematic debugging methodology for Next.js 15 + Supabase apps. Use when encountering errors, bugs, authentication issues, hydration mismatches, or any production/development failures. Provides structured troubleshooting workflow with evidence-based solutions.
skill-version: 1.0.0
allowed-tools:
  - bash
  - view
  - str_replace
  - WebSearch
  - WebFetch
---

# Debug Expert Skill

## Purpose
Provides systematic debugging methodology for Next.js 15 + Supabase applications with focus on authentication flows, client/server boundaries, hydration issues, and production errors.

## When to Use

### Trigger Keywords
- debug
- broken
- error
- fix
- not working
- investigate
- troubleshoot
- failing
- crash
- bug

### Typical Requests
- "Debug authentication redirect loop"
- "Fix hydration mismatch error"
- "Why is this API route failing?"
- "Investigate Supabase auth issue"
- "Broken OAuth flow after deployment"
- "Client/server component boundary error"

## Repurpose MVP Context

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **UI**: React 19.1.0 + shadcn/ui (Radix primitives)
- **Styling**: Tailwind CSS 4 + Framer Motion 12
- **Database**: Supabase (PostgreSQL + RLS policies)
- **Auth**: Supabase Auth (email/password + OAuth)
- **AI**: OpenAI GPT-4o (content adaptation)
- **Jobs**: Upstash QStash (delayed execution)
- **Rate Limiting**: Upstash Redis (sliding window)
- **Testing**: Jest + Playwright + @testing-library/react

### Project Structure
```
app/                    # Next.js 15 App Router pages
├── api/               # API routes
├── dashboard/         # Main dashboard
├── create/            # Content creation
├── batch-create/      # Bulk content generation
└── connections/       # OAuth connections

lib/                   # Core utilities
├── supabase-client.ts  # Database client (SSR-compatible)
├── anthropic.ts       # OpenAI integration
├── qstash.ts         # Job scheduling
├── twitter.ts        # Twitter OAuth + posting
├── linkedin.ts       # LinkedIn OAuth + posting
└── rate-limit.ts     # Rate limiting config

middleware.ts         # Route protection + auth refresh
```

## Systematic Debugging Methodology

### Overview: 5-Phase Debug Workflow

```
1. COLLECT → 2. HYPOTHESIZE → 3. ISOLATE → 4. ANALYZE → 5. VALIDATE
```

**Source**: Adapted from systematic RCA (Root Cause Analysis) methodology
**URL**: https://bugasura.io/blog/root-cause-analysis-for-bug-tracking/
**Snippet**: "RCA is a structured, step-by-step process designed to seek out primary, underlying causes by gathering and analyzing relevant data"
**Fetched**: 2025-10-18
**CRAAP Score**: 3.8/5.0 (Currency: 4.0, Relevance: 4.5, Authority: 3.5, Accuracy: 4.0, Purpose: 3.0)

---

## Phase 1: Error Collection

### Browser Console Errors

**Steps**:
1. Open Chrome DevTools (Cmd+Option+I on macOS, F12 on Windows)
2. Navigate to Console tab
3. Clear console (Cmd+K or trash icon)
4. Reproduce the error
5. Copy full error stack trace

**Common Next.js 15 Error Patterns**:
```
Hydration Mismatch:
"Text content does not match server-rendered HTML"

Component Boundary Violation:
"You're importing a component that needs useSearchParams. Wrap it in <Suspense>"

Auth Session Error:
"Invalid refresh token" or "User not authenticated"

RLS Policy Violation:
"new row violates row-level security policy"
```

**Source**: Next.js Official Debugging Guide
**URL**: https://nextjs.org/docs/app/guides/debugging
**Snippet**: "Next.js has source maps enabled by default in dev mode, so you'll see your uncompiled source code"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.8/5.0 (Currency: 5.0, Relevance: 5.0, Authority: 5.0, Accuracy: 5.0, Purpose: 4.0)

### Network Tab Analysis

**Steps**:
1. Open DevTools → Network tab
2. Filter by XHR/Fetch for API calls
3. Reproduce error
4. Check for failed requests (red status codes)
5. Inspect request headers, body, response

**Critical Headers to Check**:
- **Authorization**: Should contain valid bearer token
- **Content-Type**: Should match request body (application/json)
- **Cookie**: Should include Supabase session cookies

**Common Issues**:
```
401 Unauthorized → Auth token missing/expired
403 Forbidden → RLS policy blocking access
429 Too Many Requests → Rate limit exceeded
500 Internal Server Error → Server-side crash (check logs)
```

**Source**: Debugging Next.js Like a Pro (Medium)
**URL**: https://medium.com/@farihatulmaria/debugging-next-js-like-a-pro-tools-and-techniques-for-production-grade-apps-b8818c66c953
**Snippet**: "DevTools Network tab can highlight issues like broken URLs caused by malformed API responses"
**Fetched**: 2025-10-18
**CRAAP Score**: 3.4/5.0 (Currency: 4.0, Relevance: 4.0, Authority: 2.5, Accuracy: 3.5, Purpose: 3.5)

### Server Logs (Terminal)

**Steps**:
1. Check terminal running npm run dev
2. Look for error stack traces
3. Note file paths and line numbers
4. Check for unhandled promise rejections

**Common Server-Side Errors**:
```typescript
// Supabase SSR Auth Error
Error: Invalid redirect arguments.
Location: lib/supabase-client.ts

// QStash Signature Validation Failed
Error: Signature mismatch
Location: app/api/post/execute/route.ts

// Database Query Error
PostgrestError: new row violates row-level security policy
Location: Supabase RLS policies
```

---

## Phase 2: Hypothesis Generation

### Systematic Hypothesis Ranking (5 Whys Technique)

**Method**: Ask "Why?" 5 times to reach root cause

**Source**: Root Cause Analysis Methodology
**URL**: https://www.elastic.co/what-is/root-cause-analysis
**Snippet**: "Commonly used techniques are the 5 Whys, Fishbone Diagrams, and Pareto Analysis"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.2/5.0 (Currency: 4.5, Relevance: 4.0, Authority: 4.5, Accuracy: 4.5, Purpose: 3.5)

**Example: Authentication Redirect Loop**

```
Symptom: User redirects to /login after authenticating

Why #1: "Why does user redirect to /login?"
→ Middleware.ts detects user as unauthenticated

Why #2: "Why does middleware see unauthenticated?"
→ supabase.auth.getUser() returns null

Why #3: "Why does getUser() return null?"
→ Session cookie not set or expired

Why #4: "Why is session cookie missing?"
→ Callback handler didn't store session properly

Why #5: "Why didn't callback store session?"
→ Using wrong Supabase client (non-SSR) in callback

ROOT CAUSE: Wrong import in app/api/auth/callback/route.ts
FIX: Change to import { createClient } from '@/lib/supabase-client'
```

### Likelihood-Based Hypothesis Ranking

Rank hypotheses by:
1. **Frequency** (how often this causes similar errors)
2. **Recency** (was code changed recently in this area?)
3. **Complexity** (simpler explanations more likely)

**Template**:
```markdown
## Hypotheses (Ranked by Likelihood)

### H1: [Hypothesis] - Likelihood: HIGH
- **Evidence for**: [what supports this]
- **Evidence against**: [what contradicts this]
- **Test**: [how to verify]

### H2: [Hypothesis] - Likelihood: MEDIUM
- **Evidence for**: ...
- **Evidence against**: ...
- **Test**: ...
```

---

## Phase 3: Systematic Isolation & Testing

### Isolation Strategies

**Binary Search Debugging**:
1. Comment out half of suspicious code
2. Test if error persists
3. If yes → bug in remaining half
4. If no → bug in commented half
5. Repeat until isolated

**Minimal Reproduction**:
1. Create simplest possible test case
2. Remove unrelated dependencies
3. Isolate to single component/function
4. Document exact steps to reproduce

**Example: Isolating Hydration Mismatch**

```typescript
// BEFORE (hydration error)
export default function DashboardPage() {
  const timestamp = new Date().toISOString() // Different on server/client
  return <div>{timestamp}</div>
}

// AFTER (isolated with useEffect)
'use client'
export default function DashboardPage() {
  const [timestamp, setTimestamp] = useState<string>('')

  useEffect(() => {
    setTimestamp(new Date().toISOString()) // Client-only
  }, [])

  return <div>{timestamp || 'Loading...'}</div>
}
```

**Source**: Next.js Hydration Error Documentation
**URL**: https://nextjs.org/docs/messages/react-hydration-error
**Snippet**: "Ensure the component renders the same content server-side as it does during the initial client-side render"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.9/5.0 (Currency: 5.0, Relevance: 5.0, Authority: 5.0, Accuracy: 5.0, Purpose: 4.5)

---

## Phase 4: Root Cause Analysis

### Common Root Causes in Repurpose MVP

#### 1. Supabase SSR Client Issues

**Symptom**: Random logouts, session not persisting, "Invalid redirect arguments"

**Root Cause**: Using wrong Supabase client import

**Detection**:
```typescript
// WRONG (causes random logouts)
import { createClient } from '@supabase/supabase-js'

// CORRECT (SSR-compatible)
import { createClient } from '@/lib/supabase-client'
```

**Source**: Supabase SSR Troubleshooting Guide
**URL**: https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV
**Snippet**: "Never trust supabase.auth.getSession() inside server code - it isn't guaranteed to revalidate the Auth token"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.7/5.0 (Currency: 5.0, Relevance: 5.0, Authority: 5.0, Accuracy: 5.0, Purpose: 3.5)

**Fix Template**:
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client' // SSR client

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // Validates token

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Continue with authenticated logic...
}
```

#### 2. Middleware Protected Routes Missing

**Symptom**: Page redirects to dashboard/login unexpectedly

**Root Cause**: Route not added to protectedRoutes or publicRoutes in middleware.ts

**Fix**:
```typescript
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/connections',
  '/batch-create', // Add missing route
]
```

#### 3. Hydration Mismatch (Server vs Client Rendering)

**Symptom**: "Text content does not match server-rendered HTML"

**Root Causes**:
- Using browser APIs (window, localStorage, Date.now()) in server components
- Conditional rendering based on client-only state
- Browser extensions injecting code (Grammarly, Dark Reader)

**Source**: Resolving Hydration Mismatch Errors in Next.js
**URL**: https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/
**Snippet**: "Server-side rendering happens before the browser loads, so window, document, and localStorage don't exist"
**Fetched**: 2025-10-18
**CRAAP Score**: 3.9/5.0 (Currency: 4.0, Relevance: 4.5, Authority: 3.5, Accuracy: 4.0, Purpose: 3.5)

**Fix Patterns**:

```typescript
// Pattern 1: Use suppressHydrationWarning for time-based content
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>

// Pattern 2: Move to useEffect (client-only)
'use client'
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
return <div>{window.innerWidth}</div>

// Pattern 3: Disable SSR for component
import dynamic from 'next/dynamic'
const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
)
```

#### 4. useSearchParams Without Suspense Boundary

**Symptom**: Build fails with "useSearchParams needs Suspense boundary"

**Fix Template**:
```typescript
// BEFORE (fails build)
export default function ResetPasswordPage() {
  const searchParams = useSearchParams() // No Suspense
  // ...
}

// AFTER (works)
import { Suspense } from 'react'

function ResetPasswordForm() {
  const searchParams = useSearchParams() // Inside Suspense
  // ...
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
```

#### 5. Next.js 15 Fetch Caching Changes

**Symptom**: 429 errors from Supabase, duplicate getUser() calls

**Root Cause**: Next.js 15 no longer caches fetch by default

**Source**: Supabase Auth Server-Side Documentation
**URL**: https://supabase.com/docs/guides/auth/server-side/nextjs
**Snippet**: "Next.js v15 fetch calls are no longer cached by default. Wrapping getUser() in React's cache function is important for deduplicating network calls"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.7/5.0 (Currency: 5.0, Relevance: 5.0, Authority: 5.0, Accuracy: 5.0, Purpose: 3.5)

**Fix**:
```typescript
import { cache } from 'react'

// Deduplicate getUser() calls within single render
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
```

---

## Phase 5: Fix Validation

### Verification Checklist

Before considering bug fixed:

```markdown
- [ ] Error no longer appears in console
- [ ] Network requests return 200/201 status
- [ ] Functionality works as intended
- [ ] No new errors introduced
- [ ] Works in both dev and production build
- [ ] Tested across different browsers
- [ ] Tested with cleared cache/cookies
- [ ] Added logging for future debugging
```

### Documentation

**Create Post-Mortem**:
```markdown
## Bug Post-Mortem: [Title]

**Date**: YYYY-MM-DD
**Severity**: Critical/High/Medium/Low
**Time to Resolve**: X hours

### Symptom
[What user experienced]

### Root Cause
[Technical explanation]

### Fix Applied
[Code changes made]

### Prevention
[How to avoid in future]
- [ ] Add test coverage
- [ ] Update documentation
- [ ] Add validation/checks
- [ ] Improve error messages
```

---

## Common Debugging Scenarios

### Scenario 1: OAuth Flow Debugging

**Problem**: Twitter OAuth returns 401 or redirects fail

**Debug Checklist**:
```typescript
// 1. OAuth Init
const codeVerifier = generateCodeVerifier()
const codeChallenge = await generateCodeChallenge(codeVerifier)
const state = generateRandomString(32)

// Store for callback
cookies().set('oauth_code_verifier', codeVerifier, { httpOnly: true })
cookies().set('oauth_state', state, { httpOnly: true })

// 2. OAuth Callback
const storedState = cookies().get('oauth_state')?.value
if (state !== storedState) {
  console.error('State mismatch', { received: state, stored: storedState })
  return // CSRF attack or session issue
}

const storedVerifier = cookies().get('oauth_code_verifier')?.value
if (!storedVerifier) {
  console.error('Code verifier missing from session')
  return // Session lost or expired
}
```

**Source**: OAuth 2.0 PKCE Flow (RFC 7636)
**URL**: https://tools.ietf.org/html/rfc7636
**Snippet**: "PKCE prevents authorization code interception attacks"
**Fetched**: 2025-10-18
**CRAAP Score**: 5.0/5.0 (Currency: 3.0, Relevance: 5.0, Authority: 5.0, Accuracy: 5.0, Purpose: 5.0)

### Scenario 2: API Route Debugging

**Debug Template**:
```typescript
export async function POST(request: NextRequest) {
  console.log('1. API route called')

  try {
    console.log('2. Checking auth')
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 })
    }

    console.log('3. User authenticated:', user?.id)

    const body = await request.json()
    console.log('4. Body:', body)

    // Database operation
    console.log('5. Executing database query')
    const { data, error: dbError } = await supabase
      .from('table_name')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      if (dbError.message.includes('row-level security')) {
        console.error('RLS policy blocking insert')
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log('6. Success:', data)
    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
```

### Scenario 3: Middleware Debugging

**Debug Template**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log('Middleware:', { path })

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('Auth check:', {
    user: user?.id,
    error: error?.message,
    hasSession: !!user
  })

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  console.log('Route type:', { isProtectedRoute, isPublicRoute })

  if (isProtectedRoute && !user) {
    console.log('Redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && user) {
    console.log('Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
```

---

## Tools & Techniques

### Browser DevTools Workflow

**Source**: Next.js Debugging Guide
**URL**: https://nextjs.org/docs/app/guides/debugging
**Snippet**: "Navigate to specific source files using the Go to source shortcut (Cmd+P on Chrome for macOS)"
**Fetched**: 2025-10-18
**CRAAP Score**: 4.8/5.0

**Best Practices**:
1. Use breakpoints instead of console.log for complex flows
2. Conditional breakpoints for specific scenarios
3. Watch expressions to track variable changes
4. Call stack navigation to trace execution path
5. Network tab filtering (XHR/Fetch, status codes)

### Server-Side Debugging (Node Inspector)

**Setup**:
```bash
# Enable Node.js debugger
NODE_OPTIONS='--inspect' npm run dev

# Open Chrome DevTools
# Navigate to chrome://inspect
# Click "inspect" next to your Next.js process
```

**Source**: 5 Steps to Debugging Next.js from Chrome DevTools
**URL**: https://dev.to/vvo/5-steps-to-debugging-next-js-node-js-from-vscode-or-chrome-devtools-497o
**Snippet**: "Pass the --inspect flag to the underlying Node.js process to debug server-side code"
**Fetched**: 2025-10-18
**CRAAP Score**: 3.7/5.0 (Currency: 4.0, Relevance: 4.5, Authority: 3.0, Accuracy: 4.0, Purpose: 3.5)

---

## Auto-Fallback to researcher-expert

**Trigger Conditions** (invoke researcher-expert if ANY match):
- Failed 2+ times debugging same issue
- Unfamiliar error message or stack trace
- Security-related bug (auth, OAuth, tokens, RLS)
- No solution found in project history or docs
- Multiple conflicting solutions found online
- Confidence < 0.7 about root cause

**Action**: See .claude/skills/_shared/auto-fallback-pattern.md for invocation template

---

## Pre-Output Self-Check (REQUIRED)

Before returning debugging results:

- [ ] **Delegation**: Complex debugging (>3 files, >20 lines) → delegated to subagent?
- [ ] **Citations**: All solutions cite authoritative sources (docs, RFCs, official guides)?
- [ ] **Errors**: 2+ failed attempts → invoked researcher-expert?
- [ ] **Common questions**: Pre-answered (checked logs, isolated issue, identified root cause, tested fix)

Reference: .claude/skills/_shared/pre-output-checklist.md

---

## Appendix: Source Quality Assessment (CRAAP)

All sources scored using CRAAP methodology (minimum 3.2/5.0):

### High-Authority Sources (≥4.5)
1. Next.js Official Docs - 4.8/5.0
2. Supabase Auth Troubleshooting - 4.7/5.0
3. Next.js Hydration Error Docs - 4.9/5.0
4. OAuth 2.0 RFC 7636 - 5.0/5.0

### Reputable Secondary Sources (3.5-4.4)
5. LogRocket Hydration Guide - 3.9/5.0
6. Root Cause Analysis (Bugasura) - 3.8/5.0
7. Elastic RCA Guide - 4.2/5.0
8. DEV.to Debugging Guide - 3.7/5.0

**Scoring Criteria**:
- **Currency** (0.15 weight): Publication/update date
- **Relevance** (0.25 weight): Match to Next.js 15 + Supabase
- **Authority** (0.25 weight): Official docs > vendor guides > blogs
- **Accuracy** (0.25 weight): Technical correctness, code examples work
- **Purpose** (0.10 weight): Educational vs marketing bias

---

*This skill provides systematic debugging methodology with evidence-based solutions for Repurpose MVP (Next.js 15 + Supabase).*

**Version**: 1.0.0
**Last Updated**: October 18, 2025
**Maintained by**: Repurpose MVP Team
