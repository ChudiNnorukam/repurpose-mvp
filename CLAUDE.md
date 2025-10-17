# Repurpose - Elite Subagent Orchestration System

**Version**: 3.0.0  
**Last Updated**: October 17, 2025  
**Purpose**: Precision agent orchestration engine for Claude Code AI with Repurpose MVP

---

## ⚡ QUICK REFERENCE CARD (30-Second Decision)

```
USER REQUEST ARRIVES
        ↓
┌───────────────────────────────────────────┐
│ STEP 1: SIZE & COMPLEXITY CHECK           │
├───────────────────────────────────────────┤
│ • < 10 lines?          → Handle directly  │
│ • Config/docs only?    → Handle directly  │
│ • Trivial bugfix?      → Handle directly  │
└───────────────────────┬───────────────────┘
                        ↓ (if no)
┌───────────────────────────────────────────┐
│ STEP 2: KEYWORD MATCH                     │
├───────────────────────────────────────────┤
│ • "implement", "add", "build"             │
│   → feature-implementer                   │
│ • "test", "verify", "coverage"            │
│   → test-validator                        │
│ • "review", "audit", "refactor"           │
│   → code-reviewer                         │
│ • "design", "UI", "layout", "responsive"  │
│   → ui-ux-expert                          │
│ • "find", "where", "explore", "search"    │
│   → Explore                               │
│ • "batch", "CSV", "50+", "bulk"          │
│   → batch-workbench-expert                │
│ • "policy", "compliance", "guidelines"    │
│   → guardrails-expert                     │
│ • "shadcn", "form", "dialog", "sheet"    │
│   → shadcn-expert                         │
└───────────────────────┬───────────────────┘
                        ↓ (if no match)
┌───────────────────────────────────────────┐
│ STEP 3: MULTI-DOMAIN CHECK                │
├───────────────────────────────────────────┤
│ • Sequential (A→B→C)?  → Chain agents     │
│ • Parallel (A || B)?   → Run simultaneous │
│ • Iterative?           → Loop pattern     │
└───────────────────────┬───────────────────┘
                        ↓ (if unclear)
┌───────────────────────────────────────────┐
│ STEP 4: DEFAULT TO ANALYSIS               │
├───────────────────────────────────────────┤
│ • Complex/unclear?     → general-purpose  │
│ • Need exploration?    → Explore          │
└───────────────────────────────────────────┘
```

**Auto-Chain Rule**: When `feature-implementer` completes:
```
feature-implementer → test-validator → code-reviewer (automatic)
```

---

## 🔧 SKILLS INTEGRATION: Hybrid System

### What Are Skills?

**Skills** are specialized YAML-fronted SKILL.md files in `.claude/skills/` that enhance the 12 built-in subagents with **Repurpose MVP-specific context**. They act as an intelligent routing layer that provides:

- **Project Context**: Next.js 15, Supabase, QStash, OAuth patterns
- **Code Templates**: API routes, OAuth flows, Supabase queries, QStash jobs
- **Real Examples**: Batch-create, calendar, scheduling implementations
- **Conventions**: Design tokens, error handling, rate limiting patterns
- **Delegation Logic**: When to invoke built-in subagents for complex work

### Architecture: Hybrid Skills + Subagents

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ Skill Discovers (keyword-based)         │
│ "implement", "test", "review", etc.     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Skill Provides Repurpose Context        │
│ • Tech stack (Next.js 15, Supabase)     │
│ • Design patterns (tokens, RLS)         │
│ • Code templates (OAuth, API routes)    │
│ • Real examples (batch-create)          │
└─────────────────┬───────────────────────┘
                  ↓
        ┌─────────────────┐
        │  Simple task?   │
        │  (< 10 lines)   │
        └────┬────────┬───┘
             │        │
            YES      NO
             ↓        ↓
    ┌───────────┐  ┌──────────────────────────┐
    │  Handle   │  │ Delegate to Built-in     │
    │  Directly │  │ Subagent (Task tool)     │
    └───────────┘  └─────────┬────────────────┘
                             ↓
               ┌──────────────────────────────┐
               │ Subagent Executes with       │
               │ Enhanced Repurpose Context   │
               └──────────────────────────────┘
```

### The 12 Skills (Match the 12 Subagents)

| Skill | Purpose | Delegates To | Templates/Examples |
|-------|---------|--------------|-------------------|
| **feature-implementer** | Implements features with Repurpose patterns | feature-implementer subagent | API routes, OAuth, Supabase, QStash |
| **explore** | Researches codebase with search strategies | Explore subagent | OAuth flow tracing, architecture |
| **test-validator** | Creates tests with Repurpose fixtures | test-validator subagent | Jest unit, Playwright E2E |
| **code-reviewer** | Reviews with Next.js 15 + Supabase checklist | code-reviewer subagent | Security audit, performance |
| **solodev-claude-reviewer** | Pragmatic review for solo devs | solodev-claude-reviewer subagent | Quick wins, critical only |
| **guardrails-expert** | Ensures policy compliance | — (advisory only) | GDPR, content policies |
| **batch-workbench-expert** | Handles bulk operations | batch-workbench-expert subagent | 30-day content generation |
| **shadcn-expert** | Builds UI with shadcn/ui | — (direct handling) | Forms, dialogs, tables |
| **ui-ux-expert** | Designs with design tokens | — (direct handling) | COLOR_PRIMARY, WCAG |
| **statusline-setup** | Configures status display | statusline-setup subagent | — |
| **output-style-setup** | Customizes output formatting | output-style-setup subagent | — |
| **general-purpose** | Fallback for complex tasks | general-purpose subagent | — |

### How Skills Enhance Subagents

**Example: Implementing Instagram OAuth**

**Without Skills** (Generic Subagent):
```
User: "Implement Instagram OAuth"
    ↓
feature-implementer subagent:
- Generates generic OAuth flow
- May not use PKCE pattern
- Doesn't follow Repurpose patterns
- Misses rate limiting integration
- No Supabase RLS consideration
```

**With Skills** (Hybrid System):
```
User: "Implement Instagram OAuth"
    ↓
feature-implementer SKILL:
- Detects "implement" + "OAuth"
- Provides OAuth template (.claude/skills/feature-implementer/templates/oauth-flow.ts)
- References Twitter OAuth example (lib/twitter.ts)
- Includes Repurpose conventions:
  * PKCE flow with crypto.randomBytes
  * State parameter for CSRF
  * Token storage in social_accounts table
  * Rate limiting integration
  * Supabase RLS patterns
    ↓
Delegates to feature-implementer SUBAGENT with enhanced context:
"Implement Instagram OAuth following template at
.claude/skills/feature-implementer/templates/oauth-flow.ts
and pattern in lib/twitter.ts. Use PKCE, store tokens
in social_accounts table with RLS, integrate rate limiting."
    ↓
feature-implementer subagent:
- Builds Instagram OAuth matching Repurpose patterns
- lib/instagram.ts (PKCE + token refresh)
- app/api/auth/instagram/route.ts
- app/api/auth/instagram/callback/route.ts
- All following Repurpose conventions ✅
```

**Result**: Consistent, production-ready code that matches existing patterns.

### Skill Locations

**Project Skills** (`.claude/skills/`):
- **Location**: `/Users/chudinnorukam/Downloads/Repurpose MVP /.claude/skills/`
- **Committed to git**: ✅ Yes
- **Shared with team**: ✅ Yes
- **Contains**: Repurpose-specific templates, examples, conventions
- **Use for**: Common workflows, team standards

**Personal Skills** (`~/.claude/skills/`):
- **Location**: `~/.claude/skills/`
- **Committed to git**: ❌ No
- **Shared with team**: ❌ No
- **Contains**: Personal workflow preferences, custom shortcuts
- **Use for**: Individual customizations, override project skills

**Priority**: Personal skills override project skills if both exist.

### Discovery Mechanism

Skills auto-activate based on **trigger keywords** in user messages:

```yaml
# Example: feature-implementer skill
Trigger Keywords:
  - "implement"
  - "add"
  - "build"
  - "create"
  - "add endpoint"
  - "create feature"

