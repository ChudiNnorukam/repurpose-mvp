'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ALERT_VARIANTS } from '@/lib/design-tokens'
import { ConnectionsHeader } from '@/components/connections/ConnectionsHeader'
import { PlatformCard } from '@/components/connections/PlatformCard'

interface SocialAccount {
  id: string
  platform: string
  platform_username: string
  connected_at: string
}

function ConnectionsContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkUser()

    // Check for OAuth callback messages
    const success = searchParams.get('success')
    const username = searchParams.get('username')
    const errorParam = searchParams.get('error')

    if (success === 'twitter_connected' && username) {
      toast.success(`Successfully connected Twitter as @${username}!`)
    } else if (success) {
      toast.success(`Successfully connected!`)
    }

    if (errorParam) {
      const message = searchParams.get('message')
      toast.error(message ? `Error: ${errorParam} - ${message}` : `Error: ${errorParam}`)
    }
  }, [searchParams])

  const checkUser = async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      await loadAccounts(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadAccounts = async (userId: string) => {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error loading accounts:', error)
      return
    }

    setAccounts(data || [])
  }

  const handleConnect = async (platform: string) => {
    try {
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
      toast.loading(`Connecting to ${platformName}...`)

      // Twitter uses GET request that directly redirects
      // LinkedIn uses POST request that returns authUrl
      if (platform === 'twitter') {
        // Redirect directly to Twitter OAuth init endpoint
        window.location.href = '/api/auth/twitter/init'
      } else if (platform === 'linkedin') {
        const response = await fetch('/api/auth/init-linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Request failed with code ${response.status}` }))
          toast.error(`Failed to connect: ${errorData.error || 'Unknown error'}`)
          console.error(`Connection error for ${platform}:`, response.status, errorData)
          return
        }

        const data = await response.json()

        if (data.error) {
          toast.error(`Failed to connect: ${data.error}`)
          return
        }

        if (!data.authUrl) {
          toast.error('Failed to get authorization URL')
          return
        }

        // Redirect to LinkedIn OAuth
        window.location.href = data.authUrl
      }
    } catch (error: any) {
      console.error('Connection error:', error)
      toast.error(`Failed to initiate connection: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return
    }

    const loadingToast = toast.loading(`Disconnecting ${platform}...`)

    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', platform)

    if (error) {
      toast.error(`Failed to disconnect ${platform}`, { id: loadingToast })
      return
    }

    toast.success(`Disconnected ${platform}`, { id: loadingToast })
    await loadAccounts(user.id)
  }

  const isConnected = (platform: string) => {
    return accounts.some(acc => acc.platform === platform)
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <ConnectionsHeader />

      {message && (
        <div className={`mb-6 ${ALERT_VARIANTS.success} px-4 py-3 rounded`}>
          {message}
        </div>
      )}

      {error && (
        <div className={`mb-6 ${ALERT_VARIANTS.error} px-4 py-3 rounded`}>
          {error}
        </div>
      )}

      <div className="space-y-4">
        <PlatformCard
          platform="twitter"
          icon="𝕏"
          isConnected={isConnected('twitter')}
          username={accounts.find(a => a.platform === 'twitter')?.platform_username}
          onConnect={() => handleConnect('twitter')}
          onDisconnect={() => handleDisconnect('twitter')}
        />

        <PlatformCard
          platform="linkedin"
          icon="in"
          isConnected={isConnected('linkedin')}
          username={accounts.find(a => a.platform === 'linkedin')?.platform_username}
          onConnect={() => handleConnect('linkedin')}
          onDisconnect={() => handleDisconnect('linkedin')}
        />

        <PlatformCard
          platform="instagram"
          icon="IG"
          isConnected={false}
          onConnect={() => {}}
          onDisconnect={() => {}}
          isComingSoon={true}
        />
      </div>
    </DashboardLayout>
  )
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ConnectionsContent />
    </Suspense>
  )
}
