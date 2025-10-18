# Security Pre-Output Checklist (OWASP Top-10)

**Purpose**: Comprehensive security validation checklist for all agents working on security-sensitive code.

**When to use**: Automatically triggered when any OWASP condition detected in auto-fallback-pattern.md

**Minimum passing score**: All 🔴 CRITICAL items must pass, ≥80% of 🟡 HIGH items must pass

---

## 🔴 A1 - Broken Access Control (CRITICAL)

**Applies when**: Auth/authz implementation, protected routes, middleware, RLS policies, permissions

### Required Checks (ALL must pass)

- [ ] **Authentication verification present**
  - Every protected endpoint checks `supabase.auth.getUser()`
  - Returns 401 for missing/invalid auth
  - No anonymous access to protected resources

- [ ] **User ID validation enforced**
  - Database queries filter by `user_id` from auth session
  - No user impersonation possible (hardcoded IDs, URL params)
  - RLS policies enforce user isolation

- [ ] **Authorization logic correct**
  - Role checks use session data, not user input
  - Permission grants verified before actions
  - Least privilege principle applied

- [ ] **Protected routes configured**
  - `middleware.ts` includes all protected paths
  - Unauthenticated users redirected to login
  - No bypass routes discovered

- [ ] **Session security implemented**
  - Session tokens are HttpOnly, Secure, SameSite
  - Token expiration enforced
  - Logout invalidates sessions properly

### Common Vulnerabilities to Avoid

❌ **Don't**:
- Trust user input for authorization decisions
- Use client-side auth checks only
- Hardcode user IDs or roles
- Skip auth checks assuming middleware handles it
- Allow access based on URL knowledge alone

✅ **Do**:
- Verify auth on every request
- Use RLS policies as defense-in-depth
- Log all authorization failures
- Test with different user accounts
- Implement fail-secure (deny by default)

### Required Authoritative Sources

Minimum 2 sources with CRAAP ≥ 4.0:
- [ ] OWASP Top 10 A1 official documentation
- [ ] Supabase RLS best practices
- [ ] Next.js middleware auth patterns
- [ ] Framework-specific auth guides

---

## 🔴 A2 - Cryptographic Failures (CRITICAL)

**Applies when**: Token storage, secrets, encryption, hashing, cookies, key management

### Required Checks (ALL must pass)

- [ ] **No secrets in code**
  - All secrets in environment variables
  - No hardcoded API keys, tokens, passwords
  - `.env` not committed to git
  - Secrets rotation plan documented

- [ ] **Secure token storage**
  - OAuth tokens encrypted in database
  - Refresh tokens stored securely
  - No tokens in localStorage (use HttpOnly cookies)
  - Token expiration enforced

- [ ] **Proper encryption algorithms**
  - Use AES-256-GCM or equivalent for data
  - bcrypt/argon2 for passwords (min cost 10)
  - TLS 1.3 for transport
  - No deprecated algorithms (MD5, SHA1, DES)

- [ ] **Cookie security configured**
  - HttpOnly flag set (prevent XSS)
  - Secure flag set (HTTPS only)
  - SameSite=Strict or Lax (CSRF protection)
  - Appropriate expiration times

- [ ] **Key management**
  - Keys rotated periodically
  - Separate keys for dev/staging/prod
  - Keys not derived from predictable values
  - Backup/recovery process documented

### Common Vulnerabilities to Avoid

❌ **Don't**:
- Store tokens in localStorage
- Use weak hashing (MD5, SHA1)
- Hardcode encryption keys
- Reuse keys across environments
- Store passwords in plaintext

✅ **Do**:
- Use environment variables for secrets
- Implement token rotation
- Use strong encryption standards
- Log crypto failures for monitoring
- Encrypt sensitive data at rest

### Required Authoritative Sources

Minimum 2 sources with CRAAP ≥ 4.0:
- [ ] OWASP Cryptographic Storage Cheat Sheet
- [ ] NIST cryptographic standards
- [ ] OAuth 2.0 RFC 6749 (for tokens)
- [ ] Platform-specific crypto guides (Supabase)

