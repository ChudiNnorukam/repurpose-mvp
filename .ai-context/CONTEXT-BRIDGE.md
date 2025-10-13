# Context Bridge: Claude ↔ Codex Continuity System

**Purpose**: Seamless context handoff between Claude Code and Codex-GPT-5
**Status**: Active
**Last Updated**: October 13, 2025

---

## Quick Start

### When Switching from Claude → Codex

```bash
# 1. Claude finishes design/architecture
# 2. Claude writes handoff file
cat > .ai-context/handoff.json << 'EOF'
{
  "from": "claude",
  "to": "codex",
  "task": "Implement Instagram OAuth",
  "spec": ".ai-context/codex/specs/instagram-oauth-spec.md",
  "context_files": [
    ".ai-context/active-session.json",
    ".ai-context/memory/patterns.md",
    "lib/twitter.ts (reference)",
    "lib/linkedin.ts (reference)"
  ]
}
EOF

# 3. Codex reads handoff + context
codex sync
# This automatically:
# - Reads .ai-context/handoff.json
# - Loads .ai-context/active-session.json
# - Reviews spec and reference files
# - Understands current project state

# 4. Codex generates code
codex generate from-spec
```

### When Switching from Codex → Claude

```bash
# 1. Codex finishes code generation
# 2. Codex updates handoff
cat > .ai-context/handoff.json << 'EOF'
{
  "from": "codex",
  "to": "claude",
  "task": "Review Instagram OAuth implementation",
  "generated_files": [
    ".ai-context/codex/outputs/instagram-oauth/*"
  ],
  "review_checklist": [
    "Security: PKCE/OAuth 2.0 compliance",
    "Integration: Supabase compatibility",
    "Testing: Coverage and edge cases"
  ]
}
EOF

# 3. Claude reads handoff
# Automatically picks up:
# - Generated code in .ai-context/codex/outputs/
# - Review checklist
# - Full context from active-session.json
```

---

## File Structure

```
.ai-context/
├── handoff.json              ← CRITICAL: Current handoff state
├── active-session.json       ← CRITICAL: Session context
├── codex/
│   ├── specs/                ← Claude writes specs here
│   └── outputs/              ← Codex writes code here
├── memory/
│   ├── patterns.md           ← Shared patterns
│   ├── decisions.md          ← ADRs
│   └── gotchas.md            ← Known issues
└── context/
    ├── current-feature.md    ← Active feature context
    └── recent-changes.md     ← Last 5 changes
```

---

## The 3-File System

### File 1: handoff.json (The Baton)

**What**: Current task handoff between agents
**Updated**: Every time an agent finishes work
**Read by**: Next agent picking up work

```json
{
  "from": "claude|codex",
  "to": "codex|claude",
  "timestamp": "2025-10-13T15:30:00Z",
  "task": "Brief task description",
  "status": "pending|in-progress|review|completed",

  // Claude → Codex handoff
  "spec": ".ai-context/codex/specs/feature-spec.md",
  "files_to_generate": ["file1.ts", "file2.ts"],
  "patterns_to_follow": ["lib/twitter.ts"],

  // Codex → Claude handoff
  "generated_files": [".ai-context/codex/outputs/feature/*"],
  "review_checklist": ["Security", "Integration", "Tests"],

  "next_step": "Clear description of next action"
}
```

### File 2: active-session.json (The Memory)

**What**: Complete session state and history
**Updated**: After every significant action
**Read by**: Both agents at session start

```json
{
  "session_id": "session-2025-10-13-003",
  "feature": "Instagram OAuth Integration",
  "status": "in_progress",
  "active_agent": "codex",

  "timeline": [
    {
      "timestamp": "2025-10-13T14:00:00Z",
      "agent": "claude",
      "action": "Designed OAuth flow",
      "output": ".ai-context/codex/specs/instagram-oauth-spec.md"
    },
    {
      "timestamp": "2025-10-13T15:45:00Z",
      "agent": "codex",
      "action": "Generated OAuth implementation",
      "output": ".ai-context/codex/outputs/instagram-oauth/"
    }
  ],

  "current_state": {
    "files_modified": ["lib/instagram.ts (new)", "lib/types.ts (modified)"],
    "tests_passing": false,
    "next_action": "Claude reviews generated code"
  },

  "context": {
    "similar_implementations": ["lib/twitter.ts", "lib/linkedin.ts"],
    "api_docs": "https://developers.facebook.com/docs/instagram",
    "open_questions": []
  }
}
```

### File 3: memory/patterns.md (The Reference)

**What**: Shared code patterns and conventions
**Updated**: When establishing new patterns
**Read by**: Both agents for pattern matching

```markdown
## OAuth Implementation Pattern

Follow this pattern for all OAuth providers:

1. Create `lib/{platform}.ts` with standard functions
2. Follow lib/twitter.ts structure exactly
3. Use ErrorResponses for all errors
4. Add tests with 95% coverage minimum

**Reference**: lib/twitter.ts (canonical implementation)
```

---

## Workflow Examples

