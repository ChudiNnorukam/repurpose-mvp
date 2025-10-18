# Auto-Fallback to researcher-expert

**Purpose**: Automatic fallback mechanism to prevent agents from getting stuck, fabricating information, or making assumptions without authoritative sources.

---

## When to Auto-Invoke researcher-expert

Any agent MUST invoke researcher-expert when **ANY** of these conditions are met:

### Trigger Conditions

✅ **Stuck Condition**: Failed 2+ times on same task
- Error loop detected
- Same error message recurring
- Implementation attempt fails repeatedly

✅ **Unknown Pattern**: Unfamiliar library, API, or framework
- Never worked with this technology before
- No template or example exists in skills/
- Documentation not in codebase

✅ **Security Domain**: Auth, OAuth, tokens, encryption, RLS
- Authentication implementation
- Authorization logic
- Token storage/refresh
- Encryption/hashing
- Row Level Security policies

✅ **Standards Compliance**: RFC, WCAG, GDPR, platform policies
- Implementing standards-based protocol
- Accessibility requirements
- Privacy compliance
- Platform API terms (Twitter, LinkedIn, Instagram)

✅ **No Authoritative Source**: Making recommendation without cited source
- Claiming "best practice" without reference
- Recommending approach without documentation
- Suggesting pattern without example

✅ **Low Confidence**: Unsure about implementation approach (confidence < 0.7)
- Multiple valid approaches exist
- Uncertain about trade-offs
- Need to compare options

---

## OWASP Top-10 Security Triggers (HIGH PRIORITY)

Auto-invoke researcher-expert + mandatory security review when **ANY** of these OWASP conditions are met:

### 🔴 A1 - Broken Access Control (CRITICAL)

✅ **Trigger when**:
- Implementing authentication/authorization logic
- Adding protected routes or API endpoints
- Modifying `middleware.ts` or RLS policies
- User permission checks or role-based access
- Session management changes
- Creating/modifying security contexts

**Required action**: Invoke researcher-expert for auth patterns + OWASP A1 best practices

---

### 🔴 A2 - Cryptographic Failures (CRITICAL)

✅ **Trigger when**:
- Token storage implementation (OAuth, session, JWT)
- Secret/credential handling or .env changes
- Encryption/hashing operations
- Cookie configuration (HttpOnly, Secure, SameSite)
- Implementing password handling
- Key management or rotation

**Required action**: Invoke researcher-expert for crypto standards + OWASP A2 guidelines

---

### 🔴 A3 - Injection (CRITICAL)

✅ **Trigger when**:
- Processing user input (forms, query params, request body)
- Generating HTML/SVG/XML dynamically
- AI-generated content rendering to browser
- Database queries (even with Supabase - verify RLS + sanitization)
- File uploads or path construction
- Command execution or shell operations

**Required action**: Invoke researcher-expert for input validation + OWASP A3 prevention

---

### 🟡 A5/A7 - Dependencies & Security Misconfiguration (HIGH)

✅ **Trigger when**:
- Adding new npm packages to package.json
- Updating package-lock.json or dependencies
- Changing environment variables or .env files
- Modifying security configs (CORS, CSP, headers)
- Changing build/deployment configurations
- Updating Node version or runtime

**Required action**: Invoke researcher-expert for dependency audit + OWASP A5/A7 checks

---

### 🟢 A10 - Logging & Monitoring Failures (MEDIUM)

✅ **Trigger when**:
- Implementing auth flows (login, OAuth, password reset)
- Sensitive operations (account changes, permission grants)
- Payment or financial transactions
- Failed authentication attempts
- Rate limit breaches
- Security event detection

**Required action**: Invoke researcher-expert for audit logging + OWASP A10 requirements

---

### Security Research Mode

When OWASP trigger activated:
1. **Minimum CRAAP Score**: 4.0 (vs standard 3.2)
2. **Required Source Types**: Official specs, vendor docs, OWASP guides, security RFCs
3. **Citation Verification**: Mandatory snippet + fetch date
4. **Human Review**: Flag for security expert review in telemetry

---

## Invocation Template

When trigger condition met, use this exact pattern:

STOP. Before proceeding, I need to invoke researcher-expert to gather authoritative sources.

**Reason**: [state which trigger condition(s) met]

**What I tried**: [attempts made, errors encountered]

**What I need**: [specific sources or information required]

Then invoke using Task tool.

---

## Pre-Output Self-Check

Before returning ANY output, verify all delegation, citation, error recovery, and common questions.

See `.claude/skills/_shared/pre-output-checklist.md` for complete checklist.
