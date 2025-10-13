# .ai-context/ - Shared Context for Claude ↔ Codex

**Purpose**: Bridge context between Claude Code and Codex-GPT-5 agents to maintain continuity across AI sessions.

---

## Directory Structure

```
.ai-context/
├── README.md                    # This file
├── active-session.json          # Current working session context
├── handoff.json                 # Active handoff between agents
├── memory/                      # Persistent knowledge base
│   ├── architecture.md          # System architecture decisions
│   ├── patterns.md              # Code patterns and conventions
│   ├── decisions.md             # ADRs (Architecture Decision Records)
│   └── gotchas.md               # Known issues and workarounds
├── tasks/                       # Task tracking
│   ├── in-progress.json         # Current tasks
│   ├── pending.json             # Queued tasks
│   └── completed.json           # Completed tasks (last 7 days)
├── context/                     # Session context
│   ├── current-feature.md       # Active feature context
│   ├── recent-changes.md        # Last 5 code changes
│   └── open-questions.md        # Unanswered questions
└── codex/                       # Codex-specific files
    ├── generation-queue.json    # Pending code generation
    ├── specs/                   # Implementation specs from Claude
    └── outputs/                 # Generated code for review
```

---

## How It Works

### 1. Claude → Codex Handoff

When Claude completes design/architecture work and hands off to Codex:

```json
// .ai-context/handoff.json
{
  "from": "claude",
  "to": "codex",
  "timestamp": "2025-10-13T15:30:00Z",
  "task": "Implement Instagram OAuth integration",
  "context": {
    "design_complete": true,
    "spec_location": ".ai-context/codex/specs/instagram-oauth-spec.md",
    "files_to_generate": [
      "lib/instagram.ts",
      "app/api/auth/instagram/route.ts",
      "app/api/auth/instagram/callback/route.ts"
    ],
    "requirements": {
      "security": ["PKCE flow", "state validation", "token encryption"],
      "patterns": ["Follow lib/twitter.ts pattern", "Use ErrorResponses"],
      "testing": ["Unit tests required", "Mock OAuth responses"]
    }
  },
  "dependencies": ["lib/types.ts", "lib/supabase.ts"],
  "related_files": ["lib/twitter.ts", "lib/linkedin.ts"],
  "next_step": "Codex generates OAuth implementation",
  "review_by": "claude"
}
```

### 2. Codex → Claude Handoff

When Codex completes code generation and hands back to Claude for review:

```json
// .ai-context/handoff.json
{
  "from": "codex",
  "to": "claude",
  "timestamp": "2025-10-13T15:45:00Z",
  "task": "Review Instagram OAuth implementation",
  "context": {
    "generation_complete": true,
    "output_location": ".ai-context/codex/outputs/instagram-oauth/",
    "files_generated": [
      "lib/instagram.ts",
      "app/api/auth/instagram/route.ts",
      "app/api/auth/instagram/callback/route.ts",
      "lib/__tests__/instagram.test.ts"
    ],
    "patterns_followed": ["Twitter OAuth pattern", "Standard error handling"],
    "tests_generated": true,
    "test_coverage": "95%"
  },
  "review_checklist": [
    "Security: PKCE implementation",
    "Security: State validation",
    "Security: Token encryption",
    "Integration: Supabase schema compatibility",
    "Testing: Edge cases covered",
    "Documentation: JSDoc comments"
  ],
  "next_step": "Claude reviews and approves",
  "approval_required": true
}
```

### 3. Active Session Context

Both agents read/write to `active-session.json`:

