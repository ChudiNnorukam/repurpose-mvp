import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TwitterThreadOptions {
  sourceContent: string
  threadLength?: 'short' | 'medium' | 'long' // 3-7, 8-15, 16-25 tweets
  threadType?: 'educational' | 'storytelling' | 'listicle' | 'tips' | 'analysis'
  tone?: 'professional' | 'casual' | 'inspirational'
  includeHashtags?: boolean
  targetAudience?: string
}

export interface TwitterThread {
  tweets: Array<{
    text: string
    position: number
    characterCount: number
  }>
  hook: string
  cta: string
  hashtags: string[]
  totalTweets: number
  threadType: string
  estimatedEngagement: number
}

/**
 * Generate a Twitter thread from source content
 */
export async function generateTwitterThread(
  options: TwitterThreadOptions
): Promise<TwitterThread> {
  const {
    sourceContent,
    threadLength = 'medium',
    threadType = 'educational',
    tone = 'professional',
    includeHashtags = true,
    targetAudience = 'professionals',
  } = options

  const lengthSpec = {
    short: { min: 3, max: 7, detail: 'concise, punchy' },
    medium: { min: 8, max: 15, detail: 'balanced, comprehensive' },
    long: { min: 16, max: 25, detail: 'detailed, in-depth' },
  }[threadLength]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert Twitter content creator specializing in high-engagement threads.

Create a ${threadType} thread with ${lengthSpec.min}-${lengthSpec.max} tweets that is ${lengthSpec.detail}.

CRITICAL TWITTER RULES:
- Each tweet MUST be under 280 characters
- First tweet is the HOOK - must stop scrolling
- Use line breaks for readability
- Number tweets (1/, 2/, etc.) except the first
- End with strong CTA
- Use simple, clear language
- Break complex ideas into tweet-sized chunks

Thread Type: ${threadType}
${threadType === 'educational' ? '- Teach one clear concept\n- Use examples\n- Break into logical steps' : ''}
${threadType === 'storytelling' ? '- Have clear beginning, middle, end\n- Use emotion\n- Include turning points' : ''}
${threadType === 'listicle' ? '- Each tweet = one item\n- Keep items parallel\n- Order by importance' : ''}
${threadType === 'tips' ? '- One actionable tip per tweet\n- Explain "why" and "how"\n- Include quick wins' : ''}
${threadType === 'analysis' ? '- Present data/insights\n- Break down complexity\n- Draw conclusions' : ''}

Tone: ${tone}
Target Audience: ${targetAudience}

Respond with JSON:
{
  "hook": "Compelling first tweet that makes people STOP scrolling",
  "tweets": [
    {"text": "First tweet (hook) - no numbering", "key_point": "Main idea"},
    {"text": "2/ Second tweet content", "key_point": "Main idea"}
  ],
  "cta": "Final tweet with clear call-to-action",
  "hashtags": ["relevant", "hashtags"],
  "thread_summary": "One-line summary"
}`,
      },
      {
        role: 'user',
        content: `Source content:\n\n${sourceContent}\n\nCreate a ${threadType} thread.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const generated = JSON.parse(response.choices[0].message.content || '{}')

  // Validate character counts
  const validatedTweets = generated.tweets.map((tweet: any, index: number) => {
    let text = tweet.text

    // Ensure numbering
    if (index > 0 && !text.match(/^\d+\//)) {
      text = `${index + 1}/ ${text}`
    }

    // Truncate if over limit
    if (text.length > 280) {
      text = text.substring(0, 277) + '...'
    }

    return {
      text,
      position: index + 1,
      characterCount: text.length,
    }
  })

  // Add CTA as final tweet
  let ctaText = generated.cta || 'What do you think?'
  if (!ctaText.match(/^\d+\//)) {
    ctaText = `${validatedTweets.length + 1}/ ${ctaText}`
  }

  if (ctaText.length > 280) {
    ctaText = ctaText.substring(0, 277) + '...'
  }

  validatedTweets.push({
    text: ctaText,
    position: validatedTweets.length + 1,
    characterCount: ctaText.length,
  })

  return {
    tweets: validatedTweets,
    hook: generated.hook || validatedTweets[0].text,
    cta: ctaText,
    hashtags: includeHashtags ? generated.hashtags || [] : [],
    totalTweets: validatedTweets.length,
    threadType,
    estimatedEngagement: 0.75,
  }
}

/**
 * Generate a single tweet
 */
export async function generateSingleTweet(
  content: string,
  style: 'quote' | 'stat' | 'question' | 'teaser' = 'quote'
): Promise<string> {
  const stylePrompts = {
    quote: 'Extract the most impactful quote and present it compellingly',
    stat: 'Find the most surprising statistic or data point',
    question: 'Create a thought-provoking question that makes people want to read more',
    teaser: 'Write a teaser that creates curiosity about the full content',
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Create a single tweet (under 280 characters) that ${stylePrompts[style]}.

Make it:
- Attention-grabbing
- Self-contained
- Encouraging engagement
- Clear and punchy`,
      },
      {
        role: 'user',
        content,
      },
    ],
    max_tokens: 100,
  })

  let tweet = response.choices[0].message.content || ''

  // Ensure under 280 chars
  if (tweet.length > 280) {
    tweet = tweet.substring(0, 277) + '...'
  }

  return tweet
}

/**
 * Optimize existing thread
 */
export async function optimizeThread(
  existingThread: string[]
): Promise<{ optimized: string[]; improvements: string[] }> {
  const threadText = existingThread
    .map((t, i) => `Tweet ${i + 1}: ${t}`)
    .join('\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Analyze this Twitter thread and suggest optimizations for:
1. Hook strength (first tweet)
2. Flow and logical progression
3. Character count optimization
4. Clarity and impact
5. CTA effectiveness

Return optimized tweets and explain changes.`,
      },
      {
        role: 'user',
        content: threadText,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    optimized: result.optimized_tweets || [],
    improvements: result.improvements_made || [],
  }
}
