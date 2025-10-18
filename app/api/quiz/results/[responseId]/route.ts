import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { responseId: string } }
) {
  try {
    const { responseId } = params
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('score_total, score_production, score_distribution, score_analytics, tier')
      .eq('id', responseId)
      .single()
    
    if (error) {
      return NextResponse.json(
        { success: false, error: 'Results not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      scores: {
        total: data.score_total,
        production: data.score_production,
        distribution: data.score_distribution,
        analytics: data.score_analytics,
        tier: data.tier
      }
    })
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
