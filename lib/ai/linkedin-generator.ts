import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface LinkedInPostOptions {
  sourceContent: string
  postLength?: 'short' | 'medium' | 'long' // 500, 1500, 3000 chars
  postStyle?: 'thought-leadership' | 'case-study' | 'tips' | 'announcement' | 'personal-story'
  tone?: 'professional' | 'inspirational' | 'analytical'
  includeHashtags?: boolean
  targetAudience?: string
  includeEmoji?: boolean
}

export interface LinkedInPost {
  headline?: string
  post: string
  hashtags: string[]
  mentions: string[]
  characterCount: number
  hasHook: boolean
  callToAction: string
  estimatedEngagement: number
}

/**
 * Generate a LinkedIn post from source content
 */
export async function generateLinkedInPost(
  options: LinkedInPostOptions
): Promise<LinkedInPost> {
  const {
    sourceContent,
    postLength = 'medium',
    postStyle = 'thought-leadership',
    tone = 'professional',
    includeHashtags = true,
    targetAudience = 'professionals',
    includeEmoji = true,
  } = options

  const lengthSpec = {
    short: { chars: 500, paragraphs: '2-3', detail: 'concise, punchy' },
    medium: { chars: 1500, paragraphs: '4-6', detail: 'balanced, insightful' },
    long: { chars: 3000, paragraphs: '8-12', detail: 'comprehensive, detailed' },
  }[postLength]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert LinkedIn content strategist specializing in ${postStyle} posts.

Create a ${lengthSpec.detail} post (target ${lengthSpec.chars} characters, ${lengthSpec.paragraphs} paragraphs).

CRITICAL LINKEDIN RULES:
- Start with a HOOK - 1-2 lines that grab attention
- Use line breaks frequently (2-3 lines max per paragraph)
- First 2-3 lines visible before "see more" - make them count
- Professional but personable tone
- Use storytelling when appropriate
- Include actionable insights
- End with engagement question or CTA
${includeEmoji ? '- Strategic emoji use (sparingly, professionally)' : '- No emojis'}

Post Style: ${postStyle}
${postStyle === 'thought-leadership' ? '- Share unique perspective\n- Back with experience/data\n- Challenge conventional thinking' : ''}
${postStyle === 'case-study' ? '- Problem → Solution → Results format\n- Include specific metrics\n- Explain lessons learned' : ''}
${postStyle === 'tips' ? '- Actionable, practical advice\n- Numbered or bulleted format\n- Explain why each tip works' : ''}
${postStyle === 'announcement' ? '- Lead with the news\n- Explain significance\n- Include next steps/CTA' : ''}
${postStyle === 'personal-story' ? '- Vulnerable and authentic\n- Show growth/learning\n- Connect to broader lesson' : ''}

Tone: ${tone}
Target Audience: ${targetAudience}

Respond with JSON:
{
  "headline": "Optional compelling headline",
  "hook": "Attention-grabbing first 2-3 lines",
  "post": "Full post with line breaks (use \\n\\n for paragraphs)",
  "key_takeaways": ["Main point 1", "Main point 2"],
  "hashtags": ["Professional", "Industry", "Relevant"],
  "cta": "Engagement question or call-to-action",
  "post_summary": "One-line value proposition"
}`,
      },
      {
        role: 'user',
        content: `Source content:\n\n${sourceContent}\n\nCreate a ${postStyle} post for ${targetAudience}.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const generated = JSON.parse(response.choices[0].message.content || '{}')

  let finalPost = generated.post || ''

  // Ensure proper formatting
  finalPost = finalPost.replace(/\n{3,}/g, '\n\n').trim()

  // Add hook if not already at start
  if (!finalPost.startsWith(generated.hook)) {
    finalPost = `${generated.hook}\n\n${finalPost}`
  }

  // Enforce character limit
  if (finalPost.length > 3000) {
    finalPost = finalPost.substring(0, 2997) + '...'
  }

  return {
    headline: generated.headline,
    post: finalPost,
    hashtags: includeHashtags ? generated.hashtags || [] : [],
    mentions: [],
    characterCount: finalPost.length,
    hasHook: true,
    callToAction: generated.cta || '',
    estimatedEngagement: 0.7,
  }
}

