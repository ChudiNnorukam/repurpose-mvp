# Codex Onboarding: How to Use This Codebase

**For**: Codex-GPT-5 (local or cloud)
**From**: Claude Code (previous agent)
**Project**: Repurpose MVP - Social media content adaptation platform

---

## 🚀 Quick Start (Copy-Paste This to Codex)

```
Hi Codex,

I'm switching from Claude Code to you for tactical implementation work.

**Context Location**: All context is in `.ai-context/` directory

**Your First Actions**:
1. Read `.ai-context/handoff.json` - Check if there's work for you
2. Read `.ai-context/active-session.json` - Get full project context
3. Read `.ai-context/memory/patterns.md` - Learn code patterns
4. If handoff.json has a spec for you, read it from `.ai-context/codex/specs/`

**Project Overview**:
- Tech: Next.js 15 + TypeScript + Supabase + OpenAI + QStash
- Purpose: AI-powered social media content adaptation
- Current state: See `.ai-context/active-session.json`

**Documentation**:
- Context guide: `.ai-context/CONTEXT-BRIDGE.md`
- Code patterns: `.ai-context/memory/patterns.md`
- Decisions: `.ai-context/memory/decisions.md`
- Claude guide: `CLAUDE.md`
- Codex guide: `AGENTS.md`
- Project reference: `SOURCE_OF_TRUTH.md`

**When You Generate Code**:
1. Output to: `.ai-context/codex/outputs/[feature-name]/`
2. Follow patterns from: `.ai-context/memory/patterns.md`
3. Update: `.ai-context/handoff.json` (hand back to Claude for review)
4. Update: `.ai-context/active-session.json` (record your actions)

**Current Task**: Check `.ai-context/handoff.json` to see if there's work assigned to you.

Ready to start?
```

---

## 📋 Detailed Onboarding Prompts

### Scenario 1: There's Already a Handoff for You

```
Hi Codex,

Claude handed off work to you. Here's what you need to do:

**Step 1: Read Context**
```bash
cat .ai-context/handoff.json
cat .ai-context/active-session.json
cat .ai-context/memory/patterns.md
```

**Step 2: Read Your Spec**
The spec file location is in handoff.json under "spec" field.
Example: `.ai-context/codex/specs/instagram-oauth-spec.md`

**Step 3: Review Reference Implementations**
The handoff.json has "patterns_to_follow" field.
Example: Review `lib/twitter.ts` for OAuth pattern

**Step 4: Generate Code**
- Output location: `.ai-context/codex/outputs/[feature-name]/`
- Follow patterns exactly as specified
- Generate tests with 95% coverage minimum

**Step 5: Update Context**
After generation:
1. Update `.ai-context/handoff.json`:
   ```json
   {
     "from": "codex",
     "to": "claude",
     "task": "Review [feature name]",
     "generated_files": ["list of files you created"],
     "review_checklist": ["Security", "Integration", "Tests"]
   }
   ```

2. Update `.ai-context/active-session.json` timeline:
   Add your generation action to the timeline array

**Questions?** Check `.ai-context/CONTEXT-BRIDGE.md` for examples.

Ready to generate?
```

### Scenario 2: No Active Handoff (General Development)

```
Hi Codex,

No active handoff from Claude, but I need you for code generation.

**Context to Load**:
1. Read `.ai-context/active-session.json` - See current project state
2. Read `.ai-context/memory/patterns.md` - Learn code patterns
3. Read `SOURCE_OF_TRUTH.md` - Understand project architecture
4. Read `AGENTS.md` - Your role in this project

**Project Tech Stack**:
- Frontend: Next.js 15 + React 19 + TypeScript
- Backend: Next.js API routes + Supabase + QStash
- AI: OpenAI GPT-4o
- OAuth: Twitter + LinkedIn (working), Instagram (planned)

**Key Patterns to Follow** (from `.ai-context/memory/patterns.md`):
- OAuth: Follow `lib/twitter.ts` pattern exactly
- API routes: Auth → Rate limiting → Validation → Business logic
- Database: Use RLS policies, client for user queries, admin for cross-user
- Errors: Use `ErrorResponses` from `lib/api/errors.ts`
- Testing: 95% coverage, Jest + Playwright

**When You Generate Code**:
1. Ask me: "What feature should I generate?"
2. I'll provide requirements
3. You generate to: `.ai-context/codex/outputs/[feature-name]/`
4. You create handoff for Claude review

Ready to start?
```

### Scenario 3: Bug Fix or Small Change

