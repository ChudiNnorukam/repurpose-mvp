"use client"

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChecklistItem } from './ChecklistItem'
import { Twitter, FileText, Calendar, Sparkles, BarChart3 } from 'lucide-react'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function OnboardingChecklist() {
  const router = useRouter()
  const { 
    stepsCompleted, 
    completed, 
    progressPercentage,
    loading,
  } = useOnboarding()

  // Trigger confetti when onboarding is completed
  useEffect(() => {
    if (completed && stepsCompleted.length === 5) {
      const duration = 3000
      const end = Date.now() + duration

      const colors = ['#6366f1', '#8b5cf6', '#ec4899']

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    }
  }, [completed, stepsCompleted.length])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (completed) {
    return null
  }

  const steps = [
    {
      id: 'connect_account' as const,
      title: 'Connect Your First Account',
      description: 'Link your Twitter, LinkedIn, or Instagram account to start posting.',
      icon: Twitter,
      actionLabel: 'Connect Account',
      action: () => router.push('/dashboard/accounts'),
    },
    {
      id: 'create_post' as const,
      title: 'Create Your First Post',
      description: 'Write and preview content for any platform.',
      icon: FileText,
      actionLabel: 'Create Post',
      action: () => router.push('/dashboard/posts/new'),
    },
    {
      id: 'schedule_post' as const,
      title: 'Schedule a Post',
      description: 'Plan your content with our smart scheduling calendar.',
      icon: Calendar,
      actionLabel: 'Schedule Post',
      action: () => router.push('/dashboard/calendar'),
    },
    {
      id: 'adapt_content' as const,
      title: 'Try AI Adaptation',
      description: 'Let AI transform your content for different platforms automatically.',
      icon: Sparkles,
      actionLabel: 'Adapt Content',
      action: () => router.push('/dashboard/adapt'),
    },
    {
      id: 'view_analytics' as const,
      title: 'Check Your Analytics',
      description: 'See how your posts perform across all platforms.',
      icon: BarChart3,
      actionLabel: 'View Analytics',
      action: () => router.push('/dashboard/analytics'),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription className="mt-1">
              Complete these steps to unlock the full power of Repurpose
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {stepsCompleted.length}/{steps.length}
            </div>
            <div className="text-xs text-muted-foreground">
              steps completed
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <ChecklistItem
              key={step.id}
              title={step.title}
              description={step.description}
              completed={stepsCompleted.includes(step.id)}
              icon={step.icon}
              actionLabel={step.actionLabel}
              onAction={step.action}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
