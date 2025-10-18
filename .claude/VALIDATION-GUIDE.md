# Manual Validation Guide - Option B

**Purpose**: Track agent behavior improvements after auto-fallback + pre-output system implementation.

**Duration**: 2-3 weeks minimum
**Effort**: ~5 minutes/day
**Goal**: Validate 80%+ improvement in delegation, research, citations, error recovery

---

## Quick Start

1. **Open tracking spreadsheet**:
   ```bash
   # Import into Google Sheets
   open .claude/validation-tracking.csv
   
   # Or use Excel, Numbers, etc.
   ```

2. **Track daily**: After each agent interaction, add one row with:
   - Date, Task, Agent used
   - Delegation (✅/❌), Research (✅/❌), Citations (✅/❌), Errors (✅/❌/N/A)
   - Brief notes, Outcome (Success/Partial/Failure)

3. **Weekly review**: Calculate rates, compare to targets

4. **Decision point (Week 3)**:
   - If metrics ≥80% targets → Proceed to Option A (CI automation)
   - If <80% → Adjust trigger conditions, iterate

---

## The 5 Key Metrics

### 1. Delegation Rate

**Question**: Are agents delegating tasks >10 lines to subagents?

**How to calculate**:
```
Delegation Rate = (✅ count for tasks >10 lines) / (total tasks >10 lines)
```

**Target**: ≥90%

**Example**:
- Task: "Implement Instagram OAuth" (>10 lines)
- Agent: feature-implementer
- Delegated?: ✅ (used Task tool to invoke subagent)
- Counts toward: ✅ delegation

**If below 90%**: Agents not following "are you using the subagents?" pre-check

---

### 2. Research Rate

**Question**: Are agents invoking researcher-expert for unfamiliar/security/standards tasks?

**How to calculate**:
```
Research Rate = (✅ count for applicable tasks) / (tasks requiring research)
```

**Applicable tasks**:
- Unfamiliar library/API
- Security/OAuth implementation
- Standards compliance (RFC, WCAG, GDPR)
- Making recommendations

**Target**: ≥80%

**Example**:
- Task: "Research OAuth PKCE best practices"
- Agent: feature-implementer (before implementing)
- Researched?: ✅ (invoked researcher-expert first)
- Counts toward: ✅ research

**If below 80%**: Agents skipping "did you research this?" pre-check

---

### 3. Citation Rate

**Question**: Do all recommendations have authoritative sources with snippets?

**How to calculate**:
```
Citation Rate = (✅ count for tasks with citations) / (tasks with recommendations)
```

**Tasks with recommendations**:
- Security approach suggested
- Performance optimization recommended
- UI/UX pattern suggested
- Library/framework recommended

**Target**: ≥95%

**Example**:
- Task: "Optimize API performance"
- Agent: code-reviewer
- Citations?: ✅ (cited Next.js docs with snippet + fetch_date)
- Counts toward: ✅ citations

**If below 95%**: Agents fabricating claims without sources

---

### 4. Error Recovery Rate

**Question**: After 2 failures, did agent invoke researcher-expert for solutions?

**How to calculate**:
```
Error Recovery Rate = (✅ count for tasks with 2+ failures) / (tasks with 2+ failures)
```

**Applicable only when**:
- Agent fails 2+ times on same task
- Same error recurring
- Implementation loop detected

**Target**: ≥85%

**Example**:
- Task: "Implement drag-and-drop"
- Agent: feature-implementer
- Failures: 2 (react-dnd error, native events error)
- Errors Recovered?: ✅ (invoked researcher-expert on 2nd failure)
- Counts toward: ✅ error recovery

**If below 85%**: Agents looping instead of researching solutions

---

### 5. Success Rate

**Question**: What % of tasks completed successfully without user corrections?

**How to calculate**:
```
Success Rate = (Success count) / (total tasks)
```

**Outcomes**:
- **Success**: Task completed fully, no user corrections needed
- **Partial**: User had to ask "did you research?" or "are you using subagents?"
- **Failure**: Task didn't work, major rework required

**Target**: ≥80% success

**Example**:
- Task: "Add Twitter OAuth"
- Outcome: Success (no corrections needed, agent researched → delegated → cited sources)
- Counts toward: ✅ success

**If below 80%**: System not reducing user correction loops

---

## Weekly Review Process

### End of Each Week

1. **Calculate 5 metrics** using formulas above

2. **Fill out weekly summary** in spreadsheet:
   ```
   Week of: 2025-10-20
   Total tasks: 15
   Delegation rate: 14/15 = 93% ✅
   Research rate: 12/15 = 80% ✅
   Citation rate: 14/15 = 93% ⚠️ (target: 95%)
   Error recovery: 3/3 = 100% ✅
   Success rate: 12/15 = 80% ✅
   ```

3. **Identify gaps**:
   - Which metrics below target?
   - Which agents need reinforcement?
   - Common patterns in failures?

4. **Adjust if needed**:
   - Citation rate low? → Review pre-output checklist examples
   - Delegation low? → Add clearer examples to common-questions.md
   - Research low? → Lower confidence threshold (0.7 → 0.6)

---

## Decision Tree (Week 3)

After 3 weeks of tracking:

### If ALL metrics ≥ 80% of targets:
✅ **SUCCESS - Proceed to Option A**

**Action**:
- Add CI automation (GitHub Actions)
- Add telemetry logging (agent-runs.jsonl)
- Continue manual spot-checks monthly

**Expected outcome**: Automated validation, 95%+ compliance

---

