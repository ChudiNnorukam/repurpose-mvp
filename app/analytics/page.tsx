'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  platform: string
  content: string
  status: string
  scheduled_at: string
  posted_at: string | null
  created_at: string
}

interface Analytics {
  totalPosts: number
  postedCount: number
  scheduledCount: number
  failedCount: number
  platformBreakdown: { [key: string]: number }
  recentPosts: Post[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dateRange, setDateRange] = useState('7') // days

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchAnalytics()
  }, [dateRange])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate date threshold
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange))

      // Fetch all posts in date range
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate analytics
      const totalPosts = posts?.length || 0
      const postedCount = posts?.filter(p => p.status === 'posted').length || 0
      const scheduledCount = posts?.filter(p => p.status === 'scheduled').length || 0
      const failedCount = posts?.filter(p => p.status === 'failed').length || 0

      // Platform breakdown
      const platformBreakdown: { [key: string]: number } = {}
      posts?.forEach(post => {
        platformBreakdown[post.platform] = (platformBreakdown[post.platform] || 0) + 1
      })

      setAnalytics({
        totalPosts,
        postedCount,
        scheduledCount,
        failedCount,
        platformBreakdown,
        recentPosts: posts?.slice(0, 10) || [],
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getSuccessRate = () => {
    if (!analytics || analytics.totalPosts === 0) return 0
    return Math.round((analytics.postedCount / analytics.totalPosts) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Repurpose</h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/create" className="text-gray-600 hover:text-gray-900">Create</Link>
              <Link href="/posts" className="text-gray-600 hover:text-gray-900">Posts</Link>
              <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
              <Link href="/analytics" className="text-gray-900 font-semibold">Analytics</Link>
              <Link href="/connections" className="text-gray-600 hover:text-gray-900">Connections</Link>
              <button onClick={handleSignOut} className="text-gray-600 hover:text-gray-900">Sign Out</button>
            </nav>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <Link href="/dashboard" className="block py-2 text-gray-600">Dashboard</Link>
              <Link href="/create" className="block py-2 text-gray-600">Create</Link>
              <Link href="/posts" className="block py-2 text-gray-600">Posts</Link>
              <Link href="/templates" className="block py-2 text-gray-600">Templates</Link>
              <Link href="/analytics" className="block py-2 text-gray-900 font-semibold">Analytics</Link>
              <Link href="/connections" className="block py-2 text-gray-600">Connections</Link>
              <button onClick={handleSignOut} className="block py-2 text-gray-600 w-full text-left">Sign Out</button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-600 mt-1">Track your content performance and posting activity</p>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : !analytics ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No data available</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalPosts}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Posted</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.postedCount}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.scheduledCount}</p>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{getSuccessRate()}%</p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {platform === 'twitter' ? '🐦' : platform === 'linkedin' ? '💼' : '📱'}
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{platform}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">
                        {analytics.totalPosts > 0 ? Math.round((count / analytics.totalPosts) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            {analytics.failedCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Failed Posts</h3>
                <p className="text-red-700 mb-4">
                  {analytics.failedCount} post{analytics.failedCount > 1 ? 's' : ''} failed to publish.
                  <Link href="/posts?filter=failed" className="ml-2 underline font-semibold">
                    View and retry →
                  </Link>
                </p>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {analytics.recentPosts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No recent posts</p>
                ) : (
                  analytics.recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold capitalize px-2 py-1 bg-white rounded">
                            {post.platform === 'twitter' ? '🐦 Twitter' : '💼 LinkedIn'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            post.status === 'posted' ? 'bg-green-100 text-green-800' :
                            post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {post.status === 'posted' && post.posted_at
                            ? `Posted: ${new Date(post.posted_at).toLocaleString()}`
                            : post.status === 'scheduled'
                            ? `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`
                            : `Created: ${new Date(post.created_at).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {analytics.recentPosts.length > 0 && (
                <div className="mt-6 text-center">
                  <Link href="/posts" className="text-blue-600 hover:text-blue-700 font-semibold">
                    View all posts →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/create"
                className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                <p className="text-2xl mb-2">✍️</p>
                <p className="font-semibold">Create New Post</p>
              </Link>

              <Link
                href="/templates"
                className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700 transition-colors"
              >
                <p className="text-2xl mb-2">📝</p>
                <p className="font-semibold">Manage Templates</p>
              </Link>

              <Link
                href="/posts"
                className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700 transition-colors"
              >
                <p className="text-2xl mb-2">📋</p>
                <p className="font-semibold">View All Posts</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
