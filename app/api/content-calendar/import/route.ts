import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

// POST /api/content-calendar/import
// Imports the 90-day content calendar CSV into Supabase
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Read the CSV file
    const csvPath = path.join(process.cwd(), 'content-strategy/90-day-content-calendar.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // 3. Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    console.log(`Parsed ${records.length} calendar entries`)

    // 4. Transform and insert into Supabase
    const calendarEntries = records.map((row: any, index: number) => {
      // Parse date
      const scheduled_date = new Date(row.Date).toISOString().split('T')[0]
      
      // Parse key points (pipe-separated in CSV)
      const key_points = row.Key_Points && row.Key_Points.trim()
        ? row.Key_Points.split('|').map((p: string) => p.trim()).filter(Boolean)
        : []
      
      // Parse hashtags (space-separated)
      const hashtags = row.Hashtags && row.Hashtags.trim()
        ? row.Hashtags.split(/\s+/).map((h: string) => h.trim()).filter(Boolean)
        : []
      
      // Parse SEO keywords (comma-separated)
      const seo_keywords = row.SEO_Keywords && row.SEO_Keywords.trim()
        ? row.SEO_Keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : []
      
      // Calculate week number (1-13 for 90 days)
      const week_number = Math.ceil((index + 1) / 7)
      
      // Get day of week (0-6)
      const day_of_week = new Date(row.Date).getDay()
      
      // Parse platform (convert to lowercase)
      const platform = (row.Platform || '').toLowerCase().trim() || 'linkedin'
      
      return {
        user_id: user.id,
        scheduled_date,
        scheduled_time: null, // Can be added later
        platform,
        content_type: row.Content_Type || 'Post', // Default if missing
        topic_theme: row.Topic_Theme || 'General',
        hook: row.Hook_First_Line || '',
        key_points,
        full_content: null, // Will be populated from week1-content or generated
        cta: row.CTA || null,
        hashtags,
        seo_keywords,
        estimated_engagement_score: parseInt(row.Est_Engagement_Score) || 5,
        ai_detection_risk: (row.AI_Detection_Risk || 'low').toLowerCase(),
        status: 'draft',
        content_pillar: row.Content_Pillar || 'General',
        week_number,
        day_of_week
      }
    })

    // 5. Batch insert
    const { data, error } = await supabase
      .from('content_calendar')
      .insert(calendarEntries)
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: `Imported ${data.length} calendar entries`,
      data: {
        total_entries: data.length,
        week_1_entries: data.filter(e => e.week_number === 1).length,
        linkedin_entries: data.filter(e => e.platform === 'linkedin' || e.platform === 'both').length,
        twitter_entries: data.filter(e => e.platform === 'twitter' || e.platform === 'both').length,
        date_range: {
          start: data[0]?.scheduled_date,
          end: data[data.length - 1]?.scheduled_date
        }
      }
    })

  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/content-calendar/import
// Returns import status and preview
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if calendar already imported
    const { data: existing, error } = await supabase
      .from('content_calendar')
      .select('id, scheduled_date, platform, content_type, status')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: existing && existing.length > 0,
      total_entries: existing?.length || 0,
      date_range: existing && existing.length > 0 ? {
        start: existing[0].scheduled_date,
        end: existing[existing.length - 1].scheduled_date
      } : null,
      preview: existing?.slice(0, 5) || []
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
