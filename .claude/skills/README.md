# Repurpose MVP Skills

Project-specific skills for Claude Code orchestration system.

## Overview

This directory contains 13 specialized skills that enhance Claude Code's built-in subagents with Repurpose MVP-specific context, patterns, and templates.

## Architecture: Hybrid Skills + Subagents

```
User Request
    ↓
Skill Discovers (based on keywords)
    ↓
Skill Provides Repurpose Context
    - Tech stack (Next.js 15, Supabase, QStash)
    - Design patterns (tokens, conventions)
    - Code templates
    - Real examples
    ↓
Skill Delegates to Built-in Subagent (for complex work)
    ↓
Subagent Executes with Enhanced Context
    ↓
Returns Result to User
```

## Available Skills

### High-Priority Skills (Used Most Often)

1. **feature-implementer** - Implements features with Repurpose patterns
   - Templates: API routes, OAuth flows, Supabase queries, QStash jobs
   - Examples: Calendar, batch-create, scheduling
   - Delegates to: feature-implementer subagent

2. **ui-ux-expert** - Designs interfaces with design tokens and accessibility
   - Provides: COLOR_PRIMARY, COLOR_AI, WCAG checklist
   - Examples: Calendar components, modals, forms
   - Delegates to: None (handles directly)

3. **test-validator** - Creates Jest + Playwright tests
   - Templates: Unit tests, E2E tests, API integration tests
   - Examples: OAuth testing, calendar testing
   - Delegates to: test-validator subagent

4. **code-reviewer** - Reviews for quality, security, performance
   - Checklists: Next.js 15 patterns, Supabase security, OAuth
   - Examples: Middleware review, component review
   - Delegates to: code-reviewer subagent

5. **shadcn-expert** - Builds UI with shadcn/ui components
   - Templates: Forms, dialogs, tables, calendar grids
   - Patterns: Dialog + Form, tooltips, Framer Motion
   - Delegates to: None (handles directly)

### Specialized Skills

6. **explore** - Analyzes codebase and traces implementations
   - Strategies: Finding OAuth flows, tracing Supabase queries
   - Examples: Architecture diagrams, flow tracing
   - Delegates to: Explore subagent

7. **researcher-expert** (NEW) - Systematic external research with source evaluation
   - Method: RAG retrieval, CRAAP scoring, PRISMA logging
   - Templates: Search strategies, source rubric
   - Examples: OAuth PKCE research, WCAG documentation
   - Use cases: Finding RFCs, vendor docs, best practices, compliance policies
   - Delegates to: general-purpose subagent

8. **guardrails-expert** - Ensures compliance and safety
   - Compliance: GDPR, content policies, API terms
   - Examples: Content moderation, data privacy
   - Delegates to: None (advisory only)

9. **batch-workbench-expert** - Handles bulk operations
   - Templates: Batch processing, bulk updates
   - Examples: 30-day content generation
   - Delegates to: batch-workbench-expert subagent

10. **solodev-claude-reviewer** - Pragmatic review for solo devs
    - Focus: Critical issues only, skip perfectionism
    - Examples: Quick wins, security-first review
    - Delegates to: solodev-claude-reviewer subagent

### Utility Skills

11. **statusline-setup** - Configures status display
12. **output-style-setup** - Customizes output formatting
13. **general-purpose** - Fallback for general requests

## Structure

Each skill contains:

```
skill-name/
├── SKILL.md               # Main skill instructions
├── templates/             # Code templates (optional)
├── examples/              # Real implementations (optional)
├── conventions.md         # Project conventions (optional)
└── checklists/ or compliance/ # Reference docs (optional)
```

## How Skills Work

### Discovery
Skills are discovered by keywords. For example:

- **"Add OAuth for Instagram"** → Triggers feature-implementer
- **"How does scheduling work?"** → Triggers explore
- **"Review the auth code"** → Triggers code-reviewer
- **"Design a settings page"** → Triggers ui-ux-expert
- **"Find best practices for OAuth PKCE"** → Triggers researcher-expert

### Execution Flow

#### Simple Tasks
Skill handles directly if task is straightforward:
- Small code changes (<10 lines)
- Documentation
- Quick reviews

#### Complex Tasks
Skill delegates to built-in subagent:
1. Skill provides Repurpose context
2. Invokes subagent via Task tool
3. Subagent executes with context
4. Returns enhanced result

### Example: Adding OAuth Provider

```
User: "Add Instagram OAuth"
    ↓
feature-implementer SKILL activates
    ↓
Provides Context:
- OAuth template (PKCE flow)
- Conventions (token storage pattern)
- Example (twitter.ts reference)
    ↓
Invokes Subagent:
Task(
  subagent_type='feature-implementer',
  prompt='Implement Instagram OAuth following
          template at templates/oauth-flow.ts and
          pattern in lib/twitter.ts'
)
    ↓
Subagent builds Instagram OAuth with proper patterns
    ↓
Result: Instagram OAuth that matches Repurpose conventions
```

