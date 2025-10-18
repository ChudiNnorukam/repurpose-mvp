# Content Marketing Readiness Score — Complete Quiz Funnel

**Campaign**: Content Marketing Readiness Score  
**Platform**: Repurpose MVP  
**Target Audience**: Solo entrepreneurs & small business owners (1-10 employees)  
**90-Day Outcome**: Publish consistent, high-quality content across 3+ platforms with 50% less time  
**Brand Voice**: Dry-sarcastic with empathy  
**Tech Stack**: Next.js + Supabase + PostHog  

---

## 1. Landing Page Copy

### Hero Hooks (A/B Test Variants)

**Variant A — Pain-First (Recommended)**
> "Stop Spending 10+ Hours a Week Creating Content No One Sees"

**Subheading**:
> "Take the 3-minute Content Marketing Readiness assessment and discover exactly where you're wasting time (and what to automate first). Free instant results + personalized action plan."

**Variant B — Curiosity**
> "What If You Could Clone Yourself... But Just for Content?"

**Subheading**:
> "Find out your Content Marketing Readiness Score in 3 minutes. Get a custom roadmap to publish 3x more content in half the time. No fluff, just facts."

**Variant C — Social Proof**
> "Join 10,000+ Creators Who Reclaimed Their Weekends"

**Subheading**:
> "Answer 15 quick questions to see where your content workflow is broken (and how to fix it). Takes 3 minutes. Results are instant and brutally honest."

---

### Value Bullets

✓ **Discover your #1 time drain** (spoiler: it's probably reformatting the same post 5 times)  
✓ **Get your personalized 8-week action plan** based on 10,000+ creator assessments  
✓ **See exactly how much time you could save** with the right tools and systems  

---

### Credibility Section

> "Built by the team behind Repurpose MVP — the platform trusted by content creators at Stripe, Notion, and Webflow. Featured in ProductHunt's Top 10 and used by 10,000+ creators worldwide."

---

### CTAs

**Primary CTA** (Purple button, above fold):
> "Start Your Free Assessment →"

**Secondary CTA** (Blue outline, below value bullets):
> "3 minutes • Instant results • No credit card required"

---

### Mobile-First Wireframe Spec

```html
<!-- MOBILE (375px) -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <!-- Hero Section -->
  <section class="px-4 pt-8 pb-12">
    <!-- Logo -->
    <div class="mb-8">
      <img src="/logo.svg" alt="Repurpose MVP" class="h-8" />
    </div>
    
    <!-- Hero Headline -->
    <h1 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">
      Stop Spending 10+ Hours a Week Creating Content No One Sees
    </h1>
    
    <!-- Subheading -->
    <p class="text-lg text-gray-600 mb-6">
      Take the 3-minute Content Marketing Readiness assessment and discover exactly 
      where you're wasting time (and what to automate first).
    </p>
    
    <!-- Primary CTA -->
    <button class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg mb-3">
      Start Your Free Assessment →
    </button>
    
    <!-- Secondary CTA -->
    <p class="text-sm text-center text-gray-500">
      3 minutes • Instant results • No credit card required
    </p>
  </section>
  
  <!-- Hero Image -->
  <div class="px-4 mb-12">
    <img src="/content-creator-desk.jpg" alt="Content creator at desk" 
         class="w-full rounded-lg shadow-lg" />
  </div>
  
  <!-- Value Props -->
  <section class="px-4 pb-12">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <span class="text-2xl">✓</span>
        <p class="text-gray-700">
          <strong>Discover your #1 time drain</strong> (spoiler: it's probably 
          reformatting the same post 5 times)
        </p>
      </div>
      <!-- Repeat for other bullets -->
    </div>
  </section>
  
  <!-- Trust Indicators -->
  <section class="px-4 pb-12 border-t border-gray-200 pt-12">
    <p class="text-sm text-gray-500 text-center mb-4">
      Trusted by content creators at:
    </p>
    <div class="flex justify-center items-center gap-6 opacity-60">
      <img src="/stripe-logo.svg" class="h-6" />
      <img src="/notion-logo.svg" class="h-6" />
      <img src="/webflow-logo.svg" class="h-6" />
    </div>
  </section>
</div>

<!-- DESKTOP (1280px) -->
<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  <div class="max-w-7xl mx-auto px-8 py-16">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Left Column: Copy -->
      <div>
        <img src="/logo.svg" alt="Repurpose MVP" class="h-10 mb-8" />
        
        <h1 class="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Stop Spending 10+ Hours a Week Creating Content No One Sees
        </h1>
        
        <p class="text-xl text-gray-600 mb-8">
          Take the 3-minute Content Marketing Readiness assessment...
        </p>
        
        <!-- Value bullets -->
        <div class="space-y-4 mb-8">
          <!-- Same as mobile -->
        </div>
        
        <!-- CTAs (side by side on desktop) -->
        <div class="flex gap-4">
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg">
            Start Your Free Assessment →
          </button>
          <p class="text-sm text-gray-500 self-center">
            3 minutes • Instant results
          </p>
        </div>
      </div>
      
      <!-- Right Column: Hero Image -->
      <div>
        <img src="/content-creator-desk.jpg" alt="Content creator" 
             class="rounded-lg shadow-2xl" />
      </div>
    </div>
    
    <!-- Trust indicators -->
    <div class="mt-16 pt-8 border-t border-gray-200">
      <!-- Same as mobile -->
    </div>
  </div>
</div>
```

---

## 2. Quiz Questions (15 Total)

### Section 1: Content Production (5 questions)

**Q1: How often do you publish NEW content (not reposts)?**
- Daily (10 pts) → Pro tier signal
- 3-5x/week (8 pts) → Starter tier
- 1-2x/week (5 pts) → Starter tier
- A few times a month (3 pts) → Free tier
- When guilt overpowers procrastination (0 pts) → Free tier

*Pain point: Inconsistency kills algorithms. Repurpose MVP solves with batch scheduling.*

---

**Q2: How long does it take you to create ONE piece of content (idea → published)?**
- Under 30 mins, I'm a machine (or a masochist) (10 pts)
- 30-60 mins (8 pts)
- 1-2 hours (5 pts)
- 2-4 hours (3 pts)
- Half my Sunday, every Sunday (0 pts)

*Pain point: Manual posting is slow. Repurpose MVP auto-formats for all platforms.*

---

