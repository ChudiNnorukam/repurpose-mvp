'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('Password reset error:', error)
        throw error
      }

      setSuccess(true)
      toast.success('Password reset email sent!')
    } catch (error: any) {
      console.error('Password reset error:', error)
      const errorMessage = error.message || 'Failed to send reset email. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Password reset instructions sent"
        footerText="Remember your password?"
        footerLink={{ text: 'Log in', href: '/login' }}
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm" role="alert" aria-live="polite" aria-atomic="true">
            <p className="font-medium mb-1">Password reset email sent!</p>
            <p>We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox and follow the link to reset your password.</p>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p>Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Check your spam/junk folder</li>
              <li>Make sure the email address is correct</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Send another email
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
      footerText="Remember your password?"
      footerLink={{ text: 'Log in', href: '/login' }}
    >
      <form className="space-y-6" onSubmit={handleResetRequest}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert" aria-live="assertive" aria-atomic="true">
            {error}
          </div>
        )}

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
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-xs text-gray-500">
            Enter the email address associated with your account
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Sending...' : 'Send reset instructions'}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </form>
    </AuthLayout>
  )
}
