---
description: Build high-converting assessment landing pages with 15-question quiz funnels, scoring logic, dynamic results, and CRM automation. Use for 'assessment landing', 'quiz funnel', 'scorecard', 'lead gen quiz'.
skill-version: 1.0.0
allowed-tools:
  - file_create
  - view
  - web_search
---

# Assessment Landing Funnel Builder

## Purpose
Generate complete assessment/quiz funnel systems: landing page copy, UI wireframes, JSON quiz payload, scoring rules, dynamic results pages, CTA variants, analytics plan, and CRM integrations.

## When to Use

### Trigger Keywords
- assessment landing
- quiz funnel
- scorecard landing page
- assessment lead gen
- quiz landing page for [audience]
- lead magnet quiz
- interactive assessment

### Typical Requests
- "Build an assessment landing page for [audience]"
- "Create a quiz funnel for [niche]"
- "Design a scorecard lead gen system"
- "Generate quiz questions for [topic]"

## Inputs Required

The agent MUST collect these before proceeding:

1. **Business/Campaign Name** (e.g., "Sleep Better Score")
2. **Primary Target Audience** (1-2 sentence persona)
3. **Primary Desired Outcome (90-day)** (e.g., "7+ hours deep sleep")
4. **Three Measurement Areas** (defaults: environment, routine, tools)
5. **Tone/Brand Voice** (e.g., dry-sarcastic, clinical, warm coach)
6. **Tech/Integration Preference** (ScoreApp / Typeform / Interact / custom)
7. **Required Assets** (logo, hero image, brand colors, tracking IDs)

### Quick-Start Defaults
If user provides only campaign name, use:
- Hero hook: frustration variant
- Subhead: "Answer 15 questions to find out why you're stuck — takes 3 minutes, free."
- Measurement areas: environment, routine, tools
- Result buckets: cold <50, warm 50-79, hot ≥80
- Integration: ScoreApp (fastest path)

## Outputs Delivered

### 1. Landing Page Content Package
- **3 hero headline hooks**:
  1. Frustration hook (pain point focused)
  2. Results hook (outcome focused)
  3. Curiosity hook (discovery focused)
- **Matching subheading** with time-to-complete and value prop
- **Value-prop bullets** (3 items)
- **2 CTA variants** (primary + secondary microcopy)

### 2. UI Wireframe Spec
- Desktop + mobile layout blocks
- Component placement (above fold, credibility, value, CTA, footer)
- Suggested sizes and spacing
- Mobile-first responsive breakpoints

### 3. Quiz JSON
Ready-to-import structure:
- Contact fields (name, email, phone)
- 10 best-practice questions (Yes/No with scoring weights)
- 5 qualifier questions (segmentation, no scoring)
- Scoring logic and bucket definitions

### 4. Scoring Logic & Results Mapping
- **Overall score buckets**: cold (0-49), warm (50-79), hot (80-100)
- **3 tailored insights per bucket** (dynamic based on lowest-scoring areas)
- **Next-step funnels per bucket**:
  - Hot: 1:1 consult booking
  - Warm: Group masterclass/mini-course
  - Cold: Free starter guide + resources

### 5. Automation + Integrations Checklist
- CRM field mapping
- Email follow-up triggers (3-email sequence)
- UTM/analytics setup
- Webhook payload examples
- ScoreApp template import steps (if selected)

### 6. CRO & KPI Plan
- **Target conversion benchmarks**:
  - Landing page baseline: 6.6% (median)
  - Quiz funnel target: 20-40% start rate
  - Completion rate: 70%+
  - Lead-to-MQL: measure by "hot" bucket %
- **Primary metrics** to track
- **1-week and 30-day experiments** (A/B tests)

### 7. Accessibility & QA Checklist
- Form validation requirements
- Keyboard/touch navigation
- Color contrast (WCAG AA)
- Load speed targets (<2s mobile)
- Cross-browser testing (4 browsers, 3 screen sizes)

### 8. Delivery Pack
Single structured output with all files:
- `landing.md` - Full copy and wireframe spec
- `quiz.json` - Question payload
- `results_templates.md` - Dynamic results per bucket
- `automation.md` - Email sequences and CRM mapping
- `cro_plan.md` - A/B tests and KPI targets

## Action Plan (Step-by-Step)