User says: "Add Instagram OAuth"
    ↓
Keywords detected: "Add" (matches "add")
    ↓
feature-implementer skill activates
```

### When Skills Delegate vs Handle Directly

**Delegate to Subagent** (complex work):
- New features (> 10 lines)
- API endpoints with auth + rate limiting
- OAuth implementations
- Database migrations
- Multi-file changes
- Test suite creation

**Handle Directly** (simple work):
- Documentation updates
- Config changes (< 5 lines)
- Quick bug fixes (< 10 lines)
- Providing templates/examples
- Answering questions about patterns

### Skills Directory Structure

```
.claude/skills/
├── feature-implementer/
│   ├── SKILL.md                    # Main skill instructions
│   ├── templates/
│   │   ├── api-route.ts            # Next.js 15 API pattern
│   │   ├── oauth-flow.ts           # OAuth 2.0 PKCE template
│   │   ├── supabase-query.ts       # Supabase + RLS patterns
│   │   └── qstash-job.ts           # QStash delayed jobs
│   ├── examples/
│   │   ├── calendar.md             # Calendar implementation
│   │   ├── batch-create.md         # Batch generation
│   │   └── scheduling.md           # Post scheduling
│   └── conventions.md              # Repurpose conventions
├── test-validator/
│   ├── SKILL.md
│   └── templates/
│       ├── jest-unit.ts
│       ├── playwright-e2e.ts
│       └── api-integration.ts
├── code-reviewer/
│   ├── SKILL.md
│   └── checklists/
│       ├── security.md
│       ├── performance.md
│       └── next-15-patterns.md
├── ui-ux-expert/
│   ├── SKILL.md
│   └── design-tokens.md
├── shadcn-expert/
│   ├── SKILL.md
│   └── templates/
│       ├── form-dialog.tsx
│       ├── data-table.tsx
│       └── calendar-component.tsx
├── batch-workbench-expert/
│   ├── SKILL.md
│   └── templates/
│       └── batch-processing.ts
├── explore/SKILL.md
├── guardrails-expert/
│   ├── SKILL.md
│   └── compliance/
│       ├── gdpr.md
│       └── platform-policies.md
├── solodev-claude-reviewer/SKILL.md
├── statusline-setup/SKILL.md
├── output-style-setup/SKILL.md
├── general-purpose/SKILL.md
└── README.md                       # Skills system documentation
```

### Testing the Skills System

```bash
# Test feature-implementer skill
User: "Implement webhook endpoint for QStash"
Expected: Skill provides template, delegates to subagent

# Test explore skill
User: "Where do we handle OAuth token refresh?"
Expected: Skill provides search strategy, delegates to Explore

# Test test-validator skill
User: "Add tests for the scheduling flow"
Expected: Skill provides test templates, delegates to test-validator

