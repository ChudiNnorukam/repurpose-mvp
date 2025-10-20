# SKILLS.md - Claude Skills Catalog for Repurpose MVP

**Version:** 2.0.0 (Updated for CLAUDE.md v3.2 orchestration)
**Last Updated:** 2025-10-19
**Purpose:** Comprehensive catalog of 14 specialized Claude skills for Repurpose MVP development and orchestration

---

## 📚 Available Skills (ALL 14 OPERATIONAL ✅)

### Complete Skill Inventory (v3.2)

| # | Skill Name | Status | Tier | Primary Domain | File Location |
|---|------------|--------|------|----------------|---------------|
| 1 | general-purpose | ✅ Available | 1 | Research & Complex Tasks | `.claude/skills/general-purpose/SKILL.md` |
| 2 | Explore | ✅ Available | 1 | Codebase Navigation | `.claude/skills/explore/SKILL.md` |
| 3 | feature-implementer | ✅ Available | 1 | Feature Development | `.claude/skills/feature-implementer/SKILL.md` |
| 4 | test-validator | ✅ Available | 1 | Testing & Validation | `.claude/skills/test-validator/SKILL.md` |
| 5 | code-reviewer | ✅ Available | 1 | Code Quality & Security | `.claude/skills/code-reviewer/SKILL.md` |
| 6 | solodev-claude-reviewer | ✅ Available | 1 | Pre-commit & CI/CD | `.claude/skills/solodev-claude-reviewer/SKILL.md` |
| 7 | guardrails-expert | ✅ Available | 1 | Policy & Compliance | `.claude/skills/guardrails-expert/SKILL.md` |
| 8 | batch-workbench-expert | ✅ Available | 1 | Bulk Operations | `.claude/skills/batch-workbench-expert/SKILL.md` |
| 9 | shadcn-expert | ✅ Available | 1 | UI Components | `.claude/skills/shadcn-expert/SKILL.md` |
| 10 | statusline-setup | ✅ Available | 1 | CLI Configuration | `.claude/skills/statusline-setup/SKILL.md` |
| 11 | output-style-setup | ✅ Available | 1 | Output Formatting | `.claude/skills/output-style-setup/SKILL.md` |
| 12 | ui-ux-expert | ✅ Available | 1 | Design & Accessibility | `.claude/skills/ui-ux-expert/SKILL.md` |
| 13 | researcher-expert | ✅ Available | 1 | Technical Research | `.claude/skills/researcher-expert/SKILL.md` |
| 14 | n8n-automation-engineer | ✅ Available | 1 | Workflow Automation | `.claude/skills/n8n-automation-engineer/SKILL.md` |

**NEW Skills (v3.2):** researcher-expert, n8n-automation-engineer, Repurpose AI App Developer

**Legend:**
- ✅ Available: Fully developed and ready for use
- ⚠️ Needed: Priority for development
- 🚧 In Progress: Currently being built
- 💡 Planned: Future skill

---

## 🏆 Skill Tier System

### Tier 1: Complete Orchestration Skills (ALL 14 AVAILABLE ✅)

These 14 skills handle all development workflows for Repurpose MVP using v3.2 orchestration patterns.

**Foundation Domain:**
- **general-purpose**: Complex research, multi-step analysis, tech evaluation
- **Explore**: Fast codebase search, locating code patterns
- **feature-implementer**: New features, endpoints, OAuth, integrations
- **test-validator**: Unit/E2E tests, coverage, validation
- **code-reviewer**: Quality, security audit, optimization, architecture
- **solodev-claude-reviewer**: Pre-commit validation, CI/CD optimization, security
- **debug-expert**: Systematic debugging, error diagnosis, root cause analysis

