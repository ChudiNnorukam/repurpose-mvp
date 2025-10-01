import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Platform = 'twitter' | 'linkedin' | 'instagram'

export async function POST(request: NextRequest) {
  try {
    // Get user from session using SSR client
    const cookieStore = await cookies()

    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

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
