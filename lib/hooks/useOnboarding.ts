"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

export type OnboardingStep = 
  | 'connect_account'
  | 'create_post'
  | 'schedule_post'
  | 'adapt_content'
  | 'view_analytics'

interface OnboardingState {
  completed: boolean
  startedAt: string | null
  completedAt: string | null
  stepsCompleted: OnboardingStep[]
  showWelcomeModal: boolean
}

interface OnboardingHook extends OnboardingState {
  loading: boolean
  error: Error | null
  completeStep: (step: OnboardingStep) => Promise<void>
  dismissWelcomeModal: () => Promise<void>
  resetOnboarding: () => Promise<void>
  progressPercentage: number
}

const TOTAL_STEPS = 5

export function useOnboarding(): OnboardingHook {
  const [state, setState] = useState<OnboardingState>({
    completed: false,
    startedAt: null,
    completedAt: null,
    stepsCompleted: [],
    showWelcomeModal: true,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  // Load onboarding state from database
  useEffect(() => {
    async function loadOnboardingState() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('user_preferences')
          .select('onboarding_completed, onboarding_started_at, onboarding_completed_at, onboarding_steps_completed, show_welcome_modal')
          .eq('user_id', user.id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          setState({
            completed: data.onboarding_completed || false,
            startedAt: data.onboarding_started_at,
            completedAt: data.onboarding_completed_at,
            stepsCompleted: (data.onboarding_steps_completed || []) as OnboardingStep[],
            showWelcomeModal: data.show_welcome_modal ?? true,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load onboarding state'))
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingState()
  }, [])

  const completeStep = useCallback(async (step: OnboardingStep) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Don't add duplicate steps
      if (state.stepsCompleted.includes(step)) return

      const newStepsCompleted = [...state.stepsCompleted, step]
      const allStepsCompleted = newStepsCompleted.length >= TOTAL_STEPS
      const now = new Date().toISOString()

      const updates: any = {
        onboarding_steps_completed: newStepsCompleted,
        onboarding_completed: allStepsCompleted,
      }

      // Set started_at on first step
      if (state.stepsCompleted.length === 0) {
        updates.onboarding_started_at = now
      }

      // Set completed_at when all steps done
      if (allStepsCompleted) {
        updates.onboarding_completed_at = now
      }

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setState(prev => ({
        ...prev,
        stepsCompleted: newStepsCompleted,
        completed: allStepsCompleted,
        startedAt: prev.startedAt || now,
        completedAt: allStepsCompleted ? now : prev.completedAt,
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to complete step'))
    }
  }, [state.stepsCompleted])

  const dismissWelcomeModal = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ show_welcome_modal: false })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setState(prev => ({ ...prev, showWelcomeModal: false }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to dismiss welcome modal'))
    }
  }, [])

  const resetOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({
          onboarding_completed: false,
          onboarding_started_at: null,
          onboarding_completed_at: null,
          onboarding_steps_completed: [],
          show_welcome_modal: true,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setState({
        completed: false,
        startedAt: null,
        completedAt: null,
        stepsCompleted: [],
        showWelcomeModal: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset onboarding'))
    }
  }, [])

  const progressPercentage = Math.round((state.stepsCompleted.length / TOTAL_STEPS) * 100)

  return {
    ...state,
    loading,
    error,
    completeStep,
    dismissWelcomeModal,
    resetOnboarding,
    progressPercentage,
  }
}