# Test ui-ux-expert skill
User: "Design a settings page with design tokens"
Expected: Skill provides COLOR_PRIMARY tokens, handles directly
```

### Further Documentation

- **Skills README**: `.claude/skills/README.md` - Complete skills system guide
- **Individual Skills**: `.claude/skills/*/SKILL.md` - Each skill's documentation
- **Templates**: `.claude/skills/*/templates/` - Copy-paste code templates
- **Examples**: `.claude/skills/*/examples/` - Real implementation walkthroughs

---

## 📖 THE 12 REAL SUBAGENTS

### 1. general-purpose

**Purpose**: Complex multi-step research, code search, and analysis  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "research", "analyze", "investigate", "complex", "multi-step"

**Use Cases**:
1. Researching how error handling works across the codebase
2. Analyzing performance bottlenecks in multiple files
3. Multi-step investigations requiring context from many sources
4. Complex refactoring that spans multiple domains
5. Architecture analysis and recommendations

**Anti-patterns**:
- ❌ Simple file searches (use Explore instead)
- ❌ Single-domain tasks (use specialized agents)
- ❌ Implementation work (use feature-implementer)

**Invocation Template**:
```
Task: [Comprehensive research/analysis task]

Requirements:
- [What needs to be investigated]
- [Scope and boundaries]
- [Expected output format]

Context:
- [Relevant background]
```

---

### 2. Explore  

**Purpose**: Fast codebase exploration using Glob/Grep/Read  
**Type**: Built-in  
**Tools**: Glob, Grep, Read, Bash

**Trigger Keywords**: "find", "where is", "search for", "locate", "explore"

**Use Cases**:
1. **Finding files**: "Where are the OAuth implementations?"
2. **Searching code**: "Find all usages of createClient"  
3. **Locating patterns**: "Where do we handle rate limiting?"
4. **Quick exploration**: "What files implement batch processing?"
5. **Context gathering**: "Show me the auth middleware"

**Anti-patterns**:
- ❌ Don't use for implementation
- ❌ Don't use for complex analysis (use general-purpose)
- ❌ Don't use for making changes

**Invocation Template**:
```
Task: Find [what you're looking for]

Search strategy:
- Pattern: [file pattern or code pattern]
- Scope: [which directories]
- Thoroughness: quick|medium|very thorough

Expected output:
- List of relevant files with line numbers
```

**Real Example from Repurpose**:
```
Task: Where are errors from the client handled in batch-create?

Agents used: Explore  
Time: 2 minutes
Found: app/batch-create/page.tsx lines 233-250, 343-360
```

---

### 3. feature-implementer

**Purpose**: Implements new features, endpoints, and functionality  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "implement", "add endpoint", "create feature", "build", "add functionality"

**Use Cases**:
1. **OAuth implementation**: Add Instagram OAuth flow
2. **API endpoints**: Create /api/batch/schedule
3. **New features**: Implement recurring posts
4. **Database operations**: Add analytics tracking
5. **Integration work**: Connect new external API

**Auto-Chain Behavior**:
After completion, automatically invokes:
1. test-validator → Write tests
2. code-reviewer → Security audit

**Anti-patterns**:
- ❌ Bugs < 10 lines (fix directly)
- ❌ Documentation (handle directly)
- ❌ Code reviews (use code-reviewer)

**Invocation Template**:
```
Task: Implement [feature name]

Requirements:
- [Functional requirement 1]
- [Functional requirement 2]
- [Technical constraints]

Files to create/modify:
- [file path 1]
- [file path 2]

Success criteria:
- [How to verify it works]
```

**Real Example from Repurpose**:
```
Task: Fix batch-create Supabase client import issue

Problem: Wrong import causing redirect loop
Solution: Changed from '@/lib/supabase/client' to '@/lib/supabase-client'
Result: Page loads correctly
Time: 8 minutes
Commit: bf06137
```

---

### 4. test-validator

**Purpose**: Write and validate tests (unit, integration, E2E)  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "test", "verify", "edge cases", "coverage", "validate"

**Use Cases**:
1. **Unit tests**: Test OAuth helper functions
2. **Integration tests**: API endpoint testing
3. **E2E tests**: Full user flow testing
4. **Edge cases**: Boundary conditions, error paths
5. **Test diagnosis**: Fix failing tests

**Anti-patterns**:
- ❌ Don't use for production code
- ❌ Don't use for design review  
- ❌ Don't modify logic (unless trivial test-only fix)

**Invocation Template**:
```
Task: Write tests for [component/feature]

Scope:
- Unit tests: [functions to test]
- Integration tests: [API endpoints]
- E2E tests: [user flows]

Coverage goals:
- Critical paths: 100%
- Edge cases: [list specific cases]

Files:
- [test file paths]
```

**Real Example from Repurpose**:
```
Task: Test scheduling flow for edge cases

Tests written:
- Timezone handling
- Past dates validation
- Concurrent scheduling
- Rate limit errors
Result: 95% coverage
Time: 25 minutes
```

---

### 5. code-reviewer

**Purpose**: Review code for quality, security, and best practices  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "review", "audit", "refactor", "optimize", "clean up"

**Use Cases**:
1. **Security audit**: Review auth implementation
2. **Code quality**: Check for anti-patterns
3. **Performance**: Identify optimization opportunities
4. **Best practices**: Ensure consistency with standards
5. **Bug diagnosis**: Analyze root causes

**Severity Levels**:
- 🔴 **Critical**: Security issues, data corruption risks
- 🟡 **Warning**: Performance issues, maintainability concerns
- 🟢 **Suggestion**: Style improvements, optional optimizations

**Anti-patterns**:
- ❌ Don't use for implementation
- ❌ Don't use for running tests
- ❌ Don't introduce new features during review

**Invocation Template**:
```
Task: Review [component/feature]

Focus areas:
- Security: [specific concerns]
- Performance: [bottlenecks]
- Code quality: [patterns to check]

Files to review:
- [file paths with line numbers]

Output format:
- Critical issues first
- Actionable feedback
- Code examples for fixes
```

**Real Example from Repurpose**:
```
Task: Diagnose batch-create redirect issue

Diagnosis:
1. /batch-create missing from middleware protected routes
2. Wrong Supabase client import (non-SSR)

Severity: Critical
Time: 5 minutes
Fixes applied: Added route to middleware, fixed import
```

---

### 6. solodev-claude-reviewer

**Purpose**: Pre-commit reviews, security deep-pass, CI integration  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "pre-commit", "security scan", "CI review", "deployment check"

**Use Cases**:
1. **Pre-commit review**: Staged diffs analysis before commit
2. **Security deep pass**: Auth, secrets, unsafe migrations
3. **Soft-gated CI**: Block only on Critical/High severity
4. **Test authoring**: Generate missing test cases
5. **Performance check**: N+1 queries, large payloads

**Review Modes**:
- `/security` - Security-focused deep pass
- `/tests` - Missing test case enumeration  
- `/perf` - Performance sanity check
- `/docs` - Documentation and migration notes

**Anti-patterns**:
- ❌ Don't use for regular code reviews (use code-reviewer)
- ❌ Don't use for feature implementation

**Invocation Template**:
```
Task: Pre-commit review of staged changes

Mode: [security|tests|perf|docs]

Severity threshold:
- Block on: Critical, High
- Warn on: Medium, Low

Files changed:
- [git diff output or file list]
```

---

### 7. guardrails-expert

**Purpose**: Content policy compliance, review platform guidelines  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "policy", "compliance", "guidelines", "content review", "violations"

**Use Cases**:
1. **Review policy check**: Ensure generated content complies
2. **Platform guidelines**: Twitter/LinkedIn/Instagram rules
3. **Content moderation**: Flag inappropriate content
4. **Automated detection**: Build violation detection systems
5. **Content rewriting**: Strategies for policy compliance

**Specializations**:
- Google/Yelp/Airbnb review policies
- Social media content guidelines
- Violation detection patterns
- Content rewriting strategies

**Anti-patterns**:
- ❌ Don't use for technical code review
- ❌ Don't use for feature implementation

**Invocation Template**:
```
Task: Review content for policy compliance

Platform: [Twitter|LinkedIn|Instagram|Google|Yelp]

Content to review:
- [content text]

Check for:
- Spam/manipulation
- Hate speech/harassment
- Misinformation
- Copyright violations
- Platform-specific rules
```

**Real Example from Repurpose**:
```
Task: Ensure AI-generated posts comply with LinkedIn policies

Checked: 30 posts
Violations found: 0
Recommendations: Add disclaimers for promotional content
Time: 5 minutes
```

---

### 8. batch-workbench-expert

**Purpose**: CSV/PDF batch processing, data workflows, table operations  
**Type**: Built-in  
**Tools**: * (all tools)

**Trigger Keywords**: "batch", "CSV", "50+ rows", "bulk", "table", "export"

**Use Cases**:
1. **CSV operations**: Process 50+ row datasets
2. **Batch workflows**: Multi-step data processing
3. **Table UIs**: Selection, progress tracking
4. **PDF exports**: Document generation
5. **Bulk operations**: Mass updates/deletes

**Specializations**:
- CSV/PDF data operations
- Table interactions (selection, filtering)
- Batch processing workflows (50+ rows)
- Progress tracking systems
- Export infrastructure

**Anti-patterns**:
- ❌ Don't use for < 10 rows (handle directly)
- ❌ Don't use for single-record operations

**Invocation Template**:
```
Task: Process batch operation

Data format: [CSV|PDF|JSON]
Row count: [number]

Operations:
- [transform/validate/export]

UI requirements:
- Selection capability
- Progress tracking
- Error handling

Files:
- [data file paths]
```

**Real Example from Repurpose**:
```
Task: Design batch content generation for 30 days

Features implemented:
- Generate 30 posts per platform
- Progress tracking UI
- Error recovery for partial failures
- Draft auto-save
Time: 90 minutes
Files: app/batch-create/*, app/api/batch/*
```

---

### 9. shadcn-expert

**Purpose**: shadcn/ui component design, Next.js patterns, responsive UIs  
**Type**: Built-in  
**Tools**: Read, Write, Edit, Glob, Grep

**Trigger Keywords**: "shadcn", "form", "dialog", "sheet", "dropdown", "select"

**Use Cases**:
1. **Form components**: Complex forms with validation
2. **Dialogs/Sheets**: Modal patterns
3. **Data display**: Tables, lists, cards
4. **Navigation**: Menus, breadcrumbs, tabs
5. **Feedback**: Toasts, alerts, progress

**Component Categories**:
- Forms: Input, Select, Checkbox, Radio, Switch
- Overlays: Dialog, Sheet, Popover, Tooltip
- Navigation: Dropdown Menu, Tabs, Breadcrumb
- Data: Table, Card, Avatar, Badge
- Feedback: Toast, Alert, Progress, Skeleton

**Anti-patterns**:
- ❌ Don't reinvent components shadcn already has
- ❌ Don't mix shadcn with other UI libraries

**Invocation Template**:
```
Task: Implement [component type] using shadcn/ui

Component: [Dialog|Form|Table|etc]

Requirements:
- [Feature 1]
- [Feature 2]

Accessibility:
- Keyboard navigation
- Screen reader support
- ARIA labels

Files:
- [component file paths]
```

**Real Example from Repurpose**:
```
Task: Add form validation to create page

Components used:
- Form wrapper with react-hook-form
- Input with error states
- Select for platform/tone
- Button with loading state
Time: 30 minutes
Files: app/create/page.tsx
```

---

### 10. statusline-setup

**Purpose**: Configure Claude Code status line  
**Type**: Built-in  
**Tools**: Read, Edit

**Trigger Keywords**: "status line", "configure status", "bottom bar"

**Use Cases**:
1. Configure status line display
2. Customize information shown
3. Toggle visibility

**Anti-patterns**:
- ❌ Rarely needed in normal development

**Invocation Template**:
```
Task: Configure Claude Code status line

Settings:
- [visibility options]
- [information to display]
```

---

### 11. output-style-setup

**Purpose**: Create Claude Code output styles  
**Type**: Built-in  
**Tools**: Read, Write, Edit, Glob, Grep

**Trigger Keywords**: "output style", "format output", "customize display"

**Use Cases**:
1. Create custom output formats
2. Style code responses
3. Configure display preferences

**Anti-patterns**:
- ❌ Rarely needed in normal development

**Invocation Template**:
```
Task: Create output style

Style name: [name]
Format: [markdown|plain|custom]
```

---

### 12. ui-ux-expert (Custom Agent)

**Purpose**: Magic UI components, design systems, responsive layouts, accessibility  
**Type**: Custom (.claude/agents/ui-ux-expert.md)  
**Tools**: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Magic UI MCP

**Trigger Keywords**: "design", "UI", "UX", "layout", "responsive", "Magic UI", "component"

**Use Cases**:
1. **Design system work**: Tokens, variants, theming
2. **Magic UI integration**: Animated components, effects
3. **Responsive design**: Mobile-first layouts
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Component architecture**: Atomic design, composition

**Magic UI Component Categories**:
- **Layouts**: bento-grid, dock, sidebar, file-tree
- **Motion**: blur-fade, text-reveal, scroll-progress
- **Interactive**: animated-beam, orbiting-circles, ripple
- **Buttons**: shimmer-button, shine-border, rainbow-button
- **Backgrounds**: grid-pattern, dot-pattern, meteors

**Anti-patterns**:
- ❌ Don't build custom when Magic UI has it
- ❌ Don't skip accessibility features
- ❌ Don't ignore mobile experience

**Invocation Template**:
```
Task: Design [component/page]

Requirements:
- User experience goal: [goal]
- Design constraints: [constraints]
- Accessibility: WCAG 2.1 AA

Magic UI components to consider:
- [component 1]
- [component 2]

Responsive breakpoints:
- Mobile: sm (640px)
- Tablet: md (768px)  
- Desktop: lg (1024px)
```

**Real Example from Repurpose**:
```
Task: Design dashboard with content calendar

Magic UI used:
- bento-grid for layout
- blur-fade for smooth entrances
- shimmer-button for CTAs

Time: 45 minutes
Files: app/dashboard/page.tsx
```

---

## 🎯 ORCHESTRATION DECISION ENGINE

### Domain → Agent Mapping Matrix

| Task Domain | Primary Agent | Support Agents | Pattern | Example |
|-------------|---------------|----------------|---------|---------|
| **OAuth implementation** | feature-implementer | test-validator → code-reviewer | Sequential auto-chain | "Add Twitter OAuth" |
| **UI/UX design** | ui-ux-expert | shadcn-expert (if shadcn) | Parallel | "Design dashboard calendar" |
| **Bug diagnosis** | Explore | code-reviewer (root cause) | Sequential | "Fix redirect loop" |
| **Test coverage** | test-validator | code-reviewer (test quality) | Sequential | "Test scheduling flow" |
| **Security audit** | code-reviewer | solodev-claude-reviewer | Parallel | "Audit auth system" |
| **Batch operations** | batch-workbench-expert | feature-implementer (if new) | Sequential | "Process 50 posts" |
| **Content policy** | guardrails-expert | — | Single | "Check review compliance" |
| **Codebase exploration** | Explore | general-purpose (if complex) | Sequential | "Where are errors handled?" |
| **Performance tuning** | code-reviewer | Explore (bottlenecks) | Iterative | "Optimize API speed" |
| **Component library** | shadcn-expert | ui-ux-expert | Parallel | "Add form components" |
| **Feature implementation** | feature-implementer | test-validator → code-reviewer | Auto-chain | "Add recurring posts" |
| **API endpoint** | feature-implementer | test-validator → code-reviewer | Auto-chain | "Create /api/batch" |
| **Pre-commit review** | solodev-claude-reviewer | — | Single | "Review staged changes" |
| **Complex research** | general-purpose | Explore (context) | Sequential | "Analyze architecture" |
| **Magic UI design** | ui-ux-expert | shadcn-expert | Parallel | "Hero section with animations" |

### Quick Decision Rules

**Size-based**:
- < 10 lines → Handle directly
- 10-50 lines → Single agent
- 50-200 lines → Sequential chain
- 200+ lines → Parallel swarm

**Complexity-based**:
- Simple → Handle directly
- Medium → Single specialized agent
- Complex → Sequential chain  
- Very complex → general-purpose analysis first

**Domain-based**:
- Single domain → One agent
- Two domains → Sequential chain
- Three+ domains → Parallel + sync

---

## 🔄 EXECUTION PATTERNS

### Pattern 1: Auto-Chaining (Default for Features)

**When**: feature-implementer completes  
**Then**: Auto-invoke test-validator → code-reviewer  
**Time**: Adds 15-30 minutes to implementation

**Example: Implement Instagram OAuth**
```
USER: "Implement Instagram OAuth"
    ↓
feature-implementer creates:
├── lib/instagram.ts
├── app/api/auth/instagram/route.ts
└── app/api/auth/instagram/callback/route.ts
    ↓ (automatic)
test-validator writes:
└── lib/__tests__/instagram.test.ts (95% coverage)
    ↓ (automatic)
code-reviewer audits:
├── Security: PKCE, state, token storage
├── Code quality: Error handling, types
└── Best practices: Rate limiting, retries
    ↓
Present complete package to user
```

**Benefits**:
- Complete feature with tests and review
- Catches issues before user sees code
- Consistent quality across all features

---

### Pattern 2: Parallel Swarm

**When**: Multiple independent tasks  
**Then**: Invoke all in parallel, sync at end  
**Time**: Same as slowest agent (vs sum of sequential)

**Example: Add Three OAuth Providers**
```
USER: "Add Twitter, LinkedIn, Instagram OAuth"
    ↓
feature-implementer(Twitter) || feature-implementer(LinkedIn) || feature-implementer(Instagram)
├── Twitter: 30 min       ├── LinkedIn: 25 min      ├── Instagram: 35 min
└── lib/twitter.ts        └── lib/linkedin.ts       └── lib/instagram.ts
    ↓ (all complete, 35 min total)
test-validator writes tests for all 3
    ↓ (20 min)
code-reviewer audits all 3
    ↓ (15 min)
Total time: 70 min (vs 210 min sequential)
```

**Benefits**:
- 3x faster for independent tasks
- No blocking between agents
- Efficient resource utilization

---

### Pattern 3: Explore → Implement

**When**: Location/understanding needed first  
**Then**: Explore finds context, then implement  
**Time**: 5-10 min exploration + implementation time

**Example: Improve Error Handling**
```
USER: "Improve error handling"
    ↓
Explore agent:
├── Searches for error patterns
├── Finds lib/api/errors.ts
├── Finds error usage in 15 files
└── Analyzes current patterns
    ↓ (5 minutes)
Present findings to user:
"Error handling found in lib/api/errors.ts.
Currently using ErrorResponses pattern.
Gaps: Missing validation errors, no retry logic."
    ↓
USER: "Fix the gaps"
    ↓
feature-implementer:
├── Add validation error types
├── Implement retry logic  
└── Update error handling in 15 files
    ↓ (30 minutes)
Result: Comprehensive error handling
```

**Benefits**:
- User sees what exists before changes
- Informed decisions on approach
- No wasted implementation work

---

### Pattern 4: Iterative Refinement

**When**: Optimization/improvement needed  
**Then**: Review → Fix → Validate → Repeat  
**Time**: 30-60 min per iteration

**Example: Optimize Performance**
```
USER: "Optimize performance"
    ↓
ITERATION 1:
Explore identifies bottlenecks:
├── /api/adapt: 8s (OpenAI latency)
├── /api/posts: 2s (N+1 queries)
└── Dashboard: 3s (unoptimized images)
    ↓ (10 min)
code-reviewer analyzes:
├── OpenAI: Add caching layer
├── Posts: Optimize Supabase query with join
└── Dashboard: Implement next/image
    ↓ (10 min)
feature-implementer fixes:
├── Add Redis caching for OpenAI
├── Single query instead of N+1
└── Convert to next/image
    ↓ (40 min)
test-validator benchmarks:
├── /api/adapt: 8s → 0.5s (cached)
├── /api/posts: 2s → 0.3s
└── Dashboard: 3s → 1.2s
    ↓ (10 min)
    
ITERATION 2 (if needed):
Identify new bottlenecks...
```

**Benefits**:
- Measurable improvements each cycle
- Focus on biggest wins first
- Know when to stop optimizing

---

### Pattern 5: Research → Design → Implement

**When**: New complex feature with unclear approach  
**Then**: Research → UI design → Implementation  
**Time**: 60-120 min total

**Example: Add Content Calendar**
```
USER: "Add content calendar with drag-and-drop"
    ↓
general-purpose research:
├── Survey existing calendar libraries
├── Analyze drag-and-drop patterns
├── Review Next.js best practices
└── Recommend: react-big-calendar + dnd-kit
    ↓ (20 min)
ui-ux-expert designs:
├── Monthly grid layout
├── Post cards with status indicators
├── Drag-and-drop UX patterns
├── Mobile responsive design
└── Accessibility requirements
    ↓ (30 min)
feature-implementer builds:
├── CalendarGrid component
├── Post card component
├── Drag-drop logic
└── API integration
    ↓ (50 min)
test-validator:
└── E2E drag-drop tests
    ↓ (15 min)
Total: 115 min for complete feature
```

---

## 📚 REPURPOSE-SPECIFIC PLAYBOOKS

### Playbook 1: Add New OAuth Provider

**Agents**: feature-implementer → test-validator → code-reviewer  
**Time**: 30-45 minutes  
**Complexity**: Medium

**Steps**:
1. **feature-implementer** (20-30 min):
   - Create `lib/{provider}.ts` with OAuth functions:
     - `generateAuthUrl()` - PKCE challenge generation
     - `exchangeCodeForTokens()` - Token exchange
     - `refreshAccessToken()` - Token refresh
     - `postContent()` - Platform-specific posting
   - Create `app/api/auth/{provider}/route.ts` - Initialize OAuth
   - Create `app/api/auth/{provider}/callback/route.ts` - Handle callback
   - Update `lib/types.ts` - Add provider type

2. **test-validator** (10-15 min):
   - OAuth flow tests (PKCE, state validation)
   - Token refresh tests
   - Error handling tests
   - Integration tests for posting

3. **code-reviewer** (5-10 min):
   - Security audit: Secrets, encryption, state parameter
   - Code quality: Error handling, types, docs
   - Best practices: Rate limiting, token expiration

**Files Created/Modified**:
```
lib/{provider}.ts                          (new)
app/api/auth/{provider}/route.ts           (new)
app/api/auth/{provider}/callback/route.ts  (new)
lib/__tests__/{provider}.test.ts           (new)
lib/types.ts                               (modified - add Platform type)
```

**Success Criteria**:
- [ ] OAuth flow completes successfully
- [ ] Tokens stored securely in social_accounts table
- [ ] Token refresh works before expiration
- [ ] Posting to platform succeeds
- [ ] All tests pass (> 90% coverage)

---

### Playbook 2: Add New UI Page/Feature

**Agents**: ui-ux-expert → feature-implementer → test-validator  
**Time**: 45-60 minutes  
**Complexity**: Medium

**Steps**:
1. **ui-ux-expert** (15-20 min):
   - Design layout with Magic UI components
   - Define responsive breakpoints
   - Plan accessibility features
   - Select design tokens

2. **feature-implementer** (25-30 min):
   - Build page component with layout
   - Implement client-side logic
   - Add form handling/validation
   - Integrate with API endpoints
   - Add loading/error states

3. **test-validator** (10-15 min):
   - E2E test for happy path
   - Error state tests
   - Responsive behavior tests
   - Accessibility checks

**Files Created/Modified**:
```
app/{page}/page.tsx                (new)
components/{feature}/*             (new)
app/api/{endpoint}/route.ts        (new if needed)
tests/{feature}.spec.ts            (new)
```

**Success Criteria**:
- [ ] Page loads without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] All user interactions work
- [ ] E2E tests pass

---

### Playbook 3: Fix Production Bug

**Agents**: Explore → code-reviewer → feature-implementer  
**Time**: 15-30 minutes  
**Complexity**: Low-Medium

**Steps**:
1. **Explore** (5 min):
   - Find bug location in codebase
   - Identify related files
   - Gather context

2. **code-reviewer** (5-10 min):
   - Analyze root cause
   - Identify edge cases
   - Recommend fix approach

3. **feature-implementer** (10-15 min):
   - Implement fix
   - Add regression test
   - Update error handling

**Real Example: Batch-Create Redirect Bug**
```
Problem: Page redirects to dashboard after 1 second

Explore found: app/batch-create/page.tsx
code-reviewer diagnosed:
├── /batch-create missing from middleware
└── Wrong Supabase client import (non-SSR)

feature-implementer fixed:
├── Added route to middleware.ts:91
└── Changed import to @/lib/supabase-client

Time: 15 minutes
Commits: 2d381ee, bf06137
```

**Success Criteria**:
- [ ] Bug no longer reproduces
- [ ] Regression test added
- [ ] No new bugs introduced
- [ ] Tests pass

---

### Playbook 4: Batch Data Processing

**Agents**: batch-workbench-expert → feature-implementer → test-validator  
**Time**: 60-90 minutes  
**Complexity**: High

**Steps**:
1. **batch-workbench-expert** (20-30 min):
   - Design CSV/table workflow
   - Plan progress tracking UI
   - Define error recovery strategy
   - Design selection interface

2. **feature-implementer** (30-45 min):
   - Build batch processing logic
   - Implement progress tracking
   - Add error handling with retry
   - Create UI with table/selection

3. **test-validator** (15-20 min):
   - Test with 50+ rows
   - Edge cases: partial failures
   - Progress tracking accuracy
   - Error recovery flow

**Real Example: Batch Content Generation**
```
Feature: Generate 30 days of content

batch-workbench-expert designed:
├── Input: theme + topics list
├── Generate 30 posts per platform
├── Progress bar with percentage
└── Draft auto-save

feature-implementer built:
├── app/batch-create/page.tsx (UI)
├── app/api/batch/generate/route.ts
├── app/api/batch/schedule/route.ts
└── Retry logic with exponential backoff

Time: 90 minutes
Files: 3 new files, 710 lines
```

**Success Criteria**:
- [ ] Processes 50+ rows successfully
- [ ] Progress tracking accurate
- [ ] Error recovery works
- [ ] Performance acceptable
- [ ] Tests cover edge cases

---

### Playbook 5: Content Policy Compliance

**Agents**: guardrails-expert  
**Time**: 5-10 minutes  
**Complexity**: Low

**Steps**:
1. **guardrails-expert** (5-10 min):
   - Review content against platform policies
   - Flag policy violations
   - Recommend rewrites if needed
   - Document compliance status

**Use Cases**:
- Review AI-generated content before posting
- Ensure LinkedIn posts follow promotional guidelines
- Check Twitter posts for manipulation/spam
- Validate Instagram captions for hashtag limits

**Real Example: LinkedIn Post Compliance**
```
Task: Review 30 AI-generated LinkedIn posts

guardrails-expert checked:
├── Spam/manipulation: ✅ None found
├── Promotional content: ⚠️ 5 posts need disclaimer
├── Hashtag limits: ✅ All within limits
└── Authenticity: ✅ Properly humanized

Recommendations:
- Add "Sponsored" disclaimer to 5 posts
- Reduce hashtags from 8 to 5 (best practice)

Time: 8 minutes
```

**Success Criteria**:
- [ ] All content reviewed
- [ ] Violations flagged
- [ ] Rewrites provided if needed
- [ ] Compliance documented

---

### Playbook 6: Accessibility Audit & Fixes

**Agents**: ui-ux-expert → code-reviewer → feature-implementer  
**Time**: 30-60 minutes  
**Complexity**: Medium

**Steps**:
1. **ui-ux-expert** (15-20 min):
   - Run accessibility audit
   - Check WCAG 2.1 AA compliance
   - Identify violations
   - Recommend fixes

2. **code-reviewer** (5-10 min):
   - Review semantic HTML
   - Check ARIA labels
   - Validate keyboard navigation

3. **feature-implementer** (15-30 min):
   - Add missing ARIA labels
   - Fix color contrast issues
   - Implement keyboard navigation
   - Add screen reader support

**Common Issues**:
- Missing alt text on images
- Insufficient color contrast (< 4.5:1)
- Missing form labels
- No keyboard navigation
- Broken focus indicators

**Success Criteria**:
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] All forms have labels

---

### Playbook 7: Performance Optimization

**Agents**: Explore → code-reviewer → feature-implementer → test-validator  
**Time**: 60-120 minutes  
**Complexity**: High

**Steps**:
1. **Explore** (15-20 min):
   - Identify performance bottlenecks
   - Measure current metrics
   - Find slow queries/endpoints

2. **code-reviewer** (20-30 min):
   - Analyze optimization opportunities
   - N+1 query detection
   - Large payload identification
   - Caching opportunities

3. **feature-implementer** (30-50 min):
   - Implement optimizations
   - Add caching layer
   - Optimize database queries
   - Lazy load components

4. **test-validator** (10-20 min):
   - Performance benchmarks
   - Load testing
   - Validate improvements

**Real Example: API Response Time Optimization**
```
Problem: /api/adapt taking 8s, /api/posts taking 2s

Explore found:
├── /api/adapt: OpenAI latency
└── /api/posts: N+1 queries

code-reviewer analyzed:
├── Add Redis caching for OpenAI
└── Single Supabase query with join

feature-implementer optimized:
├── Implemented Redis cache
└── Fixed N+1 with proper join

test-validator measured:
├── /api/adapt: 8s → 0.5s (94% improvement)
└── /api/posts: 2s → 0.3s (85% improvement)

Time: 75 minutes
```

**Success Criteria**:
- [ ] Performance targets met
- [ ] No regressions introduced
- [ ] Benchmarks documented
- [ ] Monitoring in place

---

## 🎯 10 REAL-WORLD EXAMPLES FROM REPURPOSE

### Example 1: Batch-Create Redirect Bug (October 17, 2025)

**Problem**: Clicking "Batch Create" loads page for 1 second then redirects to dashboard

**Symptoms**:
```
Server logs:
GET /batch-create 200 in 70ms
GET /dashboard 200 in 60ms  ← Unwanted redirect!
```

**Diagnosis**:
```
Agents: Explore → code-reviewer → feature-implementer
Time: 15 minutes

Explore: Found page at app/batch-create/page.tsx
code-reviewer diagnosed TWO issues:
1. /batch-create missing from middleware.ts protectedPageRoutes
2. Wrong import: using '@/lib/supabase/client' (non-SSR) instead of '@/lib/supabase-client'
```

**Solution**:
```
feature-implementer fixed:
1. Added '/batch-create' to middleware.ts:91
2. Changed import in app/batch-create/page.tsx:4

Result:
GET /batch-create 200 in 4448ms
GET /favicon.ico 200 in 791ms  ← No redirect!
```

**Commits**: `2d381ee` (middleware), `bf06137` (import fix)  
**Files Modified**: 2  
**Learning**: Always check middleware protection AND client SSR compatibility

---

### Example 2: Reset-Password Suspense Error (October 17, 2025)

**Problem**: Vercel build failing with Suspense boundary error

**Error**:
```
useSearchParams() should be wrapped in a suspense boundary
at page "/reset-password"
```

**Diagnosis**:
```
Agents: code-reviewer
Time: 5 minutes

code-reviewer identified:
- useSearchParams() requires Suspense for static generation
- Next.js 15 enforces this for App Router
```

**Solution**:
```
code-reviewer implemented:
1. Imported Suspense from React
2. Extracted ResetPasswordForm component
3. Wrapped in Suspense with loading fallback

Before:
export default function ResetPasswordPage() {
  const searchParams = useSearchParams()  // ❌ Error
  ...
}

After:
function ResetPasswordForm() {
  const searchParams = useSearchParams()  // ✅ Inside Suspense
  ...
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
```

**Commit**: `92220dc`  
**Files Modified**: 1  
**Build Status**: ✅ Succeeded (38/38 pages generated)  
**Learning**: All useSearchParams() usage needs Suspense in Next.js 15

---

### Example 3: Batch Create Feature (October 16, 2025)

**Feature**: Generate 30 days of content at once

**Agents Used**: batch-workbench-expert → feature-implementer → test-validator  
**Time**: 90 minutes

**Implementation**:
```
batch-workbench-expert designed:
├── Input form: theme, topics, platforms
├── Generate 30 posts per platform
├── Progress tracking UI
├── Draft auto-save (24hr validity)
└── Bulk scheduling with optimal times

feature-implementer built:
├── app/batch-create/page.tsx (710 lines)
├── app/api/batch/generate/route.ts
├── app/api/batch/schedule/route.ts
├── Retry logic (exponential backoff)
└── Error recovery (partial failures)

test-validator verified:
├── Generation of 60 posts (2 platforms × 30)
├── Partial failure handling
├── Progress tracking accuracy
└── Draft persistence
```

**Features Delivered**:
- Generate 30 posts per platform
- AI-powered theme & topic expansion
- Automatic scheduling at optimal times
- Real-time progress tracking
- Error recovery with retry
- Draft auto-save for 24 hours

**Commit**: `3045c00`  
**Files**: 3 new files, 710 lines  
**Learning**: Batch operations need robust error recovery

---

### Example 4: Complete P0 UI/UX Fixes (October 16, 2025)

**Project**: Fix 9 critical UI/UX issues

**Agents Used**: ui-ux-expert (primary)  
**Time**: 21 hours  
**Issues Fixed**: 9

**Issues & Solutions**:
```
1. Batch Create navigation
   └─ Added to AppHeader with "NEW" badge

2. Character counters
   └─ Implemented real-time validation with visual feedback

3. Timezone handling
   └─ Fixed datetime-local min attribute

4. Success feedback
   └─ Added toast notifications with proper timing

5. Error states
   └─ Comprehensive error handling with recovery options

6. Loading states
   └─ Skeleton screens + shimmer effects

7. Mobile responsive
   └─ Tested on 3 breakpoints (sm/md/lg)

8. Empty states
   └─ Added illustrations + helpful copy

9. Accessibility
   └─ ARIA labels, keyboard navigation, focus indicators
```

**Commit**: `4ec47d7`  
**Files Modified**: 15  
**Learning**: UI/UX requires holistic approach across all pages

---

### Example 5: Design Token System (October 15, 2025)

**Feature**: Centralized design tokens for consistency

**Agents Used**: ui-ux-expert  
**Time**: 90 minutes

**Implementation**:
```
ui-ux-expert created lib/design-tokens.ts:

// Color tokens
COLOR_PRIMARY = {
  bg: 'bg-blue-600',
  bgHover: 'hover:bg-blue-700',
  text: 'text-blue-600',
  border: 'border-blue-600',
  bgLight: 'bg-blue-50'
}

COLOR_SUCCESS = {
  bg: 'bg-green-600',
  ...
}

COLOR_AI = {
  bg: 'bg-purple-600',
  ...
}

// Component variants
BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  ...
}
```

**Benefits**:
- Consistent colors across 15 pages
- Easy theme updates (change once, apply everywhere)
- Clear semantic naming
- Reduced hardcoded values

**Files**: 1 new file (lib/design-tokens.ts)  
**Usage**: Imported in 15 components  
**Learning**: Design tokens crucial for maintainability

---

### Example 6: Instagram OAuth Implementation (Hypothetical)

**Feature**: Add Instagram OAuth integration

**Agents Used**: feature-implementer → test-validator → code-reviewer  
**Time**: 45 minutes (estimated)

**Implementation Plan**:
```
feature-implementer would create:
├── lib/instagram.ts (OAuth + posting functions)
│   ├── generateAuthUrl() - OAuth 2.0 flow
│   ├── exchangeCodeForTokens() - Token exchange
│   ├── refreshAccessToken() - 60-day expiration
│   └── postContent() - Instagram Graph API
├── app/api/auth/instagram/route.ts (init)
└── app/api/auth/instagram/callback/route.ts (callback)

test-validator would write:
└── lib/__tests__/instagram.test.ts
    ├── OAuth flow tests
    ├── Token refresh tests
    └── Posting tests

code-reviewer would audit:
├── Security: Token encryption, expiration
├── Error handling: Rate limits, API errors
└── Best practices: Retry logic, logging
```

**Learning**: OAuth patterns reusable across providers

---

### Example 7: Content Calendar UI (Hypothetical)

**Feature**: Monthly calendar with drag-and-drop scheduling

**Agents Used**: ui-ux-expert → feature-implementer → test-validator  
**Time**: 120 minutes (estimated)

**Implementation Plan**:
```
ui-ux-expert would design:
├── Monthly grid layout (7×5 grid)
├── Post cards with platform indicators
├── Drag-and-drop UX patterns
├── Mobile: Collapse to list view
└── Accessibility: Keyboard navigation

feature-implementer would build:
├── components/calendar/CalendarGrid.tsx
├── components/calendar/CalendarDay.tsx
├── components/calendar/PostCard.tsx
├── hooks/useCalendarDragDrop.ts
└── API integration with /api/posts

test-validator would test:
├── Drag-drop functionality
├── Date validation
├── Responsive behavior
└── Keyboard navigation
```

**Learning**: Complex interactions need extensive E2E testing

---

### Example 8: API Rate Limiting Enhancement (Hypothetical)

**Feature**: Tiered rate limits with user feedback

**Agents Used**: feature-implementer → test-validator  
**Time**: 60 minutes (estimated)

**Implementation Plan**:
```
feature-implementer would add:
├── lib/rate-limit.ts enhancements
│   ├── Tiered limits (free/pro/enterprise)
│   ├── Per-endpoint quotas
│   └── User feedback (remaining, reset time)
├── Middleware updates
└── UI quota indicators

test-validator would test:
├── Rate limit enforcement
├── Tier transitions
├── Reset timing
└── User feedback accuracy
```

**Learning**: Rate limiting needs clear user communication

---

### Example 9: Content Compliance System (Hypothetical)

**Feature**: Automated policy checking for generated content

**Agents Used**: guardrails-expert → feature-implementer  
**Time**: 45 minutes (estimated)

**Implementation Plan**:
```
guardrails-expert would design:
├── Policy rule engine
│   ├── Twitter: No manipulation, authentic engagement
│   ├── LinkedIn: Professional tone, no excessive promotion
│   └── Instagram: Hashtag limits, authenticity
├── Violation detection patterns
└── Content rewriting strategies

feature-implementer would build:
├── lib/content-policy.ts
│   ├── checkCompliance()
│   ├── detectViolations()
│   └── suggestRewrites()
└── Integration in /api/adapt route
```

**Learning**: Proactive policy checking prevents platform issues

---

### Example 10: Dashboard Performance Optimization (Hypothetical)

**Feature**: Reduce dashboard load time from 3s to < 1s

**Agents Used**: Explore → code-reviewer → feature-implementer → test-validator  
**Time**: 90 minutes (estimated)

**Implementation Plan**:
```
Explore would identify:
├── Slow queries: posts, social_accounts
├── Unoptimized images
└── Unnecessary re-renders

code-reviewer would analyze:
├── N+1 queries: 10 separate queries
├── Missing indexes: user_id, status
├── Large bundle: Framer Motion loaded eagerly
└── Re-render: Every state change

feature-implementer would optimize:
├── Single query with join
├── Database indexes: idx_posts_user_status
├── Dynamic import for Framer Motion
└── React.memo for components

test-validator would benchmark:
├── Initial load: 3s → 0.8s (73% improvement)
├── Calendar render: 500ms → 100ms
└── Lighthouse score: 65 → 92
```

**Learning**: Systematic performance optimization needs measurement

---

## 🏗️ PROJECT CONTEXT

### Project Overview

**What is Repurpose?**

An MVP SaaS platform enabling content creators to:
- Adapt content for multiple social media platforms (Twitter, LinkedIn, Instagram)
- Apply AI-powered humanization and viral content frameworks
- Schedule posts with intelligent timing
- Manage OAuth connections to social platforms
- Track post status and execution

**Target Users**:
- Individual creators and solopreneurs
- Small marketing teams (1-5 accounts)
- Content strategists managing multi-platform presence

**Key Differentiators**:
- **Humanization Protocol**: De-polished, authentic content generation
- **Viral Framework**: 5-axis optimization (Hook, Body, CTA, Intention, Style)
- **Platform-Native Adaptation**: Each platform gets custom guidelines
- **Intelligent Scheduling**: QStash-based delayed execution

---

### Tech Stack & Architecture

**Frontend Stack**:
```yaml
Framework: Next.js 15.5.4 (App Router)
Language: TypeScript 5.x (strict mode)
UI: React 19.1.0
Styling: Tailwind CSS 4 + class-variance-authority
Animations: Framer Motion 12.23.22
Components: shadcn/ui + custom components
Build: Turbopack (Next.js native)
```

**Backend Stack**:
```yaml
Runtime: Node.js (Vercel serverless)
API: Next.js API Routes (app/api/*/route.ts)
Database: Supabase (PostgreSQL + RLS)
Auth: Supabase Auth (email/password + OAuth)
Job Queue: Upstash QStash (delayed execution)
AI: OpenAI GPT-4o (gpt-4o model)
Rate Limiting: Upstash Redis (sliding window)
```

**External Integrations**:
- **OpenAI API**: Content adaptation and humanization
- **Twitter API v2**: OAuth 2.0 PKCE + tweet posting
- **LinkedIn API**: OAuth 2.0 + UGC post publishing
- **Upstash QStash**: Job scheduling and execution
- **Upstash Redis**: Rate limiting and caching
- **Vercel**: Hosting, edge functions, analytics

**Architecture**:
```
┌─────────────────────────────────────────┐
│     User Browser (React/Next.js)        │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│    Next.js API Routes (Serverless)      │
│  /adapt  /schedule  /posts  /auth       │
└────┬──────┬──────┬──────┬───────────────┘
     ↓      ↓      ↓      ↓