**Specialized Domain:**
- **guardrails-expert**: Policy compliance, content moderation, GDPR
- **batch-workbench-expert**: CSV/bulk operations, 50+ row workflows
- **shadcn-expert**: shadcn/ui components, forms, dialogs, responsive design
- **ui-ux-expert**: Design, Magic UI, accessibility (WCAG AA), responsive layouts
- **researcher-expert**: Authoritative source research, RFC standards, best practices
- **n8n-automation-engineer**: Workflow orchestration, AI agents, RAG pipelines

**Infrastructure Domain:**
- **statusline-setup**: Claude Code status line configuration
- **output-style-setup**: Output formatting and response style

**Status:** COMPLETE - All 14 skills operational per v3.2

---

## 📖 Detailed Skill Profiles

### Foundation Skills (v3.2)

### 1. general-purpose ✅

**Status:** Available

**Purpose:** Complex research, multi-step analysis, and tech evaluation for unclear or multi-domain problems.

**Core Capabilities:**
- Multi-step problem analysis
- Technology research and evaluation
- Complex decision-making frameworks
- Fallback for unclear requests
- Tech stack comparisons

**When to Use:**
- Complex/unclear requirements
- Multi-domain problems requiring research
- Technology evaluation
- General assistance requests

**Activation Triggers:**
```
Keywords: research, analyze, complex, evaluate, compare, strategy
Patterns: Multiple options, unclear scope, tech decisions
```

**File:** `.claude/skills/general-purpose/SKILL.md`

---

### 2. Explore ✅

**Status:** Available

**Purpose:** Fast codebase search and navigation for finding code patterns, files, and understanding structure.

**Core Capabilities:**
- Glob pattern matching for fast file discovery
- Grep for code search across files
- Codebase structure analysis
- Finding code patterns and usage
- Architecture understanding

**When to Use:**
- Finding where code is located
- Understanding codebase structure
- Searching for patterns
- Pre-implementation analysis

**Activation Triggers:**
```
Keywords: find, where, locate, search, how does, investigate
Patterns: "where is", "find all", "how is X implemented"
```

**File:** `.claude/skills/explore/SKILL.md`

---

### 3. feature-implementer ✅

**Status:** Available

**Purpose:** Build new features, API endpoints, and functionality with minimal viable implementation and best practices.

**Core Capabilities:**
- Feature development (backend + frontend)
- API route implementation
- OAuth flows (Twitter, LinkedIn)
- Integration patterns
- Supabase queries and RLS
- QStash job scheduling
- Repurpose AI App Developer patterns

**When to Use:**
- Adding new features
- Implementing API endpoints
- Building OAuth integrations
- Creating UI components
- Complex multi-file changes (>20 lines)

**Activation Triggers:**
```
Keywords: implement, add, build, create, develop, feature
Patterns: Feature specs, user stories, detailed requirements
```

**Auto-chains to:** test-validator → code-reviewer

**File:** `.claude/skills/feature-implementer/SKILL.md`

---

### 4. test-validator ✅

**Status:** Available

**Purpose:** Comprehensive testing strategy, Jest/Playwright tests, coverage analysis for Repurpose MVP.

**Core Capabilities:**
- Test strategy (unit, integration, E2E)
- Jest configuration for Next.js 15
- Playwright E2E testing
- Supabase mocking
- OAuth flow testing
- Coverage analysis
- Regression testing

**When to Use:**
- Writing new tests
- Improving test coverage
- Fixing failing tests
- Test architecture
- Supabase RLS policy testing

**Activation Triggers:**
```
Keywords: test, testing, spec, coverage, jest, playwright, e2e, verify
Patterns: Test files, coverage reports, test failures
```

**File:** `.claude/skills/test-validator/SKILL.md`

---

### 5. code-reviewer ✅

**Status:** Available

**Purpose:** Expert code review for quality, security, architecture, performance, and maintainability.

**Core Capabilities:**
- Code quality assessment
- Security audit (OAuth PKCE, tokens, RLS)
- Architecture review
- Performance optimization
- Next.js 15 patterns
- TypeScript best practices
- React 19 patterns

**When to Use:**
- PR reviews
- Security audits
- Refactoring decisions
- Performance optimization
- Architecture decisions

