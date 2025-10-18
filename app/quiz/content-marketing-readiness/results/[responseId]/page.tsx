'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { QuizScores } from '@/lib/quiz/types'
import { getResultTemplate } from '@/lib/quiz/scoring'
import { COLOR_PRIMARY, COLOR_AI, COLOR_SUCCESS } from '@/lib/design-tokens'
import Link from 'next/link'

export default function ResultsPage() {
  const params = useParams()
  const responseId = params.responseId as string
  
  const [scores, setScores] = useState<QuizScores | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/quiz/results/${responseId}`)
        const data = await response.json()
        
        if (data.success) {
          setScores(data.scores)
          
          // Track results viewed
          if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('results_viewed', {
              score: data.scores.total,
              tier: data.scores.tier,
              cta_variant: 'trial'
            })
          }
        } else {
          setError('Failed to load results')
        }
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [responseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your score...</p>
        </div>
      </div>
    )
  }

  if (error || !scores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
          <Link 
            href="/quiz/content-marketing-readiness"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Take the quiz
          </Link>
        </div>
      </div>
    )
  }

  const template = getResultTemplate(scores.tier, scores.total)

  const handleCtaClick = () => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('results_cta_clicked', {
        tier: scores.tier,
        cta_type: template.cta
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              You scored {scores.total}/100
            </h1>
            <p className="text-xl text-gray-600">
              {template.headline}
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <ScoreSection 
              title="Content Production"
              score={scores.production}
              maxScore={50}
            />
            <ScoreSection 
              title="Multi-Platform"
              score={scores.distribution}
              maxScore={50}
            />
            <ScoreSection 
              title="Analytics"
              score={scores.analytics}
              maxScore={50}
            />
          </div>

          {/* Description */}
          <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Time Savings */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Potential time savings with automation:</p>
            <p className="text-4xl font-bold text-purple-600">
              {template.timeSavings}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href={template.ctaHref}
              onClick={handleCtaClick}
              className={`inline-block ${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg`}
            >
              {template.cta} →
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              14-day free trial • No credit card required
            </p>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What happens next?
          </h2>
          <div className="space-y-4">
            <NextStep 
              number={1}
              title="Check your email"
              description="We've sent your detailed results + action plan"
            />
            <NextStep 
              number={2}
              title="Follow the quick wins"
              description="Implement 3 time-saving changes this week"
            />
            <NextStep 
              number={3}
              title="Track your progress"
              description="Measure time saved and content output increase"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreSection({ title, score, maxScore }: { title: string, score: number, maxScore: number }) {
  const percentage = (score / maxScore) * 100

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">/ {maxScore}</span>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500"
          ></div>
        </div>
      </div>
    </div>
  )
}

function NextStep({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}
