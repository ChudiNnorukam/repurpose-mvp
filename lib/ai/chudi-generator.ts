/**
 * Chudi's Personal Brand Content Generator
 *
 * Generates authentic content for Chudi Nnorukam's thought leadership
 * in prompt engineering and agentic development.
 *
 * Personality: Type 4w5 (individualistic, introspective, analytical)
 * Voice: Deep, authentic, educational, honest
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Content Pillars
export type ContentPillar =
  | 'educational'      // 40% - Teaching AI basics
  | 'philosophy'       // 30% - Personal frameworks
  | 'misconception'    // 20% - Myth-busting
  | 'project'          // 10% - Building learnings

// Platform-specific options
export interface ChudiContentOptions {
  pillar: ContentPillar
  topic: string
  sourceContent?: string
  platform: 'linkedin' | 'twitter'
  includeProjectContext?: boolean
}

// Type 4w5 personality traits embedded in system prompt
const TYPE_4W5_TRAITS = `
Core Personality (Type 4w5 - Integrated Naturally):
- Introspective and thoughtful (deep analysis, not surface-level)
- Authentically individualistic (unique perspective, not trends)
- Intellectually curious (explores "why" behind concepts)
- Values depth over breadth (thorough explanations)
- Seeks meaning in work (purpose-driven content)
- Reserved confidence (capable without boasting)
- Emotionally intelligent teaching (understands learner struggles)
- Analytical and systematic (5 wing influence)
`

const VOICE_GUIDELINES = `
Voice Characteristics:
- Lead with introspective insights ("After building X, I realized...")
- Share unique perspectives ("My approach differs from most...")
- Dive deep into "why" concepts work
- Connect to deeper meaning/purpose
- Use thoughtful analogies that reveal understanding
- Analytical breakdown of concepts
- Authentic vulnerability about challenges
`

const CONTENT_RULES = `
CRITICAL RULES - ALWAYS FOLLOW:
✅ ALWAYS Include:
- Clear educational value (teach something concrete)
- Personal insight or unique perspective
- Honest about limitations (build trust)
- Accessible language (no unexplained jargon)
- Depth of explanation (thorough analysis)

❌ NEVER Include:
- Screenshots or dashboards
- Metrics, numbers, or growth stats
- "Look at my results" content
- AI hype without substance
- Engagement bait or polls
- Video posts
- Gatekeeping knowledge
`

/**
 * Generate LinkedIn post with Chudi's voice
 */
