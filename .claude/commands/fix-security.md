# /fix-security - Fix Security Vulnerabilities

Focuses on fixing security-related issues (auth, OAuth, secrets, input validation)

## What this command does:

1. Identifies security issues from audit:
   - Authentication bypass vulnerabilities
   - OAuth implementation flaws
   - Missing input sanitization
   - Exposed secrets
   - SQL injection risks
   - XSS vulnerabilities
   - CSRF risks

2. For each security issue:
   - Explains the attack vector
   - Shows how it could be exploited
   - Proposes secure fix
   - **Waits for approval**
   - Implements fix
   - Adds security tests
   - Commits with clear message

## Security Categories:

### Authentication & Authorization
- Missing auth checks on API routes
- Insufficient permission validation
- Session management flaws

### OAuth & Tokens
- Insecure PKCE implementation
- Token storage issues
- Refresh token handling

### Input Validation
- Missing sanitization
- No length limits
- Prompt injection risks

### Secrets Management
- Hardcoded credentials
- Environment variables in git
- API key exposure

## Usage:

```
/fix-security
```

## Example:

```
Claude: "SEC-001: Missing authentication on /api/adapt

Risk: Anyone can call this endpoint and consume OpenAI credits
Attack: curl https://your-app.com/api/adapt -d '{...}'

Current code (line 7):
  export async function POST(request: NextRequest) {
    const body = await request.json()  // ❌ No auth check

Proposed fix:
  import { createClient } from '@/lib/supabase/server'

  export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Continue with existing logic...

Approve? (y/n)"
```

## When to use:

- Before production deployment
- After security audit
- When handling sensitive user data
- After adding new API endpoints

## Verification:

After fixes are applied:
1. Tests pass
2. Security tests added
3. No new vulnerabilities introduced
4. Auth flows still work correctly
