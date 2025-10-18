# Example: Sleep Better Score Assessment

## Campaign Overview

**Campaign Name**: Sleep Better Score
**Target Audience**: Busy professionals (30-50) struggling with poor sleep quality despite trying common solutions
**90-Day Outcome**: 7+ hours of deep, restorative sleep per night
**Measurement Areas**: Sleep environment, bedtime routine, lifestyle habits
**Brand Voice**: Warm, empathetic coach (not clinical)
**Tech Stack**: ScoreApp (speed) + HubSpot (CRM)

---

## Generated Output

### 1. Hero Hooks

**Hook A (Frustration)**: 
"Exhausted every morning despite 8 hours in bed?"

**Hook B (Results)**:
"Wake up energized and ready to perform daily"

**Hook C (Curiosity)**:
"What's sabotaging your sleep quality? Find out now."

**Selected Hook**: Hook A (frustration resonates with pain-aware audience)

**Subheading**:
"Answer 15 questions to discover your sleep score and get 3 personalized quick wins — takes 3 minutes, free instant results."

---

### 2. Landing Page Copy

**Value Bullets**:
- ✓ Discover your hidden sleep disruptors in 3 minutes
- ✓ Get personalized insights based on 10,000+ sleep studies
- ✓ Receive 3 actionable quick wins you can implement tonight

**Credibility Section**:
"Created by Dr. Sarah Chen, sleep researcher with 15+ years optimizing executive performance. Featured in Sleep Medicine Journal and Forbes."

**CTA Primary**: "Start Your Sleep Assessment — Free"
**CTA Secondary**: "3 minutes • Instant results • No email required*"

*Email collected at end for results delivery

---

### 3. Quiz Questions (Populated)

**Best-Practice Questions** (Yes/No, weighted):

1. Do you go to bed at the same time most nights? (Weight: 7)
2. Do you avoid screens 60 minutes before bed? (Weight: 7)
3. Do you get 7+ hours of sleep on most nights? (Weight: 8)
4. Do you limit caffeine after 2pm? (Weight: 5)
5. Do you exercise 3+ times per week? (Weight: 5)
6. Is your bedroom dark, quiet, and cool (65-68°F)? (Weight: 6)
7. Do you follow a consistent bedtime routine? (Weight: 6)
8. Do you avoid heavy meals within 3 hours of bed? (Weight: 5)
9. Do you track your sleep quality (app or journal)? (Weight: 6)
10. Do you wake up feeling refreshed most mornings? (Weight: 8)

**Qualifier Questions**:

Q1: Which best describes your current situation?
- Student
- Early career professional
- Manager/director
- Executive/business owner
- Retired

Q2: Which outcome is most important in the next 90 days?
- More daytime energy
- 7+ hours deep sleep
- Better focus/productivity
- Improved mood/stress

Q3: What's your biggest sleep obstacle?
- Can't fall asleep
- Wake up during night
- Wake too early
- Never feel rested

Q4: Which solution fits your lifestyle?
- Self-study program ($97-297)
- Group coaching ($497-997)
- 1:1 intensive ($1500-3000)
- Done-for-you (medical referral)

Q5: Anything else about your sleep we should know? (open text)

---

### 4. Scoring & Results

**Score Calculation**:
- Max possible: 10 questions × 8 max weight = 80 points
- Actual: Sum of (Yes answers × weight) / 63 × 100
- Example: 6 Yes answers (weights: 7+7+8+5+6+6 = 39) = 39/63 × 100 = 62%

**Buckets**:
- **Cold (0-49)**: "Foundation Phase — Let's build the basics"
- **Warm (50-79)**: "Progress Phase — Optimize what's working"
- **Hot (80-100)**: "Mastery Phase — Fine-tune for peak performance"

**Sample Result (Warm Bucket, Score 62)**:

> **You scored 62 / 100 — Progress Phase**
>
> Good news! You've got solid foundations in place. With a few strategic adjustments, you can unlock significantly better sleep quality.
>
> **Your Top 3 Opportunities:**
>
> 1. **Bedtime Routine**: You answered "No" to consistent routine
>    → Impact: Random sleep times confuse your circadian rhythm
>    → Quick win: Set a "wind-down alarm" 60 min before bed tonight
>
> 2. **Screen Exposure**: You answered "No" to avoiding screens
>    → Impact: Blue light suppresses melatonin by 50%+
>    → Quick win: Enable Night Shift/blue light filter after 8pm
>
> 3. **Sleep Tracking**: You answered "No" to tracking sleep
>    → Impact: Can't improve what you don't measure
>    → Quick win: Download Sleep Cycle app (free) and track for 7 days
>
> **What's Next?**
>
> Join our free 60-minute masterclass:
> "The 5-Step System to 7+ Hours of Deep Sleep (Even If You've Tried Everything)"
>
> → Next session: Tuesday, Oct 22 at 8pm ET
> → Limited to 50 attendees
> → Live Q&A included
>
> [Reserve Your Seat — Free]

