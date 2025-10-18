---
description: End-to-end bug fixing from diagnosis to verified fix. Integrates debug-expert (diagnosis), feature-implementer (fixes), test-validator (verification), and code-reviewer (quality). Use when bugs need complete resolution from report to deployment-ready code.
skill-version: 1.0.0
allowed-tools:
  - bash
  - view
  - str_replace
  - file_create
  - WebSearch
  - WebFetch
---

# Bug Fixer Skill

## Purpose
Complete end-to-end bug fixing workflow that combines systematic diagnosis (debug-expert) with implementation (feature-implementer), verification (test-validator), and quality review (code-reviewer) to deliver production-ready bug fixes.

## When to Use

### Trigger Keywords
- fix bug, broken, not working, issue, error
- failing, investigate and fix, resolve, repair

### Typical Requests
- "Fix the authentication redirect loop"
- "Broken OAuth flow needs fixing"  
- "Resolve hydration mismatch error"
- "Fix API route 500 error"

### Distinction from debug-expert
- **debug-expert**: Diagnosis only (Phases 1-3)
- **bug-fixer**: Full workflow (Phases 1-6: complete fix)

## Tech Stack (Repurpose MVP)
- Next.js 15.5.4 + React 19 + TypeScript 5
- Supabase (PostgreSQL + RLS + Auth)
- OpenAI GPT-4o, QStash, Redis
- Jest + Playwright

---

## 6-Phase Bug Fixing Process

### Overview
```
1. REPRODUCE → 2. DIAGNOSE → 3. PLAN → 4. IMPLEMENT → 5. VERIFY → 6. REVIEW
```

**Source**: Root Cause Analysis for Bug Tracking  
**URL**: https://www.softwaretestinghelp.com/root-cause-analysis/  
**CRAAP Score**: 4.1/5.0  

---

## Phase 1: Bug Reproduction

### Goal
Create minimal repro case that consistently reproduces the bug.

**Source**: Systematic Debugging (ntietz.com)  
**URL**: https://ntietz.com/blog/how-i-debug-2023/  
**Snippet**: "The first step in debugging is to reproduce the problem consistently"  
**CRAAP Score**: 4.3/5.0

### Reproduction Template
```markdown
1. **Environment**: Browser, device, network, auth state
2. **Steps**: Navigate to X, click Y, enter Z
3. **Expected**: What should happen
4. **Actual**: What actually happens  
5. **Error Messages**: Full stack trace
6. **Reproduction Rate**: 10/10 (100%) or 7/10 (70%)
```

### Evidence Collection
- [ ] Console error stack trace
- [ ] Network request/response  
- [ ] Server terminal logs
- [ ] Database query logs (if RLS/Supabase)

---

## Phase 2: Root Cause Diagnosis

### Use debug-expert Skill
**Delegate to debug-expert** for systematic diagnosis:
- Phase 1: Error Collection
- Phase 2: Hypothesis Generation (5 Whys)
- Phase 3: Systematic Isolation

### Common Root Causes (Repurpose MVP)

#### 1. Authentication & Session
**Pattern**: Random logouts, redirect loops

**Causes**:
```typescript
// WRONG: Non-SSR client
import { createClient } from '@supabase/supabase-js'

// CORRECT: SSR client
import { createClient } from '@/lib/supabase-client'

// Missing route in middleware
const protectedRoutes = [
  '/dashboard',
  '/batch-create', // Add missing routes
]
```

**Source**: Supabase Next.js Auth Troubleshooting  
**URL**: https://supabase.com/docs/guides/troubleshooting  
**CRAAP**: 4.7/5.0

#### 2. Hydration Mismatches
**Pattern**: "Text content does not match server-rendered HTML"

**Causes**: Browser APIs (window, localStorage, Date) in Server Components

**Source**: Next.js Hydration Error Docs  
**URL**: https://nextjs.org/docs/messages/react-hydration-error  
**CRAAP**: 4.9/5.0

#### 3. Suspense Requirements
**Pattern**: Build fails "useSearchParams needs Suspense"

**Source**: Next.js 15 Release Notes  
**URL**: https://nextjs.org/blog/next-15  
**CRAAP**: 4.8/5.0

