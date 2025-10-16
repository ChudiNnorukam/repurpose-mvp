import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { schedulePostJob } from '@/lib/qstash'
import { logger } from "@/lib/logger"

// This endpoint should be called by a cron job (Vercel Cron or external service)
// Run daily at 8:00 AM to check and schedule recurring posts

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // Get all recurring templates
    const { data: templates, error: templatesError } = await supabase
      .from('content_templates')
      .select('*')
      .eq('is_recurring', true)

    if (templatesError) throw templatesError

    if (!templates || templates.length === 0) {
      return NextResponse.json({ message: 'No recurring templates found', processed: 0 })
    }

    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentHour = now.getHours()

    let processed = 0

    for (const template of templates) {
      // Parse schedule pattern (e.g., "weekly_monday_9am")
      const pattern = template.schedule_pattern
      if (!pattern) continue

      const [frequency, day, time] = pattern.split('_')

      if (frequency !== 'weekly') continue

      // Check if today matches the schedule day
      const scheduleDays: { [key: string]: number } = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      }

      const scheduleDay = scheduleDays[day.toLowerCase()]
      if (currentDay !== scheduleDay) continue

      // Check if we've already posted today
      const lastUsed = template.last_used_at ? new Date(template.last_used_at) : null
      if (lastUsed) {
        const lastUsedDay = lastUsed.toDateString()
        const todayStr = now.toDateString()
        if (lastUsedDay === todayStr) {
          // Already posted today
          continue
        }
      }

      // Parse time (e.g., "9am" -> hour 9)
      const hour = parseInt(time.replace(/[^\d]/g, ''))
      const isPM = time.toLowerCase().includes('pm')
      const scheduledHour = isPM && hour !== 12 ? hour + 12 : hour

      if (currentHour !== scheduledHour) continue

      // Create scheduled post for this template
      const scheduledTime = new Date()
      scheduledTime.setMinutes(0)
      scheduledTime.setSeconds(0)
      scheduledTime.setMilliseconds(0)

      // For each platform in the template
      for (const platform of template.platforms) {
        // Get user's connection for this platform
        const { data: connection } = await supabase
          .from('connections')
          .select('*')
          .eq('user_id', template.user_id)
          .eq('platform', platform)
          .single()

        if (!connection) continue

        // Create post record
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: template.user_id,
            platform,
            content: template.template_text,
            status: 'scheduled',
            scheduled_at: scheduledTime.toISOString(),
          })
          .select()
          .single()

        if (postError) {
          logger.error('Error creating post:', postError)
          continue
        }

        // Schedule with QStash
        await schedulePostJob(
          {
            postId: post.id,
            platform,
            content: template.template_text,
            userId: template.user_id,
          },
          scheduledTime
        )

        processed++
      }

      // Update last_used_at
      await supabase
        .from('content_templates')
        .update({ last_used_at: now.toISOString() })
        .eq('id', template.id)
    }

    return NextResponse.json({
      message: 'Recurring posts processed',
      processed,
      timestamp: now.toISOString()
    })
  } catch (error) {
    logger.error('Error processing recurring posts:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring posts' },
      { status: 500 }
    )
  }
}