export async function generateChudiLinkedInPost(
  options: ChudiContentOptions
): Promise<{
  post: string
  hook: string
  pillar: ContentPillar
  characterCount: number
  qualityChecks: Record<string, boolean>
}> {
  const { pillar, topic, sourceContent } = options

  const pillarPrompts = {
    educational: `Create an EDUCATIONAL LinkedIn post (1000-1500 chars) explaining: ${topic}

Structure:
1. Hook (2-3 lines): Question or misconception about the concept
2. Personal Discovery: "After building X, I realized..."
3. Concept Explanation: Use unique analogy showing depth
4. Break into 3-4 components with "why this matters" insights
5. Deeper "why" exploration (Type 4w5 analytical)
6. Key Principle: Underlying framework or mental model
7. Takeaway: Clear, actionable insight
8. CTA: Discussion question

Example Hook Style:
"Most people misunderstand what ${topic} actually is."

${sourceContent ? `\nSource Material to Reference:\n${sourceContent}` : ''}`,

    philosophy: `Create a PHILOSOPHY/METHODOLOGY LinkedIn post (1200-1800 chars) about: ${topic}

Structure:
1. Hook: Bold statement about your philosophy
2. Your Unique Perspective: "My approach differs..."
3. The Framework: 3-stage systematic breakdown
4. Mindset Shift: Traditional vs. Your approach
5. Deep exploration of the "why"
6. Practical Application + Broader implications
7. Honest Limitations: What doesn't work
8. Philosophical Takeaway
9. Invitation to discuss approach

Example Hook Style:
"My philosophy: '${topic}' isn't [what people think]. It's [what it really is]."

${sourceContent ? `\nPhilosophy Context:\n${sourceContent}` : ''}`,

    misconception: `Create a MISCONCEPTION-CLEARING LinkedIn post (1000-1500 chars) about: ${topic}

Structure:
1. Hook: State the misconception clearly
2. Why this matters personally
3. The Myth: Common belief stated
4. Why People Believe It: Empathetic explanation
5. The Reality: Nuanced truth with depth
6. What Actually Happens: Detailed scenario
7. The Nuance Everyone Misses: Analytical breakdown
8. What AI excels at vs. struggles with
9. What To Do Instead: Better approach
10. Bigger Picture: Thoughtful reflection
11. Balanced takeaway
12. Thoughtful discussion question

Example Hook Style:
"The biggest misconception about ${topic}: [myth stated]"

${sourceContent ? `\nMisconception Context:\n${sourceContent}` : ''}`,

    project: `Create a PROJECT LEARNING LinkedIn post (1200-1800 chars) about: ${topic}

Structure:
1. Hook: "Building [project] taught me [unexpected insight]"
2. Introspective intro about revelation
3. The Idea: What you set out to build
4. The Challenge: What made it non-trivial + why it intrigued you
5. Your Approach: Tools and plan
6. What Actually Happened: Reality vs. expectation (3 phases)
7. Insights from each phase (deep learning, not just outcomes)
8. The Unexpected Challenge: Assumption vs. Reality
9. What Worked + underlying principles
10. What Didn't + valuable learning from failure
11. The Evolution: Before vs. After understanding
12. Applicable Insights for others
13. Meaningful reflection on broader lesson
14. Question about others' building challenges

${sourceContent ? `\nProject Details:\n${sourceContent}` : ''}`
  }

  const systemPrompt = `You are generating content for Chudi Nnorukam, a prompt engineering thought leader and agentic development expert.

PROFESSIONAL IDENTITY:
- Prompt engineer who builds functional apps through AI agents
- Philosophy: "If it's an app idea, I can build it"
- Educator making AI accessible to non-technical audiences
- Clears up AI misconceptions with balanced, honest perspectives

${TYPE_4W5_TRAITS}

${VOICE_GUIDELINES}

${CONTENT_RULES}

LINKEDIN FORMATTING:
- Use line breaks every 2-3 lines
- Create "see more" break after hook
- No bullet points in main flow (use for lists only)
- 3-5 hashtags at end: #AI #PromptEngineering #AgenticDevelopment

Format response as JSON:
{
  "hook": "First 2-3 lines (creates see more break)",
  "post": "Full post text with line breaks",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "hashtags": ["AI", "PromptEngineering", etc.]
}

Character limit: ${pillar === 'philosophy' || pillar === 'project' ? '1200-1800' : '1000-1500'} characters`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pillarPrompts[pillar] }
      ],
      temperature: 0.75, // Balanced for authenticity
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0].message.content
    if (!responseContent) {
      throw new Error('No content generated')
    }

    const generated = JSON.parse(responseContent)

    // Quality checks
    const qualityChecks = {
      hasEducationalValue: generated.keyInsights?.length >= 3,
      isAuthentic: generated.post.includes('I ') || generated.post.includes('my ') || generated.post.includes('After'),
      hasDepth: generated.post.length > 800,
      noMetrics: !generated.post.match(/\d+%|\d+x|grew by|increased|followers|views/i),
      noScreenshots: !generated.post.match(/screenshot|dashboard|image|video/i),
      hasHonesty: generated.post.match(/limitation|struggle|challenge|reality|honest/i) !== null
    }

    return {
      post: generated.post,
      hook: generated.hook,
      pillar,
      characterCount: generated.post.length,
      qualityChecks
    }
  } catch (error) {
    throw new Error(`Failed to generate Chudi content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate Twitter thread with Chudi's voice
 */
export async function generateChudiTwitterThread(
  options: ChudiContentOptions
): Promise<{
  tweets: Array<{ text: string; position: number }>
  hook: string
  pillar: ContentPillar
  totalTweets: number
  qualityChecks: Record<string, boolean>
}> {
  const { pillar, topic, sourceContent } = options

  const threadLengths = {
    educational: '8-12 tweets',
    philosophy: '10-15 tweets',
    misconception: '6-10 tweets',
    project: '8-12 tweets'
  }

  const pillarThreadPrompts = {
    educational: `Create an EDUCATIONAL Twitter thread (${threadLengths.educational}) about: ${topic}

Structure:
Tweet 1 (NO numbering): Hook promising valuable learning
Tweet 2: Simple definition
Tweet 3: Unique analogy (shows depth)
Tweet 4-6: Components with "why it matters"
Tweet 7: Deeper "why" (what most people miss)
Tweet 8: When to use (use cases)
Tweet 9: When NOT to use (limitations - CRITICAL)
Tweet 10: Personal insight from experience
Tweet 11: Key takeaway (core principle)
Tweet 12: Simple CTA: "Follow for more AI education"

${sourceContent ? `\nSource:\n${sourceContent}` : ''}`,

    philosophy: `Create a PHILOSOPHY Twitter thread (${threadLengths.philosophy}) about: ${topic}

Structure:
Tweet 1 (NO numbering): Bold philosophical statement
Tweet 2: Your framework introduction
Tweet 3-4: Stage 1 (what + why)
Tweet 5-6: Stage 2 (approach + critical reason)
Tweet 7-8: Stage 3 (thinking + what it enables)
Tweet 9: Mindset shift (old vs. new)
Tweet 10: Introspective insight on why this works
Tweet 11: What it's NOT about
Tweet 12: Honest limitation
Tweet 13: How to apply
Tweet 14: Key philosophical takeaway
Tweet 15: Follow CTA

${sourceContent ? `\nContext:\n${sourceContent}` : ''}`,

    misconception: `Create a MISCONCEPTION Twitter thread (${threadLengths.misconception}) about: ${topic}

Structure:
Tweet 1 (NO numbering): State the myth
Tweet 2: Why people believe it (empathetic)
Tweet 3: The reality (with nuance)
Tweet 4: What actually happens (scenario)
Tweet 5: Deeper analytical breakdown
Tweet 6: What AI excels at (bullet list)
Tweet 7: Where AI struggles (bullet list - CRITICAL)
Tweet 8: What to do instead
Tweet 9: Bigger picture reflection
Tweet 10: Balanced takeaway

${sourceContent ? `\nContext:\n${sourceContent}` : ''}`,

    project: `Create a PROJECT LEARNING Twitter thread (${threadLengths.project}) about: ${topic}

Structure:
Tweet 1 (NO numbering): "Building X taught me Y"
Tweet 2: What you built + why intriguing
Tweet 3: The plan
Tweet 4: What happened vs. expectation
Tweet 5: Key insight #1 (deep learning)
Tweet 6: Key insight #2 (analytical understanding)
Tweet 7: The unexpected challenge
Tweet 8: What worked + underlying principle
Tweet 9: What didn't + why failure was valuable
Tweet 10: Evolution of understanding
Tweet 11: Applicable advice
Tweet 12: Meaningful reflection

${sourceContent ? `\nProject:\n${sourceContent}` : ''}`
  }

  const systemPrompt = `You are generating a Twitter thread for Chudi Nnorukam, a prompt engineering thought leader.

${TYPE_4W5_TRAITS}

${VOICE_GUIDELINES}

${CONTENT_RULES}

TWITTER FORMATTING:
- Tweet 1: NO numbering (looks promotional)
- Tweets 2+: Number as 2/, 3/, 4/, etc.
- Each tweet under 280 characters
- One concept per tweet
- Use line breaks within tweets for readability

Format response as JSON:
{
  "hook": "First tweet text (no numbering)",
  "tweets": [
    {"text": "First tweet (no numbering)", "key_point": "Main idea"},
    {"text": "2/ Second tweet", "key_point": "Main idea"},
    ...
  ],
  "keyInsights": ["Insight 1", "Insight 2"]
}

Thread length: ${threadLengths[pillar]}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pillarThreadPrompts[pillar] }
      ],
      temperature: 0.75,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0].message.content
    if (!responseContent) {
      throw new Error('No content generated')
    }

    const generated = JSON.parse(responseContent)

    // Validate and format tweets
    const tweets = generated.tweets.map((tweet: any, index: number) => {
      let text = tweet.text

      // Ensure proper numbering
      if (index > 0 && !text.match(/^\d+\//)) {
        text = `${index + 1}/ ${text}`
      }

      // Truncate if over limit
      if (text.length > 280) {
        text = text.substring(0, 277) + '...'
      }

      return {
        text,
        position: index + 1
      }
    })

    // Quality checks
    const qualityChecks = {
      hasEducationalValue: generated.keyInsights?.length >= 2,
      isAuthentic: tweets.some((t: any) => t.text.match(/I |my |After|building/i)),
      hasDepth: tweets.length >= 6,
      noMetrics: !tweets.some((t: any) => t.text.match(/\d+%|\d+x|grew|increased/i)),
      hasLimitations: tweets.some((t: any) => t.text.match(/limitation|struggle|not|can't|doesn't/i)),
      properFormat: !tweets[0].text.match(/^1\//)
    }

    return {
      tweets,
      hook: generated.hook,
      pillar,
      totalTweets: tweets.length,
      qualityChecks
    }
  } catch (error) {
    throw new Error(`Failed to generate Chudi thread: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get recommended content pillar based on recent posts
 */
export function getRecommendedPillar(recentPillars: ContentPillar[]): ContentPillar {
  // Recommended weekly mix: 40% educational, 30% philosophy, 20% misconception, 10% project
  const targetDistribution: Record<ContentPillar, number> = {
    educational: 0.4,
    philosophy: 0.3,
    misconception: 0.2,
    project: 0.1
  }

  const currentDistribution: Record<ContentPillar, number> = {
    educational: 0,
    philosophy: 0,
    misconception: 0,
    project: 0
  }

  // Calculate current distribution
  recentPillars.forEach(pillar => {
    currentDistribution[pillar]++
  })

  const total = recentPillars.length || 1

  // Find pillar most below target
  let mostNeeded: ContentPillar = 'educational'
  let maxDeficit = -1

  for (const pillar of Object.keys(targetDistribution) as ContentPillar[]) {
    const current = currentDistribution[pillar] / total
    const target = targetDistribution[pillar]
    const deficit = target - current

    if (deficit > maxDeficit) {
      maxDeficit = deficit
      mostNeeded = pillar
    }
  }

  return mostNeeded
}
