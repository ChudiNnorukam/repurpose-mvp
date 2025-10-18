# Email Sequence Template

## Email 1: Immediate Results (T+0)

**Trigger**: Quiz completion
**Send to**: All completers
**Goal**: Deliver value, establish authority, set up next touch

---

**Subject**: Your [CAMPAIGN] results + 3 quick wins

**Preview Text**: You scored [SCORE]/100 — here's what it means

**Body**:

Hi [NAME],

Thanks for completing the [CAMPAIGN]! Here's what we found:

**Your Score: [SCORE] / 100 — [BUCKET_LABEL]**

[BUCKET_DESCRIPTION]

**Your Top 3 Opportunities:**

1. **[AREA_1]**: You scored low on "[QUESTION]"
   → Why it matters: [IMPACT]
   → Quick win: [ACTION_STEP]

2. **[AREA_2]**: ...

3. **[AREA_3]**: ...

**What's Next?**

[BUCKET_SPECIFIC_CTA]
- **Hot**: I'd love to explore how we can optimize your results. Book a 20-minute call: [CALENDAR_LINK]
- **Warm**: Join our free masterclass where we dive deep into [AREA_1]: [SIGNUP_LINK]
- **Cold**: Download our starter guide with step-by-step fixes: [RESOURCE_LINK]

To your success,
[YOUR_NAME]
[TITLE]

P.S. Your full results are saved here: [RESULTS_PAGE_LINK]

---

## Email 2: Value + Invitation (T+24h)

**Trigger**: 24 hours after quiz completion
**Send to**: Warm + Hot only
**Goal**: Educate on #1 issue, invite to next step

---

**Subject**: [NAME], here's why [AREA] matters for [OUTCOME]

**Preview Text**: Most people don't realize this...

**Body**:

Hi [NAME],

Yesterday you discovered that [AREA] is one of your top opportunities.

Here's why it matters:

[2-3 paragraph deep dive on the area — cite research, share case study, explain mechanism]

**The good news?**

This is one of the fastest areas to improve once you know the right approach.

[WARM_SPECIFIC]
That's why I'm hosting a live masterclass next [DAY] at [TIME] where we'll cover:
✓ The 3 biggest mistakes people make with [AREA]
✓ My 5-step framework to fix it in 14 days
✓ Live Q&A to troubleshoot your specific situation

Reserve your spot (limited to 50 people): [SIGNUP_LINK]

[HOT_SPECIFIC]
Based on your score of [SCORE], you're in a great position to make rapid progress.

I have a few 1:1 slots open this week if you'd like personalized guidance on optimizing [AREA].

Book your complimentary 20-minute strategy call: [CALENDAR_LINK]

See you soon,
[YOUR_NAME]

---

## Email 3: Personal Outreach (T+7d)

**Trigger**: 7 days after quiz, no engagement with Email 1 or 2
**Send to**: Hot only
**Goal**: Direct personal invitation, overcome objections

---

**Subject**: Quick question about your [CAMPAIGN] results

**Preview Text**: [NAME], I noticed you scored [SCORE]...

**Body**:

[NAME],

I was reviewing the [CAMPAIGN] results from last week and noticed you scored [SCORE]/100.

That puts you in the top [PERCENTILE]% — which tells me you're already doing a lot of things right.

But here's what caught my attention:

Your answer to "[QUALIFIER_QUESTION]" suggests [INSIGHT_FROM_QUALIFIER].

In my experience working with [SIMILAR_PERSONA], the biggest breakthrough usually comes from [SPECIFIC_RECOMMENDATION].

I'm curious — have you made any progress on [AREA] since taking the assessment?

If you'd like to explore what's possible for you over the next 90 days, I have 3 slots available this week for a complimentary strategy call.

No pressure, just a conversation about [OUTCOME].

Interested? Just reply "yes" and I'll send you the booking link.

Best,
[YOUR_NAME]

P.S. If the timing isn't right, no worries. Your results link is still active: [RESULTS_PAGE_LINK]

---

## Automation Rules

### Email 1
- **When**: Immediately on quiz completion (0-5 min delay)
- **Condition**: None (send to all)
- **Personalization tokens**:
  - [NAME]
  - [SCORE]
  - [BUCKET_LABEL]
  - [BUCKET_DESCRIPTION]
  - [AREA_1], [AREA_2], [AREA_3] (dynamic from lowest-scoring questions)
  - [BUCKET_SPECIFIC_CTA]

### Email 2
- **When**: 24 hours after Email 1
- **Condition**: 
  - Bucket = warm OR hot
  - AND has NOT clicked CTA in Email 1
- **Personalization tokens**:
  - [NAME]
  - [AREA] (their #1 lowest-scoring area)
  - [OUTCOME] (from qualifier Q2)
  - [WARM_SPECIFIC] or [HOT_SPECIFIC] (conditional block)

### Email 3
- **When**: 7 days after Email 1
- **Condition**:
  - Bucket = hot
  - AND has NOT clicked any CTA in Email 1 or 2
  - AND has NOT booked a call
- **Personalization tokens**:
  - [NAME]
  - [SCORE]
  - [PERCENTILE] (calculated rank)
  - [QUALIFIER_QUESTION] (from qualifier responses)
  - [INSIGHT_FROM_QUALIFIER]
  - [SIMILAR_PERSONA]
  - [AREA]

## CRM Tag Strategy

On quiz completion, tag contact with:
- `quiz::[CAMPAIGN_NAME]`
- `bucket::[cold|warm|hot]`
- `score::[0-100]`
- `top_issue::[AREA]`
- `solution_pref::[QUALIFIER_Q4_ANSWER]`

Use tags to:
- Trigger correct email variant
- Suppress emails if already engaged
- Segment for future campaigns
- Score lead quality

## A/B Test Opportunities

1. **Subject Line Test (Email 1)**
   - A: "Your [CAMPAIGN] results + 3 quick wins"
   - B: "[NAME], you scored [SCORE]/100 👀"

2. **CTA Test (Email 2)**
   - A: "Reserve your spot" (event-focused)
   - B: "Get the framework" (resource-focused)

3. **Timing Test**
   - A: Email 2 at T+24h
   - B: Email 2 at T+48h

Track open rates, click rates, and conversion to next step.
