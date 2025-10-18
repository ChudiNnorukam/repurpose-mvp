import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/content-calendar
// Fetches user's content calendar entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('content_calendar')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })

    // Apply filters
    if (week) {
      query = query.eq('week_number', parseInt(week))
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Get summary stats
    const { data: summary } = await supabase
      .from('content_calendar_summary')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      data,
      summary: summary || [],
      total: data.length
    })

  } catch (error: any) {
    console.error('Fetch calendar error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