┌────────┬──────┬────────┬────────┐
│ OpenAI │QStash│Supabase│Social  │
│ GPT-4  │      │   DB   │Platforms
└────────┴──────┴────────┴────────┘
```

---

### Core Workflows

**1. Content Adaptation Workflow**:
```
User enters content + selects platforms/tone
    ↓
POST /api/adapt (with auth + rate limit)
    ↓
OpenAI GPT-4o adapts for each platform (parallel)
    ↓
Return adapted content with character counts
```

**Key files**: `app/api/adapt/route.ts:12-139`, `lib/anthropic.ts:57-170`

**Subagent recommendation**: For AI prompt changes → guardrails-expert or general-purpose

---

**2. Post Scheduling Workflow**:
```
User selects datetime + confirms schedule
    ↓
POST /api/schedule (validate auth + input)
    ↓
Insert post to database (status: scheduled)
    ↓
Schedule QStash delayed job
    ↓
Return success to user

[Later, at scheduled time]
QStash → POST /api/post/execute
    ↓
Verify QStash signature
    ↓
Get post + social account from DB
    ↓
Refresh OAuth tokens if needed
    ↓
Post to platform (Twitter/LinkedIn)
    ↓
Update post status (posted/failed)
```

**Key files**: `app/api/schedule/route.ts`, `app/api/post/execute/route.ts`, `lib/qstash.ts`

**Subagent recommendation**: For scheduling issues → Explore + code-reviewer

---

**3. OAuth Connection Workflow**:
```
User clicks "Connect Twitter"
    ↓
