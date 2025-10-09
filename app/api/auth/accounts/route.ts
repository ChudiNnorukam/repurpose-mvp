import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ErrorResponses } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/auth/accounts
 *
 * Retrieves all connected social media accounts for the authenticated user.
 * Returns account details including platform, username, and connection status.
 *
 * @returns {SocialAccount[]} Array of connected social accounts
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check - require user to be logged in
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized access attempt to /api/auth/accounts')
      return ErrorResponses.unauthorized()
    }

    // Fetch all social accounts for the authenticated user
    // RLS policies ensure users can only see their own accounts
    const { data: accounts, error: fetchError } = await supabase
      .from('social_accounts')
      .select('id, platform, account_username, connected_at, expires_at')
      .eq('user_id', user.id)
      .order('connected_at', { ascending: false })

    if (fetchError) {
      logger.error('Failed to fetch social accounts', fetchError, { userId: user.id })
      return NextResponse.json(
        {
          error: 'Failed to retrieve social accounts',
          details: fetchError.message,
        },
        { status: 500 }
      )
    }

    // Check for expired tokens and flag them
    const accountsWithStatus = accounts?.map(account => {
      const isExpired = account.expires_at && new Date(account.expires_at) < new Date()
      return {
        ...account,
        isExpired,
        needsReconnection: isExpired,
      }
    }) || []

    logger.info('Social accounts retrieved successfully', {
      userId: user.id,
      count: accounts?.length || 0,
      platforms: accounts?.map(a => a.platform) || []
    })

    return NextResponse.json({
      success: true,
      accounts: accountsWithStatus,
      count: accountsWithStatus.length,
    })
  } catch (error: any) {
    logger.error('Error in GET /api/auth/accounts', error)
    return ErrorResponses.internalError(error.message)
  }
}

/**
 * DELETE /api/auth/accounts
 *
 * Disconnects a social media account for the authenticated user.
 * Requires accountId in the request body.
 *
 * @body {string} accountId - The ID of the account to disconnect
 * @returns {object} Success message
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Unauthorized access attempt to DELETE /api/auth/accounts')
      return ErrorResponses.unauthorized()
    }

    const body = await request.json()
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      )
    }

    // Delete the social account
    // RLS policies ensure users can only delete their own accounts
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id)

    if (deleteError) {
      logger.error('Failed to delete social account', deleteError, {
        userId: user.id,
        accountId
      })
      return NextResponse.json(
        {
          error: 'Failed to disconnect account',
          details: deleteError.message,
        },
        { status: 500 }
      )
    }

    logger.info('Social account disconnected successfully', {
      userId: user.id,
      accountId
    })

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully',
    })
  } catch (error: any) {
    logger.error('Error in DELETE /api/auth/accounts', error)
    return ErrorResponses.internalError(error.message)
  }
}