```
Hi Codex,

Need you to fix a bug / make a small change.

**Issue**: [Describe the bug/change needed]

**Context to Load**:
1. Read `.ai-context/active-session.json` - Current state
2. Read `.ai-context/memory/patterns.md` - Patterns
3. Review the specific file(s) involved

**For Bug Fixes**:
- Make minimal changes
- Add tests to prevent regression
- Update `.ai-context/active-session.json` with fix details
- If simple fix, no need for Claude review (just update session)
- If security-related, update handoff for Claude review

**For Small Changes**:
- Follow existing patterns
- Update tests
- Update session history

Ready to fix?
```

### Scenario 4: Refactoring Task

```
Hi Codex,

Need you to refactor code for [performance/readability/maintainability].

**Task**: [Specific refactoring goal]

**Context to Load**:
1. Read `.ai-context/active-session.json`
2. Read `.ai-context/memory/patterns.md`
3. Review the files to refactor

**Refactoring Guidelines**:
- Preserve behavior (all tests must pass)
- Extract reusable utilities
- Follow patterns from `.ai-context/memory/patterns.md`
- Improve type safety where possible

**Output**:
1. Refactored code to: `.ai-context/codex/outputs/refactor-[name]/`
2. Update tests if needed
3. Create handoff for Claude to verify behavior preserved

Ready to refactor?
```

---

## 🎯 Example: Instagram OAuth Implementation

### What You'd Say to Codex

```
Hi Codex,

Claude designed Instagram OAuth and handed it off to you.

**Your Task**: Generate Instagram OAuth implementation

**Step 1: Read Context**
```bash
cat .ai-context/handoff.json
# Shows:
# - from: "claude"
# - to: "codex"
# - task: "Generate Instagram OAuth implementation"
# - spec: ".ai-context/codex/specs/instagram-oauth-spec.md"

cat .ai-context/codex/specs/instagram-oauth-spec.md
# Full specification of what to build

cat .ai-context/memory/patterns.md
# OAuth implementation pattern (section: "OAuth Implementation Pattern")

cat lib/twitter.ts
# Reference implementation to follow
```

**Step 2: What to Generate**

Based on the spec and patterns, generate these files:

1. `lib/instagram.ts`:
   - Follow `lib/twitter.ts` structure exactly
   - Functions: generateInstagramAuthUrl, getInstagramAccessToken, refreshInstagramToken, postInstagramContent
   - Use ErrorResponses for all errors
   - Add JSDoc comments

2. `app/api/auth/instagram/route.ts`:
   - OAuth initiation endpoint
   - Generate state token
   - Store state in session/DB
   - Return auth URL

3. `app/api/auth/instagram/callback/route.ts`:
   - OAuth callback handler
   - Validate state
   - Exchange code for tokens
   - Store in social_accounts table

4. `lib/__tests__/instagram.test.ts`:
   - Test all OAuth functions
   - 95% coverage minimum
   - Test happy path + edge cases + errors

**Step 3: Output Location**
Generate all files to: `.ai-context/codex/outputs/instagram-oauth/`

**Step 4: After Generation**
Update `.ai-context/handoff.json`:
```json
{
  "from": "codex",
  "to": "claude",
  "timestamp": "[current timestamp]",
  "task": "Review Instagram OAuth implementation",
  "generated_files": [
    ".ai-context/codex/outputs/instagram-oauth/lib/instagram.ts",
    ".ai-context/codex/outputs/instagram-oauth/app/api/auth/instagram/route.ts",
    ".ai-context/codex/outputs/instagram-oauth/app/api/auth/instagram/callback/route.ts",
    ".ai-context/codex/outputs/instagram-oauth/lib/__tests__/instagram.test.ts"
  ],
  "review_checklist": [
    "Security: OAuth 2.0 compliance",
    "Integration: Supabase schema compatibility",
    "Testing: 95% coverage, edge cases",
    "Patterns: Follows lib/twitter.ts structure"
  ],
  "next_step": "Claude reviews and approves for merge"
}
```

Ready to generate Instagram OAuth?
```

---

## 📝 Templates for Common Tasks

### Template 1: New Feature from Spec

```
Hi Codex,

Generate [feature name] from spec.

**Context**:
- Spec: `.ai-context/codex/specs/[feature-name]-spec.md`
- Patterns: `.ai-context/memory/patterns.md`
- Reference: [similar file if any]

**Output to**: `.ai-context/codex/outputs/[feature-name]/`

**Requirements**:
- Follow patterns exactly
- Generate tests (95% coverage)
- Add JSDoc comments
- Use TypeScript strict mode

**After generation**: Update handoff.json for Claude review

Generate now?
```

