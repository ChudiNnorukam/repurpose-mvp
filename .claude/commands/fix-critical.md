# /fix-critical - Fix Critical Issues Only

Systematically fixes CRITICAL severity issues from AUDIT_REPORT.md

## What this command does:

1. Reads AUDIT_REPORT.md
2. Identifies all CRITICAL issues (CRIT-001, CRIT-002, etc.)
3. For each issue:
   - Shows problematic code
   - Explains what's wrong and why it's dangerous
   - Proposes minimal fix
   - **Waits for your approval**
   - Applies fix
   - Runs tests
   - Creates descriptive commit
4. Moves to next critical issue

## Safety Rules:

- ✅ Fixes ONE issue at a time
- ✅ Waits for approval before each fix
- ✅ Runs tests after EVERY change
- ✅ Creates separate commit per fix
- ✅ Uses `/rewind` if fix makes things worse
- ❌ NO refactoring - only fixes broken things

## Usage:

```
/fix-critical
```

## Interactive Flow:

```
Claude: "Found CRIT-001: Environment variables in git
Current: .env.local contains secrets
Fix: Add to .gitignore, remove from git, rotate keys
Approve? (y/n)"

You: "y"

Claude: [applies fix, runs tests]
"✅ Fix applied. Tests pass.
✅ Created commit: 'fix(security): remove secrets from git'
Ready for CRIT-002?"
```

## When to use:

- Before ANY production deployment
- After discovering new critical bugs
- When security audit identifies issues

## Note:

This command focuses ONLY on critical issues. For high/medium priority fixes, use `/refactor-safe` after critical issues are resolved.
