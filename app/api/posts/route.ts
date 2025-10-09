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