#### 4. RLS Policy Violations  
**Pattern**: "new row violates row-level security policy"

**Causes**: Missing user_id, wrong role (anon vs authenticated)

**Source**: Supabase RLS Simplified  
**URL**: https://supabase.com/docs/guides/troubleshooting/rls-simplified  
**CRAAP**: 4.6/5.0

#### 5. OAuth PKCE Failures
**Pattern**: OAuth callback 401, state mismatch

**Source**: OAuth 2.0 PKCE RFC 7636  
**URL**: https://tools.ietf.org/html/rfc7636  
**CRAAP**: 5.0/5.0

---

## Phase 3: Fix Planning

### Impact Analysis Template
```markdown
## Fix Plan
- **Files to Modify**: [list with reasons]
- **Risk**: Isolated / Module-wide / System-wide  
- **Breaking Changes**: Yes/No
- **Rollback Strategy**: How to revert
- **Testing Strategy**: Unit, integration, E2E
```

### Auto-Fallback Trigger
**Invoke researcher-expert if**:
- Security-related (OAuth, auth, tokens, RLS)
- Unfamiliar error pattern
- Confidence < 0.7 about root cause
- Failed 2+ attempts

---

## Phase 4: Implementation

### Use feature-implementer Skill
**Delegate** for code changes with Repurpose context.

### Fix Templates

#### Template 1: Auth/Session Fix
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client' // SSR client

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser() // Validates token
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

#### Template 2: Hydration Mismatch Fix
```typescript
// Option A: suppressHydrationWarning
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>

// Option B: Client-only rendering
'use client'
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return <div>Loading...</div>
return <div>{window.innerWidth}</div>

// Option C: Dynamic import (no SSR)
const NoSSR = dynamic(() => import('./Client'), { ssr: false })
```

#### Template 3: Suspense Boundary Fix  
```typescript
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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

#### Template 4: Middleware Routing Fix
```typescript
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/connections',
  '/batch-create', // Add missing routes
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = protectedRoutes.some(r => path.startsWith(r))
  
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

#### Template 5: RLS Policy Fix
```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for INSERT
CREATE POLICY "Users can insert own posts"
ON posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for SELECT
CREATE POLICY "Users can read own posts"
ON posts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- UPDATE requires both SELECT and UPDATE policies
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## Phase 5: Verification Testing

### Use test-validator Skill
**Delegate** for comprehensive test coverage.

### Manual Verification Checklist
```markdown
## Manual Verification
- [ ] Bug no longer reproduces (10/10 attempts)
- [ ] Error messages cleared from console
- [ ] Network requests succeed (200/201)
- [ ] UI renders correctly
- [ ] Related features still work
- [ ] No new errors introduced
- [ ] Works in dev AND production build
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works with cleared cache/cookies
```

### Automated Test Examples

**Unit Test** (Jest):
```typescript
describe('Authentication Fix', () => {
  it('should use SSR-compatible Supabase client', async () => {
    const client = await createClient()
    expect(client).toBeDefined()
    expect(client.auth.getUser).toBeDefined()
  })
})
```

**E2E Test** (Playwright):
```typescript
test('authentication flow works after fix', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Should redirect to dashboard (not loop to login)
  await expect(page).toHaveURL('/dashboard')
  
  // Session persists after reload
  await page.reload()
  await expect(page).toHaveURL('/dashboard')
})
```

### Regression Prevention
**Source**: Regression Testing Best Practices 2024  
**URL**: https://www.browserstack.com/guide/understanding-regression-defects  
**Snippet**: "Conduct daily regression testing to reduce hotfixes"  
**CRAAP**: 3.9/5.0

- [ ] Add regression test for this bug
- [ ] Update smoke tests for critical paths
- [ ] Add error monitoring alert

---

## Phase 6: Quality Review

### Use code-reviewer Skill
**Delegate** for:
- Code quality assessment
- Security review (OAuth, auth, RLS fixes)
- Performance impact
- Best practices compliance

### Self-Review Checklist
```markdown
## Code Quality
- [ ] No TypeScript errors or `any` types
- [ ] ESLint clean
- [ ] Comments explain complex logic
- [ ] Error handling for edge cases

