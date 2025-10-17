# Repurpose MVP - Coding Conventions & Patterns

## Overview

This document defines coding conventions for the Repurpose MVP project to ensure consistency across all features.

---

## 1. API Route Conventions

### File Structure
```
app/api/
├── adapt/route.ts          # POST - Content adaptation
├── schedule/route.ts        # POST - Schedule posts
├── posts/
│   ├── route.ts            # GET - List posts
│   └── [id]/
│       ├── route.ts        # GET - Get single post
│       └── cancel/route.ts  # POST - Cancel scheduled post
└── auth/
    └── [provider]/
        ├── route.ts         # GET - Initiate OAuth
        └── callback/route.ts # GET - OAuth callback
```

### Standard API Route Pattern
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication (ALWAYS FIRST)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return ErrorResponses.unauthorized()

    // 2. Rate Limiting
    const identifier = getRateLimitIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(apiRateLimiter, identifier)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: '...' }, { status: 429 })
    }

    // 3. Parse and Validate Input
    const body = await request.json()
    if (!body.requiredField) {
      return ErrorResponses.missingField('requiredField')
    }

    // 4. Business Logic
    const result = await doWork(body, user.id)

    // 5. Success Response
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error in /api/endpoint:', error)
    return ErrorResponses.internalError(error.message)
  }
}
```

### Response Patterns
```typescript
// Success (200)
{ success: true, data: {...} }

// Validation Error (400)
{ error: 'Missing required field: platform', code: 'INVALID_INPUT' }

// Unauthorized (401)
{ error: 'Unauthorized', code: 'UNAUTHORIZED' }

// Rate Limited (429)
{ error: 'Rate limit exceeded. Try again after...', limit: 10, remaining: 0, reset: 1234567890 }

// Internal Error (500)
{ error: 'Internal server error', code: 'INTERNAL_ERROR', details: '...' }
```

---

## 2. Database Conventions

### Supabase Client Usage

**Server-Side (API Routes, Server Components)**:
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient() // async required
const { data, error } = await supabase.from('posts').select('*')
```

**Client-Side (Client Components)**:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient() // no await
const { data, error } = await supabase.from('posts').select('*')
```

**Admin Operations (bypass RLS)**:
```typescript
import { getSupabaseAdmin } from '@/lib/supabase'

const supabaseAdmin = getSupabaseAdmin()
const { data, error } = await supabaseAdmin.from('posts').update({...})
```

### Query Patterns

**Single Record**:
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', postId)
  .single() // Returns single object, not array
```

**List with Filtering**:
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)        // RLS enforces this
  .eq('status', 'scheduled')    // Additional filter
  .order('created_at', { ascending: false })
  .limit(50)
```

**Join Query**:
```typescript
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    social_accounts (
      platform,
      account_name
    )
  `)
  .eq('user_id', userId)
```

**Insert and Return**:
```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: userId,
    platform: 'twitter',
    adapted_content: content,
    status: 'draft'
  })
  .select()
  .single()
```

### Row-Level Security (RLS)

**Always enabled**: All tables have RLS policies that enforce user isolation.

**Policies**:
- `SELECT`: Users can only select their own rows (`user_id = auth.uid()`)
- `INSERT`: Users can only insert with their own `user_id`
- `UPDATE/DELETE`: Users can only modify their own rows

**Testing RLS**:
```typescript
// This will fail in production (RLS violation)
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', 'another-user-id') // ❌ RLS blocks this
```

---

## 3. TypeScript Conventions

### Type Definitions

**Location**: `lib/types.ts`

```typescript
// Platform Enum
export type Platform = 'twitter' | 'linkedin' | 'instagram'

// Tone Enum
export type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'

// Post Status
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'

// Database Types
export interface Post {
  id: string
  user_id: string
  platform: Platform
  original_content: string
  adapted_content: string
  scheduled_time: string | null
  status: PostStatus
  posted_at: string | null
  error_message: string | null
  qstash_message_id: string | null
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  access_token: string
  refresh_token: string
  expires_at: string
  account_id: string
  account_name: string
  created_at: string
}
```