Generate PKCE verifier + challenge + state
    ↓
Store verifier + state in DB (encrypted)
    ↓
Redirect to Twitter OAuth
    ↓
User approves
    ↓
Twitter redirects to callback with code + state
    ↓
Validate state, retrieve verifier
    ↓
Exchange code + verifier for tokens
    ↓
Store tokens in social_accounts table
    ↓
Redirect to connections page
```

**Key files**: `app/api/auth/init-twitter/route.ts`, `app/api/auth/twitter/callback/route.ts`, `lib/twitter.ts`

**Subagent recommendation**: For OAuth implementation → feature-implementer

---

### Development Patterns

**API Route Pattern**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return ErrorResponses.unauthorized()

    // 2. Rate Limiting
    const rateLimitResult = await checkRateLimit(...)
    if (!rateLimitResult.success) return NextResponse.json({...}, {status: 429})

    // 3. Validate Input
    const body = await request.json()
    if (!body.field) return ErrorResponses.missingField('field')

    // 4. Business Logic
    const result = await processRequest(...)

    // 5. Success Response
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return ErrorResponses.internalError(error.message)
  }
}
```

**Database Query Pattern**:
```typescript
// Client-side (with RLS)
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)  // RLS enforces this
  .order('created_at', { ascending: false })

// Server-side (admin privileges)
const supabaseAdmin = getSupabaseAdmin()
const { data, error } = await supabaseAdmin
  .from('posts')
  .update({ status: 'posted' })
  .eq('id', postId)
```

