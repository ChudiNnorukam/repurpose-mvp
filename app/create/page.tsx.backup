'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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

type ScheduleState = 'idle' | 'loading' | 'success' | 'error'

interface ScheduleRunMeta {
  timestamp: string
  message: string
  code?: string
  traceId?: string | null
}

interface ScheduleFeedback {
  state: ScheduleState
  lastRun?: ScheduleRunMeta
}

type ScheduleFeedbackMap = Record<Platform, ScheduleFeedback>

interface ScheduleErrorState {
  platform: Platform
  message: string
  code?: string
  field?: string
  details?: string
  traceId?: string | null
  status: number
}

interface ScheduleSuccessState {
  platform: Platform
  message: string
  traceId?: string | null
}

const INITIAL_FEEDBACK: ScheduleFeedbackMap = {
  twitter: { state: 'idle' },
  linkedin: { state: 'idle' },
  instagram: { state: 'idle' },
}

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleString()
}

function DetailedErrorBanner({
  error,
  onDismiss,
}: {
  error: ScheduleErrorState
  onDismiss: () => void
}) {
  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            Failed to schedule {error.platform} post
          </p>
          <p className="mt-1 text-red-700">{error.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="rounded border border-red-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-red-600 hover:bg-red-100"
        >
          Dismiss
        </button>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {error.code && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Error Code
            </dt>
            <dd className="mt-0.5 font-mono text-xs">{error.code}</dd>
          </div>
        )}
        {error.field && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Field
            </dt>
            <dd className="mt-0.5 text-xs">{error.field}</dd>
          </div>
        )}
        {error.status && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-red-500">
              HTTP Status
            </dt>
            <dd className="mt-0.5 text-xs">{error.status}</dd>
          </div>
        )}
        {error.traceId && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Trace ID
            </dt>
            <dd className="mt-0.5 break-all font-mono text-xs">{error.traceId}</dd>
          </div>
        )}
      </dl>

      {error.details && (
        <div className="mt-3 rounded bg-white/70 p-3 font-mono text-xs text-red-700">
          {error.details}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {error.traceId && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(error.traceId!)
              toast.success('Trace ID copied to clipboard')
            }}
            className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Copy Trace ID
          </button>
        )}
        {error.details && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(error.details!)
              toast.success('Error details copied')
            }}
            className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Copy Details
          </button>
        )}
        <Link
          href="/settings/connections"
          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          Manage Connections
        </Link>
      </div>
    </div>
  )
}

function SuccessBanner({
  success,
  onDismiss,
}: {
  success: ScheduleSuccessState
  onDismiss: () => void
}) {
  return (
    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            Scheduled {success.platform} post successfully
          </p>
          <p className="mt-1 text-green-700">{success.message}</p>
          {success.traceId && (
            <p className="mt-2 text-xs text-green-600">
              Trace ID:{' '}
              <span className="font-mono">{success.traceId}</span>
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="rounded border border-green-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-green-700 hover:bg-green-100"
        >
          Dismiss
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Link
          href="/posts?filter=scheduled"
          className="rounded border border-green-200 px-3 py-1 font-medium text-green-700 hover:bg-green-100"
        >
          View scheduled posts
        </Link>
        {success.traceId && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(success.traceId!)
              toast.success('Trace ID copied to clipboard')
            }}
            className="rounded border border-green-200 px-3 py-1 font-medium text-green-700 hover:bg-green-100"
          >
            Copy Trace ID
          </button>
        )}
      </div>
    </div>
  )
}

function ScheduleStatusPill({ state }: { state: ScheduleState }) {
  const labelMap: Record<ScheduleState, { label: string; classes: string }> = {
    idle: { label: 'Idle', classes: 'bg-gray-100 text-gray-600' },
    loading: { label: 'Scheduling…', classes: 'bg-blue-100 text-blue-700' },
    success: { label: 'Success', classes: 'bg-green-100 text-green-700' },
    error: { label: 'Error', classes: 'bg-red-100 text-red-700' },
  }

  const { label, classes } = labelMap[state]

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  )
}