## Security  
- [ ] No secrets in code
- [ ] Input validation
- [ ] XSS prevention
- [ ] RLS policies reviewed

## Performance
- [ ] No N+1 queries
- [ ] Caching appropriate
- [ ] Bundle size impact minimal

## Documentation
- [ ] README updated (if user-facing)
- [ ] Comments explain WHY (not just WHAT)
```

### Post-Mortem Template
```markdown
## Bug Post-Mortem: [Title]

**Date**: YYYY-MM-DD
**Severity**: Critical/High/Medium/Low  
**Time to Resolve**: X hours

### Symptom
[What users experienced]

### Root Cause
[Technical explanation + 5 Whys analysis]

### Fix Applied
**Files Modified**: [list]
**Code Changes**:
```diff
- Old code (buggy)
+ New code (fixed)
```

**Commit**: [hash]

### Prevention Strategy
- [ ] Regression test added
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Linter rule added (if applicable)
```

---

## Real-World Examples from Repurpose MVP

### Example 1: Batch-Create Redirect Bug (Oct 17, 2025)

**Symptom**: Page redirects to dashboard after 1s

**Root Cause**: `/batch-create` not in middleware protectedRoutes

**Fix**:
```typescript
// middleware.ts:91
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/connections',
  '/batch-create', // ADDED
]
```

**Commits**: 2d381ee, bf06137  
**Time**: 15 min

---

### Example 2: Reset-Password Suspense Error (Oct 17, 2025)

**Symptom**: Vercel build failing - "useSearchParams needs Suspense"

**Root Cause**: useSearchParams in Server Component without Suspense

**Fix**:
```typescript
// BEFORE (fails)
export default function ResetPasswordPage() {
  const searchParams = useSearchParams() // No Suspense
}

