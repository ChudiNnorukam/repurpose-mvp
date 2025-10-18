import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-client'
import { calculateScores } from '@/lib/quiz/scoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, email, fullName, variant, questionOrder, ctaVariant, utmParams } = body
    
    // Calculate scores
    const scores = calculateScores(answers)
    
    // Create Supabase client
    const supabase = createClient()
    
    // Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Save to database
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        user_id: user?.id,
        campaign: 'content-marketing-readiness',
        variant,
        question_order: questionOrder,
        cta_variant: ctaVariant,
        email,
        full_name: fullName,
        score_total: scores.total,
        score_production: scores.production,
        score_distribution: scores.distribution,
        score_analytics: scores.analytics,
        tier: scores.tier,
        utm_source: utmParams?.utm_source,
        utm_campaign: utmParams?.utm_campaign
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      )
    }
    
    // TODO: Trigger email automation
    // await triggerEmailAutomation(data.id, scores.tier)
    
    return NextResponse.json({ 
      success: true, 
      responseId: data.id,
      scores 
    })
  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