1. **Confirm inputs** (use defaults when omitted)
2. **Generate 3 hero hooks + subheadings**
   - Prompt: "Produce three concise hero hooks for [campaign], each 6-10 words: 1) frustration hook, 2) results-readiness, 3) curiosity-driven. Then write a single-line subheading that calls to 'Answer 15 questions…' and includes time-to-complete and free/instant value."
3. **Write full landing copy**: value bullets, credibility blurb, CTA microcopy
4. **Produce mobile-first wireframe spec** (component list & copy placements)
5. **Emit quiz.json** with 15 questions
6. **Create scoring rules & dynamic results templates**
7. **Create automation mapping**: email templates, CRM fields, webhooks
8. **CRO plan**: A/B test suggestions + KPI targets
9. **Accessibility & QA**: test checklist
10. **One-click handoff**: produce complete file package

## Benchmarks & References

### Conversion Rates
- **Landing page baseline**: 6.6% median (Q4 2024) - Unbounce
- **Quiz funnel target**: 20-40% start rate (well-matched lead magnets)
- **Case studies**: Some quiz funnels achieve >30% conversion - Outgrow, ScoreApp

### Best Practices
- Keep CTA above the fold
- Clear single CTA (no multiple competing actions)
- Match ad → page messaging consistency
- Mobile-first design (60%+ traffic)
- Dynamic personalization improves relevance - AWA Digital

### Tool Recommendations
1. **ScoreApp** - Fastest path, templates, dynamic results, CRM connectors
2. **Interact/Outgrow/LeadQuizzes** - Alternative quiz builders with strong personalization
3. **Custom implementation** - Use provided quiz.json for full control

## Templates

### Hero Hook Generator Prompt
```
Generate 3 hero hooks for [campaign_name] targeting [audience]:

1. FRUSTRATION HOOK (6-8 words): Address their pain point directly
   Example: "Exhausted every morning despite 8 hours sleep?"

2. RESULTS HOOK (6-10 words): Promise the outcome they want
   Example: "Wake up energized and ready to perform"

3. CURIOSITY HOOK (6-10 words): Create discovery desire
   Example: "What's sabotaging your sleep quality? Find out."

Then write a subheading (15-20 words) that:
- Mentions "15 questions" or "3-minute assessment"
- Emphasizes "free" and "instant results"
- Hints at personalized insights

Brand voice: [tone]
```

### Quiz JSON Template
See: `.claude/skills/assessment-funnel-builder/templates/quiz-template.json`

### Email Sequence Template
See: `.claude/skills/assessment-funnel-builder/templates/email-sequence.md`

## CRO Experiments (First 30 Days)

### A/B Test 1: Hero Hook Variants
- **Control**: Frustration hook
- **Variant**: Results readiness hook
- **Metric**: Start rate (clicks → quiz start)
- **Target**: >25% improvement

### A/B Test 2: CTA Microcopy
- **Control**: "Start Quiz — 3 minutes"
- **Variant**: "Begin Assessment — Free"
- **Metric**: Click-through rate
- **Target**: >15% improvement

### A/B Test 3: Result Page CTA
- **Control**: "Book Your Free Consult"
- **Variant**: "Claim Your Personalized Plan"
- **Metric**: Hot lead → booking rate
- **Target**: >20% booking rate

## Integration Options

### ScoreApp (Recommended for Speed)
**Pros**:
- Pre-built templates
- Dynamic result pages out-of-box
- Native CRM connectors (HubSpot, ActiveCampaign, Mailchimp)
- No-code setup

**Setup Steps**:
1. Import quiz.json via ScoreApp template
2. Connect CRM via native integration
3. Customize result page templates
4. Set up email automation triggers
5. Add tracking pixels (GA4, Meta)

### Custom Implementation
**Pros**:
- Full design control
- Custom analytics
- No platform fees

**Tech Stack**:
- Frontend: Next.js + Tailwind (use design tokens)
- Forms: React Hook Form + Zod validation
- Database: Supabase (store responses + scores)
- Email: Resend API with React Email templates
- Analytics: PostHog or Mixpanel

## Sample Quiz JSON Structure

