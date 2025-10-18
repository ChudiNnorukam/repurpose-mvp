'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        // If there's an invalid refresh token error, clear the session
        if (error && error.message.includes('Refresh Token')) {
          await supabase.auth.signOut()
          return
        }

        if (session) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Session check error:', error)
        // Clear any corrupt session data
        await supabase.auth.signOut()
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('Login error:', error)
        throw error
      }

      if (data.session) {
        toast.success('Welcome back!')
        // Give a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/dashboard')
        router.refresh()
      } else {
        throw new Error('No session created. Please try again.')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Invalid email or password'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your Repurpose account"
      footerText="Don't have an account?"
      footerLink={{ text: 'Sign up', href: '/signup' }}
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Forgot your password?
          </Link>
        </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