### Template 2: Generate Tests for Existing Code

```
Hi Codex,

Generate tests for existing code in `[file path]`.

**Context**:
- File to test: `[file path]`
- Test patterns: `.ai-context/memory/patterns.md` (section: "Testing Pattern")

**Requirements**:
- 95% coverage
- Test happy path + edge cases + errors
- Use Jest for unit tests
- Mock external dependencies

**Output to**: `[file path].test.ts` (same directory)

Generate tests now?
```

### Template 3: Refactor for Performance

```
Hi Codex,

Refactor `[file path]` for better performance.

**Context**:
- File: `[file path]`
- Goal: [specific performance goal]
- Patterns: `.ai-context/memory/patterns.md`

**Requirements**:
- Preserve behavior (all tests must pass)
- Document performance improvements
- Update tests if needed

**Output to**: `.ai-context/codex/outputs/refactor-[name]/`

Refactor now?
```

### Template 4: Generate API Route

```
Hi Codex,

Generate API route: `POST /api/[endpoint-name]`

**Context**:
- Pattern: `.ai-context/memory/patterns.md` (section: "API Route Pattern")
- Reference: `app/api/adapt/route.ts` (similar route)

**Requirements**:
- Auth check (required)
- Rate limiting: [X requests per Y]
- Validation: [list fields to validate]
- Business logic: [describe logic]

**Output to**: `app/api/[endpoint-name]/route.ts`

Generate now?
```

---

## 🔄 Handoff Protocol (Important!)

### When Codex Finishes Work

**Always do these 2 things:**

1. **Update handoff.json**:
```json
{
  "from": "codex",
  "to": "claude",
  "timestamp": "[current time]",
  "task": "Review [what you generated]",
  "generated_files": ["list all files"],
  "review_checklist": ["Security", "Integration", "Tests", "Patterns"],
  "next_step": "Claude reviews and approves/requests changes"
}
```

2. **Update active-session.json** (add to timeline):
```json
{
  "timestamp": "[current time]",
  "agent": "codex",
  "action": "Generated [feature name]",
  "output": ".ai-context/codex/outputs/[feature-name]/"
}
```

---

## ⚠️ Common Mistakes to Avoid

1. **Don't skip reading context**: Always read handoff.json + active-session.json first
2. **Don't ignore patterns**: Follow `.ai-context/memory/patterns.md` exactly
3. **Don't forget tests**: 95% coverage minimum
4. **Don't skip handoff update**: Always update handoff.json when done
5. **Don't guess patterns**: When unsure, check reference implementations

---

## 📚 Key Files Reference

| File | Purpose | When to Read |
|------|---------|-------------|
| `.ai-context/handoff.json` | Current task for you | Always (first thing) |
| `.ai-context/active-session.json` | Project state & history | Always (second thing) |
| `.ai-context/memory/patterns.md` | Code patterns to follow | Before generating code |
| `.ai-context/memory/decisions.md` | Why decisions were made | When unsure about approach |
| `AGENTS.md` | Your full guide | For detailed workflows |
| `SOURCE_OF_TRUTH.md` | Project architecture | For understanding system |
| `CLAUDE.md` | Claude's guide (reference) | To understand his role |

---

## 🎓 Learning Path

**First Time Using This Codebase?**

1. Read this file (you're doing it!)
2. Read `.ai-context/CONTEXT-BRIDGE.md` (5 min)
3. Read `.ai-context/memory/patterns.md` (10 min)
4. Skim `SOURCE_OF_TRUTH.md` (5 min)
5. Check `.ai-context/handoff.json` for tasks
6. Start generating!

**Total onboarding time**: ~20 minutes

---

## ✅ Ready to Start Checklist

- [ ] Read `.ai-context/handoff.json`
- [ ] Read `.ai-context/active-session.json`
- [ ] Read `.ai-context/memory/patterns.md`
- [ ] Understand output location: `.ai-context/codex/outputs/`
- [ ] Know handoff protocol (update handoff.json when done)

**All checked?** You're ready to generate code!

---

**Questions?**
- Check `.ai-context/CONTEXT-BRIDGE.md` for examples
- Check `AGENTS.md` for detailed workflows
- Check `.ai-context/memory/patterns.md` for code patterns

**Last Updated**: October 13, 2025
**For**: Codex-GPT-5 agents
**From**: Claude Code