---

## 🔴 A3 - Injection (CRITICAL)

**Applies when**: User input processing, dynamic content, database queries, file operations, AI-generated content

### Required Checks (ALL must pass)

- [ ] **Input validation implemented**
  - All user input validated on server side
  - Type checking enforced (string, number, enum)
  - Length limits enforced
  - Allowlist validation preferred over blocklist

- [ ] **XSS prevention**
  - React automatic escaping verified
  - No `dangerouslySetInnerHTML` without sanitization
  - AI-generated content sanitized before rendering
  - Content-Security-Policy headers configured

- [ ] **SQL injection prevention**
  - Parameterized queries used (Supabase handles this)
  - RLS policies verified
  - No string concatenation for queries
  - Input sanitized even with ORM

- [ ] **Command injection prevention**
  - No user input in shell commands
  - File paths validated (no ../ traversal)
  - Allowlist of permitted operations
  - Use library functions over shell execution

- [ ] **AI content safety**
  - AI-generated content validated before use
  - Prompt injection resistance checked
  - Output sanitized for target platform
  - Content length limits enforced

### Common Vulnerabilities to Avoid

❌ **Don't**:
- Trust any user input
- Concatenate strings for queries
- Use `eval()` or `Function()` on user data
- Allow arbitrary file paths
- Render AI output without validation

✅ **Do**:
- Validate all inputs server-side
- Use parameterized queries
- Sanitize output for context (HTML, URL, SQL)
- Implement CSP headers
- Test with malicious input samples

### Required Authoritative Sources

Minimum 2 sources with CRAAP ≥ 4.0:
- [ ] OWASP XSS Prevention Cheat Sheet
- [ ] OWASP SQL Injection Prevention
- [ ] React security best practices
- [ ] AI prompt injection research papers

---

## 🟡 A5/A7 - Dependencies & Security Misconfiguration (HIGH)

**Applies when**: Adding packages, updating dependencies, changing configs, environment variables

### Required Checks (≥80% must pass)

- [ ] **Dependency vulnerability scan**
  - `npm audit` run and reviewed
  - No critical or high severity vulnerabilities
  - Outdated packages updated
  - Unused dependencies removed

- [ ] **Package verification**
  - Packages from trusted registries (npm)
  - Package popularity/maintenance checked
  - License compatibility verified
  - No typosquatting packages

- [ ] **Security headers configured**
  - Content-Security-Policy set
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security enabled

- [ ] **CORS properly configured**
  - Specific origins allowlisted (no *)
  - Credentials handled securely
  - Preflight requests validated

- [ ] **Environment isolation**
  - Separate .env for dev/staging/prod
  - Production secrets never in dev
  - Debug mode disabled in production
  - Error messages sanitized (no stack traces)

- [ ] **Build configuration**
  - Source maps disabled in production
  - Minification enabled
  - Dead code elimination enabled
  - Security linters configured

### Common Vulnerabilities to Avoid

❌ **Don't**:
- Use packages with known vulnerabilities
- Allow CORS from * in production
- Commit .env files
- Enable debug mode in production
- Skip dependency updates

✅ **Do**:
- Run npm audit regularly
- Review dependency changes
- Configure security headers
- Separate environments
- Automate security scanning

### Required Authoritative Sources

Minimum 1 source with CRAAP ≥ 4.0:
- [ ] OWASP Security Misconfiguration
- [ ] npm security best practices
- [ ] Next.js security headers guide
- [ ] Snyk/Dependabot security advisories

---

## 🟢 A10 - Logging & Monitoring Failures (MEDIUM)

**Applies when**: Auth flows, sensitive operations, security events, error handling

### Required Checks (≥60% should pass)

- [ ] **Authentication events logged**
  - Successful logins logged
  - Failed login attempts tracked
  - Password resets logged
  - Account changes audited

- [ ] **Security events captured**
  - Authorization failures logged
  - Rate limit violations tracked
  - Suspicious activity flagged
  - Input validation failures logged

