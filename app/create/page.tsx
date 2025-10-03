'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  const router = useRouter()

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
      const { data: { user } } = await supabase.auth.getUser()

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to schedule post')
      }

      toast.success(`Post scheduled for ${platform}!`, { id: loadingToast })
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule post. Please try again.', { id: loadingToast })
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

    const loadingToast = toast.loading('Adapting content for platforms...')

    try {
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

      if (!response.ok) {
        throw new Error('Failed to adapt content')
      }

      const data = await response.json()
      setAdaptedContent(data.adaptedContent)
      toast.success('Content adapted successfully!', { id: loadingToast })
    } catch (error: any) {
      toast.error(error.message || 'Failed to adapt content. Please try again.', { id: loadingToast })
    } finally {
      setAdapting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            Repurpose
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="mt-2 text-sm text-gray-500">
                {originalContent.length} characters
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

            <button
              onClick={handleAdaptContent}
              disabled={adapting || !originalContent.trim() || selectedPlatforms.length === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adapting ? 'Adapting...' : 'Adapt Content'}
            </button>
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
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{item.content}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      {item.content.length} characters
                    </div>

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
                          min={new Date().toISOString().slice(0, 16)}
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
      </main>
    </div>
  )
}