### Type Guards
```typescript
export function isPlatform(value: any): value is Platform {
  return ['twitter', 'linkedin', 'instagram'].includes(value)
}

export function isPostStatus(value: any): value is PostStatus {
  return ['draft', 'scheduled', 'posted', 'failed'].includes(value)
}
```

---

## 4. Error Handling

### Error Response Utilities

**Location**: `lib/api/errors.ts`

```typescript
import { NextResponse } from 'next/server'

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_INPUT = 'INVALID_INPUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export const ErrorResponses = {
  unauthorized: () => NextResponse.json(
    { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
    { status: 401 }
  ),

  missingField: (field: string) => NextResponse.json(
    { error: `Missing required field: ${field}`, code: ErrorCode.INVALID_INPUT },
    { status: 400 }
  ),

  internalError: (details?: string) => NextResponse.json(
    {
      error: 'Internal server error',
      code: ErrorCode.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    { status: 500 }
  )
}
```

### Try-Catch Pattern
```typescript
try {
  const result = await riskyOperation()
  return NextResponse.json({ success: true, data: result })
} catch (error: any) {
  console.error('Error context:', error)
  
  // Specific error handling
  if (error.code === 'PGRST116') {
    return ErrorResponses.notFound('Resource not found')
  }
  
  return ErrorResponses.internalError(error.message)
}
```

---

## 5. Rate Limiting

### Configuration

**Location**: `lib/rate-limit.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// AI Adaptation: 10 requests per hour
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ai'
})

// API Endpoints: 30 requests per minute
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api'
})
```

### Usage Pattern
```typescript
import { checkRateLimit, apiRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const identifier = getRateLimitIdentifier(request, user.id) // IP + user ID
const result = await checkRateLimit(apiRateLimiter, identifier)

if (!result.success) {
  return NextResponse.json(
    {
      error: `Rate limit exceeded. Try again after ${new Date(result.reset).toLocaleTimeString()}.`,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset
    },
    { status: 429, headers: result.headers }
  )
}
```

---

## 6. OAuth Patterns

### PKCE Flow

**Initiation** (`app/api/auth/[provider]/route.ts`):
```typescript
// 1. Generate PKCE challenge
const codeVerifier = crypto.randomBytes(64).toString('base64url')
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url')

// 2. Generate state
const state = crypto.randomBytes(32).toString('hex')

// 3. Store in database (encrypted)
await supabase.from('oauth_sessions').insert({
  user_id: user.id,
  state,
  code_verifier: codeVerifier,
  expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
})

// 4. Build auth URL
const authUrl = new URL('https://provider.com/oauth/authorize')
authUrl.searchParams.set('client_id', process.env.PROVIDER_CLIENT_ID!)
authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/provider/callback`)
authUrl.searchParams.set('code_challenge', codeChallenge)
authUrl.searchParams.set('code_challenge_method', 'S256')
authUrl.searchParams.set('state', state)

return NextResponse.redirect(authUrl.toString())
```

**Callback** (`app/api/auth/[provider]/callback/route.ts`):
```typescript
// 1. Verify state
const { data: session } = await supabase
  .from('oauth_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('state', callbackState)
  .single()

if (!session || new Date(session.expires_at) < new Date()) {
  return NextResponse.redirect(new URL('/connections?error=invalid_state', request.url))
}

// 2. Exchange code for tokens
const tokenResponse = await fetch('https://provider.com/oauth/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: callbackCode,
    code_verifier: session.code_verifier,
    client_id: process.env.PROVIDER_CLIENT_ID!,
    client_secret: process.env.PROVIDER_CLIENT_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/provider/callback`
  })
})

// 3. Store tokens
await supabase.from('social_accounts').upsert({
  user_id: user.id,
  platform: 'provider',
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
})
```

---

## 7. QStash Job Scheduling

### Schedule Job
```typescript
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

// Calculate delay
const scheduledDate = new Date(scheduledTime)
const delay = Math.floor((scheduledDate.getTime() - Date.now()) / 1000)

if (delay <= 0) {
  throw new Error('Scheduled time must be in the future')
}

// Schedule job
const { messageId } = await qstash.publishJSON({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/post/execute`,
  body: {
    postId,
    userId,
    platform
  },
  delay // seconds
})