### If 1-2 metrics < 80%:
⚠️ **PARTIAL - Iterate on weak points**

**Action**:
- Focus on lowest metrics
- Add more examples to _shared/ files
- Manual corrections for 1 more week
- Re-measure

**Expected outcome**: Reach 80%+ in 1 more week

---

### If 3+ metrics < 80%:
❌ **NEEDS WORK - Review system design**

**Action**:
- Review if trigger conditions too strict/loose
- Check if agents actually reading _shared/ files
- Add enforcement (e.g., blocking outputs without citations)
- Consider simplified version

**Expected outcome**: Identify root cause, fix, restart 2-week trial

---

## The 5 Manual Tests (Week 1)

Run these tests in Week 1 to validate system works:

### Test 1: Delegation Check
**Task**: "Implement Instagram OAuth"
**Expected**: Agent delegates to subagent (>10 lines)
**Pass**: ✅ Agent uses Task tool
**Fail**: ❌ Agent implements directly → Review common-questions.md Q1

---

### Test 2: Research Check
**Task**: "Research OAuth PKCE best practices"
**Expected**: researcher-expert returns JSON with verification_status
**Pass**: ✅ Output has lexical_pass_rate, semantic_pass_rate, sources ≥3
**Fail**: ❌ Generic response without JSON → Review researcher-expert/SKILL.md

---

### Test 3: Error Recovery
**Task**: Give unfamiliar pattern ("Use Zustand for state management")
**Expected**: After 2 failures, invoke researcher-expert
**Pass**: ✅ Agent researches instead of looping
**Fail**: ❌ Agent loops 3+ times → Review auto-fallback-pattern.md

---

### Test 4: Citation Verification
**Task**: "What are Twitter API rate limits?"
**Expected**: researcher-expert cites Twitter docs with snippet
**Pass**: ✅ Source has title, URL, snippet, fetch_date
**Fail**: ❌ Generic answer without citation → Review pre-output-checklist.md

---

### Test 5: Common Questions
**Task**: Simple 20-line feature implementation
**Expected**: Agent delegates automatically, no user correction
**Pass**: ✅ No "are you using subagents?" question needed
**Fail**: ❌ User has to correct → Review common-questions.md

---

## Troubleshooting

### Problem: Agents not using auto-fallback

**Symptoms**:
- Research rate < 50%
- Agents looping on errors
- No researcher-expert invocations

**Solutions**:
1. Check if _shared/ files exist and are readable
2. Verify agent skills have auto-fallback sections
3. Lower confidence threshold (0.7 → 0.5)
4. Add more trigger keywords

---

### Problem: Too many false positive fallbacks

**Symptoms**:
- Research rate > 90%
- Workflow feels slow
- Agents researching trivial tasks

**Solutions**:
1. Raise confidence threshold (0.7 → 0.8)
2. Increase error count (2 → 3 failures)
3. Add "safe list" for common patterns
4. Narrow "unfamiliar" definition

---

### Problem: Citations present but low quality

**Symptoms**:
- Citation rate high (>90%)
- But sources are blogs, not RFCs/vendor docs
- CRAAP scores < 3.5

**Solutions**:
1. Review researcher-expert scoring rubric
2. Adjust domain filters (site:ietf.org, site:docs.supabase.com)
3. Raise minimum score threshold (3.2 → 3.5)

---

### Problem: Metrics good but success rate low

**Symptoms**:
- Delegation ≥90%, Research ≥80%, Citations ≥95%
- But Success rate < 70%

**Solutions**:
1. Check if agent outputs meet user expectations
2. Review "Partial" failures for patterns
3. Add more examples to _shared/common-questions.md
4. May need different success criteria

---

## Quick Reference

### Daily (5 min)
- Add row to spreadsheet after each agent interaction
- 8 columns: Date, Task, Agent, 4 checks, Notes, Outcome

### Weekly (15 min)
- Calculate 5 metrics
- Fill weekly summary
- Identify gaps
- Adjust if needed

### Week 3 (30 min)
- Generate final report
- Make go/no-go decision
- Document lessons learned
- Plan next phase (Option A or iterate)

---

## Example Weekly Report

```markdown
# Week 2 Validation Report (2025-10-24)

## Metrics Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Delegation | 90% | 14/15 (93%) | ✅ |
| Research | 80% | 12/15 (80%) | ✅ |
| Citations | 95% | 14/15 (93%) | ⚠️ |
| Error Recovery | 85% | 3/3 (100%) | ✅ |
| Success | 80% | 12/15 (80%) | ✅ |

**Overall**: 4/5 metrics at target ✅

## Observations

**What's working**:
- Agents consistently delegating >10 line tasks
- Auto-fallback triggering properly for unfamiliar patterns
- Error recovery excellent (100%)

**What needs work**:
- Citation rate 93% vs 95% target (2% gap)
- 1 task had generic recommendation without source
- Agent: ui-ux-expert claiming "single CTA improves conversion" without study

**Action**:
- Add citation examples to ui-ux-expert skill
- Review pre-output checklist enforcement
- Manual spot-check ui-ux outputs this week

## Next Week Plan

- Continue tracking
- Focus on citation quality for ui-ux-expert
- Run Test 4 (citation verification) again
- Target: 95% citation rate by Week 3
```

---

**File Location**: `.claude/VALIDATION-GUIDE.md`
**Spreadsheet**: `.claude/validation-tracking.csv`
**Duration**: 2-3 weeks minimum
**Decision Point**: Week 3 - proceed to Option A or iterate