**Type Safety Pattern**:
```typescript
// lib/types.ts
export type Platform = 'twitter' | 'linkedin' | 'instagram'
export type PostStatus = 'draft' | 'scheduled' | 'posted' | 'failed'

export interface Post {
  id: string
  user_id: string
  platform: Platform
  original_content: string
  adapted_content: string
  scheduled_time: string | null
  status: PostStatus
  created_at: string
}
```

---

### Testing & QA

**Testing Strategy**:
```yaml
Unit Tests (Jest):
  Location: lib/__tests__/
  Coverage: Utility functions, OAuth helpers
  Run: npm test

Integration Tests (Jest):
  Location: app/api/__tests__/
  Coverage: API endpoints with mocks
  Run: npm run test:integration

E2E Tests (Playwright):
  Location: tests/
  Coverage: Critical user flows
  Run: npx playwright test
```

**Subagent recommendation**: For comprehensive tests → test-validator

---

### Deployment & Operations

**Environments**:
```bash
Local: http://localhost:3000 (npm run dev)
Staging: https://repurpose-staging.vercel.app (branch: develop)
Production: https://repurpose-orpin.vercel.app (branch: main)
```

**Deployment Checklist**:
- [ ] All tests passing
- [ ] TypeScript compiles (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] OAuth callback URLs updated

