'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { COLOR_PRIMARY, COLOR_AI } from '@/lib/design-tokens'

function QuizLandingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const variant = searchParams.get('v') || 'A'
  
  useEffect(() => {
    // Track landing view (PostHog integration)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_landing_viewed', {
        variant,
        utm_source: searchParams.get('utm_source'),
        utm_campaign: searchParams.get('utm_campaign')
      })
    }
  }, [variant, searchParams])

  const heroHooks = {
    A: "Stop Spending 10+ Hours a Week Creating Content No One Sees",
    C: "What If You Could Clone Yourself... But Just for Content?"
  }

  const handleStartQuiz = () => {
    // Track CTA click
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('quiz_cta_clicked', {
        variant,
        cta_type: 'primary'
      })
    }
    
    router.push(`/quiz/content-marketing-readiness/questions?v=${variant}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <section className="px-4 pt-8 pb-12">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Repurpose MVP</h2>
          </div>
          
          {/* Hero Headline */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {heroHooks[variant as 'A' | 'C']}
          </h1>
          
          {/* Subheading */}
          <p className="text-lg text-gray-600 mb-6">
            Take the 3-minute Content Marketing Readiness assessment and discover exactly 
            where you're wasting time (and what to automate first). Free instant results.
          </p>
          
          {/* Primary CTA */}
          <button
            onClick={handleStartQuiz}
            className={`w-full ${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-semibold py-4 px-6 rounded-lg mb-3 transition-colors`}
          >
            Start Your Free Assessment →
          </button>
          
          {/* Secondary CTA */}
          <p className="text-sm text-center text-gray-500">
            3 minutes • Instant results • No credit card required
          </p>
        </section>
        
        {/* Value Props */}
        <section className="px-4 pb-12">
          <div className="space-y-4">
            <ValueBullet 
              text="Discover your #1 time drain (spoiler: it's probably reformatting the same post 5 times)"
            />
            <ValueBullet 
              text="Get your personalized 8-week action plan based on 10,000+ creator assessments"
            />
            <ValueBullet 
              text="See exactly how much time you could save with the right tools and systems"
            />
          </div>
        </section>
        
        {/* Trust Indicators */}
        <section className="px-4 pb-12 border-t border-gray-200 pt-12">
          <p className="text-sm text-gray-500 text-center mb-4">
            Trusted by content creators at:
          </p>
          <div className="flex justify-center items-center gap-6 text-gray-400">
            <span className="font-semibold">Stripe</span>
            <span className="font-semibold">Notion</span>
            <span className="font-semibold">Webflow</span>
          </div>
        </section>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Copy */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Repurpose MVP</h2>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {heroHooks[variant as 'A' | 'C']}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Take the 3-minute Content Marketing Readiness assessment and discover exactly 
                where you're wasting time (and what to automate first).
              </p>
              
              {/* Value bullets */}
              <div className="space-y-4 mb-8">
                <ValueBullet 
                  text="Discover your #1 time drain (spoiler: it's probably reformatting the same post 5 times)"
                />
                <ValueBullet 
                  text="Get your personalized 8-week action plan based on 10,000+ creator assessments"
                />
                <ValueBullet 
                  text="See exactly how much time you could save with the right tools and systems"
                />
              </div>
              
              {/* CTAs */}
              <div className="flex gap-4 items-center">
                <button
                  onClick={handleStartQuiz}
                  className={`${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-semibold py-4 px-8 rounded-lg transition-colors`}
                >
                  Start Your Free Assessment →
                </button>
                <p className="text-sm text-gray-500">
                  3 minutes • Instant results
                </p>
              </div>
            </div>
            
            {/* Right Column: Hero Image Placeholder */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Content Creator Hero Image</p>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-4">
              Trusted by content creators at:
            </p>
            <div className="flex justify-center items-center gap-8 text-gray-400">
              <span className="font-semibold text-lg">Stripe</span>
              <span className="font-semibold text-lg">Notion</span>
              <span className="font-semibold text-lg">Webflow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-green-600 text-2xl flex-shrink-0">✓</span>
      <p className="text-gray-700">{text}</p>
    </div>
  )
}

export default function QuizLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QuizLandingContent />
    </Suspense>
  )
}
