import { createClient } from '@/lib/supabase-client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateTwitterThread, generateSingleTweet } from '@/lib/ai/twitter-generator'
import { generateLinkedInPost, generateLinkedInCarousel } from '@/lib/ai/linkedin-generator'

/**
 * Generate repurposed content (Twitter thread, LinkedIn post, etc.)
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      sourceId,
      platform,
      contentType,
      options = {},
    } = await request.json()

    if (!['twitter', 'linkedin'].includes(platform)) {
      return Response.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Get source content
    const { data: source } = await supabaseAdmin
      .from('content_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (!source) {
      return Response.json({ error: 'Source not found' }, { status: 404 })
    }

    let generatedContent: any

    // Generate content based on type
    if (platform === 'twitter') {
      if (contentType === 'twitter_thread') {
        generatedContent = await generateTwitterThread({
          sourceContent: source.original_content,
          ...options,
        })
      } else if (contentType === 'twitter_single') {
        const tweet = await generateSingleTweet(source.original_content)
        generatedContent = { text: tweet }
      }
    } else if (platform === 'linkedin') {
      if (contentType === 'linkedin_post') {
        generatedContent = await generateLinkedInPost({
          sourceContent: source.original_content,
          ...options,
        })
      } else if (contentType === 'linkedin_carousel') {
        generatedContent = await generateLinkedInCarousel({
          sourceContent: source.original_content,
          ...options,
        })
      } else if (contentType === 'linkedin_article') {
        // For article, use post generation with long format
        generatedContent = await generateLinkedInPost({
          sourceContent: source.original_content,
          postLength: 'long',
          ...options,
        })
      }
    }

    // Save to database
    const { data: repurposedContent, error } = await supabaseAdmin
      .from('repurposed_content')
      .insert({
        user_id: user.id,
        source_id: sourceId,
        platform,
        content_type: contentType,
        content_data: generatedContent,
        status: 'draft',
        engagement_score: generatedContent.estimatedEngagement || 0.5,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save content: ${error.message}`)
    }

    return Response.json({
      success: true,
      contentId: repurposedContent.id,
      content: generatedContent,
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