// AFTER (works)
function ResetPasswordForm() {
  const searchParams = useSearchParams() // Inside Suspense
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
```

**Commit**: 92220dc  
**Time**: 5 min

---

### Example 3: CSV Import Error (Oct 17, 2025)

**Symptom**: "null value in column 'content_type' violates not-null constraint"

**Root Cause**: CSV column names had underscores, code expected spaces

**Fix**:
```typescript
const columnMapping = {
  'content_type': row['content_type'] || row['content type'] || 'text',
  'platform': row['platform'] || row['Platform'] || 'twitter',
}
```

**Commits**: 2dbeb3c, 58e6f7e  
**Time**: 20 min

---

### Example 4: Login Page Client Exception (Oct 18, 2025)

**Symptom**: "Application error: a client-side exception has occurred"

**Root Cause**: Missing error boundary + env validation

**Fix**:
```typescript
// 1. Add error boundary (app/login/error.tsx)
'use client'
export default function LoginError({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// 2. Add env validation (lib/env.ts)
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
for (const env of required) {
  if (!process.env[env]) throw new Error(`Missing: ${env}`)
}
```

**Commit**: 4262a26  
**Time**: 12 min

---

## Common Bug Patterns (Quick Reference)

| Symptom | Root Cause | Fix Location | Time |
|---------|-----------|--------------|------|
| Random logouts | Wrong Supabase import | API routes, lib/ | 5m |
| Page redirects | Missing middleware route | middleware.ts | 5m |
| Hydration mismatch | Browser API in Server | Component | 10m |
| Build fails (Suspense) | useSearchParams w/o Suspense | Page | 5m |
| 401 Unauthorized | Auth token expired | API route | 10m |
| 403 Forbidden | RLS policy blocking | Supabase | 15m |
| 500 Internal | Unhandled exception | API try/catch | 10m |
| OAuth callback fails | State/verifier mismatch | OAuth route | 20m |
| Database constraint | Missing required field | Insert query | 10m |

**Average Fix Time**: 10-15 min (known patterns)  
**Escalation**: >30 min → invoke researcher-expert

---

## Workflow Execution Guide

### Simple Bugs (≤15 min)
```
1. Reproduce (2 min)
2. Quick diagnosis (3 min) - check patterns table
3. Implement fix (8 min) - use templates
4. Manual verify (2 min)
5. Commit
```

### Medium Bugs (15-45 min)
```
1. Reproduce + evidence (5 min)
2. Invoke debug-expert (10 min)
3. Implement using templates (15 min)
4. Manual + automated testing (10 min)
5. Quick review (5 min)
```

### Complex Bugs (>45 min)
```
1. Reproduce (5 min)
2. Invoke debug-expert (15-20 min)
3. Invoke feature-implementer (20-30 min)
4. Invoke test-validator (15-20 min)
5. Invoke code-reviewer (10-15 min)
6. Create post-mortem (10 min)
```

### Emergency (Production Critical)
```
1. Immediate repro (2 min)
2. Quick hypothesis (3 min) - 5 Whys
3. Minimal safe fix (10 min)
4. Hotfix deploy (5 min)
5. Full verification (20 min)
6. Proper fix + tests (30 min)
```

---

## Auto-Fallback to researcher-expert

**Trigger Conditions**:
- Failed 2+ fix attempts
- Unfamiliar error pattern
- Security bug (OAuth, auth, tokens, RLS, XSS)
- No solution in project history
- Confidence < 0.7
- Critical production path affected

**Action**:
```
STOP → Invoke researcher-expert (security mode if OWASP)
→ Get CRAAP-scored sources (≥3.2, or ≥4.0 security)
→ Proceed with evidence-based fix
→ Cite sources in commit
```

---

## Pre-Output Self-Check (REQUIRED)

- [ ] **Reproduction**: Minimal repro case created?
- [ ] **Root Cause**: High confidence (>0.8) or researcher-expert invoked?
- [ ] **Delegation**: Complex fix (>20 lines, >2 files) delegated?
- [ ] **Citations**: Solutions cite authoritative sources?
- [ ] **Testing**: Manual + automated tests passed?
- [ ] **Regression**: No new bugs introduced?
- [ ] **Documentation**: Post-mortem for medium+ severity?
- [ ] **Prevention**: Regression test or monitoring added?

---

## Output Format

### For Simple Bugs
```markdown
## Bug Fix: [Title]

### Root Cause
[Brief technical explanation]

### Fix Applied
**File**: `[path]`
```diff
- [old code]
+ [new code]
```

### Verification
- [x] Bug no longer reproduces
- [x] Manual testing passed
- [x] No regression

### Commit
[hash or ready to commit]
```

### For Complex Bugs
```markdown
## Bug Fix: [Title]

### Phase 1-2: Diagnosis (debug-expert)
[Root cause summary]

### Phase 3: Fix Plan
**Impact**: [Isolated/Module/System]
**Files**: [List]
**Risk**: [Low/Medium/High]

### Phase 4: Implementation (feature-implementer)
[Code changes summary]

### Phase 5: Verification (test-validator)
**Manual**: [x] Passed
**Unit**: [x] 5 added
**E2E**: [x] 2 added

### Phase 6: Review (code-reviewer)
**Quality**: [x] Passed
**Security**: [x] No issues
**Performance**: [x] No degradation

### Post-Mortem
[Link to detailed doc]

### Prevention
- [x] Regression test added
- [x] Monitoring configured
- [x] Docs updated

### Ready for Deployment
**Commit**: [hash]
**Branch**: [name]
```

---

## Appendix: Source Quality (CRAAP)

All sources ≥3.2/5.0 (≥4.0 for security):

### High-Authority (≥4.5)
1. Next.js Official Docs - 4.8
2. Supabase Auth Troubleshooting - 4.7
3. Next.js Hydration Docs - 4.9
4. OAuth 2.0 RFC 7636 - 5.0
5. Next.js 15 Release - 4.8

### Reputable Secondary (3.5-4.4)
6. Root Cause Analysis Guide - 4.1
7. Systematic Debugging (ntietz) - 4.3
8. Regression Testing 2024 - 4.0
9. BrowserStack Guide - 3.9

**Criteria**: Currency (0.15), Relevance (0.25), Authority (0.25), Accuracy (0.25), Purpose (0.10)

---

*End-to-end bug fixing from diagnosis to deployment-ready code for Repurpose MVP (Next.js 15 + Supabase).*

**Version**: 1.0.0  
**Updated**: October 18, 2025  
**Dependencies**: debug-expert, feature-implementer, test-validator, code-reviewer, researcher-expert
