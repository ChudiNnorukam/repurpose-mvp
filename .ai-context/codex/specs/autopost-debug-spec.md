# Autopost Debugging Specification

**Created**: October 13, 2025
**For**: Codex-GPT-5
**From**: Claude Code
**Priority**: High
**Type**: Bug investigation and fix

---

## Problem Statement

The autoposting/scheduling feature is failing on production (https://repurpose-orpin.vercel.app). Users can:
- ✅ Generate content via OpenAI
- ✅ Connect social accounts via OAuth
- ❌ Schedule posts (fails silently or with foreign key constraint error)

## Known Issues (from AUTOPOST_AUDIT.md)

### 1. **Foreign Key Constraint Error** (CRITICAL)
- **Error**: `insert or update on table "posts" violates foreign key constraint "posts_user_id_fkey"`
- **Location**: `app/api/schedule/route.ts:64-75`
- **Cause**: User ID from frontend may not exist in `auth.users` table
- **Impact**: Posts cannot be inserted into database

### 2. **Datetime-local Timezone Bug** (FIXED)
- **Status**: Fixed in commit `c62ae1b` but may not be deployed
- **Issue**: Users couldn't select times within next 7 hours

### 3. **Generic Error Messages** (HIGH)
- **Issue**: Frontend shows "Failed to schedule post" without details
- **Impact**: Impossible for users to debug

### 4. **QStash Configuration** (UNKNOWN)
- **Unknown**: Whether QStash env vars are correctly set on production
- **Required vars**: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `NEXT_PUBLIC_APP_URL`
- **Impact**: Jobs may be scheduled but never execute

### 5. **OAuth Token Validity** (UNKNOWN)
- **Unknown**: Whether stored OAuth tokens are still valid
- **Impact**: Scheduling may work, but posting will fail

## Your Task

**Generate a comprehensive debugging suite** that:

1. **Diagnoses the root cause** of the scheduling failure
2. **Provides diagnostic scripts** to verify each component
3. **Creates fixes** for identified issues
4. **Includes testing scripts** to verify fixes

## Files to Generate

### 1. Diagnostic Script: `scripts/debug-autopost.ts`

A comprehensive diagnostic that checks:
- ✅ User exists in `auth.users` table
- ✅ Environment variables are set correctly
- ✅ QStash endpoint is reachable
- ✅ OAuth tokens are valid and not expired
- ✅ Database RLS policies are correctly configured
- ✅ Service role key bypasses RLS
- ✅ Latest commits are deployed

**Output format**: JSON report with pass/fail for each check

### 2. Fix: Update `app/api/schedule/route.ts`

**Changes needed**:
- Add better error handling with specific error codes
- Validate user exists before inserting post
- Return detailed error messages to frontend
- Log all errors with context
- Add request validation (zod or similar)

**Pattern to follow**: `app/api/adapt/route.ts` (auth + rate limiting + validation)

### 3. Fix: Update `app/create/page.tsx`

**Changes needed**:
- Display detailed error messages from API
- Show specific error codes to user
- Add loading states during scheduling
- Add success confirmation with post details
- Handle all error cases (network, validation, server)

### 4. Test Script: `scripts/test-scheduling-flow.ts`

**Test coverage**:
- Create test user
- Connect mock Twitter account
- Generate test content
- Schedule post (immediate + future)
- Verify post appears in database
- Verify QStash job is created
- Execute post manually (bypass QStash delay)
- Verify post status updates

### 5. Monitoring Script: `scripts/monitor-qstash.ts`

**Functionality**:
- Check QStash dashboard for pending jobs
- Check for failed deliveries
- Verify callback URL is correct
- Test QStash signature verification

## Technical Requirements

### Code Patterns to Follow

**From `.ai-context/memory/patterns.md`**:

1. **API Route Pattern** (Auth → Rate limiting → Validation → Logic):
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return ErrorResponses.unauthorized()

    // 2. Rate Limiting (if applicable)
    // 3. Parse and validate input
    // 4. Business logic
    // 5. Success response
  } catch (error: any) {
    console.error('Error:', error)
    return ErrorResponses.internalError(error.message)
  }
}
```

2. **Error Handling Pattern**:
```typescript
import { ErrorResponses } from '@/lib/api/errors'

