"use client"

import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

interface DashboardHeaderProps {
  userEmail?: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const handleLogout = async () => {
    await createClient().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Repurpose
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-gray-900 border-b-2 border-blue-600 pb-1">Dashboard</Link>
            <Link href="/create" className="text-sm text-gray-600 hover:text-gray-900">Create</Link>
            <Link href="/batch-create" className="text-sm text-gray-600 hover:text-gray-900">Batch Create</Link>
            <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">Posts</Link>
            <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900">Templates</Link>
            <Link href="/connections" className="text-sm text-gray-600 hover:text-gray-900">Connections</Link>
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Logout Button */}
          <div className="md:hidden">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
