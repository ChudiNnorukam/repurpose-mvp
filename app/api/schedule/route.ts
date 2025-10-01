import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

type Platform = 'twitter' | 'linkedin' | 'instagram'

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Create a Supabase client with the cookies
    const supabaseClient = supabase

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { platform, content, originalContent, scheduledTime } = body

    // Validate input
    if (!platform || !content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['twitter', 'linkedin', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledTime)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Save to database
    const { data: post, error: insertError } = await supabaseClient
      .from('posts')
      .insert({
        user_id: user.id,
        platform: platform as Platform,
        original_content: originalContent || content,
        adapted_content: content,
        scheduled_time: scheduledTime,
        status: 'scheduled',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting post:', insertError)
      return NextResponse.json(
        { error: 'Failed to schedule post' },
        { status: 500 }
      )
    }

    // TODO: Set up QStash scheduled job to post at the scheduled time
    // For MVP, we'll add this in the next step

    return NextResponse.json({
      success: true,
      post,
      message: 'Post scheduled successfully',
    })
  } catch (error: any) {
    console.error('Error in /api/schedule:', error)

    return NextResponse.json(
      {
        error: 'Failed to schedule post. Please try again.',
        details: error.message
      },
      { status: 500 }
    )
  }
}
