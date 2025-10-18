# Repurpose - Agent Orchestration v3.1

**Purpose**: Precision orchestration engine for Claude Code | **Updated**: Oct 17, 2025

---

## ⚡ QUICK DECISION (30s)

```
REQUEST → SIZE CHECK → KEYWORD MATCH → DOMAIN CHECK → DEFAULT
```

**Step 1: Size**

- < 10 lines? → Handle directly
- Trivial? → Handle directly

**Step 2: Keywords**
| Trigger | Agent |
|---------|-------|
| implement, add, build | feature-implementer |
| test, verify, coverage | test-validator |
| review, audit, refactor | code-reviewer |
| design, UI, layout | ui-ux-expert |
| find, where, search | researcher-expert |
| batch, CSV, 50+, bulk | batch-workbench-expert |
| policy, compliance | guardrails-expert |
| shadcn, form, dialog | shadcn-expert |
| research, find docs, authoritative | researcher-expert |

**Step 3: Multi-domain**

- A→B→C? Chain agents
- A||B? Parallel
- Iterative? Loop

**Step 4: Default**

- Complex/unclear? → researcher-expert → Delegate to specific agent
- Need exploration? → researcher-expert → Delegate to specific agent

**Auto-chain**: feature-implementer → test-validator → code-reviewer

---

## 🔧 SKILLS SYSTEM

**Skills** = YAML-fronted .md files in `.claude/skills/` providing:

- Project context (Next.js 15, Supabase, QStash, OAuth)
- Code templates (API routes, OAuth, Supabase, QStash)
- Real examples (batch-create, calendar, scheduling)
- Conventions (design tokens, RLS, rate limiting)

**Locations**:

- **Project**: `.claude/skills/` (git-committed, team-shared)
- **Personal**: `~/.claude/skills/` (local overrides)

**Discovery**: Keyword-based (see `.claude/skills/README.md`)

**Flow**:

```
User → Skill (context) → Subagent (if complex) → Result
```

**Details**: See `.claude/skills/README.md`

---

## 📖 THE 13 AGENTS

| #   | Agent                   | Purpose                        | Tools                                                   | Keywords                               |
| --- | ----------------------- | ------------------------------ | ------------------------------------------------------- | -------------------------------------- |
| 1   | general-purpose         | Complex research, multi-step   | \*                                                      | research, analyze, complex             |
| 2   | Explore                 | Fast codebase search           | Glob, Grep, Read, Bash                                  | find, where, locate                    |
| 3   | feature-implementer     | New features, endpoints        | \*                                                      | implement, add, build                  |
| 4   | test-validator          | Tests (unit, E2E)              | \*                                                      | test, verify, coverage                 |
| 5   | code-reviewer           | Quality, security review       | \*                                                      | review, audit, optimize                |
| 6   | solodev-claude-reviewer | Pre-commit, CI, security       | \*                                                      | pre-commit, security scan              |
| 7   | guardrails-expert       | Policy compliance              | \*                                                      | policy, compliance, GDPR               |
| 8   | batch-workbench-expert  | CSV/bulk operations            | \*                                                      | batch, CSV, 50+, bulk                  |
| 9   | shadcn-expert           | shadcn/ui components           | Read, Write, Edit, Glob, Grep                           | shadcn, form, dialog                   |
| 10  | statusline-setup        | Status line config             | Read, Edit                                              | status line, bottom bar                |
| 11  | output-style-setup      | Output formatting              | Read, Write, Edit, Glob, Grep                           | output style, format                   |
| 12  | ui-ux-expert            | Design, Magic UI, a11y         | Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, MCP | design, UI, UX, responsive             |
| 13  | **researcher-expert**   | **Systematic source research** | **WebSearch, WebFetch, Read, Glob, Grep**               | **research, find docs, authoritative** |

### researcher-expert (NEW)

**Purpose**: Find, evaluate, rank authoritative sources (standards, docs, papers)

**Method**: RAG retrieval (Query → Retrieve → Validate → Expand → Rank) + CRAAP scoring + PRISMA logging

**Output**: JSON with ranked sources, evidence table, search log

**Use Cases**:

- OAuth research: RFC 7636, vendor docs, best practices
- Performance: Next.js optimization guides, Vercel patterns
- Policy: Twitter/LinkedIn API terms
- A11y: WCAG 2.1 AA guidelines

**Patterns**:

- Research → Implement: `researcher-expert → feature-implementer`
- Evidence-Based Review: `researcher-expert → code-reviewer`
- Parallel Context: `researcher-expert || Explore`

**Details**: `.claude/skills/researcher-expert/SKILL.md`

---

## 🎯 ORCHESTRATION ENGINE

### Domain → Agent Matrix