// Store message ID for cancellation
await supabase
  .from('posts')
  .update({ qstash_message_id: messageId })
  .eq('id', postId)
```

### Job Execution Handler
```typescript
// Verify signature
const signature = request.headers.get('upstash-signature')
const isValid = await qstash.verify({
  signature: signature!,
  body: await request.text()
})

if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

---

## 8. Design System

### Colors (Design Tokens)

**Location**: `lib/design-tokens.ts`

```typescript
export const COLOR_PRIMARY = {
  bg: 'bg-blue-600',
  bgHover: 'hover:bg-blue-700',
  text: 'text-blue-600',
  border: 'border-blue-600',
  bgLight: 'bg-blue-50'
}

export const COLOR_SUCCESS = {
  bg: 'bg-green-600',
  bgHover: 'hover:bg-green-700',
  text: 'text-green-600',
  border: 'border-green-600',
  bgLight: 'bg-green-50'
}

export const COLOR_AI = {
  bg: 'bg-purple-600',
  bgHover: 'hover:bg-purple-700',
  text: 'text-purple-600',
  border: 'border-purple-600',
  bgLight: 'bg-purple-50'
}
```

### Component Variants
```typescript
export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
}
```

---

## 9. File Organization

### Component Structure
```
components/
├── ui/                      # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── layout/                  # Layout components
│   ├── AppHeader.tsx
│   ├── AppSidebar.tsx
│   └── AppFooter.tsx
├── posts/                   # Feature-specific components
│   ├── PostCard.tsx
│   ├── PostList.tsx
│   └── PostForm.tsx
└── calendar/                # Calendar feature
    ├── CalendarGrid.tsx
    ├── CalendarDay.tsx
    └── PostCard.tsx
```

### Naming Conventions
- **Components**: PascalCase (`PostCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`PLATFORM_LIMITS`)
- **Types**: PascalCase (`type Post = {...}`)

---

## 10. Testing Conventions

### Unit Tests
**Location**: `lib/__tests__/`

```typescript
describe('OAuth Helpers', () => {
  it('should generate valid PKCE challenge', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    
    expect(codeVerifier).toHaveLength(128)
    expect(codeChallenge).toHaveLength(43)
  })
})
```

### E2E Tests
**Location**: `tests/`

```typescript
test('user can schedule post', async ({ page }) => {
  await page.goto('/create')
  await page.fill('textarea[name=content]', 'Test post')
  await page.click('button:has-text("Schedule")')
  
  await expect(page.locator('.success-message')).toBeVisible()
})
```

---

## 11. Environment Variables

### Naming Convention
```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_APP_URL=...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
TWITTER_CLIENT_SECRET=...
```

### Usage
```typescript
// Client-side
const appUrl = process.env.NEXT_PUBLIC_APP_URL

// Server-side
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

---

## 12. Git Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance tasks

### Examples
```
feat(oauth): Add Instagram OAuth integration

- Implement PKCE flow
- Add token refresh logic
- Store tokens securely

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Summary Checklist

✅ **API Routes**:
- [ ] Auth first
- [ ] Rate limiting
- [ ] Validate input
- [ ] Use ErrorResponses

✅ **Database**:
- [ ] Use correct Supabase client (server vs client)
- [ ] Trust RLS policies
- [ ] Include `.single()` for single records

✅ **Types**:
- [ ] Define in lib/types.ts
- [ ] Use type guards for enums

✅ **OAuth**:
- [ ] Use PKCE flow
- [ ] Verify state parameter
- [ ] Encrypt tokens
- [ ] Handle expiration

✅ **Naming**:
- [ ] PascalCase components
- [ ] camelCase utilities
- [ ] UPPER_SNAKE_CASE constants

✅ **Design**:
- [ ] Use design tokens
- [ ] Follow WCAG 2.1 AA
- [ ] Mobile-first responsive

---

**Last Updated**: October 17, 2025