export interface LinkedInCarouselOptions {
  sourceContent: string
  slideCount?: number // 5-15 slides
  carouselType?: 'educational' | 'tips' | 'process' | 'stats' | 'story'
  includeIntroOutro?: boolean
}

export interface CarouselSlide {
  slideNumber: number
  title: string
  content: string[]
  visualSuggestion: string
  designNotes: string
}

/**
 * Generate LinkedIn carousel content
 */
export async function generateLinkedInCarousel(
  options: LinkedInCarouselOptions
): Promise<{
  slides: CarouselSlide[]
  coverSlide: CarouselSlide
  closingSlide: CarouselSlide
  caption: string
}> {
  const {
    sourceContent,
    slideCount = 10,
    carouselType = 'educational',
    includeIntroOutro = true,
  } = options

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Create a ${carouselType} LinkedIn carousel with ${slideCount} content slides.

LINKEDIN CAROUSEL BEST PRACTICES:
- Each slide: 1 clear point
- Minimal text per slide (3-5 bullet points max)
- Strong visual hierarchy
- Consistent design flow
- Clear progression
- First slide is cover (title + hook)
- Last slide is CTA

Carousel Type: ${carouselType}
Format: 1080x1080px (square)

Respond with JSON:
{
  "cover_slide": {
    "title": "Main title",
    "subtitle": "Hook or value proposition",
    "design_notes": "Visual suggestions"
  },
  "content_slides": [
    {
      "slide_number": 2,
      "title": "Slide title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "visual_suggestion": "Icon or image recommendation"
    }
  ],
  "closing_slide": {
    "title": "Thank you / CTA title",
    "cta": "Clear call to action",
    "contact_info": "How to connect"
  },
  "caption": "LinkedIn post caption"
}`,
      },
      {
        role: 'user',
        content: `Source content:\n\n${sourceContent}\n\nCreate ${slideCount} slides for a ${carouselType} carousel.`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const generated = JSON.parse(response.choices[0].message.content || '{}')

  const slides: CarouselSlide[] = (generated.content_slides || []).map(
    (slide: any, index: number) => ({
      slideNumber: index + 2,
      title: slide.title || '',
      content: slide.content || [],
      visualSuggestion: slide.visual_suggestion || '',
      designNotes: slide.design_notes || '',
    })
  )

  return {
    slides,
    coverSlide: {
      slideNumber: 1,
      title: generated.cover_slide?.title || '',
      content: [generated.cover_slide?.subtitle || ''],
      visualSuggestion: generated.cover_slide?.design_notes || '',
      designNotes: 'Cover slide - bold, attention-grabbing',
    },
    closingSlide: {
      slideNumber: slides.length + 2,
      title: generated.closing_slide?.title || '',
      content: [
        generated.closing_slide?.cta || '',
        generated.closing_slide?.contact_info || '',
      ],
      visualSuggestion: 'Professional photo or brand logo',
      designNotes: 'Call-to-action slide',
    },
    caption: generated.caption || '',
  }
}

/**
 * Generate LinkedIn article (long-form)
 */
export async function generateLinkedInArticle(
  sourceContent: string,
  articleLength: 'standard' | 'long' = 'standard'
): Promise<{
  title: string
  subtitle: string
  content: string
  sections: Array<{ heading: string; content: string }>
  seoKeywords: string[]
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Transform this content into a professional LinkedIn article.

ARTICLE STRUCTURE:
1. Compelling title (60-100 chars)
2. Subtitle with value proposition
3. Strong opening paragraph
4. Well-structured sections with H2/H3 headings
5. Data/examples throughout
6. Actionable takeaways
7. Conclusion with CTA

Style: Professional, insightful, authoritative
Length: ${articleLength === 'standard' ? '1000-1500' : '2000-3000'} words

Include:
- Personal insights
- Industry context
- Practical applications
- SEO-friendly keywords`,
      },
      {
        role: 'user',
        content: sourceContent,
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}