### Example 1: New Feature (Claude → Codex → Claude)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Claude Designs Feature                          │
├─────────────────────────────────────────────────────────┤
│ 1. Claude analyzes requirements                         │
│ 2. Claude designs architecture                          │
│ 3. Claude writes detailed spec:                         │
│    .ai-context/codex/specs/feature-spec.md              │
│ 4. Claude updates handoff.json:                         │
│    {                                                     │
│      "from": "claude",                                  │
│      "to": "codex",                                     │
│      "task": "Generate implementation",                 │
│      "spec": ".ai-context/codex/specs/feature-spec.md"  │
│    }                                                     │
│ 5. Claude updates active-session.json with design       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Codex Implements Feature                        │
├─────────────────────────────────────────────────────────┤
│ 1. Codex reads handoff.json                            │
│ 2. Codex reads active-session.json for context         │
│ 3. Codex reads spec file                               │
│ 4. Codex reviews reference implementations             │
│ 5. Codex generates code:                               │
│    .ai-context/codex/outputs/feature/                  │
│ 6. Codex generates tests                               │
│ 7. Codex updates handoff.json:                         │
│    {                                                    │
│      "from": "codex",                                  │
│      "to": "claude",                                   │
│      "task": "Review implementation",                  │
│      "generated_files": [...]                          │
│    }                                                    │
│ 8. Codex updates active-session.json with generation   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: Claude Reviews Implementation                   │
├─────────────────────────────────────────────────────────┤
│ 1. Claude reads handoff.json                           │
│ 2. Claude reads active-session.json                    │
│ 3. Claude reviews generated files                      │
│ 4. Claude runs security audit                          │
│ 5. Claude runs tests                                   │
│ 6. If approved: Claude merges code                     │
│    If changes needed: Claude updates handoff for Codex │
│ 7. Claude updates active-session.json with approval    │
└─────────────────────────────────────────────────────────┘
```

### Example 2: Bug Fix (Codex handles solo)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Bug Identified                                  │
├─────────────────────────────────────────────────────────┤
│ User reports: "Instagram OAuth callback fails"          │
│                                                          │
│ Codex (local agent):                                    │
│ 1. Reads active-session.json                           │
│ 2. Reviews lib/instagram.ts                            │
│ 3. Identifies issue: missing state validation          │
│ 4. Generates fix                                       │
│ 5. Runs tests                                          │
│ 6. Updates active-session.json with fix                │
│                                                          │
│ No handoff needed - simple fix doesn't need Claude     │
└─────────────────────────────────────────────────────────┘
```

### Example 3: Complex Refactor (Parallel work)

```
┌──────────────────────────┐   ┌────────────────────────┐
│ Claude (Parallel)        │   │ Codex (Parallel)        │
├──────────────────────────┤   ├────────────────────────┤
│ 1. Analyze bottlenecks   │   │ 1. Refactor slow funcs │
│ 2. Design caching        │   │ 2. Generate perf tests │
│ 3. Plan DB indexes       │   │ 3. Optimize bundle     │
│ 4. Write spec for Codex  │   │ 4. Generate profiling  │
└──────────────┬───────────┘   └────────────┬───────────┘
               │                              │
               └──────────────┬───────────────┘
                              ↓
              ┌────────────────────────────┐
              │ Merge Point                │
              ├────────────────────────────┤
              │ 1. Claude reviews optimizations
              │ 2. Codex applies DB indexes│
              │ 3. Claude verifies results │
              └────────────────────────────┘
```

---

## Context Continuity Rules

### Rule 1: Always Update active-session.json
After every significant action, update the session timeline.

### Rule 2: Never Delete Context
Archive old sessions, don't delete. Context trail is critical.

### Rule 3: Explicit Handoffs Only
Always update handoff.json when passing work between agents.

### Rule 4: Reference Similar Work
Link to related implementations for pattern consistency.

### Rule 5: Read Before Write
Always read active-session.json and handoff.json before starting work.

---

## Troubleshooting

### "I'm Codex, but I don't know what Claude decided"

**Solution**:
```bash
# Read the context
cat .ai-context/handoff.json
cat .ai-context/active-session.json
cat .ai-context/codex/specs/*.md

# If still unclear, check recent changes
cat .ai-context/context/recent-changes.md
```

### "I'm Claude, but I don't know what Codex generated"

**Solution**:
```bash
# Check handoff
cat .ai-context/handoff.json

# Review outputs
ls -la .ai-context/codex/outputs/

# Check session history
cat .ai-context/active-session.json | jq '.timeline[-3:]'
```

### "Context seems corrupted or incomplete"

**Solution**:
```bash
# Recover from git history
git log --all --full-history --oneline -- .ai-context/

# Rebuild from completed tasks
cat .ai-context/tasks/completed.json

# Check recent commits
git log --oneline -10 --all
```

---

## Best Practices

1. **Keep Specs Detailed**: Codex needs clear, unambiguous specifications
2. **Update Frequently**: Don't batch context updates
3. **Link References**: Always cite similar implementations
4. **Document Decisions**: Record architectural choices in memory/decisions.md
5. **Clean Outputs**: Archive old generated code monthly

---

## Integration Commands

### For Claude

```bash
# Start new feature
ai-context init "Feature Name"
# Creates: active-session.json, spec template

# Hand off to Codex
ai-context handoff codex \
  --spec .ai-context/codex/specs/feature.md \
  --files lib/feature.ts,app/api/feature/route.ts

# Review Codex output
ai-context review
# Shows: generated files, test results, review checklist
```

### For Codex

```bash
# Sync context from Claude
codex sync
# Reads: handoff.json, active-session.json, specs

# Generate from spec
codex generate from-spec \
  --spec .ai-context/codex/specs/feature.md \
  --output .ai-context/codex/outputs/feature/

# Hand back to Claude
codex handoff claude \
  --generated .ai-context/codex/outputs/feature/ \
  --review-needed "security,integration,tests"
```

---

**Last Updated**: October 13, 2025
**Maintained By**: Both Claude and Codex agents
**Status**: Production ready
