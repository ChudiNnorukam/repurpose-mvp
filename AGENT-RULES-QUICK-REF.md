# Agent Orchestration Rules - Quick Reference

**Version**: 2.1.0
**Last Updated**: October 13, 2025

---

## 🎯 Quick Decision Tree

```
User Request
    ↓
Does it match keywords?
    ├─ "implement", "feature", "add", "create", "build"
    │   → feature-implementer
    │       → (auto) test-validator
    │       → (auto) code-reviewer
    │
    ├─ "test", "verify", "edge cases", "coverage"
    │   → test-validator
    │       → (no auto-chain)
    │
    ├─ "review", "audit", "refactor", "optimize"
    │   → code-reviewer
    │       → (no auto-chain)
    │
    └─ Small change (< 10 lines) or docs/config?
        → Handle directly (no agents)
```

---

## 🤖 Active Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **feature-implementer** | Implements features/endpoints | New functionality, API routes, utilities |
| **test-validator** | Writes/validates tests | Test coverage, edge cases, E2E flows |
| **code-reviewer** | Reviews quality/security | Audits, refactoring, optimization |

---

## ⚡ The 5 Rules

### Rule 1: Keyword Matching
Match user prompt keywords to agents:
- **implement, feature, add, create, build** → `feature-implementer`
- **test, verify, edge cases, coverage** → `test-validator`
- **review, audit, refactor, optimize** → `code-reviewer`

### Rule 2: Auto-Chaining
After `feature-implementer` completes:
1. ✅ Auto-invoke `test-validator`
2. ✅ Auto-invoke `code-reviewer`

Result: Complete package (code + tests + review)

### Rule 3: Skip for Trivial
Skip all agents for:
- Bugfixes < 10 lines
- Documentation updates
- Config changes
- Quick refactors (if tests exist)

### Rule 4: Minimal Context
Between agent handoffs, pass:
- ✅ File paths, function names, requirements
- ❌ NOT: Full file contents, entire codebase

Example: "Review app/api/schedule/route.ts lines 50-100"

### Rule 5: Parallel Execution
For independent tasks, run agents in parallel:
```
Task: "Add Twitter and LinkedIn OAuth"
  ↓
feature-implementer (Twitter) || feature-implementer (LinkedIn)
  ↓ (both complete)
test-validator → code-reviewer
```

---

## 📋 Examples

### Example 1: New Feature (Full Chain)
```
User: "Implement Instagram OAuth"

1. feature-implementer
   - Generates: lib/instagram.ts, app/api/auth/instagram/*.ts

2. test-validator (auto)
   - Generates: lib/__tests__/instagram.test.ts

3. code-reviewer (auto)
   - Audits: Security, patterns, best practices
```

### Example 2: Bug Fix (No Agents)
```
User: "Fix timezone bug in scheduling"

Claude handles directly:
- Read app/create/page.tsx
- Fix datetime-local min attribute (5 lines)
- Commit
```

### Example 3: Tests Only (No Chain)
```
User: "Test the scheduling flow"

1. test-validator
   - Generates: lib/__tests__/schedule.test.ts

(No auto-chain since no new feature code)
```

### Example 4: Review Only (No Chain)
```
User: "Review the auth code for security issues"

1. code-reviewer
   - Audits: app/api/auth/**/*.ts
   - Reports: Findings + recommendations

(No auto-chain)
```

---

## 🔧 Agent Invocation Syntax

### feature-implementer
```typescript
Task: "Implement [feature name]"

Requirements:
- [Requirement 1]
- [Requirement 2]

Patterns to follow:
- [Reference file.ts]

Output:
- [Expected files]
```

### test-validator
```typescript
Task: "Write tests for [module/feature]"

Requirements:
- 95% coverage minimum
- Test: happy path, edge cases, errors
- Mock external dependencies

Target:
- [File to test]
```

### code-reviewer
```typescript
Task: "Review [module/feature]"

Focus:
- Security vulnerabilities
- Code patterns adherence
- Performance issues
- Best practices

Target:
- [Files to review]
```

---

## 🚦 When NOT to Use Agents

❌ **Skip agents for**:
- Line count < 10
- Only changing comments/docs
- Only changing config (package.json, .env, etc.)
- Only changing imports
- Only fixing typos
- Only updating version numbers

✅ **Use agents for**:
- New features (any size)
- New endpoints/routes
- New utilities/helpers
- Refactoring > 10 lines
- Security-related changes
- Performance optimizations

---

## 📊 Agent Chaining Matrix

| Initial Agent | Auto-Chain 1 | Auto-Chain 2 | Reason |
|--------------|--------------|--------------|--------|
| feature-implementer | test-validator | code-reviewer | New code needs tests + review |
| test-validator | ❌ None | ❌ None | Only tests, no new features |
| code-reviewer | ❌ None | ❌ None | Review only, no new code |

---

## 💡 Pro Tips

1. **Be specific in prompts**: "Implement Instagram OAuth" is better than "Add Instagram"

2. **Reference existing patterns**: "Follow lib/twitter.ts pattern" helps consistency

3. **Specify test requirements**: "Include edge cases for expired tokens" gets better tests

4. **Skip when obvious**: For 1-line fixes, just fix it. Don't overthink.

5. **Use parallel for independence**: "Add Twitter and LinkedIn OAuth" → run in parallel

6. **Trust the chain**: After feature-implementer, let auto-chain handle tests + review

---

## 🔗 Related Documentation

- **Full Guide**: `CLAUDE.md` (complete orchestration guide)
- **Codex Integration**: `AGENTS.md` (Codex-GPT-5 workflows)
- **Context Bridge**: `.ai-context/CONTEXT-BRIDGE.md` (multi-agent system)
- **Code Patterns**: `.ai-context/memory/patterns.md` (coding standards)

---

**Quick Access**: Keep this doc open during development for fast agent decisions.

**Last Updated**: October 13, 2025