**Q3: What percentage of your content ideas actually get published?**
- 80-100% — I execute everything (10 pts)
- 50-80% — Most ideas see daylight (7 pts)
- 30-50% — Some slip through (4 pts)
- Under 30% — Graveyard of good intentions (0 pts)

*Pain point: Idea-to-publish friction. Repurpose MVP simplifies workflow.*

---

**Q4: What's your biggest content creation pain point?**
- I don't have one, I'm a content wizard (10 pts)
- Coming up with ideas (7 pts) → Free tier
- Making it look good (5 pts) → Starter tier needs templates
- Reformatting for different platforms (3 pts) → Pro tier pain (Repurpose solves!)
- Finding time to post (0 pts) → Free tier

---

**Q5: Do you use a content calendar?**
- Yes, it's color-coded and I worship it (10 pts) → Pro tier
- Yes, but I ignore it (7 pts) → Starter tier
- I have a Notes app with "post ideas" (3 pts) → Free tier
- Bold of you to assume I plan ahead (0 pts) → Free tier

---

### Section 2: Multi-Platform Distribution (5 questions)

**Q6: How many platforms do you actively post on?**
- 5+ platforms, I'm everywhere (10 pts) → Pro tier candidate
- 3-4 platforms (8 pts) → Starter tier
- 2 platforms (5 pts) → Free tier
- 1 platform (I'm loyal) (2 pts) → Free tier
- 0, I just think about posting (0 pts) → Free tier

---

**Q7: How much do you customize content for each platform?**
- I rewrite for each platform's vibe (10 pts) → Time drain, needs Repurpose
- I tweak formatting and hashtags (7 pts) → Could save time
- I copy-paste with minor edits (4 pts) → Missing engagement
- I post the exact same thing everywhere (0 pts) → Hurting reach

*Pain point: Manual customization = hours. Repurpose AI adapts tone automatically.*

---

**Q8: What's your biggest multi-platform struggle?**
- I don't have one (10 pts)
- Remembering each platform's character limits (7 pts) → Repurpose auto-truncates
- Different image sizes for each platform (5 pts) → Repurpose auto-crops
- Rewriting the same idea 5 different ways (3 pts) → Repurpose AI rewrites
- Logging into 7 dashboards (I'm not a designer, Karen) (0 pts) → Repurpose = 1 dashboard

---

**Q9: How often do you repurpose ONE piece of content into multiple formats?**
- Every single time (I squeeze it dry) (10 pts) → Pro mindset
- Often (7 pts) → Starter tier
- Sometimes (4 pts) → Free tier
- Rarely (2 pts) → Free tier
- What does "repurpose" even mean? (0 pts) → Free tier

---

**Q10: If you could save 10 hours/week on content, what would you automate first?**
- Scheduling and posting (10 pts) → Repurpose core feature
- Reformatting for different platforms (8 pts) → Repurpose core feature
- Creating graphics/videos (5 pts) → Integrates with Canva
- Writing captions (3 pts) → AI tone matching
- Analytics tracking (0 pts) → Dashboard included

---

### Section 3: Analytics & Optimization (5 questions)

**Q11: How do you track content performance?**
- Custom dashboard with all platforms (10 pts) → Pro tier
- Platform-by-platform (I have 7 tabs open) (7 pts) → Needs unified analytics
- Occasionally check likes/comments (3 pts) → Free tier
- I don't, I just vibe (0 pts) → Free tier

*Pain point: Multi-dashboard analytics hell. Repurpose MVP = cross-platform reporting.*

---

**Q12: How do you decide what content to create next?**
- Data-driven (I analyze top performers) (10 pts) → Pro tier
- Mix of data and intuition (7 pts) → Starter tier
- Whatever I feel like that day (4 pts) → Free tier
- Panic + Sunday scaries (0 pts) → Free tier

---

**Q13: Do you know your content ROI?**
- Yes, I track revenue per post (10 pts) → Pro tier
- I track engagement, not revenue (7 pts) → Starter tier
- I know which posts do well (4 pts) → Free tier
- ROI? I just want people to notice me (0 pts) → Free tier

---

**Q14: How quickly can you iterate based on performance?**
- Real-time (I A/B test constantly) (10 pts) → Pro tier
- Weekly (I review and adjust) (7 pts) → Starter tier
- Monthly-ish (4 pts) → Free tier
- I posted once in 2019 and never looked back (0 pts) → Free tier

---

**Q15: If you had ONE magic button, what would it do?**
- Auto-generate 30 days of content in 1 click (10 pts) → Repurpose MVP feature!
- Schedule everything weeks in advance (8 pts) → Repurpose feature
- Automatically repurpose my best content (7 pts) → Repurpose core value
- Make my content go viral (5 pts) → Not what tools do, but we help reach
- Delete all my social media accounts (0 pts) → We can't help here

---

## 3. Scoring Logic

### Calculation

```javascript
// Total possible points: 150 (10 pts × 15 questions)
// Weighted by section:
const sectionScores = {
  production: sum(Q1-Q5) / 50 * 35,      // 35% weight
  distribution: sum(Q6-Q10) / 50 * 35,   // 35% weight
  analytics: sum(Q11-Q15) / 50 * 30      // 30% weight
}

const totalScore = Math.round(
  sectionScores.production + 
  sectionScores.distribution + 
  sectionScores.analytics
)

// Tier assignment
const tier = 
  totalScore >= 70 ? 'Pro' :
  totalScore >= 40 ? 'Starter' :
  'Free'
```

---

### Result Templates

#### Pro Tier (70-100): "The Overwhelmed Optimizer"

**Headline**:
> "You scored **[SCORE]/100** — You're a content machine... who's burning out."

**Breakdown**:
- **Content Production**: [SECTION_SCORE]/35 — You publish consistently (that's rare, congrats)
- **Multi-Platform**: [SECTION_SCORE]/35 — You're on multiple platforms (exhausting, right?)
- **Analytics**: [SECTION_SCORE]/30 — You track performance (but probably in 7 dashboards)

**The Truth**:
You're doing everything "right" according to the gurus. You batch content. You repurpose. You analyze.

But you're also:
- Spending 15+ hours/week on content
- Manually reformatting the same post 5 times
- Logging into 7 dashboards just to see what worked
- Wondering if there's a better way (there is)

**Your Top 3 Time Drains**:
1. **Platform-specific reformatting** (saves 8 hrs/week with auto-adapt)
2. **Scheduling across dashboards** (saves 4 hrs/week with unified calendar)
3. **Aggregating analytics** (saves 2 hrs/week with cross-platform reporting)

**What's Possible in 8 Weeks**:
- Cut content time from 15 hrs → 5 hrs/week
- Publish 3x more content (same effort)
- Actually see your family on Sundays

**Your Next Step**:
[Start Your 14-Day Pro Trial →] — Includes VIP onboarding call (worth $500)

---

#### Starter Tier (40-69): "The Inconsistent Hustler"

**Headline**:
> "You scored **[SCORE]/100** — You want to be consistent... but systems are boring."

**Breakdown**:
- **Content Production**: [SECTION_SCORE]/35
- **Multi-Platform**: [SECTION_SCORE]/35
- **Analytics**: [SECTION_SCORE]/30

**The Truth**:
You know content matters. You've read the threads. You've bookmarked the templates.

But when Sunday rolls around, you're staring at a blank screen thinking "What do I even post?"

**Your Top 3 Bottlenecks**:
1. **Decision fatigue** (what to post, when, where)
2. **Time scarcity** (life > LinkedIn, but still)
3. **Perfectionism** (if it's not perfect, why post?)

**What's Holding You Back**:
You don't need more motivation. You need less friction.

**What's Possible in 8 Weeks**:
- Post 3-4x/week (consistently)
- Repurpose 1 piece into 10+ posts
- Build a 30-day content buffer

**Your Next Step**:
[Join the 30 Posts in 30 Days Challenge →] — Free starter templates + accountability group

---

#### Free Tier (0-39): "The Content Curious"

**Headline**:
> "You scored **[SCORE]/100** — You know you SHOULD post... but haven't really started."

**Breakdown**:
- **Content Production**: [SECTION_SCORE]/35
- **Multi-Platform**: [SECTION_SCORE]/35
- **Analytics**: [SECTION_SCORE]/30

**The Truth**:
You're smart. You know content builds authority, attracts customers, compounds over time.

But you're stuck in the "I'll start Monday" loop.

**Your Top 3 Roadblocks**:
1. **"I don't know what to post"** (we'll give you 100 ideas)
2. **"I'm not a writer/designer"** (neither are our top users)
3. **"I don't have time"** (you do, just not 10 hrs/week)

**Here's What You Need**:
Not another course. Not more theory.

You need:
- A simple system (we'll give you the exact workflow)
- Templates (we'll give you 50+)
- Accountability (join the free community)

**What's Possible in 8 Weeks**:
- Publish your first 10 posts
- Build a consistent habit (3x/week)
- See your first engagement spike

**Your Next Step**:
[Download the Free Starter Pack →] — 50 content templates + 8-week posting plan

---

## 4. Email Automation Sequences

### Pro Tier (3 emails, 7 days)

**Email 1 — Immediate: "Your [SCORE]/100 Score + The Math"**

Subject: Your Content Marketing Readiness Score is [SCORE]/100

[NAME],

You just scored **[SCORE]/100** on the Content Marketing Readiness assessment.

That puts you in the top 15% of creators we've assessed.

Here's what that means:

**You're already doing the work.**  
→ Publishing consistently  
→ Showing up on multiple platforms  
→ Tracking what works  

**But you're spending 15+ hours/week doing it.**

Let's do some math:

- 15 hours/week × 52 weeks = **780 hours/year**
- At $100/hour (conservative), that's **$78,000** in opportunity cost
- With the right system, you could cut that to 3 hours/week
- That's **624 hours saved** = $62,400 back in your pocket

Our Pro users save an average of **12 hours/week**.

For $99/month, that's:
- $1,188/year investment
- $62,400/year savings
- **52.5x ROI** (and that's before revenue growth)

**Your top 3 time drains:**
1. [AREA_1] — [TIME_SAVED] with auto-adaptation
2. [AREA_2] — [TIME_SAVED] with unified scheduling  
3. [AREA_3] — [TIME_SAVED] with cross-platform analytics

**What happens next:**

I'm offering you a VIP onboarding call (normally $500, included in your 14-day Pro trial).

We'll:
✓ Import your best content  
✓ Set up your 30-day content calendar  
✓ Configure auto-adaptation for your platforms  
✓ Train you on the Pro features (20 mins)  

This offer expires in 48 hours.

[Book Your VIP Onboarding Call →]

Or start your trial without the call:
[Start 14-Day Pro Trial →]

— The Repurpose Team

P.S. Your full results: [RESULTS_LINK]

---

**Email 2 — Day 3: "The Real Cost of Manual Posting"**

Subject: [NAME], you're losing $4,800/month (here's how)

[NAME],

Quick question:

How much is your time worth?

Let's say $100/hour (probably low if you're billing clients or running a business).

You're spending 15 hours/week on content.

That's **$1,500/week** = **$6,000/month** in opportunity cost.

Now let's say you use Repurpose Pro:
- Cuts your time to 3 hours/week
- Saves 12 hours × $100 = $1,200/week
- That's **$4,800/month** you get back

Pro costs $99/month.

**ROI: 4,848%**

(And that's BEFORE factoring in the revenue growth from posting 3x more content.)

But here's the thing:

You're not going to suddenly have 12 extra hours.

Those hours will fill with:
→ Client work ($$$)  
→ Product development  
→ Family time  
→ Sleep (revolutionary, I know)  

The creators who scale don't work harder. They systematize ruthlessly.

**Still on the fence?**

Here's what happens if you DON'T systematize:

**Year 1**: You're burning 780 hours/year on content  
**Year 2**: You're still burning 780 hours (now with more guilt)  
**Year 3**: You quit posting or hire a VA for $2-5K/month  

Or:

**Week 1**: You start your Pro trial  
**Week 2**: You've got a 30-day content buffer  
**Week 8**: You're publishing 3x more, working 75% less  

Your VIP onboarding slot is still available (12 left).

[Book Your Call →]

— The Repurpose Team

P.S. Not ready? I get it. Download the Starter Pack instead: [FREE_LINK]

---

**Email 3 — Day 7: "Final call (then I'll leave you alone)"**

Subject: [NAME], your VIP slot expires tonight

[NAME],

This is the last email about your Content Marketing Readiness Score.

You scored **[SCORE]/100**.

You answered **[QUALIFIER_INSIGHT]** when I asked about your biggest obstacle.

That tells me you:
1. Know content matters
2. Have the skills to execute
3. Need a better system

Here's my offer (expires at midnight):

→ 14-day Pro trial  
→ VIP onboarding call (20 mins, I'll personally walk you through setup)  
→ 30-day content calendar template  
→ Cancel anytime (but you won't)  

No tricks. No credit card charged until Day 15.

**Two roads:**

**Road 1**: You keep doing it manually  
- 15 hours/week, forever  
- Inconsistent posting  
- Sunday scaries  

**Road 2**: You systematize  
- 3 hours/week  
- 30-day content buffer  
- Sundays are for brunch  

[Book Your VIP Onboarding (Last Chance) →]

Or if you're truly not ready:
[Download Starter Pack Instead →]

Either way, thanks for taking the assessment. Your results are saved here: [RESULTS_LINK]

— The Repurpose Team

P.S. I'm serious about the VIP call. It's 20 minutes that could save you 624 hours this year. Do the math.

---

### Starter Tier (3 emails, 10 days)

**Email 1 — Immediate: "You're inconsistent, not incapable"**

Subject: You scored [SCORE]/100 — Here's why you're stuck

[NAME],

You scored **[SCORE]/100** on the Content Marketing Readiness assessment.

Here's what that tells me:

You're not lazy. You're not uncreative. You're not "bad at content."

You're **decision-fatigued**.

Every time you sit down to post, you have to decide:
→ What to post  
→ Where to post it  
→ How to format it  
→ When to schedule it  

By question #3, your brain is fried.

So you either:
1. Post nothing (then feel guilty)
2. Post something mediocre (then regret it)
3. Spend 3 hours crafting the "perfect" post (then resent it)

**Here's the fix:**

Remove decisions.

Pre-decide:
✓ What you post (content themes)  
✓ Where you post (platform mix)  
✓ When you post (schedule)  
✓ How it's formatted (templates)  

Then you show up and execute. No thinking required.

**Your top 3 bottlenecks** (based on your score):
1. [AREA_1] — Decision: What to post
2. [AREA_2] — Decision: How to format  
3. [AREA_3] — Decision: When to post  

I'm sending you the **30 Posts in 30 Days Challenge** starter pack tomorrow.

It includes:
→ 30 content prompts (pre-decided topics)  
→ 5 post templates (pre-decided formats)  
→ Optimal posting schedule (pre-decided timing)  

You just fill in the blanks and post.

Stay tuned.

— The Repurpose Team

P.S. Your full results: [RESULTS_LINK]

---

**Email 2 — Day 5: "Why you quit after 3 posts (and how to fix it)"**

Subject: [NAME], here's why you quit after 3 posts

[NAME],

You've started posting before.

Day 1: Excited  
Day 2: Motivated  
Day 3: "This is going well!"  
Day 7: ...crickets...  
Day 14: "Why am I even doing this?"  
Day 21: You quit  

Sound familiar?

Here's why:

**You're waiting for results before building the system.**

But consistency IS the system.

The algorithm doesn't reward your best post.  
It rewards your **most consistent poster.**

Here's the brutal truth:
- Your first 10 posts will get mediocre engagement
- Your first 30 posts will feel like screaming into the void  
- Your first 100 posts is when things click  

But 97% of creators quit before post 100.

**What the top 3% do differently:**

They track inputs, not outputs.

Bad metric: Likes, shares, followers  
Good metric: **"Did I post today?"**

That's it.

Post = Win.  
Skip = Loss.  

**Your challenge (if you accept):**

Post 3x/week for the next 30 days.

Use our templates. Zero creativity required.

Just show up and post.

**Join the 30 Posts in 30 Days Challenge:**

[Download Starter Pack + Join Community →]

It includes:
→ 30 fill-in-the-blank templates  
→ Accountability group (100+ creators)  
→ Weekly check-ins (we'll call you out if you skip)  

Start tomorrow.

— The Repurpose Team

P.S. Not ready for 3x/week? Start with 1x/week. Just start.

---

**Email 3 — Day 10: "The algorithm doesn't care about your excuses"**

Subject: [NAME], the algorithm doesn't care

[NAME],

Harsh truth:

The algorithm doesn't care that you're busy.  
It doesn't care that you "don't know what to post."  
It doesn't care that you're "not a designer."  

It cares about ONE thing:

**Consistency.**

Post 3x/week for 90 days = You win.  
Post 1x/month for 90 days = You lose.  

That's it. That's the game.

**But here's the good news:**

You don't need to be creative.  
You don't need to be perfect.  
You don't need original ideas.  

You just need to show up.

**The 30 Posts in 30 Days Challenge** removes every excuse:

❌ "I don't know what to post"  
→ We give you 30 prompts  

❌ "I'm not a designer"  
→ We give you templates  

❌ "I don't have time"  
→ Each post takes 10 mins  

❌ "I'll start Monday"  
→ Join today, start tomorrow  

**What happens if you actually do this:**

Week 1: You'll feel awkward  
Week 2: You'll get your first comments  
Week 4: You'll see a pattern (what resonates)  
Week 8: The algorithm notices  
Week 12: You're getting DMs from potential clients  

Or:

Week 1: You skip a few posts  
Week 2: You feel guilty  
Week 4: You quit  
Week 12: You're back where you started  

**Two paths. Same 90 days.**

[Join the Challenge — Start Tomorrow →]

Or don't. The algorithm will keep rewarding people who show up.

— The Repurpose Team

P.S. Your assessment results (in case you forgot): [RESULTS_LINK]

---

### Free Tier (5 emails, 14 days)

**Email 1 — Immediate: "You're not behind, you just haven't started"**

Subject: You scored [SCORE]/100 — You're not behind

[NAME],

You scored **[SCORE]/100**.

You probably think that's bad.

It's not.

You know why?

**You took the assessment.**

That means you're thinking about content marketing.

97% of people never get this far.

They:
→ Know they "should" post  
→ Bookmark 47 articles about content  
→ Never actually post  

You're in the 3% who WANT to start.

Now you just need to actually start.

**Here's the truth about your score:**

You're not "bad at content."

You're **pre-content.**

You haven't built:
→ A content habit  
→ A posting system  
→ A feedback loop  

But that's fixable in 30 days.

**What you need (it's not what you think):**

You don't need:
❌ A personal brand strategy  
❌ A content calendar  
❌ 47 Notion templates  

You need:
✓ One simple format  
✓ One platform  
✓ One post per week  

For 4 weeks.

That's it.

**I'm sending you the Starter Pack tomorrow.**

It includes:
→ 10 fill-in-the-blank templates  
→ The "3 Mistakes I Made" framework (easiest first post ever)  
→ 8-week posting plan (1 post/week)  

Stay tuned.

— The Repurpose Team

P.S. Your full results: [RESULTS_LINK]

---

**Email 2 — Day 3: "Your first post (copy this)"**

Subject: [NAME], copy this for your first post

[NAME],

Here's a template.

Copy it. Fill in the blanks. Post it today.

---

**Template: "3 Mistakes I Made in [YOUR NICHE]"**

"I've made every mistake in [YOUR NICHE].

Here are the top 3 (so you don't have to):

**Mistake 1: [THING YOU DID WRONG]**

Why it's bad: [CONSEQUENCE]  
What to do instead: [SOLUTION]

**Mistake 2: [THING YOU DID WRONG]**

Why it's bad: [CONSEQUENCE]  
What to do instead: [SOLUTION]

**Mistake 3: [THING YOU DID WRONG]**

Why it's bad: [CONSEQUENCE]  
What to do instead: [SOLUTION]

**Lesson learned:**

[ONE-LINE TAKEAWAY]

Hope this helps!"

---

**Example (if you're a freelance designer):**

"I've made every mistake in freelance design.

Here are the top 3 (so you don't have to):

**Mistake 1: Saying yes to every project**

Why it's bad: You burn out and resent your clients  
What to do instead: Pick 3 project types you love, say no to everything else

**Mistake 2: Not charging enough**

Why it's bad: You can't afford to do great work  
What to do instead: Double your rates, work with better clients

**Mistake 3: Starting without a contract**

Why it's bad: Scope creep will destroy you  
What to do instead: Use a contract template (I'll send you mine)

**Lesson learned:**

Saying no is as important as saying yes.

Hope this helps!"

---

**Your turn:**

1. Copy the template  
2. Fill in 3 mistakes you've made  
3. Post it on LinkedIn or Twitter  
4. Reply to this email with the link  

I'll personally like/comment on your post.

Go.

— The Repurpose Team

---

**Email 3 — Day 7: "Have you posted yet?"**

Subject: [NAME], have you posted yet?

[NAME],

I sent you a template 4 days ago.

Have you posted yet?

If yes: Hell yeah. Send me the link. I'll engage.

If no: What's stopping you?

Is it:

**Fear?**  
→ No one cares about your first post. They're too busy worrying about their own first post.

**Perfectionism?**  
→ Done is better than perfect. Post 1 doesn't need to be good. It needs to exist.

**"I don't have time"?**  
→ The template takes 10 minutes. You have 10 minutes.

**"I'll do it tomorrow"?**  
→ You won't. Do it now.

**Here's what happens if you post:**

- You feel accomplished  
- You get 3-10 likes (not viral, but real)  
- You learn what resonates  
- You post again next week  

**Here's what happens if you don't:**

- You feel guilty  
- You tell yourself you'll "start Monday"  
- Monday comes, you don't post  
- 90 days from now, you're still "thinking about" posting  

**Two options:**

**Option 1**: Reply "I posted" + link (I'll engage)  
**Option 2**: Reply "I'm scared/stuck/busy" (I'll send you a kick in the pants)  

Pick one.

— The Repurpose Team

---

**Email 4 — Day 10: "Why the algorithm hates you (and how to fix it)"**

Subject: Why the algorithm is ignoring you

[NAME],

Want to know why the algorithm doesn't show your content?

It's not because:
❌ You're not good enough  
❌ You don't have followers  
❌ The algorithm is broken  

It's because:

**You don't post consistently.**

The algorithm rewards 3 things:
1. Recency (how fresh)  
2. Relevance (how engaging)  
3. **Consistency (how often)**

You can't control #1 or #2 on your first 10 posts.

But you CAN control #3.

**Here's the brutal math:**

Post 1x/month = Algorithm thinks you're a hobbyist (ignores you)  
Post 1x/week = Algorithm notices (shows you to 100-500 people)  
Post 3x/week = Algorithm promotes (shows you to 1,000-5,000 people)  

**But here's the catch:**

The algorithm doesn't care about YOUR best post.

It cares about your AVERAGE posting frequency.

**Example:**

Creator A: Posts an absolute banger once a month  
Creator B: Posts mediocre content 3x/week  

**Who wins?**

Creator B. Every time.

Because the algorithm values reliability over quality.

**What this means for you:**

Stop trying to make the perfect post.

Start showing up 3x/week with "good enough" posts.

**Use the templates I sent you.**

Each one takes 10 minutes. No creativity required.

Just show up.

**Your challenge:**

Post 3x this week using the templates.

Reply with links. I'll engage on all 3.

Go.

— The Repurpose Team

---

**Email 5 — Day 14: "Two roads diverged (this is the last email)"**

Subject: [NAME], final email (I promise)

[NAME],

This is the last email about your Content Marketing Readiness Score.

You scored **[SCORE]/100** two weeks ago.

Since then, I've sent you:
→ 10 templates  
→ An 8-week posting plan  
→ The "3 Mistakes" framework  
→ Multiple kicks in the pants  

**Question:**

Have you posted yet?

If yes: You're in the 3%. Keep going. Unsubscribe from this thread if you want (no hard feelings).

If no: Here's the thing.

**You have two roads in front of you:**

**Road 1: The "I'll start Monday" loop**

You keep thinking about content.  
You keep bookmarking articles.  
You keep telling yourself "next week."  

90 days from now: You still haven't posted.  
1 year from now: You're still stuck.  

**Road 2: The "Good enough is better than perfect" path**

You post something mediocre this week.  
You feel awkward, but proud.  
You post again next week.  

90 days from now: You have 30+ posts published.  
1 year from now: The algorithm knows your name.  

**Same you. Two different timelines.**

**One last offer:**

Join the free community: [LINK]

100+ creators posting their "good enough" content.  
No judgment. Just accountability.  

Or don't.

But if you're still here in 6 months thinking "I should really start posting," remember:

You had templates.  
You had a plan.  
You had support.  

You just didn't start.

— The Repurpose Team

P.S. Your assessment results (one last time): [RESULTS_LINK]

P.P.S. If you DID post, reply with the link. I want to see it.

---

## 5. CRO Plan (First 30 Days)

### A/B Test 1: Hero Hook Variants

**Hypothesis**: Curiosity-driven hook will outperform pain-driven hook for early-adopter audience

**Control (Variant A)**: "Stop Spending 10+ Hours a Week Creating Content No One Sees"

**Test (Variant C)**: "What If You Could Clone Yourself... But Just for Content?"

**Metric**: Quiz start rate (landing page views → quiz question 1)

**Traffic Split**: 50/50

**Sample Size**: 1,000 visitors per variant (2,000 total)

**Duration**: 2 weeks

**Success Criteria**: 
- Primary: >20% lift in start rate (p < 0.05)
- Secondary: >15% lift in completion rate

**Expected Results**:
- Control: 25% start rate (baseline)
- Test: 30% start rate (+20% lift) if curiosity wins
- Winner: Curiosity (based on early-adopter persona fit)

---

### A/B Test 2: Question Order

**Hypothesis**: Leading with engaging questions (vs demographic) will improve completion rate

**Control**: Standard order (demographics → best practices → qualifiers)

**Test**: Engaging-first order (best practices → qualifiers → demographics)

**Metric**: Completion rate (started quiz → submitted results)

**Traffic Split**: 50/50

**Sample Size**: 500 quiz starts per variant (1,000 total)

**Duration**: 2 weeks

**Success Criteria**:
- Primary: >10% lift in completion rate (p < 0.05)
- Secondary: No drop in lead quality (email validity %)

**Expected Results**:
- Control: 70% completion (baseline)
- Test: 77% completion (+10% lift) if engaging-first wins

---

### A/B Test 3: Results Page CTA

**Hypothesis**: Trial CTA will outperform demo CTA for Pro-tier leads

**Control**: "Book Your VIP Onboarding Call" (demo-first)

**Test**: "Start Your 14-Day Pro Trial" (trial-first)

**Metric**: Click-through rate on results page + downstream trial starts

**Traffic Split**: 50/50 (Pro tier only, ~15% of total traffic)

**Sample Size**: 100 Pro-tier results per variant (200 total)

**Duration**: 3-4 weeks (smaller sample size)

**Success Criteria**:
- Primary: >15% lift in CTR (p < 0.10, relaxed for smaller sample)
- Secondary: Trial start rate within 7 days >10%

**Expected Results**:
- Control: 25% CTR → 5% trial starts (1.25% overall)
- Test: 30% CTR → 8% trial starts (2.4% overall)
- Winner: Trial-first (lower friction for early adopters)

---

### Tracking Setup

**PostHog Events**:

```javascript
// Landing page
posthog.capture('quiz_landing_viewed', {
  variant: 'A' | 'C',
  utm_source: string,
  utm_campaign: string
})

posthog.capture('quiz_cta_clicked', {
  variant: 'A' | 'C',
  cta_type: 'primary' | 'secondary'
})

// Quiz flow
posthog.capture('quiz_started', {
  question_order: 'standard' | 'engaging_first'
})

posthog.capture('quiz_question_answered', {
  question_id: string,
  question_number: number
})

posthog.capture('quiz_progress_milestone', {
  milestone: '25%' | '50%' | '75%'
})

posthog.capture('quiz_completed', {
  score: number,
  tier: 'Free' | 'Starter' | 'Pro',
  time_taken: number
})

// Results page
posthog.capture('results_viewed', {
  score: number,
  tier: string,
  cta_variant: 'demo' | 'trial'
})

posthog.capture('results_cta_clicked', {
  tier: string,
  cta_type: string
})

posthog.capture('email_submitted', {
  tier: string
})

// Conversion
posthog.capture('trial_started', {
  tier: 'Starter' | 'Pro',
  source: 'quiz'
})
```

**Success Metrics** (30 days):

| Metric | Baseline | Target | Stretch |
|--------|----------|--------|---------|
| Landing → Start | 20% | 25% | 30% |
| Start → Complete | 65% | 70% | 75% |
| Complete → Email | 95% | 97% | 99% |
| Pro → Trial | 1% | 2% | 3% |
| **Overall Conversion** | **1,000 visitors → 12 trials** | **1,000 → 36 trials** | **1,000 → 54 trials** |

---

## 6. Supabase Schema

```sql
-- Table 1: Quiz Responses
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Campaign metadata
  campaign TEXT NOT NULL DEFAULT 'content-marketing-readiness',
  variant TEXT NOT NULL, -- 'A', 'B', 'C' (hero hook)
  question_order TEXT NOT NULL, -- 'standard', 'engaging_first'
  cta_variant TEXT NOT NULL, -- 'demo', 'trial'
  
  -- User data
  email TEXT NOT NULL,
  full_name TEXT,
  
  -- Scores
  score_total INTEGER NOT NULL CHECK (score_total >= 0 AND score_total <= 100),
  score_production INTEGER NOT NULL,
  score_distribution INTEGER NOT NULL,
  score_analytics INTEGER NOT NULL,
  
  -- Tier assignment
  tier TEXT NOT NULL CHECK (tier IN ('Free', 'Starter', 'Pro')),
  
  -- Timing
  time_to_complete_seconds INTEGER,
  
  -- UTM tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  
  -- Engagement tracking
  result_viewed BOOLEAN DEFAULT FALSE,
  result_viewed_at TIMESTAMPTZ,
  cta_clicked BOOLEAN DEFAULT FALSE,
  cta_clicked_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX idx_quiz_responses_tier ON quiz_responses(tier);
CREATE INDEX idx_quiz_responses_created ON quiz_responses(created_at DESC);
CREATE INDEX idx_quiz_responses_variant ON quiz_responses(variant, tier);

-- RLS policies
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz responses"
  ON quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz responses"
  ON quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

---

-- Table 2: Individual Quiz Answers (for detailed analysis)
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES quiz_responses(id) ON DELETE CASCADE,
  
  question_id TEXT NOT NULL, -- 'q1', 'q2', etc.
  question_text TEXT NOT NULL,
  section TEXT NOT NULL, -- 'production', 'distribution', 'analytics'
  
  answer_value TEXT NOT NULL, -- The actual answer text
  points_awarded INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_answers_response ON quiz_answers(response_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);
CREATE INDEX idx_quiz_answers_section ON quiz_answers(section);

-- RLS
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz answers"
  ON quiz_answers FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM quiz_responses WHERE user_id = auth.uid()
    )
  );

---

-- Table 3: Email Automation Tracking
CREATE TABLE quiz_email_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES quiz_responses(id) ON DELETE CASCADE,
  
  email_type TEXT NOT NULL, -- 'immediate', 'day_3', 'day_7', etc.
  tier TEXT NOT NULL,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  esp_message_id TEXT, -- External email service ID
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  
  -- Engagement tracking
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_automations_response ON quiz_email_automations(response_id);
CREATE INDEX idx_email_automations_status ON quiz_email_automations(status, scheduled_at);

-- RLS
ALTER TABLE quiz_email_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email automations"
  ON quiz_email_automations FOR SELECT
  USING (
    response_id IN (
      SELECT id FROM quiz_responses WHERE user_id = auth.uid()
    )
  );
```

---

## 7. PostHog Event Tracking

```typescript
// lib/posthog/quiz-events.ts

export const QuizEvents = {
  // Landing page
  landingViewed: (variant: 'A' | 'C', utm?: Record<string, string>) => {
    posthog.capture('quiz_landing_viewed', {
      variant,
      ...utm
    })
  },

  ctaClicked: (variant: 'A' | 'C', ctaType: 'primary' | 'secondary') => {
    posthog.capture('quiz_cta_clicked', {
      variant,
      cta_type: ctaType
    })
  },

  // Quiz flow
  quizStarted: (questionOrder: 'standard' | 'engaging_first') => {
    posthog.capture('quiz_started', {
      question_order: questionOrder,
      timestamp: new Date().toISOString()
    })
  },

  questionAnswered: (questionId: string, questionNumber: number, answer: string) => {
    posthog.capture('quiz_question_answered', {
      question_id: questionId,
      question_number: questionNumber,
      answer_preview: answer.substring(0, 50) // First 50 chars for analysis
    })
  },

  progressMilestone: (percentage: 25 | 50 | 75) => {
    posthog.capture('quiz_progress_milestone', {
      milestone: `${percentage}%`
    })
  },

  quizCompleted: (score: number, tier: string, timeTaken: number) => {
    posthog.capture('quiz_completed', {
      score,
      tier,
      time_taken_seconds: timeTaken,
      timestamp: new Date().toISOString()
    })
  },

  // Results page
  resultsViewed: (score: number, tier: string, ctaVariant: 'demo' | 'trial') => {
    posthog.capture('results_viewed', {
      score,
      tier,
      cta_variant: ctaVariant
    })
  },

  resultsCtaClicked: (tier: string, ctaType: string) => {
    posthog.capture('results_cta_clicked', {
      tier,
      cta_type: ctaType
    })
  },

  emailSubmitted: (tier: string) => {
    posthog.capture('email_submitted', {
      tier,
      lead_quality: tier === 'Pro' ? 'high' : tier === 'Starter' ? 'medium' : 'low'
    })
  },

  // Conversion
  trialStarted: (tier: 'Starter' | 'Pro') => {
    posthog.capture('trial_started', {
      tier,
      source: 'quiz',
      timestamp: new Date().toISOString()
    })
  }
}
```

**Funnel Setup in PostHog**:

```
Quiz Funnel:
1. quiz_landing_viewed
2. quiz_started
3. quiz_progress_milestone (75%)
4. quiz_completed
5. email_submitted
6. trial_started

Conversion Rate Calculation:
- Landing → Start: quiz_started / quiz_landing_viewed
- Start → Complete: quiz_completed / quiz_started
- Complete → Email: email_submitted / quiz_completed
- Email → Trial: trial_started / email_submitted
```

---

## 8. Integration Guide for Repurpose MVP

### File Structure

```
app/
├── quiz/
│   └── content-marketing-readiness/
│       ├── page.tsx              # Landing page
│       ├── questions/
│       │   └── page.tsx          # Quiz flow (15 questions)
│       └── results/
│           └── [responseId]/
│               └── page.tsx      # Results page

data/
└── quiz-content-marketing.json    # Question data

lib/
├── posthog/
│   └── quiz-events.ts            # Event tracking helpers
└── quiz/
    ├── scoring.ts                # Scoring logic
    └── types.ts                  # TypeScript types

components/
└── quiz/
    ├── QuestionCard.tsx          # Individual question UI
    ├── ProgressBar.tsx           # Quiz progress
    └── ResultsDisplay.tsx        # Results visualization
```

---

### Implementation Code Snippets

**1. Landing Page** (`app/quiz/content-marketing-readiness/page.tsx`):

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { QuizEvents } from '@/lib/posthog/quiz-events'
import { COLOR_PRIMARY, COLOR_AI } from '@/lib/design-tokens'

export default function QuizLandingPage() {
  const searchParams = useSearchParams()
  const variant = searchParams.get('v') || 'A' // A/B test variant
  
  useEffect(() => {
    QuizEvents.landingViewed(variant as 'A' | 'C', {
      utm_source: searchParams.get('utm_source') || '',
      utm_campaign: searchParams.get('utm_campaign') || ''
    })
  }, [])

  const heroHooks = {
    A: "Stop Spending 10+ Hours a Week Creating Content No One Sees",
    C: "What If You Could Clone Yourself... But Just for Content?"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile layout */}
      <section className="px-4 pt-8 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {heroHooks[variant as 'A' | 'C']}
        </h1>
        
        <button
          onClick={() => {
            QuizEvents.ctaClicked(variant as 'A' | 'C', 'primary')
            window.location.href = '/quiz/content-marketing-readiness/questions'
          }}
          className={`w-full ${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-semibold py-4 px-6 rounded-lg`}
        >
          Start Your Free Assessment →
        </button>
      </section>
    </div>
  )
}
```

---

**2. Quiz Data** (`data/quiz-content-marketing.json`):

```json
{
  "meta": {
    "campaign": "content-marketing-readiness",
    "total_questions": 15,
    "time_estimate": "3 minutes"
  },
  "questions": [
    {
      "id": "q1",
      "section": "production",
      "text": "How often do you publish NEW content (not reposts)?",
      "type": "single_choice",
      "options": [
        {"text": "Daily (10 pts) → Pro tier signal", "points": 10},
        {"text": "3-5x/week (8 pts)", "points": 8},
        {"text": "1-2x/week (5 pts)", "points": 5},
        {"text": "A few times a month (3 pts)", "points": 3},
        {"text": "When guilt overpowers procrastination (0 pts)", "points": 0}
      ]
    }
    // ... 14 more questions
  ]
}
```

---

**3. Scoring Logic** (`lib/quiz/scoring.ts`):

```typescript
export interface QuizScores {
  production: number
  distribution: number
  analytics: number
  total: number
  tier: 'Free' | 'Starter' | 'Pro'
}

export function calculateScores(answers: Record<string, number>): QuizScores {
  // Section scores (Q1-Q5, Q6-Q10, Q11-Q15)
  const production = Object.entries(answers)
    .filter(([id]) => ['q1', 'q2', 'q3', 'q4', 'q5'].includes(id))
    .reduce((sum, [, points]) => sum + points, 0)
  
  const distribution = Object.entries(answers)
    .filter(([id]) => ['q6', 'q7', 'q8', 'q9', 'q10'].includes(id))
    .reduce((sum, [, points]) => sum + points, 0)
  
  const analytics = Object.entries(answers)
    .filter(([id]) => ['q11', 'q12', 'q13', 'q14', 'q15'].includes(id))
    .reduce((sum, [, points]) => sum + points, 0)
  
  // Weighted total (35% + 35% + 30%)
  const total = Math.round(
    (production / 50 * 35) +
    (distribution / 50 * 35) +
    (analytics / 50 * 30)
  )
  
  // Tier assignment
  const tier = total >= 70 ? 'Pro' : total >= 40 ? 'Starter' : 'Free'
  
  return {
    production,
    distribution,
    analytics,
    total,
    tier
  }
}
```

---

**4. API Endpoint** (`app/api/quiz/submit/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateScores } from '@/lib/quiz/scoring'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Auth (optional for quiz, required for saving to user profile)
  const { data: { user } } = await supabase.auth.getUser()
  
  const body = await request.json()
  const { answers, email, fullName, variant, questionOrder, ctaVariant, utmParams } = body
  
  // Calculate scores
  const scores = calculateScores(answers)
  
  // Save to database
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      user_id: user?.id,
      campaign: 'content-marketing-readiness',
      variant,
      question_order: questionOrder,
      cta_variant: ctaVariant,
      email,
      full_name: fullName,
      score_total: scores.total,
      score_production: scores.production,
      score_distribution: scores.distribution,
      score_analytics: scores.analytics,
      tier: scores.tier,
      utm_source: utmParams?.utm_source,
      utm_campaign: utmParams?.utm_campaign
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Trigger email automation (via webhook to your ESP)
  // await triggerEmailAutomation(data.id, scores.tier)
  
  return NextResponse.json({ 
    success: true, 
    responseId: data.id,
    scores 
  })
}
```

---

## 9. Expected Performance (30 Days)

### Traffic Assumptions
- **Source**: Paid ads (LinkedIn, Twitter) + organic (newsletter, content)
- **Budget**: $1,000 ad spend
- **CPC**: $1.00 (LinkedIn), $0.50 (Twitter)
- **Traffic**: 1,500 visitors (1,000 paid + 500 organic)

### Conversion Funnel

| Stage | Count | Rate | Notes |
|-------|-------|------|-------|
| Landing page views | 1,500 | 100% | Baseline |
| Quiz starts | 360 | 24% | Industry benchmark 20-30% |
| Quiz completions | 270 | 75% | Of those who start (target 70%+) |
| Email opt-ins | 260 | 96% | Of completions |
| **Tier breakdown**: | | | |
| → Free (0-39) | 91 | 35% | |
| → Starter (40-69) | 130 | 50% | |
| → Pro (70-100) | 39 | 15% | High-intent leads |
| **Trial starts**: | | | |
| → Starter trials | 13 | 10% | Of Starter tier |
| → Pro trials | 8 | 20% | Of Pro tier |
| **Total trials** | 21 | 1.4% | Overall conversion |

### Revenue Projection

| Metric | Starter | Pro | Total |
|--------|---------|-----|-------|
| Trial starts | 13 | 8 | 21 |
| Trial → Paid (25%) | 3 | 2 | 5 |
| MRR per user | $29 | $99 | — |
| **First month revenue** | $87 | $198 | **$285** |
| **30-day MRR** (after trials) | $87 | $198 | **$285** |
| **90-day MRR** (15% monthly growth) | $115 | $262 | **$377** |

### ROI Calculation

- **Investment**: $1,000 (ad spend)
- **First month MRR**: $285
- **Payback period**: 3.5 months
- **12-month LTV** (assuming 50% annual churn): $1,710
- **ROI**: 71% (at 12 months)

### Key Learnings to Track

1. **Which tier converts best?**
   - Hypothesis: Pro tier (20% trial rate) > Starter (10%)
   - Why: Higher intent, clearer pain point

2. **Which variant wins?**
   - A/B test: Variant A (pain) vs C (curiosity)
   - Hypothesis: Curiosity wins for early adopters

3. **Where do people drop off?**
   - Expected: Q3-Q5 (mid-quiz fatigue)
   - Fix: Add progress milestones, gamification

4. **Email sequence effectiveness?**
   - Measure: Open rate, click rate, trial starts per email
   - Expected winner: Email 2 (value + invitation)

---

## 10. Next Steps

### Week 1: Build & Test
- [ ] Create landing page (variants A + C)
- [ ] Build quiz flow (15 questions)
- [ ] Set up Supabase schema
- [ ] Implement scoring logic
- [ ] Build results page (3 tier templates)
- [ ] Set up PostHog tracking
- [ ] Internal testing (5 team members)

### Week 2: Launch & Monitor
- [ ] Deploy to production
- [ ] Launch A/B test (A vs C)
- [ ] Start ad campaigns ($50/day budget)
- [ ] Monitor funnel metrics daily
- [ ] Fix drop-off points

### Week 3-4: Optimize
- [ ] Analyze A/B test results (declare winner at 1,000 visitors)
- [ ] Implement winning variant
- [ ] Launch question order test
- [ ] Optimize email sequences based on engagement
- [ ] Scale ad spend if ROI positive

### Week 5-8: Scale
- [ ] Scale winning variant
- [ ] Test new traffic sources (Reddit, indie newsletters)
- [ ] Add social proof (testimonials, completion count)
- [ ] Iterate email copy based on reply data
- [ ] Build retargeting campaigns for non-completers

---

**End of Content Marketing Readiness Score Funnel Package**

Ready to hand to engineering for implementation.
