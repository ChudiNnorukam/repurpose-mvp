# /audit - Code Quality Audit

Re-runs comprehensive code audit and updates AUDIT_REPORT.md

## What this command does:

1. Scans entire codebase for issues:
   - Critical security vulnerabilities
   - Functional bugs
   - Code quality problems
   - Style inconsistencies
   - Testing gaps

2. Updates AUDIT_REPORT.md with:
   - New issues found
   - Fixed issues removed
   - Updated severity ratings
   - Complexity estimates

3. Compares to previous audit:
   - Shows improvements
   - Highlights new issues
   - Tracks progress

## Usage:

```
/audit
```

## When to use:

- After completing a refactoring phase
- Before deploying to production
- After adding new features
- Weekly code health check

## Output:

- Updated AUDIT_REPORT.md
- Summary of changes since last audit
- Count of issues by severity
