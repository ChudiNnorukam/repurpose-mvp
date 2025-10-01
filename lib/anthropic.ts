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
    style: 'Short essay format. Punchy. Direct. Use bullet points (→). Ask questions. Break up thoughts with spacing. Real insights, not corporate speak.',
    format: 'Start with a hook. Use short paragraphs (1-3 lines). Add → bullet points. Ask direct questions. End with engagement prompt (Tag someone / Ever tried that? / ↓). NO polished conclusions.',
  },
  instagram: {
    maxLength: 400,
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

  const prompt = `You are adapting content using Chudi's humanized writing protocol. This is NOT polished content - it's raw, reflective, lived-in.

ORIGINAL CONTENT:
${content}

PLATFORM: ${platform}
- Max length: ${guidelines.maxLength} characters
- Platform style: ${guidelines.style}
- Format: ${guidelines.format}

BASE TONE: ${tone} (${toneDescription})

HUMANIZATION PROTOCOL (APPLY ALL):
1. **Core Tone**: Introspective. Raw. Reflective.
   - Sentences may break mid-thought
   - Some repetition is welcome
   - Use spacing to mimic spoken rhythm
   - No polished "performance" - only natural if it emerges

2. **Embedding Drift**: Add semantic noise
   - Self-doubt lines ("might delete this later" / "not sure this fits")
   - Irrelevant sensory detail (time stamps, random memories)
   - Meta notes, offhand remarks

3. **Style Variation**:
   - Register shifts (casual → formal → poetic)
   - Vary rhythm and syntax length
   - Include interruptions and false starts

4. **De-Polish**:
   - This is 2AM journaling, not engineered content
   - Raw honesty over perfect structure
   - Let it feel lived-in, not AI-generated

PLATFORM-SPECIFIC ADJUSTMENTS:
${platform === 'twitter' ? '- Keep it punchy but authentic. Break thoughts naturally.' : ''}
${platform === 'linkedin' ? `- Use short essay format like this example:

STRUCTURE:
• Hook (1-2 lines that grab attention)
• Spacing
• Problem or observation (short paragraphs)
• Bullet points with → arrows
• Direct questions ("Ever tried that?")
• Engagement prompt at end ("Tag someone" / "↓")

STYLE:
• NO corporate speak
• NO polished conclusions
• Real insights only
• Break up with spacing
• Ask direct questions
• Use → for bullet points` : ''}
${platform === 'instagram' ? '- Casual and real. Emojis only if natural. Story-driven.' : ''}

OUTPUT RULES:
- Stay within ${guidelines.maxLength} characters
- Maintain the core message
- Sound human, not AI
- No preamble or explanation - just the adapted content
- **FORBIDDEN: Never use em dashes (—). Use periods, commas, or line breaks instead.**

ADAPTED CONTENT:`

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

    // Remove em dashes (forbidden in Chudi's protocol)
    const cleanedText = adaptedText
      .replace(/—/g, ',')  // Replace em dash with comma
      .replace(/–/g, ',')  // Replace en dash with comma
      .trim()

    return cleanedText
  } catch (error) {
    console.error(`Error adapting content for ${platform}:`, error)
    throw error
  }
}