**Subagent recommendation**: For deployment → solodev-claude-reviewer (pre-commit)

---

### Security & Compliance

**Security Checklist**:
- [x] All API routes require authentication
- [x] RLS policies enforce user isolation
- [x] JWT/session validation on every request
- [x] User ID verification (no impersonation)
- [x] Content length limits enforced
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (input sanitization)
- [x] Rate limiting: AI (10/hour), API (30/min)
- [x] QStash signature verification
- [x] PKCE implementation for Twitter OAuth
- [x] State parameter validation
- [x] Encrypted token storage
- [x] Token refresh logic with expiration
- [x] Environment variables in Vercel (not git)

**Subagent recommendation**: For security audits → code-reviewer + solodev-claude-reviewer

---

### Performance & Optimization

**Performance Targets**:
```yaml
API Response Times (p95):
  /api/adapt: < 5000ms (OpenAI dependency)
  /api/schedule: < 800ms
  /api/posts: < 300ms
  /api/auth: < 500ms

Page Load Times (p95):
  Landing: < 1500ms
  Dashboard: < 2000ms
  Create: < 1800ms

Database Queries:
  Single record: < 50ms
  List queries: < 100ms
```

**Optimization Strategies**:
- Use `Promise.all` for parallel platform adaptation
- Implement Redis caching for common adaptations
- Lazy load heavy dependencies (Framer Motion)
- Optimize Supabase queries with indexes
- Next.js Image optimization (automatic)
- Code splitting with dynamic imports

