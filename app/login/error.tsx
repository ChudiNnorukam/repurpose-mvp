'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Login page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Repurpose<span className="text-blue-600">AI</span>
          </h1>
          <div className="mt-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong!
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error loading the login page.
            </p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={reset}
                className="w-full"
              >
                Try again
              </Button>
              
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Create new account instead
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Go to home page
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