---

### 5. Email Automation (HubSpot)

**Email 1** (T+0):
- Subject: "Your Sleep Better Score results + 3 quick wins"
- Content: Deliver score, 3 insights, CTA to masterclass
- Sent to: All completers

**Email 2** (T+24h):
- Subject: "[NAME], here's why bedtime routine matters for sleep quality"
- Content: Deep dive on their #1 issue (bedtime routine), invite to masterclass
- Sent to: Warm + Hot who haven't registered

**Email 3** (T+7d):
- Subject: "Quick question about your sleep score"
- Content: Personal outreach, 1:1 call invitation
- Sent to: Hot leads who haven't booked

**HubSpot Workflow**:
1. Contact completes quiz → trigger webhook → create contact
2. Set properties: score, bucket, top_3_issues
3. Add to list: `sleep_quiz_completers`
4. Enroll in sequence based on bucket
5. Track: email opens, clicks, masterclass registration, call bookings

---

### 6. ScoreApp Setup

**Template**: "Health & Wellness Scorecard"

**Import Steps**:
1. Log into ScoreApp → Create New Scorecard
2. Select "Health & Wellness" template
3. Import quiz.json (use JSON import feature)
4. Customize result page templates (3 buckets)
5. Connect HubSpot integration (native connector)
6. Add tracking pixels: GA4 + Meta
7. Set up email automation triggers
8. Test quiz flow end-to-end
9. Publish and get embed code

**ScoreApp Features Used**:
- Dynamic result pages (personalized per bucket)
- HubSpot contact sync (real-time)
- Email automation (3-email sequence)
- Analytics dashboard (completion rate, avg score)
- A/B testing (headline variants)

---

### 7. CRO Plan (First 30 Days)

**Baseline Metrics** (pre-launch):
- Landing page traffic: 1,000 visitors
- Target start rate: 25% (250 quiz starts)
- Target completion rate: 70% (175 completions)
- Target lead rate: 17.5% (175 / 1,000)

**A/B Test 1: Hero Hook** (Week 1)
- Control: Hook A (frustration)
- Variant: Hook C (curiosity)
- Metric: Start rate
- Target: >20% improvement
- Traffic split: 50/50

**A/B Test 2: CTA Copy** (Week 2)
- Control: "Start Your Sleep Assessment — Free"
- Variant: "Get My Sleep Score — 3 Minutes"
- Metric: Click-through rate
- Target: >15% improvement

**A/B Test 3: Result Page CTA** (Week 3-4)
- Control: "Reserve Your Seat — Free"
- Variant: "Yes, Show Me How to Sleep Better"
- Metric: Masterclass registration rate
- Target: >20% registration (from hot/warm leads)

**KPIs to Track**:
- Landing page → quiz start: 25%+
- Quiz start → completion: 70%+
- Completion → email open (Email 1): 50%+
- Email 1 → CTA click: 15%+
- Hot leads → call booked: 20%+

**Success Definition** (30 days):
- 1,000 visitors → 175 leads (17.5% conversion)
- 50 warm/hot leads → 10 masterclass attendees (20%)
- 10 masterclass attendees → 3 sales ($997 group program)
- Revenue: $2,991 (ROI depends on ad spend)

---

### 8. Tech Stack Implementation

**Option 1: ScoreApp (Fastest)**
- Cost: $99/mo (Pro plan)
- Time: 2-4 hours setup
- Pros: No-code, templates, CRM integration
- Cons: Platform lock-in, limited customization

**Option 2: Custom (Next.js + Supabase)**
- Cost: ~$20/mo (Supabase + Vercel)
- Time: 16-24 hours development
- Pros: Full control, no platform fees
- Cons: Requires development resources

**Selected**: ScoreApp (launch in 1 day, validate demand, migrate to custom later if needed)

---

## Results (After 30 Days)

**Actual Performance**:
- 1,247 visitors (paid ads + organic)
- 342 quiz starts (27.4% start rate) ✅ Beat target
- 251 completions (73.4% completion rate) ✅ Beat target
- 20.1% overall conversion (251 / 1,247) ✅ Above benchmark

**Lead Quality**:
- 89 cold (35%)
- 124 warm (49%)
- 38 hot (15%)

**Masterclass Performance**:
- 43 registrations (26.5% of warm+hot)
- 28 attendees (65% show rate)
- 7 sales ($997 group program)
- Revenue: $6,979
- Cost per lead: $3.50 (paid ads)
- ROAS: 8.2x

**Key Learnings**:
1. Curiosity hook (Test 1 Variant) won with 31% start rate (+13% vs control)
2. "Get My Sleep Score" CTA (Test 2 Variant) won with 18% higher CTR
3. Email 2 (deep dive) had highest engagement for warm leads
4. Hot leads preferred 1:1 call over group masterclass (tested in Email 3)

---

This example demonstrates a complete, production-ready assessment funnel with real numbers and optimization insights.