**Activation Triggers:**
```
Keywords: review, refactor, improve, optimize, clean, best practice, audit
Patterns: Code snippets, diffs, PRs, "feedback on"
```

**Includes Checklist:** `.claude/skills/code-reviewer/security-audit-checklist.md`

**File:** `.claude/skills/code-reviewer/SKILL.md`

---

### 6. solodev-claude-reviewer ✅

**Status:** Available

**Purpose:** Pre-commit validation and CI/CD optimization for rapid solo development workflows.

**Core Capabilities:**
- Pre-commit validation checklist
- GitHub Actions optimization
- Security scanning (secrets, dependencies)
- Vercel deployment checks
- Build time profiling
- CI/CD workflow setup
- Soft-gate CI patterns

**When to Use:**
- Before committing code
- Before deployment
- CI/CD pipeline failures
- Security scanning
- Build optimization

**Activation Triggers:**
```
Keywords: commit, deploy, CI/CD, pipeline, security scan, pre-commit, ready
Patterns: "before I commit", "ready to deploy", "pipeline failing"
```

**File:** `.claude/skills/solodev-claude-reviewer/SKILL.md`

---

### 7. debug-expert ✅

**Status:** Available

**Purpose:** Systematic diagnosis and resolution of errors, bugs, and unexpected behavior in Repurpose MVP.

**Core Capabilities:**
- Error message parsing (build, runtime, test failures)
- Next.js 15 debugging (hydration, SSR/CSR boundaries, Turbopack)
- Supabase troubleshooting (auth, RLS, queries)
- OAuth flow debugging (Twitter, LinkedIn PKCE)
- Root cause analysis (5 Whys methodology)
- Production error recovery

**When to Use:**
- Build/compilation errors
- Runtime exceptions
- Test failures
- Authentication issues
- Hydration mismatches
- API errors
- Database failures

**Activation Triggers:**
```
Keywords: error, failing, broken, crash, bug, issue, problem, exception
Patterns: Stack traces, error codes, "not working", logs
```

**File:** `.claude/skills/debug-expert/SKILL.md`

---

### Specialized Skills (v3.2)

### 8. guardrails-expert ✅

**Status:** Available

**Purpose:** Policy compliance, content moderation, and regulatory adherence for social platforms and data protection.

**Core Capabilities:**
- Twitter/LinkedIn API policy compliance
- GDPR and data protection
- Content moderation rules
- Policy violation detection
- Compliance documentation
- User-generated content guidelines

**When to Use:**
- Policy compliance checks
- Content moderation strategy
- GDPR requirements
- Platform API term adherence

**Activation Triggers:**
```
Keywords: compliance, policy, GDPR, moderation, content safety
Patterns: Compliance checks, policy questions, regulatory requirements
```

**File:** `.claude/skills/guardrails-expert/SKILL.md`

---

### 9. batch-workbench-expert ✅

**Status:** Available

**Purpose:** Bulk operations, CSV processing, and 50+ row batch workflows for Repurpose MVP.

**Core Capabilities:**
- CSV import/export workflows
- Bulk content generation (30-day generation)
- Table UI design with selection
- Progress tracking
- Batch error recovery
- Data validation at scale

**When to Use:**
- Batch content generation
- Bulk database updates
- CSV processing
- Batch operations (50+ items)
- Progress tracking UI

**Activation Triggers:**
```
Keywords: batch, bulk, CSV, 50+, 100+, process multiple, generate days
Patterns: Batch operations, bulk uploads, large datasets
```

**File:** `.claude/skills/batch-workbench-expert/SKILL.md`

---

### 10. shadcn-expert ✅

**Status:** Available

**Purpose:** shadcn/ui component library design, customization, and responsive layouts.

**Core Capabilities:**
- shadcn/ui component selection
- Form design and validation
- Dialog/modal patterns
- Responsive layouts
- Component composition
- Framer Motion animations
- Accessibility (WCAG)