```json
// .ai-context/active-session.json
{
  "session_id": "session-2025-10-13-003",
  "started": "2025-10-13T14:00:00Z",
  "last_updated": "2025-10-13T15:45:00Z",
  "active_agent": "claude",
  "mode": "review",
  "feature": "Instagram OAuth Integration",
  "status": "in_progress",

  "timeline": [
    {
      "timestamp": "2025-10-13T14:00:00Z",
      "agent": "claude",
      "action": "Designed Instagram OAuth flow",
      "output": ".ai-context/codex/specs/instagram-oauth-spec.md"
    },
    {
      "timestamp": "2025-10-13T14:15:00Z",
      "agent": "claude",
      "action": "Created security requirements document",
      "output": ".ai-context/memory/decisions.md (entry #47)"
    },
    {
      "timestamp": "2025-10-13T14:20:00Z",
      "agent": "claude",
      "action": "Handed off to Codex for implementation",
      "output": ".ai-context/handoff.json"
    },
    {
      "timestamp": "2025-10-13T15:45:00Z",
      "agent": "codex",
      "action": "Generated OAuth implementation + tests",
      "output": ".ai-context/codex/outputs/instagram-oauth/"
    },
    {
      "timestamp": "2025-10-13T15:45:00Z",
      "agent": "codex",
      "action": "Handed back to Claude for review",
      "output": ".ai-context/handoff.json"
    }
  ],

  "current_state": {
    "files_modified": [
      "lib/instagram.ts (new)",
      "app/api/auth/instagram/route.ts (new)",
      "app/api/auth/instagram/callback/route.ts (new)",
      "lib/__tests__/instagram.test.ts (new)",
      "lib/types.ts (modified - added Instagram to Platform type)"
    ],
    "tests_passing": false,
    "build_status": "not_run",
    "next_action": "Claude reviews generated code"
  },

  "context": {
    "similar_implementations": ["lib/twitter.ts", "lib/linkedin.ts"],
    "security_considerations": [
      "Instagram uses standard OAuth 2.0 (not PKCE)",
      "Tokens expire after 60 days",
      "Scopes: instagram_basic, instagram_content_publish"
    ],
    "api_documentation": "https://developers.facebook.com/docs/instagram-basic-display-api/",
    "open_questions": []
  }
}
```

---

## File Format Specifications

### 1. Task Files (tasks/*.json)

```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Add Instagram OAuth support",
      "status": "in_progress",
      "assigned_to": "codex",
      "created": "2025-10-13T14:00:00Z",
      "started": "2025-10-13T14:20:00Z",
      "priority": "high",
      "subtasks": [
        {
          "id": "subtask-001-01",
          "title": "Create Instagram OAuth helpers",
          "file": "lib/instagram.ts",
          "status": "completed",
          "completed_by": "codex"
        },
        {
          "id": "subtask-001-02",
          "title": "Create OAuth routes",
          "files": ["app/api/auth/instagram/route.ts", "app/api/auth/instagram/callback/route.ts"],
          "status": "completed",
          "completed_by": "codex"
        },
        {
          "id": "subtask-001-03",
          "title": "Write unit tests",
          "file": "lib/__tests__/instagram.test.ts",
          "status": "completed",
          "completed_by": "codex"
        },
        {
          "id": "subtask-001-04",
          "title": "Security review",
          "status": "pending",
          "assigned_to": "claude"
        }
      ],
      "dependencies": [],
      "blocked_by": [],
      "spec": ".ai-context/codex/specs/instagram-oauth-spec.md"
    }
  ]
}
```

### 2. Architecture Decisions (memory/decisions.md)

```markdown
# Architecture Decision Records

## ADR-047: Instagram OAuth Implementation (2025-10-13)

**Status**: Approved by Claude
**Context**: Adding Instagram as third OAuth provider after Twitter and LinkedIn

**Decision**:
- Use standard OAuth 2.0 (Instagram doesn't support PKCE)
- Follow existing pattern from lib/twitter.ts and lib/linkedin.ts
- Store tokens in social_accounts table with 60-day expiration
- Use Facebook Graph API infrastructure

**Consequences**:
- Consistent OAuth implementation across all platforms
- Existing token refresh logic can be reused
- Instagram Graph API has stricter rate limits than Twitter/LinkedIn

**Implementation**:
- Files: lib/instagram.ts, app/api/auth/instagram/*.ts
- Generated by: Codex
- Reviewed by: Claude
- Tests: lib/__tests__/instagram.test.ts (95% coverage)

**Related**: ADR-012 (Twitter PKCE), ADR-023 (LinkedIn OAuth)
```

### 3. Code Patterns (memory/patterns.md)

