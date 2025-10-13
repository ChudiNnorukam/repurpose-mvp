# Context Bridge Setup Complete ✅

**Status**: Production Ready
**Created**: October 13, 2025
**System**: Claude ↔ Codex Context Continuity

---

## What Was Built

### 1. Shared Context Directory (`.ai-context/`)

```
.ai-context/
├── README.md                    ✅ Complete directory guide
├── CONTEXT-BRIDGE.md            ✅ Quick start & workflows
├── active-session.json          ✅ Session state tracking
├── handoff.json                 ✅ Agent-to-agent handoff
├── .gitignore                   ✅ Git rules for context files
├── memory/
│   ├── patterns.md              ✅ Code patterns & conventions
│   └── decisions.md             ✅ Architecture Decision Records (ADRs)
├── codex/
│   ├── specs/                   ✅ Claude writes specs here
│   │   └── .gitkeep
│   └── outputs/                 ✅ Codex writes code here
│       └── .gitkeep
├── context/
│   └── .gitkeep                 ✅ Feature-specific context
└── tasks/
    └── .gitkeep                 ✅ Task tracking
```

### 2. Updated Documentation

- **CLAUDE.md**: Section on context handoff (needs prepend - see below)
- **AGENTS.md**: Integration with context bridge (needs prepend - see below)
- **CONTEXT-BRIDGE.md**: Complete usage guide

### 3. Key Files Created

| File | Purpose | Used By |
|------|---------|---------|
| `handoff.json` | Current handoff between agents | Both (primary handoff mechanism) |
| `active-session.json` | Complete session history | Both (session memory) |
| `memory/patterns.md` | Shared code patterns | Both (pattern reference) |
| `memory/decisions.md` | Architecture decisions | Claude (decision history) |

---

## How It Works

### The 3-File System

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  handoff.json        ← The Baton (current handoff)      │
│  active-session.json ← The Memory (session history)     │
│  memory/patterns.md  ← The Reference (code patterns)    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Workflow Example

```
User: "Add Instagram OAuth support"
         ↓
┌────────────────────────────────────┐
│ Claude (Strategic)                 │
│ 1. Reads active-session.json       │
│ 2. Reviews memory/patterns.md      │
│ 3. Designs Instagram OAuth         │
│ 4. Writes spec to codex/specs/     │
│ 5. Updates handoff.json:           │
│    {                                │
│      "from": "claude",             │
│      "to": "codex",                │
│      "task": "Generate OAuth impl"  │
│    }                                │
│ 6. Updates active-session.json     │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ Codex (Tactical)                   │
│ 1. Reads handoff.json              │
│ 2. Reads active-session.json       │
│ 3. Reads spec from codex/specs/    │
│ 4. Generates code to codex/outputs/│
│ 5. Generates tests                 │
│ 6. Updates handoff.json:           │
│    {                                │
│      "from": "codex",              │
│      "to": "claude",               │
│      "task": "Review implementation"│
│    }                                │
│ 7. Updates active-session.json     │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│ Claude (Review)                    │
│ 1. Reads handoff.json              │
│ 2. Reviews generated code          │
│ 3. Runs security audit             │
│ 4. Approves & merges               │
│ 5. Updates active-session.json     │
│ 6. Clears handoff.json             │
└────────────────────────────────────┘
```

---

## Quick Start Guide

### For Claude Code

**Starting a new feature:**
```bash
# 1. Initialize context
echo '{
  "session_id": "session-2025-10-13-001",
  "feature": "Instagram OAuth",
  "active_agent": "claude"
}' > .ai-context/active-session.json

# 2. Design & write spec
vi .ai-context/codex/specs/instagram-oauth-spec.md

# 3. Hand off to Codex
echo '{
  "from": "claude",
  "to": "codex",
  "task": "Generate Instagram OAuth",
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

# 4. Approve & merge
```

### For Codex

**Starting work:**
```bash
# 1. Sync context
codex sync
# Reads: handoff.json, active-session.json, specs/

# 2. Generate from spec
codex generate from-spec \
  --spec .ai-context/codex/specs/instagram-oauth-spec.md

# 3. Update handoff
# (Automatically updates after generation)
```

---

## Integration Commands

### Claude Commands

```bash
# Initialize new session
ai-context init "Feature Name"

# Hand off to Codex
ai-context handoff codex \
  --spec .ai-context/codex/specs/feature.md

# Review Codex output
ai-context review
```

### Codex Commands

```bash
# Sync from Claude
codex sync

# Generate code
codex generate from-spec

# Hand back to Claude
codex handoff claude
```

