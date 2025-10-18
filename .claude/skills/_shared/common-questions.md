# Common User Questions - Knowledge Base

**Purpose**: Pre-load answers to frequently asked questions so agents can self-check BEFORE user asks.

---

## How to Use This File

**Before returning output**, mentally answer each question below:

1. Read the question
2. Check if it applies to your current task
3. If YES → ensure your output pre-answers it
4. If NO → skip to next question

**Goal**: User never needs to ask these questions because your output already addresses them.

---

## The 4 Most Common Questions

### Q1: "Are you using the subagents?"

**When user asks this**: You tried to implement directly instead of delegating to appropriate subagent.

**Self-check BEFORE output**:
```
Is my task >10 lines of code/changes?
  → YES: Did I invoke appropriate subagent using Task tool?
    ✅ YES: I'm using subagents correctly
    ❌ NO: STOP - delegate to subagent first

  → NO: Task is small enough to handle directly
    ✅ Safe to proceed
```

**Decision Tree** (from CLAUDE.md):
```
REQUEST → SIZE CHECK
  < 10 lines → Handle directly
  10-50 lines → Single agent
  50-200 lines → Sequential chain  
  200+ lines → Parallel swarm
```

**Correct Pattern**:
```markdown
This task requires implementing 3 new files (~150 lines total).

I'll delegate to feature-implementer subagent:

Task(
  subagent_type='feature-implementer',
  description='Implement Instagram OAuth',
  prompt='[detailed implementation instructions]'
)
```

**Wrong Pattern** (triggers this question):
```markdown
I'll implement Instagram OAuth by creating these files...
[starts implementing directly without Task tool]
```

---

### Q2: "Did you research this first?"

**When user asks this**: You made recommendations or implementation decisions without citing authoritative sources.

**Self-check BEFORE output**:
```
Am I recommending an approach/pattern/library?
  → YES: Did I cite authoritative source?
    ✅ YES: Listed source with URL, snippet, fetch_date
    ❌ NO: STOP - invoke researcher-expert first

  → NO: Just executing pre-defined patterns
    ✅ Safe to proceed (following templates)
```

**Auto-invoke researcher-expert for**:
- **OAuth implementations**: Need RFCs, vendor docs
- **Standards compliance**: WCAG, GDPR, platform policies
- **Security patterns**: Encryption, auth, tokens
- **Unfamiliar libraries**: Never used before
- **Performance optimization**: Need benchmarks, best practices
- **Accessibility requirements**: Need WCAG standards

**Correct Pattern**:
```markdown
I'll research Instagram OAuth before implementing.

Task(
  subagent_type='general-purpose',
  description='Research Instagram OAuth PKCE',
  prompt='You are researcher-expert. Find authoritative sources for...'
)

[After research completes]

Based on research findings:
1. RFC 7636 (PKCE): Recommends code_challenge method S256
2. Instagram API docs: Requires HTTPS redirect URI
3. Auth0 guide: Token refresh every 60 days

Implementing following these patterns...
```

**Wrong Pattern** (triggers this question):
```markdown
For Instagram OAuth, we should use PKCE because it's more secure.
[No source cited, assumption made]
```

---

### Q3: "Where's the citation for that claim?"

**When user asks this**: You made a claim without including the source.

**Self-check BEFORE output**:
```
Does my output contain factual claims?
  → YES: Does EVERY claim have source with:
    - Title
    - URL
    - Snippet (≤150 chars)
    - fetch_date (YYYY-MM-DD)
    ✅ ALL present: Citations complete
    ❌ MISSING: Add metadata or research

  → NO: Pure implementation, no claims
    ✅ Safe to proceed
```

**Required Citation Format**:
```markdown
[Claim or recommendation]

Source: [Title]
URL: [https://...]
Snippet: "[direct quote, ≤150 chars]"
Fetched: YYYY-MM-DD
```

**Correct Pattern**:
```markdown
Use PKCE (Proof Key for Code Exchange) for OAuth authorization code flow.

Source: RFC 7636 - Proof Key for Code Exchange  
URL: https://tools.ietf.org/html/rfc7636
Snippet: "PKCE prevents authorization code interception attacks by using a dynamically created cryptographically random key"
Fetched: 2025-10-17

LinkedIn OAuth requires specific scopes for posting.

Source: LinkedIn OAuth 2.0 Documentation
URL: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
Snippet: "w_member_social scope required for creating posts on behalf of members"
Fetched: 2025-10-17
```

**Wrong Pattern** (triggers this question):
```markdown
Use PKCE because it's more secure.
[No source, no URL, no snippet, no date]

LinkedIn requires certain scopes.
[Vague, no specifics, no source]
```

---

### Q4: "Why didn't this work?"

**When user asks this**: You failed 2+ times without researching solutions or explaining why.

**Self-check BEFORE continuing**:
```
Have I failed on this task before?
  → YES, 1st failure: Try alternative approach
  → YES, 2nd failure: STOP - invoke researcher-expert
    
    Task(
      subagent_type='general-purpose',
      description='Research solution for [error]',
      prompt='You are researcher-expert.
      
      Problem: [describe error]
      What I tried: [attempts 1 and 2]
      What failed: [error messages]
      What I need: [working solution or known issues]
      
      Find authoritative sources explaining this error and solutions.'
    )

  → NO: First attempt
    ✅ Safe to try implementation
```