**When to Use:**
- Building UI with shadcn
- Form implementation
- Dialog/modal creation
- Component architecture
- Design consistency

**Activation Triggers:**
```
Keywords: shadcn, form, dialog, component, UI, modal, dropdown
Patterns: UI design, component patterns, form implementation
```

**File:** `.claude/skills/shadcn-expert/SKILL.md`

---

### 11. ui-ux-expert ✅

**Status:** Available

**Purpose:** Design, Magic UI components, responsive layouts, and accessibility (WCAG AA).

**Core Capabilities:**
- Design system work
- Magic UI components
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- User experience optimization
- Layout patterns
- Design tokens (COLOR_PRIMARY, COLOR_AI)

**When to Use:**
- UI/UX design
- Design system creation
- Responsive layout
- Accessibility audit
- User experience optimization

**Activation Triggers:**
```
Keywords: design, UI, UX, layout, responsive, accessibility, a11y
Patterns: Design specs, mockups, UX improvements
```

**File:** `.claude/skills/ui-ux-expert/SKILL.md`

---

### 12. researcher-expert ✅

**Status:** Available

**Purpose:** Systematic research of authoritative sources, standards, RFC compliance, and best practices.

**Core Capabilities:**
- RFC research (OAuth PKCE RFC 7636, etc.)
- Vendor documentation (Twitter, LinkedIn, OpenAI)
- Standards research (WCAG 2.1 AA, GDPR)
- Best practices compilation
- CRAAP scoring (Credibility, Recency, Authority, Accuracy, Purpose)
- PRISMA search logging
- Source ranking and validation

**When to Use:**
- OAuth implementation (requires RFC + vendor docs)
- Standards compliance
- Technology evaluation
- Security best practices
- Performance optimization guidance

**Activation Triggers:**
```
Keywords: research, find docs, authoritative, RFC, best practices, standard
Patterns: Technical questions, compliance questions, security
```

**Auto-triggers for:** OAuth, security, compliance, unfamiliar APIs (confidence < 0.7)

**File:** `.claude/skills/researcher-expert/SKILL.md`

---

### 13. n8n-automation-engineer ✅

**Status:** Available

**Purpose:** n8n workflow orchestration, AI agents, RAG pipelines, and complex automation.

**Core Capabilities:**
- n8n workflow design
- AI agent orchestration
- RAG pipeline setup
- Multi-agent systems
- Workflow templates
- Integration nodes
- Error handling in workflows

**When to Use:**
- Building n8n workflows
- AI agent creation
- Complex automation
- Multi-step workflows
- Integration automation

**Activation Triggers:**
```
Keywords: n8n, workflow, automation, AI agent, RAG, orchestration
Patterns: Workflow requests, automation needs, AI agent design
```

**File:** `.claude/skills/n8n-automation-engineer/SKILL.md`

---

## 🔗 Skill Dependencies & Orchestration

### Dependency Graph (v3.2 - All Standalone)

```
All 14 Skills Available - No Blockers:
┌────────────────────────────────────────────────────────┐
│ Foundation Domain (7 skills) - ALL ✅                  │
│  ├─ general-purpose                                    │
│  ├─ Explore                                            │
│  ├─ feature-implementer                                │
│  ├─ test-validator                                     │
│  ├─ code-reviewer                                      │
│  ├─ solodev-claude-reviewer                            │
│  └─ debug-expert                                       │
├────────────────────────────────────────────────────────┤
│ Specialized Domain (6 skills) - ALL ✅                 │
│  ├─ guardrails-expert                                  │
│  ├─ batch-workbench-expert                             │
│  ├─ shadcn-expert                                      │
│  ├─ ui-ux-expert                                       │
│  ├─ researcher-expert                                  │
│  └─ n8n-automation-engineer                            │
├────────────────────────────────────────────────────────┤
│ Infrastructure Domain (2 skills) - ALL ✅              │
│  ├─ statusline-setup                                   │
│  └─ output-style-setup                                 │
└────────────────────────────────────────────────────────┘
```

