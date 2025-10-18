'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import quizData from '@/data/quiz-content-marketing.json'
import { QuizAnswers } from '@/lib/quiz/types'
import { calculateScores } from '@/lib/quiz/scoring'
import { COLOR_PRIMARY, COLOR_AI } from '@/lib/design-tokens'

export default function QuizQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const variant = searchParams.get('v') || 'A'
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const questions = quizData.questions
  const progress = ((currentQuestion + 1) / questions.length) * 100

  useEffect(() => {
    // Track quiz start
    if (currentQuestion === 0 && typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_started', {
        question_order: 'standard',
        timestamp: new Date().toISOString()
      })
    }

    // Track progress milestones
    if ([0.25, 0.5, 0.75].includes(progress / 100) && typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_progress_milestone', {
        milestone: `${progress}%`
      })
    }
  }, [currentQuestion, progress])

  const handleAnswer = (points: number) => {
    const questionId = questions[currentQuestion].id
    
    // Track answer
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_question_answered', {
        question_id: questionId,
        question_number: currentQuestion + 1,
        points
      })
    }

    const newAnswers = { ...answers, [questionId]: points }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Last question answered, show email capture
      setShowEmailCapture(true)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    setIsSubmitting(true)

    const scores = calculateScores(answers)
    const timeTaken = Math.round((Date.now() - startTime) / 1000)

    // Track completion
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_completed', {
        score: scores.total,
        tier: scores.tier,
        time_taken_seconds: timeTaken
      })
    }

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          email,
          fullName,
          variant,
          questionOrder: 'standard',
          ctaVariant: 'trial',
          utmParams: {
            utm_source: searchParams.get('utm_source'),
            utm_campaign: searchParams.get('utm_campaign')
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Track email submission
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.capture('email_submitted', {
            tier: scores.tier
          })
        }

        router.push(`/quiz/content-marketing-readiness/results/${data.responseId}`)
      } else {
        alert('Failed to submit quiz. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (showEmailCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Almost there! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your email to get your personalized results + action plan.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name (optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Calculating Your Score...' : 'Get My Results →'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              We'll never spam you. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${COLOR_AI.bg} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.points)}
                className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <span className="text-gray-900 font-medium">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        {currentQuestion > 0 && (
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to previous question
          </button>
        )}
      </div>
    </div>
  )
}