// Use standardized error responses
return ErrorResponses.unauthorized()
return ErrorResponses.missingField('fieldName')
return ErrorResponses.internalError(error.message)
```

3. **Database Query Pattern**:
```typescript
// Use admin client for service operations
import { getSupabaseAdmin } from '@/lib/supabase'

const supabaseAdmin = getSupabaseAdmin()
const { data, error } = await supabaseAdmin
  .from('posts')
  .insert({ user_id: userId, ... })
  .select()
  .single()

if (error) {
  console.error('Database error:', error)
  throw new Error(`Database insert failed: ${error.message}`)
}
```

### Key Files to Reference

**Existing implementations**:
- `app/api/adapt/route.ts` - Example of good API route pattern
- `lib/supabase.ts` - Database client setup
- `lib/qstash.ts` - QStash integration
- `lib/twitter.ts` - Twitter OAuth and posting
- `lib/linkedin.ts` - LinkedIn OAuth and posting

**Database schema**:
- `supabase-schema.sql` - Full schema with RLS policies

## Debugging Questions to Answer

Your diagnostic script should definitively answer:

1. **User Authentication**: Is the logged-in user's ID in `auth.users` table?
2. **Environment Variables**: Are ALL required env vars set on production?
3. **QStash Endpoint**: Can QStash reach `/api/post/execute`?
4. **OAuth Tokens**: Are tokens valid? Do they need refresh?
5. **Deployment**: Is latest code deployed?
6. **RLS Bypass**: Is service role key bypassing RLS?
7. **Database State**: Are there failed posts causing issues?

## Success Criteria

Your implementation is complete when:

✅ **Diagnostic script** runs and identifies root cause(s)
✅ **Fixes** are generated with clear code changes
✅ **Test script** verifies fixes work end-to-end
✅ **Monitoring script** can track QStash jobs
✅ **All files** follow patterns from `.ai-context/memory/patterns.md`
✅ **Documentation** is clear and actionable

## Context Files

**Read these first**:
- `.ai-context/memory/patterns.md` - Code patterns
- `.ai-context/memory/decisions.md` - Architecture decisions
- `AUTOPOST_AUDIT.md` - Detailed problem analysis
- `CURRENT_STATE.md` - What currently works

## Output Location

Generate all files to: `.ai-context/codex/outputs/autopost-debug/`

**Directory structure**:
```
.ai-context/codex/outputs/autopost-debug/
├── scripts/
│   ├── debug-autopost.ts
│   ├── test-scheduling-flow.ts
│   └── monitor-qstash.ts
├── fixes/
│   ├── app/api/schedule/route.ts
│   └── app/create/page.tsx
├── tests/
│   └── autopost.test.ts
└── README.md (implementation guide)
```

## Additional Notes

- **Foreign key error** is the most critical issue to solve first
- User might not be created correctly in Supabase Auth
- Latest timezone fix (commit `c62ae1b`) may not be deployed
- QStash env vars MUST be verified on Vercel production environment
- OAuth tokens may need refresh logic improvements

## Next Steps After Generation

After you generate these files:

1. Update `.ai-context/handoff.json` to hand back to Claude
2. Update `.ai-context/active-session.json` with your actions
3. Include a **review checklist** for Claude:
   - Security: Input validation, auth checks
   - Database: RLS bypass, foreign key handling
   - Error handling: Detailed messages, logging
   - Testing: Coverage of all error cases

---

**Generate now?** This is a comprehensive debugging task. Take your time to create thorough diagnostics and fixes.