**No external dependencies** - All 14 skills are standalone and fully operational.

---

## 🔄 Skill Combinations (v3.2 Orchestration)

### Auto-Chain Patterns

#### Pattern 1: Bug Fix Pipeline
```
debug-expert → code-reviewer → test-validator → solodev-claude-reviewer
[Find bug] → [Fix it] → [Test it] → [Deploy it]
Time: 15-30 min
```

#### Pattern 2: Feature Implementation (Auto-Chain)
```
feature-implementer → test-validator → code-reviewer
[Build feature] → [Test it] → [Security audit]
Time: 30-60 min
```

#### Pattern 3: OAuth Implementation (Research → Implement)
```
researcher-expert → feature-implementer → test-validator → code-reviewer
[Research RFC] → [Build OAuth] → [Test flows] → [Security audit]
Time: 45-90 min
```

#### Pattern 4: Design → Implement
```
ui-ux-expert → shadcn-expert → feature-implementer → test-validator
[Design UX] → [Select components] → [Build UI] → [Test E2E]
Time: 60-120 min
```

#### Pattern 5: Batch Operations
```
batch-workbench-expert → feature-implementer → test-validator
[Design batch UX] → [Implement processing] → [Test with 50+]
Time: 60-90 min
```

#### Pattern 6: Policy Compliance Check
```
guardrails-expert → feature-implementer → solodev-claude-reviewer
[Check policies] → [Update code] → [Pre-commit]
Time: 15-30 min
```

### Parallel Execution Patterns

#### Parallel 1: Multi-Platform Integration
```
feature-implementer(Twitter) || feature-implementer(LinkedIn) || feature-implementer(Instagram)
Time: ~45 min (vs 135 min sequential)
```

#### Parallel 2: UI + Automation
```
ui-ux-expert || n8n-automation-engineer
[Design dashboard] || [Build workflow]
Time: 60-120 min
```

### Skill Compatibility Matrix (14x14)

Core combinations that work well together:

| Primary | Auto-chains to | Parallel with | Rarely with |
|---------|---------------|----|----------|
| **feature-implementer** | test-validator, code-reviewer | ui-ux-expert, shadcn-expert | statusline-setup |
| **test-validator** | code-reviewer | feature-implementer, debug-expert | output-style-setup |
| **code-reviewer** | solodev-claude-reviewer | debug-expert, test-validator | general-purpose |
| **researcher-expert** | feature-implementer, code-reviewer | Explore | statusline-setup |
| **ui-ux-expert** | shadcn-expert | feature-implementer, n8n-automation-engineer | debug-expert |
| **batch-workbench-expert** | feature-implementer | general-purpose | statusline-setup |
| **guardrails-expert** | feature-implementer, code-reviewer | solodev-claude-reviewer | general-purpose |
| **n8n-automation-engineer** | feature-implementer | ui-ux-expert, researcher-expert | debug-expert |

**Legend:**
- **Auto-chains to**: Skills called after completion
- **Parallel with**: Can run simultaneously
- **Rarely with**: Different domains, limited interaction

---

## 🚀 Using Skills in Repurpose MVP

### Quick Start

Skills are automatically activated based on your query. Claude analyzes your request and selects the appropriate skill(s).

### Manual Skill Activation

If you want to explicitly use a skill, reference it in your query:

```
"Use debug-expert to diagnose this build error"
"Have code-reviewer audit this OAuth implementation"
"Run test-validator on the new API routes"
"Use solodev-claude-reviewer before I commit"
```

### Skill Activation Pattern

When a skill is activated, you'll see:

```
🎯 ACTIVATING SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ PRIMARY: [skill-name]
→ TASK: [what I'm doing]
→ WORKFLOW: [how I'll approach it]
```

---

## 📊 Repurpose MVP Tech Stack Context

All skills understand the Repurpose MVP stack:

