import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/posts
 *
 * Retrieves all posts for the authenticated user.
 * Returns posts sorted by creation date (newest first).
 *
 * @returns {Post[]} Array of user's posts with status, platform, content, etc.
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check - require user to be logged in
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized access attempt to /api/posts')
      return ErrorResponses.unauthorized()
    }

    // Fetch all posts for the authenticated user
    // RLS policies ensure users can only see their own posts
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      logger.error('Failed to fetch posts', fetchError, { userId: user.id })
      return NextResponse.json(
        {
          error: 'Failed to retrieve posts',
          details: fetchError.message,
        },
        { status: 500 }
      )
    }

    logger.info('Posts retrieved successfully', {
      userId: user.id,
      count: posts?.length || 0
    })

    return NextResponse.json({
      success: true,
      posts: posts || [],
      count: posts?.length || 0,
    })
  } catch (error: any) {
    logger.error('Error in GET /api/posts', error)
    return ErrorResponses.internalError(error.message)
  }
}

/**
 * POST /api/posts
 *
 * Creates multiple posts (drafts) for the authenticated user.
 * Used for bulk draft creation from the generate page.
 *
 * @body {posts: Post[]} Array of posts to create
 * @returns {Post[]} Array of created posts
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized access attempt to POST /api/posts')
      return ErrorResponses.unauthorized()
    }

    const { posts } = await request.json()

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: posts array required' },
        { status: 400 }
      )
    }

    // Add user_id to each post and ensure they're drafts
    const postsToCreate = posts.map(post => ({
      ...post,
      user_id: user.id,
      status: 'draft',
      is_draft: true,
      created_at: new Date().toISOString()
    }))

    // Insert posts into database
    const { data: createdPosts, error: insertError } = await supabase
      .from('posts')
      .insert(postsToCreate)
      .select()

    if (insertError) {
      logger.error('Failed to create posts', insertError, { userId: user.id })
      return NextResponse.json(
        {
          error: 'Failed to create posts',
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    logger.info('Posts created successfully', {
      userId: user.id,
      count: createdPosts?.length || 0
    })

    return NextResponse.json({
      success: true,
      posts: createdPosts || [],
      count: createdPosts?.length || 0,
    })
  } catch (error: any) {
    logger.error('Error in POST /api/posts', error)
    return ErrorResponses.internalError(error.message)
  }
}