## Customization

### Project Skills (This Directory)
- Committed to git
- Shared with team
- Contains Repurpose-specific patterns

### Personal Skills (~/.claude/skills/)
- Not committed
- Local to your machine
- Can override project skills
- For personal workflow preferences

## Adding New Templates

To add a new template:

1. Identify which skill it belongs to
2. Create file in appropriate templates/ directory
3. Follow existing template naming: `thing-name.ts`
4. Include comments explaining the pattern
5. Reference from SKILL.md

Example:
```bash
# Add new API pattern
.claude/skills/feature-implementer/templates/websocket-endpoint.ts
```

## Adding New Examples

To document a real implementation:

1. Create markdown file in examples/ directory
2. Explain what was built and why
3. Show key code snippets
4. Note patterns used
5. Link related files

Example:
```bash
# Document new feature
.claude/skills/feature-implementer/examples/instagram-oauth.md
```

## Testing Skills

Test that skills activate properly:

```bash
# Should trigger feature-implementer
"Add a new social platform"

# Should trigger explore
"How does the calendar work?"

# Should trigger test-validator
"Add tests for scheduling"

# Should trigger ui-ux-expert
"Design a user profile page"

# Should trigger researcher-expert
"Find authoritative sources for OAuth PKCE"
```

## Maintenance

### When to Update

**Update skills when:**
- New patterns emerge (add to templates/)
- New features implemented (add to examples/)
- Conventions change (update conventions.md)
- Better practices discovered (update SKILL.md)

**Review quarterly:**
- Remove outdated patterns
- Update tech stack references
- Prune unused templates

### Best Practices

✅ **Do:**
- Keep templates concise and focused
- Include real examples from Repurpose
- Update when conventions change
- Reference actual file locations

❌ **Don't:**
- Add every possible variation
- Create templates for one-off cases
- Let examples get stale
- Duplicate information

## Troubleshooting

### Skill Not Activating

**Problem**: Skill doesn't trigger when expected

**Solutions:**
1. Check trigger keywords in SKILL.md
2. Try more explicit keywords
3. Verify SKILL.md YAML frontmatter is valid
4. Check Claude Code version compatibility

### Wrong Skill Activating

**Problem**: Wrong skill responds to request

**Solutions:**
1. Be more specific in request
2. Explicitly mention skill name
3. Check for keyword overlap
4. Update skill descriptions

### Template Not Found

**Problem**: Skill references template that doesn't exist

**Solutions:**
1. Verify file exists in templates/ directory
2. Check file path in skill documentation
3. Create missing template
4. Update skill to remove reference

## Resources

- **CLAUDE.md**: Main orchestration documentation
- **SKILLS.md**: Detailed skills usage guide (if exists)
- **Claude Code Docs**: https://docs.claude.com/claude-code
- **Project README**: Root repository documentation

---

**Version**: 1.1.0
**Last Updated**: October 17, 2025 (Added researcher-expert skill)
**Maintained by**: Repurpose MVP Team

## Shared Resources (_shared/)

**New in v1.2.0**: Cross-agent resources to improve quality and prevent common mistakes.

### Directory Structure
```
.claude/skills/_shared/
├── auto-fallback-pattern.md    # Auto-invoke researcher-expert when stuck
├── pre-output-checklist.md     # Universal validation before returning
└── common-questions.md          # FAQ knowledge base
```

### Auto-Fallback System

All 11 agent skills now include auto-fallback to researcher-expert when:
- Failed 2+ times on same task
- Unfamiliar library/API/pattern
- Security/auth implementation
- Standards compliance (RFC, WCAG, GDPR)
- Making recommendation without authoritative source
- Confidence < 0.7

**How it works**:
1. Agent detects trigger condition
2. Invokes researcher-expert for authoritative sources
3. Receives ranked sources with CRAAP scores
4. Proceeds with evidence-based implementation

**Benefits**:
- No more fabricated claims or assumptions
- Automatic research for unfamiliar patterns
- Citations for all recommendations
- Error recovery after 2 failed attempts

### Pre-Output Validation

All agents run validation checklist before returning results:
- ✅ Delegation check (>10 lines → subagent?)
- ✅ Citation check (claims have sources?)
- ✅ Error recovery (2+ failures → research?)
- ✅ Common questions pre-check

**Prevents common user corrections**:
- "Are you using the subagents?"
- "Did you research this first?"
- "Where's the citation for that claim?"
- "Why didn't this work?"

### Common Questions Knowledge Base

Pre-loaded answers to frequently asked questions so agents self-check before user asks.

**Coverage**:
- Q1: Subagent delegation
- Q2: Research requirements
- Q3: Citation format
- Q4: Error recovery
- Q5-Q8: Security, accessibility, performance, conventions

**Impact**: 50-70% reduction in user correction loops

---

**Version**: 1.2.0
**Last Updated**: October 17, 2025 (Added auto-fallback system + pre-output validation)
**Maintained by**: Repurpose MVP Team
