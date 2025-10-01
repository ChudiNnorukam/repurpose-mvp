import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey,
})

type Platform = 'twitter' | 'linkedin' | 'instagram'
type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'

interface AdaptContentParams {
  content: string
  platform: Platform
  tone: Tone
}

const platformGuidelines = {
  twitter: {
    maxLength: 280,
    style: 'Concise and engaging. Use hashtags sparingly. Get to the point quickly.',
    format: 'Short, punchy sentences. Can include emojis if appropriate for the tone.',
  },
  linkedin: {
    maxLength: 3000,
    style: 'Professional and thoughtful. Focus on insights and value. Use professional language.',
    format: 'Well-structured with paragraphs. Can include relevant professional hashtags at the end.',
  },
  instagram: {
    maxLength: 2200,
    style: 'Casual and visually-focused. Engaging and personal. Story-driven.',
    format: 'Conversational with line breaks. Emojis encouraged. Hashtags at the end.',
  },
}

const toneGuidelines = {
  professional: 'Formal, business-appropriate, polished',
  casual: 'Relaxed, conversational, approachable',
  friendly: 'Warm, personable, inviting',
  authoritative: 'Confident, expert, definitive',
  enthusiastic: 'Energetic, excited, passionate',
}

export async function adaptContentForPlatform({
  content,
  platform,
  tone,
}: AdaptContentParams): Promise<string> {
  const guidelines = platformGuidelines[platform]
  const toneDescription = toneGuidelines[tone]

  const prompt = `You are a social media content expert. Adapt the following content for ${platform}.

ORIGINAL CONTENT:
${content}

PLATFORM GUIDELINES:
- Platform: ${platform}
- Max length: ${guidelines.maxLength} characters
- Style: ${guidelines.style}
- Format: ${guidelines.format}

TONE REQUIREMENTS:
- Desired tone: ${tone}
- Tone description: ${toneDescription}

INSTRUCTIONS:
1. Rewrite the content to fit ${platform}'s style and audience
2. Maintain the core message and key points
3. Ensure the tone is ${tone}
4. Stay within ${guidelines.maxLength} characters
5. Make it engaging and platform-appropriate
6. Do not add any preamble or explanation - just return the adapted content

ADAPTED CONTENT FOR ${platform.toUpperCase()}:`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })

    const adaptedText = completion.choices[0]?.message?.content
    if (!adaptedText) {
      throw new Error('No content in response')
    }

    return adaptedText.trim()
  } catch (error) {
    console.error(`Error adapting content for ${platform}:`, error)
    throw error
  }
}
