"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsSection } from '@/components/dashboard/StatsSection'
import { RecentActivitySection } from '@/components/dashboard/RecentActivitySection'
import { QuickActionsSection } from '@/components/dashboard/QuickActionsSection'
import { OnboardingSidebar } from '@/components/dashboard/OnboardingSidebar'
import { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()

        // If there's an invalid refresh token error, clear session and redirect
        if (error && error.message.includes('Refresh Token')) {
          await supabase.auth.signOut()
          window.location.href = '/login'
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
        // Clear any corrupt session data and redirect
        await supabase.auth.signOut()
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const onboarding = useOnboarding()

  if (loading || onboarding.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />

        <ProgressIndicator
          completed={onboarding.completed}
          totalSteps={5}
          completedSteps={onboarding.stepsCompleted.length}
        />

        <WelcomeModal />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <StatsSection />
              <RecentActivitySection />
              <QuickActionsSection />
            </div>

            <div className="lg:col-span-4">
              <OnboardingSidebar />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