- [ ] **Sensitive operations audited**
  - Permission grants/revocations logged
  - Configuration changes tracked
  - Admin actions audited
  - Data export/deletion logged

- [ ] **Error handling proper**
  - Errors logged with context
  - No sensitive data in logs
  - Stack traces sanitized in production
  - Error rates monitored

- [ ] **Monitoring configured**
  - Alerting on anomalies
  - Dashboard for security metrics
  - Log retention policy defined
  - Incident response plan exists

- [ ] **Audit trail integrity**
  - Logs tamper-resistant
  - Timestamps accurate
  - User attribution correct
  - Retention meets compliance

### Common Vulnerabilities to Avoid

❌ **Don't**:
- Log passwords or tokens
- Ignore failed auth attempts
- Disable error logging
- Store logs insecurely
- Skip monitoring setup

✅ **Do**:
- Log security-relevant events
- Monitor for anomalies
- Protect log integrity
- Implement retention policies
- Alert on critical events

### Required Authoritative Sources

Minimum 1 source with CRAAP ≥ 4.0:
- [ ] OWASP Logging Cheat Sheet
- [ ] Security logging best practices
- [ ] Incident response frameworks
- [ ] Compliance requirements (if applicable)

---

## Pre-Output Validation Summary

Before returning security-sensitive code:

### Critical Checks (100% required)
- [ ] All 🔴 CRITICAL items passed (A1, A2, A3)
- [ ] Authoritative sources cited (min CRAAP 4.0)
- [ ] researcher-expert invoked for unfamiliar patterns
- [ ] Code manually reviewed for common vulnerabilities

### High Priority Checks (≥80% required)
- [ ] 🟡 HIGH items mostly passed (A5/A7)
- [ ] Security headers configured
- [ ] Dependencies scanned
- [ ] Environment variables secured

### Medium Priority Checks (≥60% recommended)
- [ ] 🟢 MEDIUM items passed (A10)
- [ ] Logging implemented
- [ ] Monitoring planned
- [ ] Audit trail configured

### Documentation Required
- [ ] Security decisions documented
- [ ] Trade-offs explained
- [ ] Threat model considered
- [ ] Testing plan included

---

## Failure Conditions

**BLOCK output if**:
- Any 🔴 CRITICAL check fails
- No authoritative sources cited
- Hardcoded secrets detected
- Auth bypass possible

**WARN if**:
- <80% 🟡 HIGH checks passed
- Outdated dependencies found
- Missing security headers
- No logging implemented

**Document for review if**:
- Novel security pattern used
- Trade-offs made for usability
- Compliance requirements involved
- High-risk operation implemented

---

## Quick Reference: Common Security Patterns

### Supabase Auth Pattern
```typescript
// ✅ CORRECT
const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return ErrorResponses.unauthorized()

// ❌ WRONG
const userId = request.headers.get('user-id') // Trust user input
```

### Token Storage Pattern
```typescript
// ✅ CORRECT - Encrypted in database
await supabase.from('social_accounts').insert({
  user_id: user.id,
  platform: 'twitter',
  access_token: encrypt(token), // Encrypted
  refresh_token: encrypt(refreshToken)
})

// ❌ WRONG - Plaintext in localStorage
localStorage.setItem('token', accessToken)
```

### Input Validation Pattern
```typescript
// ✅ CORRECT - Server-side validation
const schema = z.object({
  content: z.string().min(1).max(280),
  platform: z.enum(['twitter', 'linkedin'])
})
const validated = schema.parse(body)

// ❌ WRONG - No validation
const { content, platform } = body // Trust user input
```

### RLS Policy Pattern
```sql
-- ✅ CORRECT - User isolation enforced
CREATE POLICY "Users can only see own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- ❌ WRONG - No isolation
CREATE POLICY "Anyone can see posts"
ON posts FOR SELECT
USING (true);
```

---

**File**: `.claude/skills/_shared/security-checklist.md`  
**Version**: 1.0.0  
**Last Updated**: October 17, 2025  
**Maintained by**: Repurpose MVP Security Team  
**Reference**: OWASP Top 10 2021
