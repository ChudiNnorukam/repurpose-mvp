'use client'

import { AppHeader } from './AppHeader'
import { ReactNode } from 'react'
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface DashboardLayoutProps {
  children: ReactNode
  user?: any
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <AppHeader variant="dashboard" user={user} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