export default function CreatePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adapting, setAdapting] = useState(false)
  const [adaptProgress, setAdaptProgress] = useState(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin'])
  const [adaptedContent, setAdaptedContent] = useState<AdaptedContent[]>([])
  const [scheduleFeedback, setScheduleFeedback] = useState<ScheduleFeedbackMap>(INITIAL_FEEDBACK)
  const [activeError, setActiveError] = useState<ScheduleErrorState | null>(null)
  const [activeSuccess, setActiveSuccess] = useState<ScheduleSuccessState | null>(null)

  const [originalContent, setOriginalContent] = useState('')
  const [tone, setTone] = useState<Tone>('professional')

  const router = useRouter()
  const supabase = createClient()

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

  const updateScheduleFeedback = useCallback(
    (platform: Platform, updater: (prev: ScheduleFeedback) => ScheduleFeedback) => {
      setScheduleFeedback((prev) => ({
        ...prev,
        [platform]: updater(prev[platform]),
      }))
    },
    [],
  )

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

  const handleSchedulePost = useCallback(async (platform: Platform) => {
    const post = adaptedContent.find(item => item.platform === platform)
    if (!post || !post.scheduledTime) {
      toast.error('Please select a date and time')
      return
    }

    if (!user) {
      toast.error('Session expired. Please log in again.')
      router.push('/login')
      return
    }

    setActiveError(null)
    setActiveSuccess(null)

    const loadingToast = toast.loading(`Scheduling ${platform} post...`)
    updateScheduleFeedback(platform, () => ({
      state: 'loading',
      lastRun: {
        timestamp: new Date().toISOString(),
        message: 'Submitting schedule request…',
      },
    }))

    try {
      const localDateTime = new Date(post.scheduledTime)
      const isoString = localDateTime.toISOString()

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
          metadata: {
            timezoneOffsetMinutes: localDateTime.getTimezoneOffset() * -1,
            requestSource: 'create-page',
          },
        }),
      })

      const traceId = response.headers.get('x-trace-id')
      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to schedule post. Please try again.'

        toast.error(errorMessage, {
          id: loadingToast,
          duration: 5000,
        })

        if (response.status >= 500) {
          setTimeout(() => {
            toast.error('If this persists, please contact support with the trace ID from the error banner.', {
              duration: 5000,
            })
          }, 1200)
        }

        const errorState: ScheduleErrorState = {
          platform,
          message: errorMessage,
          code: data.code,
          field: data.field,
          details: data.details,
          traceId,
          status: response.status,
        }
        setActiveError(errorState)

        updateScheduleFeedback(platform, () => ({
          state: 'error',
          lastRun: {
            timestamp: new Date().toISOString(),
            message: errorMessage,
            code: data.code,
            traceId,
          },
        }))

        return
      }

      toast.success(
        data.message || `Post scheduled for ${platform}!`,
        { id: loadingToast },
      )

      setAdaptedContent(prev =>
        prev.map(item =>
          item.platform === platform ? { ...item, scheduledTime: undefined } : item
        )
      )

      const successState: ScheduleSuccessState = {
        platform,
        message: data.message || `Post scheduled for ${platform}!`,
        traceId,
      }

      setActiveSuccess(successState)
      updateScheduleFeedback(platform, () => ({
        state: 'success',
        lastRun: {
          timestamp: new Date().toISOString(),
          message: successState.message,
          traceId,
        },
      }))
    } catch (error: any) {
      console.error('❌ Exception during schedule request:', error)

      const genericMessage = error.message || 'An unexpected error occurred. Please try again.'

      toast.error(genericMessage, { id: loadingToast })

      const errorState: ScheduleErrorState = {
        platform,
        message: genericMessage,
        status: 0,
      }

      setActiveError(errorState)
      updateScheduleFeedback(platform, () => ({
        state: 'error',
        lastRun: {
          timestamp: new Date().toISOString(),
          message: genericMessage,
        },
      }))
    }
  }, [adaptedContent, originalContent, router, updateScheduleFeedback, user])

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
    setActiveError(null)
    setActiveSuccess(null)

    const loadingToast = toast.loading('Adapting content for platforms...')

    try {
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
        const errorMessage = await response.text()
        throw new Error(errorMessage || 'Failed to adapt content')
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

    if (!user) {
      toast.error('Session expired. Please log in again.')
      router.push('/login')
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

      setOriginalContent('')
      setAdaptedContent([])
      router.push('/posts?filter=draft')
    } catch (error: any) {
      console.error('Error saving drafts:', error)
      toast.error(error.message || 'Failed to save drafts', { id: loadingToast })
    }
  }

  const hasAdaptedContent = adaptedContent.length > 0
  const anySchedulingLoading = useMemo(
    () => Object.values(scheduleFeedback).some(item => item.state === 'loading'),
    [scheduleFeedback],
  )

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

      {activeError && (
        <DetailedErrorBanner
          error={activeError}
          onDismiss={() => setActiveError(null)}
        />
      )}

      {activeSuccess && (
        <SuccessBanner
          success={activeSuccess}
          onDismiss={() => setActiveSuccess(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
              Original Content
            </label>
            <textarea
              id="content"
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Enter your content here... Share your thoughts, ideas, or message that you want to repurpose across platforms."
            />
            <div className="mt-3">
              <CharacterCounter content={originalContent} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Platforms
            </label>
            <div className="space-y-3">
              {(['twitter', 'linkedin'] as Platform[]).map((platform) => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    {PLATFORM_LIMITS[platform].name} ({PLATFORM_LIMITS[platform].maxLength} characters)
                  </span>
                </label>
              ))}
              <label className="flex items-center opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-500">
                  Instagram (Coming soon)
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={handleAdaptContent}
              disabled={adapting || !originalContent.trim() || selectedPlatforms.length === 0}
              loading={adapting}
              loadingText="Adapting content..."
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          {hasAdaptedContent && (
            <button
              onClick={handleSaveDraft}
              className="mt-3 flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save as Draft
            </button>
          )}
        </div>

        {/* Results Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Adapted Content
          </h3>
          {!hasAdaptedContent ? (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
              <p>Your adapted content will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adaptedContent.map((item) => {
                const feedback = scheduleFeedback[item.platform]
                const isLoading = feedback.state === 'loading'
                const minDate = (() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const month = String(now.getMonth() + 1).padStart(2, '0')
                  const day = String(now.getDate()).padStart(2, '0')
                  const hours = String(now.getHours()).padStart(2, '0')
                  const minutes = String(now.getMinutes()).padStart(2, '0')
                  return `${year}-${month}-${day}T${hours}:${minutes}`
                })()

                return (
                  <div key={item.platform} className="rounded-lg bg-white p-6 shadow">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold capitalize text-gray-900">
                          {item.platform}
                        </h4>
                        <div className="mt-1 text-xs text-gray-500">
                          Limit: {PLATFORM_LIMITS[item.platform].maxLength} characters
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {feedback.lastRun && (
                          <div className="text-right text-xs text-gray-500">
                            <p className="font-medium text-gray-600">Last attempt</p>
                            <p>{formatTimestamp(feedback.lastRun.timestamp)}</p>
                            <p className="truncate">{feedback.lastRun.message}</p>
                          </div>
                        )}
                        <ScheduleStatusPill state={feedback.state} />
                      </div>
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
                      className="mb-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                    <div className="mb-4">
                      <CharacterCounter content={item.content} platform={item.platform as PlatformType} />
                    </div>

                    <div className="border-t pt-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Schedule for later
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                          type="datetime-local"
                          value={item.scheduledTime || ''}
                          onChange={(e) => updateScheduledTime(item.platform, e.target.value)}
                          className="w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          min={minDate}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const now = new Date()
                              now.setMinutes(now.getMinutes() + 2)
                              updateScheduledTime(item.platform, now.toISOString().slice(0, 16))
                            }}
                            className="rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            +2 min
                          </button>
                          <button
                            onClick={() => handleSchedulePost(item.platform)}
                            disabled={isLoading || !item.scheduledTime || anySchedulingLoading}
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? 'Scheduling…' : 'Schedule'}
                          </button>
                        </div>
                      </div>
                      {feedback.lastRun?.traceId && (
                        <p className="mt-2 text-xs text-gray-500">
                          Trace ID: <span className="font-mono">{feedback.lastRun.traceId}</span>
                        </p>
                      )}
                      {feedback.lastRun?.code && (
                        <p className="mt-1 text-xs text-gray-500">
                          Error code: <span className="font-mono">{feedback.lastRun.code}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
