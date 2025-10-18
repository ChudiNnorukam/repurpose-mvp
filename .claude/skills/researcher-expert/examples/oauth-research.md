# Example Research Output: OAuth PKCE Implementation

## Research Question
"Find authoritative sources for implementing OAuth PKCE with token refresh in Next.js 15 + Supabase for Twitter integration"

## Executive Summary
OAuth PKCE (RFC 7636) is the recommended flow for public clients. Twitter API v2 requires PKCE. Key sources: IETF RFC 7636 (standard), Twitter Developer Docs (vendor implementation), Supabase Auth Guide (integration pattern), and Next.js Auth Examples (framework pattern). All sources recommend state parameter for CSRF protection and refresh tokens for long-lived access.

## Top Sources

### 1. RFC 7636: Proof Key for Code Exchange (PKCE)
- **URL**: https://tools.ietf.org/html/rfc7636
- **Type**: Specification
- **Score**: 5.0 (C:5, R:5, A:5, Ac:5, P:5)
- **Why**: Official IETF standard defining PKCE protocol
- **Snippet**: "OAuth 2.0 public clients utilizing the Authorization Code Grant are susceptible to the authorization code interception attack. This specification describes the attack as well as a technique to mitigate against the threat through the use of Proof Key for Code Exchange (PKCE)."
- **Fetch Date**: 2025-10-17
- **Key Takeaways**:
  - Use SHA256 for code_challenge (required by Twitter)
  - Store code_verifier securely (database, encrypted)
  - code_challenge_method must be 'S256'

### 2. Twitter API v2 OAuth 2.0 Documentation
- **URL**: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- **Type**: Vendor Documentation
- **Score**: 4.9 (C:5, R:5, A:5, Ac:5, P:4)
- **Why**: Official Twitter implementation requirements
- **Snippet**: "Twitter requires all OAuth 2.0 implementations to use PKCE. The authorization code flow with PKCE is recommended for applications that can securely store a client secret."
- **Fetch Date**: 2025-10-17
- **Key Takeaways**:
  - Scopes: tweet.read, tweet.write, users.read
  - Token expiration: 2 hours (refresh required)
  - PKCE required (no exception)

### 3. Supabase Auth Documentation - OAuth
- **URL**: https://supabase.com/docs/guides/auth/social-login
- **Type**: Vendor Documentation
- **Score**: 4.6 (C:5, R:4, A:5, Ac:5, P:4)
- **Why**: Supabase-specific OAuth integration patterns
- **Snippet**: "Supabase Auth supports OAuth with custom providers. Store OAuth credentials in the auth.identities table for automatic token refresh."
- **Fetch Date**: 2025-10-17
- **Key Takeaways**:
  - Store tokens in social_accounts table (custom)
  - Use Supabase RLS for user isolation
  - Refresh tokens automatically if using Supabase Auth

### 4. Next.js Authentication Patterns
- **URL**: https://nextjs.org/docs/app/building-your-application/authentication
- **Type**: Framework Documentation
- **Score**: 4.5 (C:5, R:4, A:5, Ac:4, P:5)
- **Why**: Next.js App Router authentication patterns
- **Snippet**: "Use Server Actions for authentication flows. Store session tokens in HTTP-only cookies for security."
- **Fetch Date**: 2025-10-17
- **Key Takeaways**:
  - API Routes for OAuth callbacks
  - Server Components for token validation
  - Middleware for protected routes

### 5. Auth0 OAuth 2.0 Best Practices
- **URL**: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce
- **Type**: Vendor Guide (Secondary)
- **Score**: 4.2 (C:4, R:4, A:5, Ac:4, P:3)
- **Why**: Comprehensive PKCE implementation guide
- **Snippet**: "PKCE-enhanced Authorization Code Flow introduces a secret created by the calling application that can be verified by the authorization server."
- **Fetch Date**: 2025-10-17
- **Key Takeaways**:
  - Generate code_verifier: 43-128 chars, crypto-random
  - Store verifier securely until callback
  - Validate state parameter

## Evidence Table

| Source | Standard | Vendor | Pattern | Security | Performance |
|--------|----------|--------|---------|----------|-------------|
| RFC 7636 | ✅ PKCE spec | - | - | ✅ CSRF mitigation | - |
| Twitter Docs | - | ✅ API requirements | - | ✅ 2hr expiration | - |
| Supabase | - | ✅ Integration | ✅ RLS pattern | ✅ Token storage | - |
| Next.js | - | - | ✅ API Routes | ✅ HTTP-only cookies | - |
| Auth0 | ✅ Best practices | - | ✅ Flow diagram | ✅ Crypto-random | - |

## Search Log

### Queries Executed
1. **"RFC 7636 PKCE OAuth 2.0"**
   - Results: 45
   - Selected: 1 (RFC 7636)

2. **site:developer.twitter.com "OAuth 2.0 PKCE"**
   - Results: 12
   - Selected: 2 (OAuth docs, API reference)

3. **site:supabase.com "OAuth Next.js"**
   - Results: 8
   - Selected: 1 (Social login guide)

4. **"Next.js 15 authentication OAuth best practices"**
   - Results: 35
   - Selected: 2 (Next.js docs, Auth patterns)

5. **"OAuth PKCE implementation security 2024"**
   - Results: 50
   - Selected: 2 (Auth0 guide, OWASP)

### PRISMA Flow
- **Identified**: 150 results
- **Screened**: 45 (title/abstract review)
- **Fetched**: 15 (full text)
- **Scored**: 15 (CRAAP rubric)
- **Included**: 8 (score ≥3.2)

## Coverage Gaps

1. **Missing**: Supabase-specific PKCE implementation example
   - **Impact**: Medium (can adapt from generic pattern)
   - **Mitigation**: Reference Supabase GitHub examples

2. **Missing**: Production-scale token refresh patterns
   - **Impact**: Low (well-documented in RFC + vendor docs)
   - **Mitigation**: Implement with exponential backoff

3. **Missing**: Error handling for Twitter API rate limits
   - **Impact**: Medium (critical for production)
   - **Mitigation**: Check Twitter API error codes documentation

## Implementation Checklist

Based on research findings:

- [ ] Generate code_verifier (43-128 chars, crypto-random)
- [ ] Hash code_verifier with SHA256 → code_challenge
- [ ] Store code_verifier + state in database (encrypted)
- [ ] Redirect to Twitter OAuth with code_challenge + state
- [ ] Validate state parameter in callback
- [ ] Exchange code + code_verifier for tokens
- [ ] Store access_token + refresh_token in social_accounts table
- [ ] Implement token refresh before 2hr expiration
- [ ] Add error handling for rate limits
- [ ] Implement RLS policies for user isolation

## Time Breakdown
- **Query generation**: 2 minutes
- **Search execution**: 5 minutes
- **Source fetching**: 8 minutes
- **Scoring + analysis**: 5 minutes
- **Documentation**: 5 minutes
- **Total**: 25 minutes

## Next Steps for User
1. Review RFC 7636 sections 4.1-4.6 (PKCE flow)
2. Check Twitter scopes (tweet.read, tweet.write)
3. Decide: Use Supabase Auth OAuth or custom implementation?
4. Confirm: Store tokens in social_accounts table or auth.identities?
