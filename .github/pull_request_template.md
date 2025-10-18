## Description

<!-- Brief description of what this PR does -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Dependency update

## Testing

<!-- Describe the tests you ran to verify your changes -->

- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npx playwright test`)
- [ ] Manual testing completed
- [ ] Tested on multiple browsers/devices (if UI change)

## Security Checklist

<!-- REQUIRED for changes to auth, API routes, or data handling -->

### General Security
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables used for sensitive data
- [ ] No commented-out authentication/authorization code
- [ ] Input validation implemented where applicable
- [ ] Error messages don't leak sensitive information

### Auth/API Changes (if applicable)
- [ ] Security expert review completed (for auth file changes)
- [ ] Reviewed `.claude/skills/_shared/security-checklist.md`
- [ ] researcher-expert invoked for OAuth/crypto implementations
- [ ] Tested auth flow end-to-end (login, logout, token refresh)
- [ ] RLS policies verified in Supabase
- [ ] Rate limiting considered

### Data Handling
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (DOMPurify for HTML, React escaping for text)
- [ ] CSRF protection (Next.js built-in for API routes)
- [ ] Proper CORS configuration

### Dependencies
- [ ] `npm audit` shows no HIGH/CRITICAL vulnerabilities
- [ ] New dependencies reviewed for license compatibility
- [ ] No unnecessary dependencies added

## Accessibility (if UI change)

- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Color contrast meets standards
- [ ] Focus indicators visible
- [ ] ARIA labels added where needed

## Performance (if applicable)

- [ ] No performance regressions
- [ ] Images optimized
- [ ] Code splitting used where appropriate
- [ ] Database queries optimized
- [ ] Caching strategy considered

## Documentation

- [ ] Code comments added for complex logic
- [ ] README updated (if public API changed)
- [ ] API documentation updated (if endpoints changed)
- [ ] Migration guide added (if breaking change)

## Screenshots/Videos (if UI change)

<!-- Add screenshots or videos demonstrating the changes -->

## Related Issues

<!-- Link to related issues: Fixes #123, Closes #456 -->

## Additional Notes

<!-- Any additional information reviewers should know -->

---

## Pre-merge Checklist (Reviewer)

- [ ] Code review completed
- [ ] Security validation checks passed
- [ ] No merge conflicts
- [ ] Branch up to date with main
- [ ] Approved by required reviewers

**Note**: If auth files changed (middleware.ts, lib/supabase*, app/api/auth/**), manual security review is REQUIRED before merge.