```json
{
  "meta": {
    "campaign": "Sleep Better Score",
    "time_estimate": "3 minutes",
    "total_questions": 15
  },
  "contact": [
    {
      "id": "full_name",
      "label": "Full name",
      "type": "text",
      "required": true
    },
    {
      "id": "email",
      "label": "Email",
      "type": "email",
      "required": true
    },
    {
      "id": "phone",
      "label": "Phone (optional)",
      "type": "tel",
      "required": false
    }
  ],
  "best_practices": [
    {
      "id": "bp1",
      "q": "Do you go to bed at the same time most nights?",
      "type": "boolean",
      "weight": 7
    },
    {
      "id": "bp2",
      "q": "Do you avoid screens 60 minutes before bed?",
      "type": "boolean",
      "weight": 7
    }
    // ... 8 more best-practice questions
  ],
  "qualifiers": [
    {
      "id": "situation",
      "q": "Which best describes your current situation?",
      "type": "single_choice",
      "options": ["Student", "Early career", "Manager", "Executive", "Retired"],
      "weight": 0
    }
    // ... 4 more qualifier questions
  ],
  "scoring": {
    "max_score": 100,
    "buckets": [
      {"name": "cold", "min": 0, "max": 49},
      {"name": "warm", "min": 50, "max": 79},
      {"name": "hot", "min": 80, "max": 100}
    ]
  }
}
```

## Result Page Templates

### Big Reveal Format
```
You scored [SCORE] / 100 — [BUCKET_HEADLINE]

Bucket Headlines:
- Hot (80-100): "Excellent foundations! A few tweaks to optimize."
- Warm (50-79): "Good start! Quick wins available."
- Cold (0-49): "Opportunities to improve. Let's fix the basics."
```

### Three Insights (Dynamic)
Pull from the 3 lowest-scoring best-practice questions:

```
Here's what we found:

1. [AREA_1]: You scored low on [QUESTION]. 
   → Impact: [WHY IT MATTERS]
   → Quick win: [ACTION STEP]

2. [AREA_2]: ...

3. [AREA_3]: ...
```

### Next Steps (Bucket-Specific)
- **Hot**: "Book a 20-minute strategy call → [CALENDAR_LINK]"
- **Warm**: "Join our group masterclass (20% off) → [SIGNUP_LINK]"
- **Cold**: "Download the starter guide → [RESOURCE_LINK]"

## Automation Wiring

### CRM Field Mapping
```
email (primary key)
full_name
phone
score (integer 0-100)
bucket (cold|warm|hot)
top_3_issues (array of question IDs)
preferred_solution (from qualifier Q4)
notes (from qualifier Q5 open text)
utm_source
utm_campaign
submitted_at (timestamp)
```

### Email Sequence (3 Emails)

**Email 1: Immediate Results** (send at T+0)
- Subject: "Your [Campaign] results + 3 quick wins"
- Content: Recap score, top 3 insights, CTA to next step
- Send to: All completers

**Email 2: Value + Invitation** (send at T+24h)
- Subject: "[INSIGHT] — Here's why [AREA] matters"
- Content: Deep dive on their #1 issue, invite to group event/resource
- Send to: Warm + Hot only

**Email 3: Personal Outreach** (send at T+7d)
- Subject: "Question about your [Campaign] results"
- Content: Personalized based on qualifiers, direct 1:1 invitation
- Send to: Hot only (manual or automated)

### Webhook Payload Example
```json
POST /api/quiz-submission
{
  "email": "user@example.com",
  "score": 72,
  "bucket": "warm",
  "responses": {
    "bp1": true,
    "bp2": false,
    ...
  },
  "qualifiers": {
    "situation": "Manager",
    "outcome90": "More energy",
    ...
  }
}
```

## Accessibility & QA Checklist

- [ ] ARIA labels on all form inputs
- [ ] Meaningful alt text for hero image
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Color contrast ≥ WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Mobile performance <2s (Lighthouse)
- [ ] Validation messages (inline + screen reader)
- [ ] Test on 3 screen sizes (375px, 768px, 1440px)
- [ ] Test on 4 browsers (Chrome, Safari, Firefox, Edge)
- [ ] Form abandonment tracking
- [ ] Error state testing (network failure, timeout)

## Usage Examples

### Example 1: Sleep Coach Assessment
```
Input:
- Campaign: "Sleep Better Score"
- Audience: "Busy professionals struggling with poor sleep quality"
- Outcome: "7+ hours deep, restorative sleep"
- Areas: Sleep environment, bedtime routine, lifestyle habits
- Voice: Warm, empathetic coach
- Tech: ScoreApp

Output:
→ 3 hero hooks, landing page copy, quiz.json with 15 questions,
  scoring for 3 areas, results templates, 3-email sequence,
  ScoreApp import guide
```