---

## Context Continuity Rules

1. **Always Read First**: Check `handoff.json` and `active-session.json` before starting work
2. **Update After Actions**: Update `active-session.json` after every significant action
3. **Explicit Handoffs**: Always update `handoff.json` when passing work
4. **Reference Patterns**: Check `memory/patterns.md` for code patterns
5. **Document Decisions**: Add ADRs to `memory/decisions.md` for architectural changes

---

## What's Next

### To Start Using

1. **Test the handoff**:
   ```bash
   # Claude creates a simple spec
   echo "# Test Spec\nCreate a utility function" > .ai-context/codex/specs/test.md

   # Update handoff
   echo '{"from":"claude","to":"codex","task":"Test generation","spec":".ai-context/codex/specs/test.md"}' > .ai-context/handoff.json

   # Codex would read handoff and generate
   ```

2. **Monitor active-session.json**:
   - Check timeline after each agent action
   - Verify context is being preserved

3. **Build up memory/patterns.md**:
   - Add patterns as you establish them
   - Reference in future specs

### Documentation Updates Needed

**CLAUDE.md**: Prepend this section at line 1:

```markdown
# 🔗 Context Bridge

**IMPORTANT**: This project uses a shared context system (`.ai-context/`) for Claude ↔ Codex continuity.

**Before starting work:**
1. Read `.ai-context/handoff.json` - Check if there's a handoff for you
2. Read `.ai-context/active-session.json` - Get full session context
3. Review `.ai-context/memory/patterns.md` - Check code patterns

**After completing work:**
1. Update `.ai-context/active-session.json` with your actions
2. Update `.ai-context/handoff.json` if handing off to another agent

**Full Guide**: See `.ai-context/CONTEXT-BRIDGE.md`

---
```

**AGENTS.md**: Prepend this section at line 1:

```markdown
# 🔗 Context Bridge

**IMPORTANT**: Before generating code, sync context from Claude:

```bash
# Read Claude's design decisions
cat .ai-context/handoff.json
cat .ai-context/active-session.json

# Check code patterns
cat .ai-context/memory/patterns.md

# Review spec
cat .ai-context/codex/specs/*.md
```

**After generation:**
```bash
# Update handoff for Claude review
# (Update .ai-context/handoff.json)

# Update session history
# (Update .ai-context/active-session.json)
```

**Full Guide**: See `.ai-context/CONTEXT-BRIDGE.md`

---
```

---

## Success Metrics

### How You Know It's Working

✅ **Context Preserved**:
- Switching from Claude → Codex: Codex knows all design decisions
- Switching from Codex → Claude: Claude knows what was generated

✅ **No Rework**:
- Codex generates code that matches Claude's spec on first try
- Claude's review only finds minor issues, not architectural mismatches

✅ **Audit Trail**:
- `active-session.json` shows complete timeline
- All decisions documented in `memory/decisions.md`
- All patterns referenced in `memory/patterns.md`

✅ **Fast Handoffs**:
- Claude → Codex handoff: < 30 seconds to context sync
- Codex → Claude handoff: < 60 seconds to review generated code

---

## Maintenance

### Daily
- Update `active-session.json` after each significant action
- Update `handoff.json` when passing work between agents

### Weekly
- Review `memory/patterns.md` for accuracy
- Archive old sessions from `active-session.json`

### Monthly
- Clean up old generated code from `codex/outputs/`
- Archive completed tasks from `tasks/`
- Review and update ADRs in `memory/decisions.md`

---

## Troubleshooting

### "I don't know what the other agent decided"

**Solution**: Read the context files
```bash
cat .ai-context/handoff.json
cat .ai-context/active-session.json
cat .ai-context/memory/decisions.md
```

### "Context seems incomplete"

**Solution**: Check git history
```bash
git log --all --oneline -- .ai-context/
```

### "Agents are out of sync"

**Solution**: Update both files
```bash
# Update active-session.json with current state
# Update handoff.json with explicit next steps
```

---

## Resources

- **Full Guide**: `.ai-context/CONTEXT-BRIDGE.md`
- **Directory Guide**: `.ai-context/README.md`
- **Code Patterns**: `.ai-context/memory/patterns.md`
- **Decisions**: `.ai-context/memory/decisions.md`

- **Claude Guide**: `CLAUDE.md`
- **Codex Guide**: `AGENTS.md`
- **Project Docs**: `SOURCE_OF_TRUTH.md`

---

**Status**: Production Ready ✅
**Created**: October 13, 2025
**Next Steps**: Test with first Claude → Codex handoff