```markdown
# Code Patterns & Conventions

## OAuth Implementation Pattern

**When adding a new OAuth provider, follow this checklist:**

1. Create `lib/{platform}.ts` with:
   - `export interface {Platform}OAuthConfig`
   - `export function generate{Platform}AuthUrl()`
   - `export async function get{Platform}AccessToken()`
   - `export async function refresh{Platform}Token()`
   - `export async function post{Platform}Content()`

2. Create `app/api/auth/init-{platform}/route.ts`:
   - Generate state token
   - Store state in session/DB
   - Return auth URL

3. Create `app/api/auth/{platform}/callback/route.ts`:
   - Validate state parameter
   - Exchange code for tokens
   - Store in social_accounts table

4. Add platform to `lib/types.ts`:
   - Update `Platform` type union
   - Add to `VALID_PLATFORMS` array

5. Create tests in `lib/__tests__/{platform}.test.ts`

**Reference implementation**: lib/twitter.ts
**Generated by**: Codex (from Claude spec)
**Last updated**: 2025-10-13
```

---

## Usage Guide

### For Claude Code

**Starting a new feature:**
```bash
# 1. Update active session
echo '{
  "session_id": "session-2025-10-13-004",
  "feature": "Add Instagram support",
  "active_agent": "claude",
  "mode": "design"
}' > .ai-context/active-session.json

# 2. Create design spec for Codex
vi .ai-context/codex/specs/instagram-oauth-spec.md

# 3. Create handoff
echo '{
  "from": "claude",
  "to": "codex",
  "task": "Generate Instagram OAuth implementation",
  "spec": ".ai-context/codex/specs/instagram-oauth-spec.md"
}' > .ai-context/handoff.json
```

**Reviewing Codex output:**
```bash
# 1. Read handoff
cat .ai-context/handoff.json

# 2. Review generated files
ls .ai-context/codex/outputs/

# 3. Run tests
npm test

# 4. Update session with approval
# (Update active-session.json with review results)
```

### For Codex

**Starting code generation:**
```bash
# 1. Read handoff
cat .ai-context/handoff.json

# 2. Read spec
cat .ai-context/codex/specs/instagram-oauth-spec.md

# 3. Check active session for context
cat .ai-context/active-session.json

# 4. Review similar implementations
cat lib/twitter.ts
cat lib/linkedin.ts

# 5. Generate code
codex generate from-spec \
  --spec .ai-context/codex/specs/instagram-oauth-spec.md \
  --output .ai-context/codex/outputs/instagram-oauth/ \
  --reference lib/twitter.ts

# 6. Update handoff to pass back to Claude
# (Update handoff.json with completion status)
```

---

## Context Continuity Rules

### Rule 1: Always Read Active Session First
Both agents must read `.ai-context/active-session.json` before starting work.

### Rule 2: Update Session After Every Action
Every significant action (design, generation, review) must update the session timeline.

### Rule 3: Handoff Must Be Explicit
No implicit handoffs. Always update `handoff.json` with clear next steps.

### Rule 4: Preserve Context Trail
Never delete context files. Keep complete audit trail of decisions.

### Rule 5: Reference Similar Work
Always link to related implementations for pattern consistency.

---

## Emergency Recovery

If context is lost or session corrupted:

```bash
# 1. Recover from git
git log --all --full-history --oneline -- .ai-context/

# 2. Reconstruct from recent changes
cat .ai-context/context/recent-changes.md

# 3. Check completed tasks
cat .ai-context/tasks/completed.json

# 4. Rebuild active-session.json from timeline
# (Use git history + completed tasks)
```

---

## Best Practices

1. **Keep specs detailed**: Codex needs clear specifications
2. **Update frequently**: Don't batch updates to session files
3. **Link related work**: Always reference similar implementations
4. **Document decisions**: Use memory/decisions.md for ADRs
5. **Clean up old sessions**: Archive completed sessions monthly

---

## Integration with Git

Add to `.gitignore`:
```
# Keep context files but ignore temp outputs
.ai-context/codex/outputs/*
.ai-context/tasks/completed.json  # too noisy
```

Keep in git:
```
.ai-context/active-session.json
.ai-context/handoff.json
.ai-context/memory/
.ai-context/codex/specs/
```

---

**Last Updated**: October 13, 2025
**Maintained By**: Both Claude and Codex agents
