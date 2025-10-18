import { QuizAnswers, QuizScores } from './types'

export function calculateScores(answers: QuizAnswers): QuizScores {
  // Section scores (Q1-Q5, Q6-Q10, Q11-Q15)
  const productionQuestions = ['q1', 'q2', 'q3', 'q4', 'q5']
  const distributionQuestions = ['q6', 'q7', 'q8', 'q9', 'q10']
  const analyticsQuestions = ['q11', 'q12', 'q13', 'q14', 'q15']
  
  const production = productionQuestions.reduce(
    (sum, id) => sum + (answers[id] || 0), 
    0
  )
  
  const distribution = distributionQuestions.reduce(
    (sum, id) => sum + (answers[id] || 0), 
    0
  )
  
  const analytics = analyticsQuestions.reduce(
    (sum, id) => sum + (answers[id] || 0), 
    0
  )
  
  // Weighted total (35% + 35% + 30%)
  // Max points per section: 50
  const total = Math.round(
    (production / 50 * 35) +
    (distribution / 50 * 35) +
    (analytics / 50 * 30)
  )
  
  // Tier assignment
  const tier = total >= 70 ? 'Pro' : total >= 40 ? 'Starter' : 'Free'
  
  return {
    production,
    distribution,
    analytics,
    total,
    tier
  }
}

export function getResultTemplate(tier: 'Free' | 'Starter' | 'Pro', score: number) {
  const templates = {
    Pro: {
      headline: "You're a content machine... who's burning out",
      description: "You're doing everything 'right' according to the gurus. You batch content. You repurpose. You analyze. But you're also spending 15+ hours/week on content, manually reformatting the same post 5 times, and logging into 7 dashboards just to see what worked.",
      timeSavings: "12 hours/week",
      cta: "Start Your 14-Day Pro Trial",
      ctaHref: "/signup?plan=pro&source=quiz"
    },
    Starter: {
      headline: "You want to be consistent... but systems are boring",
      description: "You know content matters. You've read the threads. You've bookmarked the templates. But when Sunday rolls around, you're staring at a blank screen thinking 'What do I even post?'",
      timeSavings: "8 hours/week",
      cta: "Join the 30 Posts in 30 Days Challenge",
      ctaHref: "/signup?plan=starter&source=quiz"
    },
    Free: {
      headline: "You're not behind, you just haven't started",
      description: "You know you SHOULD post. You've bookmarked 47 articles about content. But you haven't actually posted. That's fixable in 30 days.",
      timeSavings: "5 hours/week",
      cta: "Download the Free Starter Pack",
      ctaHref: "/signup?plan=free&source=quiz"
    }
  }
  
  return templates[tier]
}
