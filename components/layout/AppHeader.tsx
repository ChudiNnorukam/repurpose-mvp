'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  variant?: 'landing' | 'dashboard'
  user?: any
}

export function AppHeader({ variant = 'landing', user }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path: string) => pathname === path

  if (variant === 'landing') {
    return (
      <nav className="absolute top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/landing" className="text-xl font-bold">
            Repurpose<span className="text-blue-500">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  // Dashboard variant
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/create', label: 'Create' },
    { href: '/posts', label: 'Posts' },
    { href: '/templates', label: 'Templates' },
    { href: '/connections', label: 'Connections' },
  ]

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Repurpose
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm transition',
                  isActive(link.href)
                    ? 'text-gray-900 font-semibold border-b-2 border-blue-600 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            ))}
            <span className="text-sm text-gray-600 hidden lg:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Logout
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block text-sm py-2 px-3 rounded-md transition',
                  isActive(link.href)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="text-sm text-gray-600 py-2 px-3">{user?.email}</div>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md hover:bg-gray-50 transition"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
