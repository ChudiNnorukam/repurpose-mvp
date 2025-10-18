"use client"

import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProgressIndicator() {
  const { 
    stepsCompleted, 
    progressPercentage, 
    completed,
    loading 
  } = useOnboarding()

  if (loading || completed) {
    return null
  }

  const remaining = 100 - progressPercentage

  return (
    <div className="fixed top-16 right-4 z-40 w-64 bg-card border border-border rounded-lg shadow-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Getting Started</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {stepsCompleted.length}/5
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        {progressPercentage === 100 
          ? 'All done! Great job!' 
          : remaining + '% remaining'}
      </p>
    </div>
  )
}
