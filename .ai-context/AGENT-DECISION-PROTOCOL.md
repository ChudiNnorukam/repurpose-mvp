# Agent Decision Protocol

**MANDATORY CHECK FOR EVERY USER REQUEST**

## Decision Flow (MUST FOLLOW)

```
User Request Received
    ↓
Step 1: Extract Keywords
    ↓
Step 2: Match Against Agent Rules
    ↓
Step 3: Decision
    ├─ Match Found? → Invoke Agent
    └─ No Match? → Handle Directly
```

## Keyword → Agent Mapping

| Keywords | Agent | Auto-Chain |
|----------|-------|------------|
| implement, feature, add, create, build | **feature-implementer** | → test-validator → code-reviewer |
| test, verify, edge cases, coverage | **test-validator** | None |
| review, audit, refactor, optimize | **code-reviewer** | None |

## Decision Matrix

### When to Use Agents (INVOKE AGENT)
- ✅ New features (any size)
- ✅ New endpoints/routes
- ✅ Testing tasks
- ✅ Code reviews
- ✅ Security audits
- ✅ Refactoring > 10 lines
- ✅ User says: "implement", "test", "review"

### When to Handle Directly (DO IT YOURSELF)
- ✅ Small bugfixes (< 10 lines)
- ✅ Documentation updates
- ✅ Config changes
- ✅ Reading/analyzing code
- ✅ Answering questions
- ✅ Explaining concepts
- ✅ Quick file edits

## Examples

### ❌ WRONG (What I Did Earlier)
```
User: "test all the features on this website"
Claude: *Starts testing directly with WebFetch*
```

### ✅ CORRECT (What I Should Do)
```
User: "test all the features on this website"
Claude:
  1. Extract keyword: "test"
  2. Match: "test" → test-validator agent
  3. Invoke: Task tool with test-validator
  4. Wait for agent results
  5. Present to user
```

### ✅ CORRECT (Direct Handling)
```
User: "explain how the scheduling works"
Claude:
  1. Extract keywords: "explain"
  2. No agent match (not implement/test/review)
  3. Handle directly: Read files and explain
```

## Pre-Task Checklist

Before responding to ANY user request, ask:

1. ☑️ Does this contain "implement", "feature", "add", "create", "build"?
   - YES → Invoke **feature-implementer**

2. ☑️ Does this contain "test", "verify", "edge cases", "coverage"?
   - YES → Invoke **test-validator**

3. ☑️ Does this contain "review", "audit", "refactor", "optimize"?
   - YES → Invoke **code-reviewer**

4. ☑️ Is this a small change (< 10 lines)?
   - YES → Handle directly

5. ☑️ Is this reading/analyzing code?
   - YES → Handle directly

6. ☑️ Is this documentation?
   - YES → Handle directly

## Auto-Chaining Rules

After **feature-implementer** completes:
1. ✅ Auto-invoke **test-validator**
2. ✅ Auto-invoke **code-reviewer**

After **test-validator** or **code-reviewer**:
- ❌ No auto-chaining

## Commit This to Memory

**BEFORE EVERY RESPONSE:**
- Search keywords in user request
- Match against agent rules
- Invoke agent OR handle directly
- NEVER skip this check

---

**Last Updated**: October 13, 2025
**Mandatory Protocol**: YES
**Skip Check**: NEVER