**Correct Pattern** (after 2 failures):
```markdown
I've failed twice implementing drag-and-drop:
1. Attempt 1: react-dnd → "Cannot read dragstart" error
2. Attempt 2: native drag events → same error

Let me research Next.js 15 App Router compatible drag-drop libraries.

Task(
  subagent_type='general-purpose',
  description='Research Next.js 15 drag-drop solutions',
  prompt='...'
)

[After research]

Found the issue: SSR conflict with drag-drop event listeners.
Solution: Use @dnd-kit/core with dynamic import.

Source: Next.js Docs - Dynamic Imports
Snippet: "Use dynamic imports with ssr: false for browser-only libraries"
Fetched: 2025-10-17
```

**Wrong Pattern** (triggers this question):
```markdown
[Attempt 1 fails]
Let me try react-beautiful-dnd instead...

[Attempt 2 fails]
Let me try a different approach...

[Attempt 3 fails with same error]
[User asks: "Why didn't this work?"]
```

---

## Additional Common Questions

### Q5: "Is this secure?"

**When user asks**: Security-related code without citing security standards/best practices.

**Self-check**:
- Did I research OAuth security (RFC 7636, vendor security guides)?
- Did I cite OWASP recommendations for auth/tokens?
- Did I reference Supabase RLS best practices?
- Did I explain why this approach is secure?

**Required**: Security claims MUST cite authoritative sources (RFCs, OWASP, vendor security docs).

---

### Q6: "Is this accessible?"

**When user asks**: UI/UX claims without citing WCAG 2.1 AA standards.

**Self-check**:
- Did I check color contrast (4.5:1 for text, 3:1 for UI)?
- Did I cite WCAG 2.1 AA section numbers?
- Did I verify keyboard navigation works?
- Did I add ARIA labels where needed?

**Required**: Accessibility requirements MUST cite WCAG with section numbers.

---

### Q7: "Will this perform well?"

**When user asks**: Performance claims without benchmarks or data.

**Self-check**:
- Did I cite Next.js performance docs?
- Did I reference Vercel edge network guidance?
- Did I provide before/after metrics (if optimization)?
- Did I explain trade-offs?

**Required**: Performance claims SHOULD cite benchmarks or profiling data.

---

### Q8: "Does this follow our conventions?"

**When user asks**: Code doesn't match project patterns in `.claude/skills/*/conventions.md`.

**Self-check**:
- Did I check `.claude/skills/feature-implementer/conventions.md`?
- Did I use design tokens from `lib/design-tokens.ts`?
- Did I follow API route pattern (auth → rate limit → validate → logic)?
- Did I use proper TypeScript types from `lib/types.ts`?

**Required**: Implementation MUST follow project conventions in skills/ directory.

---

## Self-Check Summary

Before returning output, ask yourself:

1. **"Are you using the subagents?"**  
   → >10 lines? Delegated to subagent? ✅

2. **"Did you research this first?"**  
   → Unfamiliar/security/standards? Researched? ✅

3. **"Where's the citation for that claim?"**  
   → Every claim has source + snippet + date? ✅

4. **"Why didn't this work?"**  
   → After 2 failures, researched solutions? ✅

If ALL ✅ → Safe to proceed with output  
If ANY ❌ → STOP and fix before continuing

---

## Measuring Effectiveness

Track in validation spreadsheet:

### Question Frequency
- How often does user ask each question?
- Target: <5% of conversations per question
- Baseline (before): ~30-40% total
- After implementation: <10% total

### Pre-Answer Rate  
- What % of outputs pre-answer questions?
- Target: >90% (agent addresses before user asks)
- Measure: Review last 20 conversations

### User Satisfaction
- Fewer corrections needed?
- Faster conversations (fewer back-and-forth)?
- Target: 50% reduction in correction loops

---

## Examples from Real Conversations

### Example 1: Hero/Dashboard Redesign

**User task**: "Research and implement better hero and dashboard pages"

**Agent mistake**: Started implementing directly without using subagents

**User correction**: "are you using the subagents?"

**Should have self-checked Q1**:
```
Task >10 lines? → YES (multi-component redesign)
Did I delegate? → NO ❌

Action: Stop and delegate to ui-ux-expert → feature-implementer → test-validator
```

---

### Example 2: OAuth Implementation (Hypothetical)

**User task**: "Implement Twitter OAuth"

**Agent mistake**: Implemented without researching PKCE standards

**User would ask**: "Did you research this first?"

**Should have self-checked Q2**:
```
Unfamiliar pattern? → NO (have template)
Security domain? → YES (OAuth tokens) ❌
Did I research? → NO

Action: Invoke researcher-expert for RFC 7636, Twitter OAuth docs
```

---

## Version History

**v1.0** (2025-10-17): Initial common questions
- 4 primary questions (subagents, research, citations, errors)
- 4 additional questions (security, accessibility, performance, conventions)
- Self-check summaries
- Real conversation examples
