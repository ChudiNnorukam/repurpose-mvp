# Pre-Output Validation Checklist

**Purpose**: Universal validation checklist ALL agents must complete before returning results.

---

## REQUIRED Self-Check (Before Every Output)

### 1. Delegation Check

**For ALL tasks**:
```
- [ ] Is this task >10 lines of code/changes?
    → YES: Did I delegate to appropriate subagent?
    → NO: Safe to handle directly

- [ ] Is this task <10 lines but unfamiliar/complex?
    → YES: Did I research first using researcher-expert?
    → NO: Can proceed with confidence
```

**Agent-specific**:
- **feature-implementer**: >10 lines → delegate to feature-implementer subagent
- **code-reviewer**: Complex analysis → delegate to code-reviewer subagent
- **test-validator**: Full test suite → delegate to test-validator subagent  
- **ui-ux-expert**: Multi-component design → may handle directly (has design expertise)

### 2. Citation Check

**For ALL claims and recommendations**:
```
- [ ] Does my output contain factual claims or recommendations?
    → YES: Does EVERY claim have ≥1 authoritative source?
    → NO: Safe to proceed

- [ ] Do all cited sources include:
    - [ ] Title
    - [ ] URL  
    - [ ] Snippet (≤150 chars)
    - [ ] fetch_date (YYYY-MM-DD)
    → ALL: Citations complete
    → MISSING: Add metadata or invoke researcher-expert

- [ ] Am I making assumptions or guessing?
    → YES: STOP - invoke researcher-expert
    → NO: Evidence-based, safe to proceed
```

**Citation Format** (required):
```markdown
[Claim or recommendation]

Source: [Title]
URL: [https://...]
Snippet: "[quote from source, ≤150 chars]"
Fetched: YYYY-MM-DD
```

**Examples**:
```markdown
✅ GOOD:
Use PKCE for OAuth 2.0 authorization code flow.

Source: RFC 7636 - Proof Key for Code Exchange
URL: https://tools.ietf.org/html/rfc7636
Snippet: "PKCE prevents authorization code interception attacks"
Fetched: 2025-10-17

❌ BAD:
Use PKCE for OAuth 2.0 because it's more secure.
[No source, no snippet, assumption]
```

### 3. Error Recovery Check

**For stuck or failing tasks**:
```
- [ ] Have I failed 2+ times on this same task?
    → YES: Did I invoke researcher-expert for solutions?
    → NO: Continue implementation

- [ ] Am I stuck or uncertain (confidence <0.7)?
    → YES: Did I research alternatives/best practices?
    → NO: Confident in approach, proceed

- [ ] Is there an error loop (same error recurring)?
    → YES: STOP - invoke researcher-expert, don't retry blindly
    → NO: Progress being made
```

### 4. Common Questions Pre-Check

Reference `.claude/skills/_shared/common-questions.md`

**Self-answer BEFORE user asks**:
```
- [ ] "Are you using the subagents?"
    Self-answer: [YES/NO] - [if >10 lines, delegated to {agent}]

- [ ] "Did you research this first?"
    Self-answer: [YES/NO] - [if unfamiliar/security/standards, researched via researcher-expert]

- [ ] "Where's the citation for that claim?"
    Self-answer: Listed above - [source title, snippet, fetch_date]

- [ ] "Why didn't this work?"
    Self-answer: [After 2 failures, researched solutions via researcher-expert OR this is first attempt]
```

---

## Agent-Specific Checklists

### For researcher-expert

**Additional checks** (beyond universal checklist):
```
- [ ] Schema validation:
    - [ ] All required fields present (summary_md, top_sources, search_log, gaps, next_steps, verification_status)
    - [ ] top_sources has ≥3 items
    - [ ] All scores ≥3.2
    - [ ] PRISMA counts coherent (identified ≥ screened ≥ included)

- [ ] Citation verification:
    - [ ] lexical_pass_rate ≥0.95 OR semantic_pass_rate ≥0.95
    - [ ] All snippets verified against raw_path files
    - [ ] unverified_claims listed in gaps if any

- [ ] Quality threshold:
    - [ ] avg(top_sources.score) ≥3.5
    - [ ] Canonical sources included (RFCs, vendor docs, standards)
    - [ ] If below threshold, listed in gaps with next_steps
```

