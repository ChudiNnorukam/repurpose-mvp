'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoadingButton, ProgressBar } from '@/components/ui/loading'
import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_AI, BUTTON_VARIANTS } from '@/lib/design-tokens'
import { CharacterCounter } from '@/components/ui/character-counter'
import { PLATFORM_LIMITS, Platform as PlatformType } from '@/lib/constants'

type Platform = 'twitter' | 'linkedin'

interface BatchPost {
  id: string
  platform: Platform
  content: string
  scheduledTime: string
  topic?: string
}

export default function BatchCreatePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [theme, setTheme] = useState('')
  const [topicsList, setTopicsList] = useState('')
  const [numPosts, setNumPosts] = useState(30)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'linkedin'])
  
  // Generation state
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedPosts, setGeneratedPosts] = useState<BatchPost[]>([])
  
  // Scheduling state
  const [scheduling, setScheduling] = useState(false)
  const [schedulingProgress, setSchedulingProgress] = useState(0)
  
  const router = useRouter()
  const supabase = createClient()

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

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Please enter a theme for your content')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setGenerating(true)
    setGenerationProgress(0)
    setGeneratedPosts([])

    const loadingToast = toast.loading('Generating your content batch...')

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90))
      }, 500)

      const topics = topicsList.trim() 
        ? topicsList.split('\n').filter(t => t.trim()).map(t => t.trim())
        : []

      const response = await fetch('/api/batch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          topics: topics.length > 0 ? topics : undefined,
          numPosts,
          platforms: selectedPlatforms,
          userId: user.id,
        }),
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedPosts(data.posts || [])
      
      toast.success(
        `Generated ${data.posts?.length || 0} posts across ${selectedPlatforms.length} platform(s)!`,
        { id: loadingToast }
      )
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate content', { id: loadingToast })
    } finally {
      setTimeout(() => {
        setGenerating(false)
        setGenerationProgress(0)
      }, 300)
    }
  }

  const handleBulkSchedule = async () => {
    if (generatedPosts.length === 0) {
      toast.error('No posts to schedule')
      return
    }

    setScheduling(true)
    setSchedulingProgress(0)

    const loadingToast = toast.loading(`Scheduling ${generatedPosts.length} posts...`)

    try {
      const progressInterval = setInterval(() => {
        setSchedulingProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      const response = await fetch('/api/batch/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          posts: generatedPosts,
          userId: user.id,
        }),
      })

      clearInterval(progressInterval)
      setSchedulingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to schedule posts')
      }

      const data = await response.json()
      
      toast.success(
        `Successfully scheduled ${data.scheduledCount || 0} post(s)!`,
        { id: loadingToast }
      )

      // Clear form and posts after successful scheduling
      setTheme('')
      setTopicsList('')
      setNumPosts(30)
      setGeneratedPosts([])
      
      // Redirect to posts page
      router.push('/posts?filter=scheduled')
    } catch (error: any) {
      console.error('Scheduling error:', error)
      toast.error(error.message || 'Failed to schedule posts', { id: loadingToast })
    } finally {
      setTimeout(() => {
        setScheduling(false)
        setSchedulingProgress(0)
      }, 300)
    }
  }

  const updatePostContent = (id: string, newContent: string) => {
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, content: newContent } : post)
    )
  }

  const deletePost = (id: string) => {
    setGeneratedPosts(prev => prev.filter(post => post.id !== id))
    toast.success('Post removed')
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

  const hasGeneratedPosts = generatedPosts.length > 0

  return (
    <DashboardLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Batch Create</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">NEW</span>
        </div>
        <p className="text-gray-600">
          Generate 30 days of content at once with AI-powered themes and topics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <label htmlFor="theme" className="mb-2 block text-sm font-medium text-gray-700">
              Content Theme <span className="text-red-500">*</span>
            </label>
            <input
              id="theme"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="e.g., 'Productivity tips for remote workers'"
              disabled={generating || scheduling}
            />
            <p className="mt-2 text-xs text-gray-500">
              The main theme or topic area for your content series
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <label htmlFor="topics" className="mb-2 block text-sm font-medium text-gray-700">
              Specific Topics <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              id="topics"
              value={topicsList}
              onChange={(e) => setTopicsList(e.target.value)}
              rows={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Time management techniques&#10;Setting boundaries with colleagues&#10;Creating a morning routine&#10;Avoiding burnout"
              disabled={generating || scheduling}
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter one topic per line. If left empty, AI will generate topics from your theme.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <label htmlFor="numPosts" className="mb-2 block text-sm font-medium text-gray-700">
              Number of Posts per Platform
            </label>
            <input
              id="numPosts"
              type="number"
              min="1"
              max="90"
              value={numPosts}
              onChange={(e) => setNumPosts(Math.min(90, Math.max(1, parseInt(e.target.value) || 30)))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={generating || scheduling}
            />
            <p className="mt-2 text-xs text-gray-500">
              Generate 1-90 posts per platform. With 2 platforms, 30 posts = 60 total posts.
            </p>
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
                    disabled={generating || scheduling}
                  />
                  <span className="ml-3 text-gray-700">
                    {PLATFORM_LIMITS[platform].name} ({PLATFORM_LIMITS[platform].maxLength} characters)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={handleGenerate}
              disabled={generating || scheduling || !theme.trim() || selectedPlatforms.length === 0}
              loading={generating}
              loadingText="Generating content..."
              className={`w-full ${BUTTON_VARIANTS.primary}`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className={COLOR_AI.text}>✨</span>
                Generate {numPosts * selectedPlatforms.length} Posts
              </span>
            </LoadingButton>

            {generating && generationProgress > 0 && (
              <ProgressBar
                progress={generationProgress}
                message={`Generating ${numPosts * selectedPlatforms.length} posts with AI...`}
              />
            )}
          </div>

          {hasGeneratedPosts && (
            <>
              <LoadingButton
                onClick={handleBulkSchedule}
                disabled={scheduling || generating}
                loading={scheduling}
                loadingText="Scheduling posts..."
                className={`w-full ${BUTTON_VARIANTS.success}`}
              >
                Schedule All {generatedPosts.length} Posts
              </LoadingButton>

              {scheduling && schedulingProgress > 0 && (
                <ProgressBar
                  progress={schedulingProgress}
                  message={`Scheduling ${generatedPosts.length} posts at optimal times...`}
                />
              )}
            </>
          )}

          {hasGeneratedPosts && (
            <div className={`rounded-lg ${COLOR_AI.bgLight} p-4 text-sm`}>
              <p className="font-semibold text-gray-900 mb-2">📅 Scheduling Strategy</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Twitter: Posts at 9 AM, 12 PM, 3 PM, 6 PM (weekdays)</li>
                <li>• LinkedIn: Posts at 7:30 AM, 12 PM, 5:30 PM (weekdays only)</li>
                <li>• Spread evenly across {Math.ceil(numPosts / 4)} days for variety</li>
              </ul>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Posts
              {hasGeneratedPosts && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({generatedPosts.length} posts)
                </span>
              )}
            </h3>
          </div>

          {!hasGeneratedPosts ? (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
              <div className="mb-4 text-4xl">📝</div>
              <p className="font-medium mb-2">No posts generated yet</p>
              <p className="text-sm">Fill in the form and click "Generate Posts" to create your content batch</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {generatedPosts.map((post, index) => (
                <div key={post.id} className="rounded-lg bg-white p-5 shadow hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          post.platform === 'twitter' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {PLATFORM_LIMITS[post.platform].name}
                        </span>
                      </div>
                      {post.topic && (
                        <p className="text-xs text-gray-600 italic">Topic: {post.topic}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                      disabled={scheduling}
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    value={post.content}
                    onChange={(e) => updatePostContent(post.id, e.target.value)}
                    rows={4}
                    className="w-full mb-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={scheduling}
                  />

                  <div className="flex justify-between items-center text-xs">
                    <CharacterCounter 
                      content={post.content} 
                      platform={post.platform as PlatformType} 
                    />
                    <span className="text-gray-500">
                      📅 {new Date(post.scheduledTime).toLocaleDateString()} at {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