**Database Indexes**:
```sql
CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_posts_scheduled_time ON posts(scheduled_time) WHERE status = 'scheduled';
CREATE INDEX idx_social_accounts_user_platform ON social_accounts(user_id, platform);
```

**Subagent recommendation**: For performance optimization → Explore + code-reviewer + feature-implementer (iterative)

---

### Troubleshooting & Debugging

**Common Issues**:

1. **OAuth callback fails with "Invalid state"**
   - Subagent: Explore + code-reviewer
   - Check: Session/cookie storage, domain settings, state expiration

2. **QStash jobs not executing**
   - Subagent: Explore + code-reviewer
   - Check: NEXT_PUBLIC_APP_URL, signing keys, middleware blocks, timeout

3. **Rate limit errors in production**
   - Subagent: code-reviewer
   - Check: Redis connection, rate limit windows, user quotas

4. **Content adaptation returns empty responses**
   - Subagent: general-purpose + code-reviewer
   - Check: OpenAI API key, quota, prompt length, token limits

---

## 📚 Appendix: Quick Reference

### Essential Commands

```bash
# Development
npm run dev                # Start dev server (http://localhost:3000)
npm run build              # Build for production
npm test                   # Run Jest tests
npx playwright test        # Run E2E tests

# Database
supabase link              # Link to Supabase project
supabase db pull           # Pull remote schema
supabase gen types typescript --local > lib/database.types.ts

# Deployment
git push origin main       # Auto-deploy to production
vercel --prod              # Manual production deploy
```

### Important File Locations

```
app/
├── api/                          # API routes
│   ├── adapt/route.ts            # Content adaptation
│   ├── schedule/route.ts         # Post scheduling
│   ├── post/execute/route.ts     # QStash callback
│   ├── batch/                    # Batch operations
│   └── auth/                     # OAuth flows
├── dashboard/page.tsx            # Main dashboard
├── create/page.tsx               # Content creation
├── batch-create/page.tsx         # Batch content generation
├── posts/page.tsx                # Posts management
└── connections/page.tsx          # Social account connections

lib/
├── anthropic.ts                  # OpenAI integration
├── qstash.ts                     # Job scheduling
├── twitter.ts                    # Twitter API
├── linkedin.ts                   # LinkedIn API
├── supabase-client.ts            # Supabase browser client (SSR)
├── supabase/                     # Supabase server clients
├── rate-limit.ts                 # Rate limiting
├── design-tokens.ts              # Design system tokens
├── types.ts                      # TypeScript types
└── constants.ts                  # Platform limits

components/
├── ui/                           # shadcn/ui components
├── layout/                       # Layout components
└── posts/                        # Post-related components
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Twitter
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## ✅ Validation Checklist

- [x] All 12 real agents documented
- [x] No fictional "legacy agents"
- [x] 30-second decision tree included
- [x] Domain → Agent matrix complete (15 scenarios)
- [x] 4 execution patterns with examples
- [x] 7 Repurpose playbooks with time estimates
- [x] 10 real-world examples (3 actual, 7 realistic)
- [x] Project context preserved
- [x] Copy-paste invocation templates for each agent
- [x] Parallel execution opportunities highlighted
- [x] Real commit references (2d381ee, bf06137, 92220dc, etc.)

---

**Version**: 3.0.0  
**Last Updated**: October 17, 2025  
**Next Review**: January 17, 2026  
**Maintainer**: Repurpose MVP Development Team

---

**Document Purpose**: This document serves as the **single source of truth** for subagent orchestration in the Repurpose MVP project. All development should follow these patterns and playbooks for consistent, high-quality outcomes.

**For Questions**: Refer to the Quick Reference Card at the top for instant decisions, or consult the relevant playbook for detailed guidance.