### For feature-implementer

**Additional checks**:
```
- [ ] Implementation follows project conventions (see `.claude/skills/feature-implementer/conventions.md`)
- [ ] Used templates from `.claude/skills/feature-implementer/templates/` if applicable
- [ ] Security implementations researched and cite standards (OAuth → RFC, encryption → best practices)
- [ ] Breaking changes documented
```

### For code-reviewer

**Additional checks**:
```
- [ ] Every recommendation cites authoritative source or codebase example
- [ ] Security findings reference standards (OWASP, RFCs, vendor security guides)
- [ ] Performance findings cite benchmarks or profiling data
- [ ] Severity levels assigned (Critical/Warning/Suggestion)
```

### For test-validator

**Additional checks**:
```
- [ ] Test coverage targets specified (e.g., "95% for critical paths")
- [ ] Edge cases identified and tested
- [ ] If test framework unfamiliar, researched best practices first
```

### For ui-ux-expert

**Additional checks**:
```
- [ ] Accessibility requirements cite WCAG 2.1 AA with section numbers
- [ ] Design patterns cite reputable design systems or studies
- [ ] UX claims (e.g., conversion improvements) cite research or case studies
- [ ] Color contrast meets 4.5:1 (text) or 3:1 (UI components)
```

---

## Failure Conditions (STOP and Fix)

If ANY of these are true, STOP and fix before returning output:

🛑 **Critical Failures** (must fix):
- Making factual claim without source
- Failed 2+ times without researching solutions
- Security implementation without citing standards
- Accessibility claim without WCAG reference
- Task >10 lines not delegated to subagent

⚠️ **Warnings** (should fix):
- Source missing fetch_date or URL
- Low confidence (<0.7) without research
- Unfamiliar pattern without checking examples
- Performance claim without data

---

## How to Use This Checklist

### During Implementation

1. Keep this checklist open
2. Check items as you work
3. If any item fails → pause and fix

### Before Output

1. Run through entire checklist
2. Mark each item ✅ or ❌
3. Fix all ❌ items before continuing
4. Include checklist status in output (optional):

```markdown
## Pre-Output Validation

✅ Delegation: Delegated to feature-implementer subagent (task >10 lines)
✅ Citations: All OAuth recommendations cite RFC 7636, Supabase docs
✅ Errors: First attempt, no failures yet
✅ Common questions: See sources above for "did you research"
```

---

## Measuring Checklist Effectiveness

Track manually (validation spreadsheet):

### Compliance Rate
- What % of outputs pass ALL checklist items?
- Target: >95% compliance
- Below 95%: Need reinforcement or clearer examples

### User Correction Rate
- How often does user ask questions this checklist prevents?
- Target: <10% (baseline: ~40%)
- Measures if checklist prevents common mistakes

### Time Impact
- Does checklist slow workflow significantly?
- Target: +30-60s per output (acceptable trade-off)
- If >2 min: Simplify checklist

---

## Troubleshooting

### Problem: Checklist takes too long

**Solutions**:
- Create quick-reference version (1 page)
- Automate checks where possible
- Focus on critical items only

### Problem: Agents skip checklist

**Solutions**:
- Add enforcement in skill instructions
- Manual spot-checks with corrections
- Add examples to common-questions.md

### Problem: Too many false positives

**Solutions**:
- Adjust thresholds (confidence, score, etc.)
- Add exceptions for common patterns
- Simplify criteria

---

## Version History

**v1.0** (2025-10-17): Initial pre-output checklist
- Universal checks (delegation, citations, errors, common questions)
- Agent-specific checks
- Failure conditions
- Usage instructions
