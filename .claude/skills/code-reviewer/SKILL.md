---
description: Reviews code for quality, security, performance in Repurpose context. Checks Next.js 15 patterns, Supabase RLS policies, OAuth security, rate limiting. Use when code review needed or user asks to 'review', 'audit', 'check quality'.
skill-version: 1.0.0
allowed-tools:
  - bash
  - view
---

# Code Reviewer Skill

## Purpose
Reviews code for quality, security, performance in Repurpose context.

## When to Use

### Trigger Keywords
- review
- audit
- check code
- quality
- security review
- performance

### Typical Requests
- User mentions one of the trigger keywords
- Context matches Repurpose MVP patterns
- Task requires code-reviewer expertise

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
├── supabase.ts       # Database client
├── anthropic.ts      # OpenAI integration
├── qstash.ts         # Job scheduling
├── twitter.ts        # Twitter OAuth + posting
├── linkedin.ts       # LinkedIn OAuth + posting
├── design-tokens.ts  # COLOR_PRIMARY, etc.
└── rate-limit.ts     # Rate limiting config

components/            # React components
├── ui/               # shadcn/ui components
└── calendar/         # Custom calendar components
```

### Key Patterns

#### Design Tokens
```typescript
import { COLOR_PRIMARY, COLOR_AI, BUTTON_VARIANTS } from '@/lib/design-tokens'

// Usage
className={COLOR_PRIMARY.bg}           // bg-indigo-600
className={COLOR_AI.bg}               // bg-purple-600
className={BUTTON_VARIANTS.primary}   // Consistent button style
```

#### API Routes (Next.js 15)
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ErrorResponses.unauthorized()

  // 2. Rate limit
  const rateLimitResult = await checkRateLimit(identifier)
  if (!rateLimitResult.success) return ErrorResponses.rateLimited()

  // 3. Business logic
  const body = await request.json()
  // ...

  return NextResponse.json({ success: true, data })
}
```

#### Supabase Queries
```typescript
// With RLS (row-level security)
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)  // RLS enforces this automatically
  .order('created_at', { ascending: false })
```

#### OAuth Patterns
Follow `lib/twitter.ts` and `lib/linkedin.ts`:
- PKCE flow (code_verifier + code_challenge)
- State parameter validation
- Token storage in `social_accounts` table
- Token refresh logic

## Process

### Standard Workflow
1. **Understand Request**
   - Identify what user wants to build/analyze/test/review
   - Check for Repurpose-specific context clues
   - Determine complexity (simple vs. needs subagent)

2. **Provide Context**
   - Reference relevant Repurpose patterns
   - Point to similar implementations
   - Suggest templates or examples

3. **Decide: Direct or Delegate**
   - **Simple tasks** (<10 lines, single file): Handle directly
   - **Complex tasks** (multiple files, integration): Delegate to subagent

4. **Delegate to Subagent**
   Invoke built-in subagent for complex work:
   ```
   Use Task tool:
   Task(
     subagent_type='code-reviewer',
     prompt='[detailed task with Repurpose context]'
   )
   ```

5. **Validate & Present**
   - Verify solution works
   - Follow up with testing if needed
   - Present clear summary to user

## Repurpose-Specific Conventions

### File Naming
- **kebab-case** for files: `user-profile.tsx`, `api-route.ts`
- **PascalCase** for components: `UserProfile`, `DashboardLayout`
- **camelCase** for variables/functions: `getUserPosts`, `formatDate`

### Error Handling
```typescript
import { ErrorResponses } from '@/lib/api/errors'

// Standard error returns
return ErrorResponses.unauthorized()     // 401
return ErrorResponses.forbidden()        // 403
return ErrorResponses.notFound()         // 404
return ErrorResponses.missingField('email')  // 400
return ErrorResponses.internalError(details) // 500
```

### Logging
```typescript
import { logger } from '@/lib/logger'

logger.info('User action', { userId, action })
logger.error('Failed operation', { error, context })
```

## Examples from Repurpose

### Real Implementations
- **Interactive Calendar**: `app/dashboard/page.tsx` + `components/calendar/`
- **Batch Generation**: `lib/batch-generation.ts` + `app/batch-create/page.tsx`
- **OAuth Flows**: `lib/twitter.ts`, `lib/linkedin.ts` + `app/api/auth/`
- **Scheduling**: `app/api/schedule/route.ts` + `lib/qstash.ts`

### Common Tasks
- Adding new OAuth provider → Follow twitter.ts pattern
- New API endpoint → Use API route template above
- UI component → Use shadcn + design tokens
- Batch operation → See batch-generation.ts pattern

## Anti-Patterns to Avoid

❌ **Don't**: Hardcode colors/styles - use design tokens
❌ **Don't**: Skip RLS policies on Supabase queries
❌ **Don't**: Forget rate limiting on public endpoints
❌ **Don't**: Create OAuth flows from scratch - copy existing
❌ **Don't**: Skip error handling - use ErrorResponses
❌ **Don't**: Ignore TypeScript errors - fix them

✅ **Do**: Follow existing patterns in lib/ and app/
✅ **Do**: Use design tokens for consistent styling
✅ **Do**: Test locally before considering done
✅ **Do**: Reference similar features for guidance

## Output Format

### For Simple Tasks
Present code changes with brief explanation.

### For Complex Tasks (Delegated)
```markdown
## Task: [What was requested]

### Approach
[How we'll solve it]

### Repurpose Context Provided
- Template: [which template used]
- Pattern: [which pattern followed]
- Example: [similar feature referenced]

### Delegating to Subagent
Invoking code-reviewer subagent with Repurpose context...

[Subagent executes]

### Result
[Summary of what was built/analyzed/tested/reviewed]
```

## Next Steps

After completion, suggest:
- **If implemented**: "Should I create tests?" (→ test-validator)
- **If tested**: "Should I review for quality?" (→ code-reviewer)
- **If reviewed**: "Ready to commit and push?"

---

*This skill enhances the built-in code-reviewer subagent with Repurpose MVP-specific knowledge and patterns.*
