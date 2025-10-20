"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { WelcomeModal } from '@/components/onboarding/WelcomeModal'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

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
        {/* App Header with Navigation */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
                Repurpose
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">Dashboard</Link>
                <Link href="/create" className="text-sm text-gray-600 hover:text-gray-900">Create</Link>
                <Link href="/batch-create" className="text-sm text-gray-600 hover:text-gray-900">Batch Create</Link>
                <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">Posts</Link>
                <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/connections" className="text-sm text-gray-600 hover:text-gray-900">Connections</Link>
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/login'; }} className="text-sm text-gray-600 hover:text-gray-900">
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        <ProgressIndicator
          completed={onboarding.completed}
          totalSteps={5}
          completedSteps={onboarding.stepsCompleted.length}
        />

        <WelcomeModal />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Posts"
                value="0"
                description="Posts created"
                trend="+0%"
              />
              <StatCard
                title="Scheduled"
                value="0"
                description="Posts scheduled"
                trend="+0%"
              />
              <StatCard
                title="Published"
                value="0"
                description="Posts published"
                trend="+0%"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">No recent activity yet</p>
                <p className="text-sm">
                  Start by connecting your accounts and creating your first post
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <QuickActionCard
                  title="Create Post"
                  description="Write a new post for your platforms"
                  href="/create"
                />
                <QuickActionCard
                  title="View Posts"
                  description="Manage all your content"
                  href="/posts"
                />
                <QuickActionCard
                  title="Connect Accounts"
                  description="Link your social platforms"
                  href="/connections"
                />
                <QuickActionCard
                  title="Browse Templates"
                  description="Start with AI templates"
                  href="/templates"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {!onboarding.completed && onboarding.showWelcomeModal && (
                <OnboardingChecklist
                  completed={onboarding.completed}
                  stepsCompleted={onboarding.stepsCompleted}
                  progressPercentage={onboarding.progressPercentage}
                  onCompleteStep={onboarding.completeStep}
                  onDismiss={onboarding.dismissWelcomeModal}
                />
              )}

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No accounts connected</p>
                  <p className="text-sm mb-4">
                    Connect Twitter, LinkedIn, or Instagram to start posting
                  </p>
                  <Link 
                    href="/connections"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    Connect Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  trend: string
}

function StatCard({ title, value, description, trend }: StatCardProps) {
  const isPositive = trend.startsWith('+')

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className={`text-xs font-medium ${
          isPositive ? 'text-green-600' : 'text-gray-600'
        }`}>
          {trend}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  href: string
}

function QuickActionCard({ title, description, href }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md"
    >
      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </Link>
  )
}
