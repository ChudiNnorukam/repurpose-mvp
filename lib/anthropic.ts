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
    hook: 'One punchy line that stops the scroll. Use curiosity, conflict, or pain point.',
    body: 'Thread format if needed. First tweet = hook. Unpack insight bit by bit. Use "But then..." shifts.',
    cta: '"Reply with your version" / "RT if this stung" / "🧵👇"',
    intention: 'High friction share (RT) - make it minimal, scannable, emotionally resonant.',
    style: 'Short, punchy. Challenge common wisdom. Use contrarian takes.',
  },
  linkedin: {
    maxLength: 3000,
    hook: '"I did X wrong for 3 years. Here\'s what saved me." Use curiosity + pain recognition.',
    body: 'Short essay format. Mix narrative + lessons. Use → bullet points. Short paragraphs (1-3 lines). White space. Subheads. Ask direct questions mid-body.',
    cta: '"Comment your story" / "Tag someone who needs this" / "Save for later" / "Ever tried that?" / "↓"',
    intention: 'Social currency - help audience look smart. Use controversy or contrarian. "I feel seen" = share fuel.',
    style: 'NO corporate speak. NO polished conclusions. Real insights with spacing. Use → bullets.',
  },
  instagram: {
    maxLength: 400,
    hook: '"I quit chasing metrics. Here\'s what came next." First 1-2 lines must grab.',
    body: 'Micro-stories. Use line breaks. Emojis (sparingly). Personal voice.',
    cta: '"Save this" / "Tag someone who needs this" / "DM me X"',
    intention: 'Visual + emotional. Shareability = saving, tagging. Make it quotable.',
    style: 'Casual, personal, story-driven. Make bits quotable.',
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

  const prompt = `You are adapting content using Chudi's humanized writing protocol + viral content framework. This is NOT polished content - it's raw, reflective, lived-in, AND designed to be shared.

ORIGINAL CONTENT:
${content}

PLATFORM: ${platform} (Max: ${guidelines.maxLength} chars)
BASE TONE: ${tone} (${toneDescription})

---
## VIRAL FRAMEWORK - 5 AXES (Apply all layers):

### 1. HOOK / TITLE
${guidelines.hook}
- Stop the scroll in 1-3 lines
- Use curiosity, conflict, pain recognition
- Challenge common wisdom (contrarian)
- Emotion: surprise, frustration, "I feel seen"

### 2. BODY / CORE CONTENT
${guidelines.body}
- Pay off the hook (no bait & switch)
- Use mini-stories, examples, vulnerability
- White space, short paragraphs, bullets
- Re-hooks mid-body: "You'd think X... but here's Y"
- Include actionable insights
- Make it quotable

### 3. CTA (Call to Action)
${guidelines.cta}
- Low friction, tied to narrative
- Small asks work best
- Use micro-CTAs mid-body

### 4. INTENTION (Virality Design)
${guidelines.intention}
- Emotional triggers (high-arousal)
- Social currency: "share to look smart"
- Practical value + "I feel seen"
- Make bits quotable/snackable

### 5. STYLE
${guidelines.style}

---
## HUMANIZATION PROTOCOL (De-polish layer):

1. **Core Tone**: Introspective. Raw. Reflective.
   - Sentences may break mid-thought
   - Spacing mimics spoken rhythm
   - NO polished "performance"

2. **Embedding Drift**:
   - Self-doubt lines ("might delete this")
   - Meta notes, offhand remarks
   - Sensory detail if natural

3. **Style Variation**:
   - Register shifts (casual → formal → poetic)
   - Vary rhythm and syntax
   - Interruptions, false starts OK

4. **De-Polish**:
   - 2AM journaling, not engineered
   - Raw honesty over structure
   - Lived-in, not AI-generated

---
## OUTPUT RULES:
- Stay within ${guidelines.maxLength} characters
- Maintain core message
- Sound human + shareable
- No preamble - just the adapted content
- **FORBIDDEN: Never use em dashes (—). Use periods, commas, or line breaks.**

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
