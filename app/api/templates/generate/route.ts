import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logger } from "@/lib/logger"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { category, platform, userContext } = await request.json()

    // No auth check needed - just generating text
    // Prompt templates for different categories
    const prompts = {
      educational: `Generate a LinkedIn promotional post for a content repurposing tool called "Repurpose".

The post should:
- Address a specific pain point content creators face
- Provide educational value
- Subtly introduce Repurpose as the solution
- Be 150-250 words
- Include a clear CTA to join the beta
- Sound authentic and helpful, not salesy

Context: Repurpose is an AI-powered platform that adapts your content across Twitter and LinkedIn while maintaining your authentic voice.`,

      product: `Generate a LinkedIn product update post for Repurpose.

The post should:
- Announce a new feature or capability
- Explain the benefit to users
- Use bullet points for clarity
- Include excitement without being overhyped
- End with a beta signup CTA
- Be 100-200 words

Context: Repurpose helps content creators repurpose content across platforms with AI-powered adaptation.`,

      engagement: `Generate an engaging LinkedIn post for Repurpose that encourages community interaction.

The post should:
- Ask a thought-provoking question OR share a relatable experience
- Relate to content creation or multi-platform distribution
- Invite comments and discussion
- Mention Repurpose naturally
- Be 75-150 words

Context: Repurpose is a content adaptation tool in beta.`,

      social_proof: `Generate a social proof LinkedIn post for Repurpose.

The post should:
- Feature a testimonial or success story (you can make it realistic but generic)
- Include specific results or benefits
- Feel authentic, not manufactured
- End with beta signup CTA
- Be 100-150 words

Context: Repurpose is an AI content adaptation platform for Twitter and LinkedIn.`,

      behind_the_scenes: `Generate a "building in public" LinkedIn post for Repurpose.

The post should:
- Share a recent development milestone or feature
- Be transparent and authentic
- Show progress (e.g., "This week we shipped...")
- Invite beta users
- Be 100-175 words

Context: Repurpose is a new AI-powered content repurposing platform in beta.`,
    }

    const prompt = prompts[category as keyof typeof prompts] || prompts.educational

    // Add user context if provided
    const fullPrompt = userContext
      ? `${prompt}\n\nAdditional context: ${userContext}`
      : prompt

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled content marketer who creates authentic, engaging LinkedIn posts. Your writing is professional but conversational, helpful but not pushy.',
        },
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    const generatedText = response.choices[0]?.message?.content

    if (!generatedText) {
      throw new Error('No content generated')
    }

    return NextResponse.json({
      content: generatedText,
      category,
      platform: platform || 'linkedin',
    })
  } catch (error) {
    logger.error('Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