### Example 2: Fitness Readiness Quiz
```
Input:
- Campaign: "Marathon Ready Check"
- Audience: "First-time marathon runners"
- Outcome: "Complete first marathon injury-free"
- Areas: Training consistency, nutrition, recovery
- Voice: Motivational, data-driven
- Tech: Custom (Next.js)

Output:
→ Full spec + code templates for custom implementation
```

## Quick Command Prompts

Use these shortcuts when invoking the skill:

1. **"Generate 3 hero hooks for [campaign] in [voice]"**
   → Returns 3 headline variants + subheading

2. **"Output mobile-first wireframe for [campaign]"**
   → Returns HTML/Tailwind component spec

3. **"Create quiz.json for [campaign] with areas: X, Y, Z"**
   → Returns complete JSON payload

4. **"Write 3 email follow-ups for hot/warm/cold buckets"**
   → Returns email templates

5. **"Produce A/B test plan for [campaign]"**
   → Returns 3 experiments + metrics

## Integration with Repurpose MVP

### Use Design Tokens
```typescript
import { COLOR_PRIMARY, COLOR_AI, BUTTON_VARIANTS } from '@/lib/design-tokens'

// Quiz CTA button
<button className={BUTTON_VARIANTS.primary}>
  Start Your Assessment
</button>

// Results page highlight
<div className={`${COLOR_AI.bgLight} ${COLOR_AI.border} border-l-4 p-4`}>
  Your personalized insights
</div>
```

### Store Submissions in Supabase
```sql
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  campaign TEXT NOT NULL,
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  bucket TEXT NOT NULL,
  responses JSONB NOT NULL,
  qualifiers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can view own submissions"
  ON quiz_submissions FOR SELECT
  USING (auth.uid() = user_id);
```

### Track with PostHog/Mixpanel
```typescript
// Track quiz events
posthog.capture('quiz_started', { campaign: 'Sleep Better Score' })
posthog.capture('quiz_completed', { campaign, score, bucket })
posthog.capture('result_cta_clicked', { campaign, bucket, cta_type })
```

## References & Citations

1. **Unbounce Landing Page Report (Q4 2024)**
   - Median conversion rate: 6.6%
   - Source: https://unbounce.com/average-conversion-rates-landing-pages/
   - CRAAP: 4.7 (authoritative, recent data)

2. **Outgrow Case Studies**
   - Interactive quiz funnels: 30%+ conversion rates
   - Source: https://outgrow.co/case-studies/
   - CRAAP: 4.2 (vendor case studies, self-reported)

3. **ScoreApp Platform**
   - Templates, automation, CRM integration
   - Source: https://www.scoreapp.com/
   - CRAAP: 4.5 (established platform, 2019+)

4. **Unbounce Best Practices Guide**
   - Above-fold CTA, mobile-first, message matching
   - Source: https://unbounce.com/landing-page-articles/landing-page-best-practices/
   - CRAAP: 4.6 (industry authority)

5. **AWA Digital Personalization Guide**
   - Dynamic content improves relevance
   - Source: https://www.awa-digital.com/blog/dynamic-content-personalization-tips-and-best-practices/
   - CRAAP: 4.1 (CRO agency insights)

## Limitations & Assumptions

### Assumptions
- ScoreApp is acceptable default for no-code path
- User wants reusable, programmatic output
- Benchmark conversion rates are directional (vary by industry/traffic)
- Email sequences require CRM integration

### What Could Go Wrong
- Benchmarks vary by niche; use as guidelines not guarantees
- Default copy needs human review for brand voice/legal compliance
- Integration complexity depends on existing tech stack
- A/B test results need statistical significance (min 100 conversions/variant)

### What to Improve Next
1. Export fully-populated quiz.json with real questions for specific niche
2. Create drop-in HTML + Tailwind code (not just spec)
3. Provide ScoreApp template slug and exact import steps

## Auto-Fallback to researcher-expert

**Trigger Conditions**:
- User requests industry-specific benchmarks (invoke researcher for latest data)
- Compliance requirements (GDPR, CCPA, CAN-SPAM) mentioned
- Custom analytics/tracking setup (invoke for platform-specific docs)
- Integration with unfamiliar CRM/email platform

**Action**: See `.claude/skills/_shared/auto-fallback-pattern.md`

---

*This skill enables the ui-ux-expert to build complete assessment funnels from a single prompt, delivering production-ready copy, wireframes, quiz payloads, and automation specs.*