| Domain               | Primary                | Support                        | Pattern    | Example               |
| -------------------- | ---------------------- | ------------------------------ | ---------- | --------------------- |
| OAuth implementation | feature-implementer    | test-validator → code-reviewer | Auto-chain | "Add Twitter OAuth"   |
| UI/UX design         | ui-ux-expert           | shadcn-expert                  | Parallel   | "Design dashboard"    |
| Bug diagnosis        | Explore                | code-reviewer                  | Sequential | "Fix redirect loop"   |
| Test coverage        | test-validator         | code-reviewer                  | Sequential | "Test scheduling"     |
| Security audit       | code-reviewer          | solodev-claude-reviewer        | Parallel   | "Audit auth"          |
| Batch operations     | batch-workbench-expert | feature-implementer            | Sequential | "Process 50 posts"    |
| Content policy       | guardrails-expert      | —                              | Single     | "Check compliance"    |
| Codebase exploration | Explore                | general-purpose                | Sequential | "Where are errors?"   |
| Performance          | code-reviewer          | Explore                        | Iterative  | "Optimize API"        |
| Component library    | shadcn-expert          | ui-ux-expert                   | Parallel   | "Add forms"           |
| Technical research   | researcher-expert      | Explore                        | Parallel   | "Research OAuth PKCE" |
| Standards compliance | researcher-expert      | code-reviewer                  | Sequential | "Audit vs RFC"        |
| Tech evaluation      | researcher-expert      | general-purpose                | Sequential | "Compare auth libs"   |

### Decision Rules

**Size**: <10→direct | 10-50→single | 50-200→chain | 200+→parallel
**Complexity**: Simple→direct | Medium→single | Complex→chain | Very complex→general-purpose
**Domain**: Single→one | Two→chain | Three+→parallel+sync

---

## 🔄 EXECUTION PATTERNS

### 1. Auto-Chain (Default for Features)

```
feature-implementer → test-validator → code-reviewer
```

**When**: feature-implementer completes  
**Time**: +15-30 min

**Example**:

```
"Implement Instagram OAuth"
 ├─ feature-implementer: lib/instagram.ts, API routes
 ├─ test-validator: lib/__tests__/instagram.test.ts
 └─ code-reviewer: Security audit (PKCE, tokens, RLS)
```

### 2. Parallel Swarm

```
Agent1 || Agent2 || Agent3 → sync
```

**When**: Multiple independent tasks  
**Time**: Slowest agent (not sum)

**Example**:

```
"Add Twitter, LinkedIn, Instagram OAuth"
 → feature-implementer(Twitter) || feature-implementer(LinkedIn) || feature-implementer(Instagram)
 → 35 min (vs 90 min sequential)
```

### 3. Explore → Implement

```
Explore (context) → feature-implementer (build)
```

**When**: Need location/understanding first  
**Time**: 5-10 min + implementation

**Example**:

```
"Improve error handling"
 ├─ Explore: Find lib/api/errors.ts, 15 files using it
 ├─ Present findings to user
 └─ feature-implementer: Add validation errors, retry logic
```

### 4. Iterative Refinement

```
Review → Fix → Validate → (repeat)
```

**When**: Optimization/improvement  
**Time**: 30-60 min/iteration

**Example**:

```
"Optimize performance"
 ├─ Explore: Bottlenecks (API 8s, queries 2s)
 ├─ code-reviewer: Recommendations (cache, join, images)
 ├─ feature-implementer: Implement fixes
 └─ test-validator: Benchmark (8s→0.5s, 2s→0.3s)
```

### 5. Research → Design → Implement

```
researcher-expert → ui-ux-expert → feature-implementer → test-validator
```

**When**: New complex feature, unclear approach  
**Time**: 60-120 min

**Example**:

```
"Add content calendar with drag-drop"
 ├─ researcher-expert: Survey libraries (react-big-calendar, dnd-kit)
 ├─ ui-ux-expert: Design (grid, drag UX, responsive, a11y)
 ├─ feature-implementer: Build (CalendarGrid, PostCard, drag logic)
 └─ test-validator: E2E drag-drop tests
```

---

## 🎯 REAL EXAMPLES

### 1. Batch-Create Redirect Bug (Oct 17, 2025)

**Problem**: Page redirects to dashboard after 1s

**Agents**: Explore → code-reviewer → feature-implementer (15 min)

**Diagnosis**:

- Missing from middleware protectedPageRoutes
- Wrong Supabase import (non-SSR)

**Solution**:

- Added '/batch-create' to middleware.ts:91
- Changed import to @/lib/supabase-client

**Commits**: 2d381ee, bf06137

### 2. Reset-Password Suspense Error (Oct 17, 2025)

**Problem**: Vercel build failing (useSearchParams needs Suspense)

**Agents**: code-reviewer (5 min)

**Solution**:

```tsx
// Before
export default function ResetPasswordPage() {
  const searchParams = useSearchParams(); // ❌
}

// After
function ResetPasswordForm() {
  const searchParams = useSearchParams(); // ✅
}
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

**Commit**: 92220dc

### 3. Batch Create Feature (Oct 16, 2025)

**Feature**: Generate 30 days of content

**Agents**: batch-workbench-expert → feature-implementer → test-validator (90 min)

**Delivered**:

- Generate 30 posts/platform
- Progress tracking UI
- Error recovery with retry
- Draft auto-save (24hr)
- Optimal scheduling

**Commit**: 3045c00  
**Files**: 3 new (710 lines)

---

## 📚 PLAYBOOKS (Quick Ref)

| Playbook           | Agents                 | Time    | Complexity |
| ------------------ | ---------------------- | ------- | ---------- |
| Add OAuth Provider | fi → tv → cr           | 30-45m  | Medium     |
| Add UI Page        | ux → fi → tv           | 45-60m  | Medium     |
| Fix Production Bug | Explore → cr → fi      | 15-30m  | Low-Med    |
| Batch Processing   | bw → fi → tv           | 60-90m  | High       |
| Policy Compliance  | gg                     | 5-10m   | Low        |
| A11y Audit         | ux → cr → fi           | 30-60m  | Medium     |
| Performance Opt    | Explore → cr → fi → tv | 60-120m | High       |

**Abbreviations**: fi=feature-implementer, tv=test-validator, cr=code-reviewer, ux=ui-ux-expert, bw=batch-workbench-expert, gg=guardrails-expert

**Detailed playbooks**: See CLAUDE.md v3.0.0 (archived) or `.claude/skills/*/examples/`

---

## 🏗️ PROJECT CONTEXT

**Platform**: Repurpose MVP - multi-platform content adaptation SaaS

**Stack**:

- Frontend: Next.js 15.5.4, React 19, TypeScript 5, Tailwind 4, shadcn/ui
- Backend: Next.js API Routes, Supabase (PostgreSQL+RLS), QStash
- AI: OpenAI GPT-4o
- Auth: Supabase Auth + OAuth (Twitter, LinkedIn)
- Deploy: Vercel

**Core Workflows**:

1. **Content Adaptation**: User → /api/adapt → OpenAI → adapted content
2. **Scheduling**: User → /api/schedule → DB → QStash → /api/post/execute → platform
3. **OAuth**: User → init → PKCE flow → callback → tokens (social_accounts table)

**Key Files**:

```
app/api/{adapt,schedule,post/execute,auth}/route.ts
lib/{anthropic,qstash,twitter,linkedin,supabase-client}.ts
components/ui/* (shadcn)
```

**Full Details**: `.claude/skills/README.md` + individual skills

---

## 📚 QUICK REFERENCE

### Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm test                 # Jest tests
npx playwright test      # E2E tests
supabase link            # Link to Supabase project
git push origin main     # Auto-deploy to production
```

### File Locations

- **API**: `app/api/*/route.ts`
- **Lib**: `lib/{anthropic,qstash,twitter,linkedin,supabase-client}.ts`
- **Components**: `components/ui/*` (shadcn), `components/layout/*`, `components/posts/*`
- **Skills**: `.claude/skills/*/` (templates, examples, checklists)

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY
NEXT_PUBLIC_APP_URL
```

---

## ✅ VALIDATION

- [x] All 13 agents documented
- [x] Quick decision tree
- [x] Domain→Agent matrix (13 scenarios)
- [x] 5 execution patterns
- [x] 3 real examples
- [x] Playbooks table
- [x] Project context summary
- [x] researcher-expert integrated

---

**Version**: 3.1.0  
**Last Updated**: October 17, 2025  
**Character Count**: ~11,500 (target: <35,000 ✅)  
**Maintainer**: Repurpose MVP Team

**Full Context**: `.claude/skills/README.md`  
**Detailed Playbooks**: Archived CLAUDE.md v3.0.0  
**Agent Details**: `.claude/skills/*/SKILL.md`

---

## 🔄 AUTO-FALLBACK PATTERN (All Agents)

**New in v3.2.0**: Systematic fallback to prevent fabrication, assumptions, and error loops.

### Trigger Conditions

Any agent MUST invoke researcher-expert when ANY condition met:

- Error count ≥2 on same task
- Unfamiliar library/framework/API
- Security implementation (OAuth, auth, tokens, encryption, RLS)
- Standards compliance (RFC, WCAG, GDPR, platform policies)
- Making recommendation without authoritative source
- Confidence < 0.7 about approach

### Action Pattern

```
STOP → Invoke researcher-expert → Receive sources (CRAAP ≥3.2) → Proceed with citations
```

**Example**:

```markdown
"Implement Instagram OAuth"
├─ Trigger: Security domain + unfamiliar API
├─ Invoke researcher-expert:
│ ├─ Query: "Instagram OAuth PKCE RFC token refresh"
│ ├─ Sources: Instagram docs (4.8), RFC 7636 (4.9), Auth0 (4.2)
│ └─ Output: JSON with verification_status, search_log
└─ Proceed: feature-implementer cites sources in implementation
```

### Pre-Output Validation (REQUIRED)

ALL agents run checklist before returning:

- [ ] **Delegation**: >10 lines → delegated to subagent?
- [ ] **Citations**: All claims have sources with snippets?
- [ ] **Errors**: 2+ failures → invoked researcher-expert?
- [ ] **Common questions**: Pre-answered (see `.claude/skills/_shared/common-questions.md`)

### Benefits

- **No fabrication**: All claims cite authoritative sources
- **Error recovery**: Research after 2 failures instead of looping
- **Evidence-based**: Decisions backed by RFCs, vendor docs, standards
- **Reproducible**: PRISMA search logs for audit trail

**Details**: `.claude/skills/_shared/auto-fallback-pattern.md`
