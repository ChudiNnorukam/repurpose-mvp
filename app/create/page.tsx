'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CharacterCounter } from '@/components/ui/character-counter'
import { PLATFORM_LIMITS, Platform as PlatformType } from '@/lib/constants'
import { LoadingState, LoadingButton, ProgressBar } from '@/components/ui/loading'

type Platform = 'twitter' | 'linkedin' | 'instagram'
type Tone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'enthusiastic'

interface AdaptedContent {
  platform: Platform
  content: string
  scheduledTime?: string
}

export default function CreatePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adapting, setAdapting] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [adaptProgress, setAdaptProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [originalContent, setOriginalContent] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin', 'instagram'])
  const [adaptedContent, setAdaptedContent] = useState<AdaptedContent[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await createClient().auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const updateScheduledTime = (platform: Platform, time: string) => {
    setAdaptedContent(prev =>
      prev.map(item =>
        item.platform === platform ? { ...item, scheduledTime: time } : item
      )
    )
  }

  const handleSchedulePost = async (platform: Platform) => {
    const post = adaptedContent.find(item => item.platform === platform)
    if (!post || !post.scheduledTime) {
      toast.error('Please select a date and time')
      return
    }

    setScheduling(true)

    const loadingToast = toast.loading(`Scheduling ${platform} post...`)

    try {
      // Convert datetime-local to ISO string with user's timezone
      // datetime-local gives "2025-10-03T14:23" (no timezone info)
      // new Date() interprets this as LOCAL time, then toISOString() converts to UTC properly
      const localDateTime = new Date(post.scheduledTime)
      const isoString = localDateTime.toISOString()

      console.log('📤 Sending schedule request:', {
        platform,
        scheduledTime: isoString,
        userId: user.id
      })

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          content: post.content,
          originalContent,
          scheduledTime: isoString,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Schedule request failed:', {
          status: response.status,
          error: data.error,
          code: data.code,
          field: data.field,
          details: data.details
        })

        // Handle specific error codes with user-friendly messages
        switch (data.code) {
          case 'UNAUTHORIZED':
            toast.error('Session expired. Please log in again.', { id: loadingToast })
            // Optionally redirect to login after a delay
            setTimeout(() => router.push('/login'), 2000)
            break

          case 'RATE_LIMIT_EXCEEDED':
            const resetTime = data.reset ? new Date(data.reset).toLocaleTimeString() : 'shortly'
            toast.error(
              `Rate limit exceeded. You can schedule ${data.limit || 30} posts per minute. Try again after ${resetTime}.`,
              { id: loadingToast, duration: 5000 }
            )
            break

          case 'INVALID_PLATFORM':
            toast.error(`Invalid platform: ${platform}. Please try again.`, { id: loadingToast })
            break

          case 'INVALID_TIME':
            toast.error(data.error || 'Invalid scheduled time. Please select a future date and time.', { id: loadingToast })
            break

          case 'DATABASE_ERROR':
            if (data.error.includes('User account not properly linked')) {
              toast.error('Account error. Please log out and log back in, then try again.', { id: loadingToast, duration: 6000 })
            } else {
              toast.error(data.error || 'Database error. Please try again.', { id: loadingToast })
            }
            break

          case 'RECORD_NOT_FOUND':
            toast.error('Your account session is invalid. Please log out and log back in.', { id: loadingToast, duration: 5000 })
            setTimeout(() => router.push('/login'), 3000)
            break

          case 'QSTASH_ERROR':
            toast.error('Failed to schedule post delivery. Please try again or contact support.', { id: loadingToast, duration: 6000 })
            break

          case 'MISSING_REQUIRED_FIELD':
            const fieldName = data.field || 'unknown field'
            toast.error(`Missing required field: ${fieldName}. Please refresh and try again.`, { id: loadingToast })
            break

          default:
            // Generic error fallback
            const errorMessage = data.error || 'Failed to schedule post. Please try again.'
            toast.error(errorMessage, { id: loadingToast })

            // If it's a 500 error, suggest contacting support
            if (response.status >= 500) {
              setTimeout(() => {
                toast.error('If this persists, please contact support.', { duration: 4000 })
              }, 2000)
            }
        }

        return
      }

      console.log('✅ Post scheduled successfully:', data)

      toast.success(
        data.message || `Post scheduled for ${platform}!`,
        { id: loadingToast }
      )

      // Optionally clear the scheduled time for this platform after successful scheduling
      setAdaptedContent(prev =>
        prev.map(item =>
          item.platform === platform ? { ...item, scheduledTime: undefined } : item
        )
      )
    } catch (error: any) {
      console.error('❌ Exception during schedule request:', error)

      // Handle network errors and other exceptions
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.', { id: loadingToast })
      } else {
        toast.error(
          error.message || 'An unexpected error occurred. Please try again.',
          { id: loadingToast }
        )
      }
    } finally {
      setScheduling(false)
    }
  }

  const handleAdaptContent = async () => {
    if (!originalContent.trim()) {
      toast.error('Please enter some content to adapt')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setAdapting(true)
    setAdaptProgress(0)

    const loadingToast = toast.loading('Adapting content for platforms...')

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setAdaptProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/adapt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          tone,
          platforms: selectedPlatforms,
        }),
      })

      clearInterval(progressInterval)
      setAdaptProgress(100)

      if (!response.ok) {
        throw new Error('Failed to adapt content')
      }

      const data = await response.json()
      setAdaptedContent(data.adaptedContent)
      toast.success('Content adapted successfully!', { id: loadingToast })
    } catch (error: any) {
      toast.error(error.message || 'Failed to adapt content. Please try again.', { id: loadingToast })
    } finally {
      setTimeout(() => {
        setAdapting(false)
        setAdaptProgress(0)
      }, 300)
    }
  }

  const handleSaveDraft = async () => {
    if (adaptedContent.length === 0) {
      toast.error('No content to save')
      return
    }

    const loadingToast = toast.loading(`Saving ${adaptedContent.length} draft(s)...`)

    try {
      const drafts = adaptedContent.map(item => ({
        user_id: user.id,
        original_content: originalContent,
        platform: item.platform,
        adapted_content: item.content,
        tone,
        status: 'draft',
        is_draft: true,
        scheduled_time: null,
        qstash_message_id: null
      }))

      const { error } = await supabase
        .from('posts')
        .insert(drafts)

      if (error) throw error

      toast.success(`Saved ${adaptedContent.length} draft(s)!`, { id: loadingToast })

      // Clear form and redirect to drafts
      setOriginalContent('')
      setAdaptedContent([])
      router.push('/posts?filter=draft')
    } catch (error: any) {
      console.error('Error saving drafts:', error)
      toast.error(error.message || 'Failed to save drafts', { id: loadingToast })
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <LoadingState message="Loading content creator..." size="lg" className="min-h-[60vh]" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Content</h2>
          <p className="mt-2 text-gray-600">
            Enter your content and we'll adapt it for different platforms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Original Content
              </label>
              <textarea
                id="content"
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your content here... Share your thoughts, ideas, or message that you want to repurpose across platforms."
              />
              <div className="mt-3">
                <CharacterCounter content={originalContent} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Platforms
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('twitter')}
                    onChange={() => togglePlatform('twitter')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">Twitter (280 characters)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('linkedin')}
                    onChange={() => togglePlatform('linkedin')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">LinkedIn (Professional)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('instagram')}
                    onChange={() => togglePlatform('instagram')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-700">Instagram (Casual)</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <LoadingButton
                onClick={handleAdaptContent}
                disabled={adapting || !originalContent.trim() || selectedPlatforms.length === 0}
                loading={adapting}
                loadingText="Adapting content..."
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adapt Content
              </LoadingButton>

              {adapting && adaptProgress > 0 && (
                <ProgressBar
                  progress={adaptProgress}
                  message="Generating platform-optimized content..."
                />
              )}
            </div>

            {/* Save as Draft Button */}
            {adaptedContent.length > 0 && (
              <button
                onClick={handleSaveDraft}
                className="w-full mt-3 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save as Draft
              </button>
            )}
          </div>

          {/* Results Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Adapted Content
            </h3>
            {adaptedContent.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>Your adapted content will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adaptedContent.map((item) => (
                  <div key={item.platform} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold capitalize text-gray-900">
                        {item.platform}
                      </h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.content)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <textarea
                      value={item.content}
                      onChange={(e) => {
                        const newContent = e.target.value
                        setAdaptedContent(prev =>
                          prev.map(i => i.platform === item.platform ? { ...i, content: newContent } : i)
                        )
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                    />
                    <CharacterCounter content={item.content} platform={item.platform as PlatformType} className="mb-4" />

                    {/* Scheduling */}
                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule for later
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={item.scheduledTime || ''}
                          onChange={(e) => updateScheduledTime(item.platform, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          min={(() => {
                            // Get current time in user's local timezone for datetime-local
                            const now = new Date()
                            // Format as YYYY-MM-DDTHH:MM for datetime-local
                            const year = now.getFullYear()
                            const month = String(now.getMonth() + 1).padStart(2, '0')
                            const day = String(now.getDate()).padStart(2, '0')
                            const hours = String(now.getHours()).padStart(2, '0')
                            const minutes = String(now.getMinutes()).padStart(2, '0')
                            return `${year}-${month}-${day}T${hours}:${minutes}`
                          })()}
                        />
                        <button
                          onClick={() => handleSchedulePost(item.platform)}
                          disabled={scheduling || !item.scheduledTime}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {scheduling ? 'Scheduling...' : 'Schedule'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </DashboardLayout>
  )
}
