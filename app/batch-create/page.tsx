'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoadingButton, ProgressBar } from '@/components/ui/loading'
import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_AI, BUTTON_VARIANTS } from '@/lib/design-tokens'
import { CharacterCounter } from '@/components/ui/character-counter'
import { PLATFORM_LIMITS, Platform as PlatformType } from '@/lib/constants'
import { AlertCircle, RefreshCw } from 'lucide-react'

type Platform = 'twitter' | 'linkedin'

interface BatchPost {
  id: string
  platform: Platform
  content: string
  scheduledTime: string
  topic?: string
  status?: 'pending' | 'scheduled' | 'failed'
  error?: string
}

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (error.message?.includes('400') || error.message?.includes('401')) {
        throw error
      }
      
      // Wait with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
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
  const [failedPosts, setFailedPosts] = useState<BatchPost[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  // Load saved draft on mount
  useEffect(() => {
    checkUser()
    loadDraft()
  }, [])

  // Save draft whenever generated posts change
  useEffect(() => {
    if (generatedPosts.length > 0) {
      saveDraft()
    }
  }, [generatedPosts])

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

  const saveDraft = () => {
    try {
      localStorage.setItem('batch-create-draft', JSON.stringify({
        theme,
        topicsList,
        numPosts,
        selectedPlatforms,
        generatedPosts,
        savedAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('batch-create-draft')
      if (draft) {
        const parsed = JSON.parse(draft)
        const savedAt = new Date(parsed.savedAt)
        const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60)
        
        // Only load if saved within last 24 hours
        if (hoursSinceSave < 24) {
          setTheme(parsed.theme || '')
          setTopicsList(parsed.topicsList || '')
          setNumPosts(parsed.numPosts || 30)
          setSelectedPlatforms(parsed.selectedPlatforms || ['twitter', 'linkedin'])
          setGeneratedPosts(parsed.generatedPosts || [])
          
          if (parsed.generatedPosts?.length > 0) {
            toast.success('Restored your previous draft')
          }
        } else {
          // Clear old draft
          localStorage.removeItem('batch-create-draft')
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
  }

  const clearDraft = () => {
    try {
      localStorage.removeItem('batch-create-draft')
    } catch (error) {
      console.error('Error clearing draft:', error)
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
    setFailedPosts([])

    const loadingToast = toast.loading('Generating your content batch...')

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90))
      }, 500)

      const topics = topicsList.trim() 
        ? topicsList.split('\n').filter(t => t.trim()).map(t => t.trim())
        : []

      // Use retry logic for generation
      const response = await retryWithBackoff(async () => {
        const res = await fetch('/api/batch/generate', {
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
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to generate content')
        }
        
        return res
      }, 3, 2000) // 3 retries with 2s base delay

      clearInterval(progressInterval)
      setGenerationProgress(100)

      const data = await response.json()
      const posts = (data.posts || []).map((post: BatchPost) => ({
        ...post,
        status: 'pending' as const
      }))
      
      setGeneratedPosts(posts)
      
      toast.success(
        `Generated ${posts.length} posts across ${selectedPlatforms.length} platform(s)!`,
        { id: loadingToast }
      )
    } catch (error: any) {
      console.error('Generation error:', error)
      const errorMessage = error.message || 'Failed to generate content'
      
      toast.error(
        <div>
          <p className="font-medium">{errorMessage}</p>
          <p className="text-xs mt-1">Click "Generate" to try again</p>
        </div>,
        { id: loadingToast, duration: 5000 }
      )
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

    const pendingPosts = generatedPosts.filter(p => p.status !== 'scheduled')
    if (pendingPosts.length === 0) {
      toast.error('All posts are already scheduled')
      return
    }

    setScheduling(true)
    setSchedulingProgress(0)
    setFailedPosts([])

    const loadingToast = toast.loading(`Scheduling ${pendingPosts.length} posts...`)

    try {
      const progressInterval = setInterval(() => {
        setSchedulingProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      // Use retry logic for scheduling
      const response = await retryWithBackoff(async () => {
        const res = await fetch('/api/batch/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            posts: pendingPosts,
            userId: user.id,
          }),
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to schedule posts')
        }
        
        return res
      }, 3, 2000) // 3 retries with 2s base delay

      clearInterval(progressInterval)
      setSchedulingProgress(100)

      const data = await response.json()
      
      // Handle partial failures
      const scheduledCount = data.scheduledCount || 0
      const failedCount = data.failedCount || 0
      const failedPostIds = new Set(data.failedPosts?.map((p: any) => p.id) || [])
      
      // Update post statuses
      setGeneratedPosts(prev => prev.map(post => {
        if (failedPostIds.has(post.id)) {
          return { ...post, status: 'failed' as const, error: data.failedPosts?.find((p: any) => p.id === post.id)?.error }
        } else if (post.status === 'pending') {
          return { ...post, status: 'scheduled' as const }
        }
        return post
      }))
      
      // Track failed posts for retry
      if (data.failedPosts?.length > 0) {
        setFailedPosts(data.failedPosts)
      }
      
      if (failedCount === 0) {
        toast.success(
          `Successfully scheduled all ${scheduledCount} post(s)!`,
          { id: loadingToast }
        )
        
        // Clear form and posts after full success
        clearDraft()
        setTimeout(() => {
          setTheme('')
          setTopicsList('')
          setNumPosts(30)
          setGeneratedPosts([])
          router.push('/posts?filter=scheduled')
        }, 1000)
      } else {
        toast.error(
          <div>
            <p className="font-medium">Partial success: {scheduledCount} scheduled, {failedCount} failed</p>
            <p className="text-xs mt-1">Scroll down to retry failed posts</p>
          </div>,
          { id: loadingToast, duration: 7000 }
        )
      }
    } catch (error: any) {
      console.error('Scheduling error:', error)
      const errorMessage = error.message || 'Failed to schedule posts'
      
      toast.error(
        <div>
          <p className="font-medium">{errorMessage}</p>
          <p className="text-xs mt-1">Your posts are saved. Click "Schedule All" to try again.</p>
        </div>,
        { id: loadingToast, duration: 7000 }
      )
    } finally {
      setTimeout(() => {
        setScheduling(false)
        setSchedulingProgress(0)
      }, 300)
    }
  }

  const retryFailedPost = async (postId: string) => {
    const post = generatedPosts.find(p => p.id === postId)
    if (!post) return
    
    const retryToast = toast.loading(`Retrying post...`)
    
    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch('/api/batch/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            posts: [post],
            userId: user.id,
          }),
        })
        
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to schedule post')
        }
        
        return res
      }, 3, 1000)
      
      const data = await response.json()
      
      if (data.scheduledCount > 0) {
        setGeneratedPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, status: 'scheduled' as const, error: undefined } : p
        ))
        setFailedPosts(prev => prev.filter(p => p.id !== postId))
        toast.success('Post scheduled successfully!', { id: retryToast })
      } else {
        throw new Error('Failed to schedule post')
      }
    } catch (error: any) {
      toast.error(error.message || 'Retry failed', { id: retryToast })
    }
  }

  const updatePostContent = (id: string, newContent: string) => {
    setGeneratedPosts(prev =>
      prev.map(post => post.id === id ? { ...post, content: newContent } : post)
    )
  }

  const deletePost = (id: string) => {
    setGeneratedPosts(prev => prev.filter(post => post.id !== id))
    setFailedPosts(prev => prev.filter(post => post.id !== id))
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
  const scheduledCount = generatedPosts.filter(p => p.status === 'scheduled').length
  const failedCount = generatedPosts.filter(p => p.status === 'failed').length
  const pendingCount = generatedPosts.filter(p => p.status === 'pending').length

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

      {failedCount > 0 && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4" role="alert" aria-live="polite" aria-atomic="true">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-900">
                {failedCount} post{failedCount > 1 ? 's' : ''} failed to schedule
              </p>
              <p className="text-sm text-red-700 mt-1">
                Posts are saved automatically. Scroll down to retry individual posts or click "Schedule All" to retry everything.
              </p>
            </div>
          </div>
        </div>
      )}

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

          {hasGeneratedPosts && pendingCount > 0 && (
            <>
              <LoadingButton
                onClick={handleBulkSchedule}
                disabled={scheduling || generating}
                loading={scheduling}
                loadingText="Scheduling posts..."
                className={`w-full ${BUTTON_VARIANTS.success}`}
              >
                Schedule {pendingCount === generatedPosts.length ? 'All' : 'Remaining'} {pendingCount} Post{pendingCount > 1 ? 's' : ''}
              </LoadingButton>

              {scheduling && schedulingProgress > 0 && (
                <ProgressBar
                  progress={schedulingProgress}
                  message={`Scheduling ${pendingCount} posts at optimal times...`}
                />
              )}
            </>
          )}

          {hasGeneratedPosts && (
            <div className="rounded-lg bg-blue-50 p-4 text-sm">
              <p className="font-semibold text-gray-900 mb-2">📊 Status Summary</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Total posts: {generatedPosts.length}</li>
                <li>• ✅ Scheduled: {scheduledCount}</li>
                <li>• ⏳ Pending: {pendingCount}</li>
                {failedCount > 0 && <li className="text-red-700 font-medium">• ❌ Failed: {failedCount}</li>}
              </ul>
            </div>
          )}

          {hasGeneratedPosts && (
            <div className={`rounded-lg ${COLOR_AI.bgLight} p-4 text-sm`}>
              <p className="font-semibold text-gray-900 mb-2">📅 Scheduling Strategy</p>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>• Twitter: Posts at 9 AM, 12 PM, 3 PM, 6 PM (weekdays)</li>
                <li>• LinkedIn: Posts at 7:30 AM, 12 PM, 5:30 PM (weekdays only)</li>
                <li>• Spread evenly across {Math.ceil(numPosts / 4)} days for variety</li>
                <li>• Draft auto-saved (valid for 24 hours)</li>
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
                <div 
                  key={post.id} 
                  className={`rounded-lg bg-white p-5 shadow hover:shadow-md transition-shadow ${
                    post.status === 'failed' ? 'border-2 border-red-300' : ''
                  }`}
                >
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
                        {post.status === 'scheduled' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                            ✓ Scheduled
                          </span>
                        )}
                        {post.status === 'failed' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">
                            ✗ Failed
                          </span>
                        )}
                      </div>
                      {post.topic && (
                        <p className="text-xs text-gray-600 italic">Topic: {post.topic}</p>
                      )}
                      {post.error && (
                        <p className="text-xs text-red-600 mt-1" role="alert">Error: {post.error}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {post.status === 'failed' && (
                        <button
                          onClick={() => retryFailedPost(post.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          disabled={scheduling}
                          title="Retry this post"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                        disabled={scheduling}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={post.content}
                    onChange={(e) => updatePostContent(post.id, e.target.value)}
                    rows={4}
                    className="w-full mb-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={scheduling || post.status === 'scheduled'}
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
