'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Platform = 'twitter' | 'linkedin' | 'instagram'

interface ConnectedAccount {
  platform: Platform
  account_username: string
}

interface GeneratedContent {
  platform: Platform
  content: string
  status: 'pending' | 'success' | 'error'
  error?: string
}

export default function GeneratePage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [topic, setTopic] = useState('')
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [generating, setGenerating] = useState(false)
  const [savingDrafts, setSavingDrafts] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await fetchConnectedAccounts(user.id)
      setLoading(false)
    }
    checkUser()
  }, [router, supabase])

  const fetchConnectedAccounts = async (userId: string) => {
    try {
      // Fetch directly from Supabase instead of using API route
      // This avoids cookie authentication issues
      const { data: accounts, error: fetchError } = await supabase
        .from('social_accounts')
        .select('id, platform, account_username, connected_at, expires_at')
        .eq('user_id', userId)
        .order('connected_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching accounts:', fetchError)
        setConnectedAccounts([])
        return
      }

      // Check for expired tokens and flag them
      const accountsWithStatus = accounts?.map(account => {
        const isExpired = account.expires_at && new Date(account.expires_at) < new Date()
        return {
          ...account,
          isExpired,
          needsReconnection: isExpired,
        }
      }) || []

      setConnectedAccounts(accountsWithStatus as ConnectedAccount[])
    } catch (error: any) {
      console.error('Error fetching accounts:', error)
      setConnectedAccounts([])
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    if (connectedAccounts.length === 0) {
      toast.error('Please connect at least one social account')
      router.push('/connections')
      return
    }

    setGenerating(true)
    const loadingToast = toast.loading('Generating content for all platforms...')

    try {
      // Initialize generated content with pending status
      const initialContent: GeneratedContent[] = connectedAccounts.map(account => ({
        platform: account.platform,
        content: '',
        status: 'pending'
      }))
      setGeneratedContent(initialContent)

      // Generate content for each platform
      const generationPromises = connectedAccounts.map(async (account) => {
        try {
          const response = await fetch('/api/adapt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: topic,
              targetPlatform: account.platform,
              tone: 'professional'
            })
          })

          if (!response.ok) {
            throw new Error(`Failed to generate ${account.platform} content`)
          }

          const data = await response.json()

          return {
            platform: account.platform,
            content: data.adaptedContent,
            status: 'success' as const
          }
        } catch (error: any) {
          return {
            platform: account.platform,
            content: '',
            status: 'error' as const,
            error: error.message
          }
        }
      })

      const results = await Promise.all(generationPromises)
      setGeneratedContent(results)

      const successCount = results.filter(r => r.status === 'success').length
      const errorCount = results.filter(r => r.status === 'error').length

      toast.dismiss(loadingToast)

      if (errorCount > 0) {
        toast.error(`Generated ${successCount} post(s), ${errorCount} failed`)
      } else {
        toast.success(`Generated ${successCount} post(s) successfully!`)
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error('Failed to generate content', { id: loadingToast })
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveAsDrafts = async () => {
    const successfulContent = generatedContent.filter(c => c.status === 'success')

    if (successfulContent.length === 0) {
      toast.error('No content to save')
      return
    }

    setSavingDrafts(true)
    const loadingToast = toast.loading(`Saving ${successfulContent.length} draft(s)...`)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: successfulContent.map(content => ({
            original_content: topic,
            platform: content.platform,
            adapted_content: content.content,
            status: 'draft',
            is_draft: true
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save drafts')
      }

      const data = await response.json()

      toast.success(`Saved ${data.posts?.length || successfulContent.length} draft(s) successfully!`, { id: loadingToast })

      // Navigate to posts page to view drafts
      router.push('/posts?filter=draft')
    } catch (error: any) {
      console.error('Save drafts error:', error)
      toast.error('Failed to save drafts', { id: loadingToast })
    } finally {
      setSavingDrafts(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Generate Multi-Platform Content
            </h1>
          </div>
          <p className="text-gray-600">
            Enter a topic and we'll generate adapted content for all your connected platforms
          </p>
        </div>

        {/* Connected Accounts Summary */}
        {connectedAccounts.length > 0 ? (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {connectedAccounts.length} platform(s) connected:
              </span>
              <span className="text-green-600">
                {connectedAccounts.map(a => a.platform).join(', ')}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                No accounts connected.
              </span>
              <Button
                variant="link"
                className="text-yellow-700 underline p-0 h-auto"
                onClick={() => router.push('/connections')}
              >
                Connect accounts
              </Button>
            </div>
          </Card>
        )}

        {/* Topic Input */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic" className="text-lg font-semibold">
                What topic would you like to post about?
              </Label>
              <p className="text-sm text-gray-500 mb-3">
                Example: "Gen-AI Prompting Common Mistakes and Tips"
              </p>
            </div>

            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic or idea here..."
              className="min-h-[120px] text-base"
              disabled={generating}
            />

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generating || !topic.trim() || connectedAccounts.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {generating ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Generated Content Preview */}
        {generatedContent.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Content Preview
              </h2>
              <Button
                onClick={handleSaveAsDrafts}
                disabled={savingDrafts || generatedContent.filter(c => c.status === 'success').length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {savingDrafts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {savingDrafts ? 'Saving...' : 'Save All as Drafts'}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedContent.map((item) => (
                <Card key={item.platform} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize text-gray-900">
                      {item.platform}
                    </h3>
                    {item.status === 'pending' && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>

                  {item.status === 'success' && (
                    <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {item.content}
                    </div>
                  )}

                  {item.status === 'error' && (
                    <div className="bg-red-50 rounded-md p-3 text-sm text-red-700">
                      {item.error || 'Failed to generate content'}
                    </div>
                  )}

                  {item.status === 'pending' && (
                    <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-500 animate-pulse">
                      Generating...
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
