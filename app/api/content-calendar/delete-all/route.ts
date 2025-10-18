import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/content-calendar/delete-all
// Deletes all calendar entries for the current user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all entries for this user
    const { data, error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('user_id', user.id)
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${data?.length || 0} calendar entries`,
      deleted_count: data?.length || 0
    })

  } catch (error: any) {
    console.error('Delete all error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