**Frontend:**
- Next.js 15.5.4 (App Router, Turbopack)
- React 19.1.0
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- shadcn/ui (Radix primitives)

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + RLS)
- Upstash QStash (scheduling)
- Upstash Redis (rate limiting)

**Auth:**
- Supabase Auth (email/password)
- OAuth 2.0 PKCE (Twitter, LinkedIn)

**AI:**
- OpenAI GPT-4o

**Testing:**
- Jest (unit tests)
- Playwright (E2E tests)
- @testing-library/react

**Deployment:**
- Vercel (production)
- GitHub Actions (CI/CD)

---

## 🎯 Priority Workflows

### Workflow 1: Fix Build Error
**Current Need:** tsconfig.json missing baseUrl causing module resolution errors

```
ACTIVATE: debug-expert
├─ Diagnose: Module resolution error (@/lib/*, @/components/*)
├─ Root Cause: Missing "baseUrl": "." in tsconfig.json
├─ Fix: Add baseUrl configuration
└─ Verify: Build succeeds
```

### Workflow 2: Pre-Deployment Check
```
ACTIVATE: solodev-claude-reviewer
├─ Code quality ✓
├─ Tests passing ✓
├─ No secrets ✓
├─ Build succeeds ✓
└─ DECISION: GO/NO-GO
```

### Workflow 3: New Feature Implementation
```
ACTIVATE: code-reviewer → test-validator → solodev-claude-reviewer
├─ Implement with best practices
├─ Add comprehensive tests
└─ Pre-commit validation
```

---

## ✅ System Status (v3.2)

**Total Skills:** 14/14 Available (100%) ✅
- **Foundation Domain:** 7/7 ✅
- **Specialized Domain:** 6/6 ✅
- **Infrastructure Domain:** 2/2 ✅

**System:** Fully Operational - Complete Orchestration Ready

**All 14 skills are available and ready to use per CLAUDE.md v3.2 specifications.**

---

## 🔄 Skill Updates & Versioning

All skills follow semantic versioning:
- **Major (X.0.0)**: Breaking changes, new orchestration patterns
- **Minor (0.X.0)**: New capabilities, added examples
- **Patch (0.0.X)**: Bug fixes, documentation updates

**v3.2 Updates (Oct 19, 2025):**
- Added researcher-expert (authoritative source research)
- Added n8n-automation-engineer (workflow orchestration)
- Added Repurpose AI App Developer skill integration
- Implemented auto-fallback pattern for all agents
- Standardized security, testing, and compliance checklists
- Created 6 primary orchestration patterns + parallel execution

**Current Versions:**
- debug-expert: 1.0.0
- code-reviewer: 1.0.0
- test-validator: 1.0.0
- solodev-claude-reviewer: 1.0.0
- feature-implementer: 1.0.0
- general-purpose: 1.0.0
- Explore: 1.0.0
- guardrails-expert: 1.0.0
- batch-workbench-expert: 1.0.0
- shadcn-expert: 1.0.0
- ui-ux-expert: 1.0.0
- researcher-expert: 1.0.0 (NEW)
- n8n-automation-engineer: 1.0.0 (NEW)
- statusline-setup: 1.0.0
- output-style-setup: 1.0.0

---

## 📚 Key Documentation

- **Orchestration Engine:** See `CLAUDE.md` v3.2 for decision trees and patterns
- **Shared Checklists:** `.claude/skills/_shared/` directory
- **Individual Skills:** `.claude/skills/{skill-name}/SKILL.md`
- **Examples & Templates:** `.claude/skills/{skill-name}/examples/`

---

**Remember: Skills provide specialized expertise for Repurpose MVP. Every development task benefits from appropriate skill-based approaches per v3.2 orchestration.**

**Version**: 2.0.0 (Updated for CLAUDE.md v3.2)
**Last Updated**: October 19, 2025
**Maintainer**: Repurpose MVP Team
**Status**: All 14 skills operational and ready for use
