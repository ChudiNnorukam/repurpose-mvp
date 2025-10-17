'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { COLOR_PRIMARY, COLOR_AI, BUTTON_VARIANTS } from '@/lib/design-tokens'
import { CalendarFilters } from '@/components/calendar/CalendarFilters'
import { CalendarPost } from '@/components/calendar/CalendarPost'
import { DayDetailModal } from '@/components/calendar/DayDetailModal'


interface Post {
  id: string
  platform: string
  adapted_content: string
  scheduled_time: string
  status: string
  created_at: string
  qstash_message_id: string | null
  tone: string | null
}

interface SocialAccount {
  platform: string
}

interface FiltersState {
  platforms: string[]
  status: string
  search: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [filters, setFilters] = useState<FiltersState>({
    platforms: ['twitter', 'linkedin', 'instagram'],
    status: 'all',
    search: ''
  })
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
      await loadDashboardData(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async (userId: string) => {
    // Load ALL posts (removed .limit(10))
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: true })

    if (postsData) {
      setPosts(postsData)
    }

    // Load connected accounts
    const { data: accountsData } = await supabase
      .from('social_accounts')
      .select('platform')
      .eq('user_id', userId)

    if (accountsData) {
      setConnectedAccounts(accountsData)
    }
  }

  // Apply filters with memoization
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Platform filter
      if (!filters.platforms.includes(post.platform)) return false
      
      // Status filter
      if (filters.status !== 'all' && post.status !== filters.status) return false
      
      // Search filter
      if (filters.search && !post.adapted_content.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [posts, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'text-green-600 bg-green-50'
      case 'scheduled':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getPostsForDay = (day: Date | null) => {
    if (!day) return []
    return filteredPosts.filter(post => {
      const postDate = new Date(post.scheduled_time || post.created_at)
      return (
        postDate.getDate() === day.getDate() &&
        postDate.getMonth() === day.getMonth() &&
        postDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const isToday = (day: Date | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + offset)
      return newDate
    })
  }

  const handleDayKeyDown = (e: React.KeyboardEvent, index: number) => {
    const days = getDaysInMonth(currentMonth)
    let nextIndex = index

    switch (e.key) {
      case "ArrowRight":
        nextIndex = Math.min(index + 1, days.length - 1)
        e.preventDefault()
        break
      case "ArrowLeft":
        nextIndex = Math.max(index - 1, 0)
        e.preventDefault()
        break
      case "ArrowDown":
        nextIndex = Math.min(index + 7, days.length - 1)
        e.preventDefault()
        break
      case "ArrowUp":
        nextIndex = Math.max(index - 7, 0)
        e.preventDefault()
        break
      case "Home":
        nextIndex = 0
        e.preventDefault()
        break
      case "End":
        nextIndex = days.length - 1
        e.preventDefault()
        break
      default:
        return
    }

    const calendarCells = document.querySelectorAll("[data-calendar-day]")
    const nextCell = calendarCells[nextIndex] as HTMLButtonElement
    nextCell?.focus()
  }

  const handleDayClick = (day: Date | null) => {
    if (day) {
      setSelectedDay(day)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : []

  return (
    <DashboardLayout user={user}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Welcome back! Ready to repurpose some content?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{posts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Scheduled</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {posts.filter(p => p.status === 'scheduled').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Connected Accounts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{connectedAccounts.length}</p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Previous month"
              >
                ←
              </button>
              <span className="text-sm font-medium text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-md"
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>

          {/* Filters */}
          <CalendarFilters filters={filters} onChange={setFilters} />

          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth(currentMonth).map((day, index) => {
              const dayPosts = getPostsForDay(day)

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleDayKeyDown(e, index)}
                  data-calendar-day
                  tabIndex={day ? 0 : -1}
                  aria-label={
                    day
                      ? `${day.toLocaleDateString()}, ${dayPosts.length} post(s) ${isToday(day) ? "(today)" : ""}`
                      : "Empty day"
                  }
                  aria-current={isToday(day) ? "date" : undefined}
                  disabled={!day}
                  className={`min-h-[80px] md:min-h-[100px] p-2 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-left ${
                    day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-gray-50 cursor-default"
                  } ${isToday(day) ? "ring-2 ring-blue-500" : ""}`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {day.getDate()}
                        {isToday(day) && <span className="sr-only"> (Today)</span>}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map(post => (
                          <CalendarPost key={post.id} post={post} />
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-gray-500 hover:text-gray-700 transition">
                            +{dayPosts.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day Detail Modal */}
        <DayDetailModal
          date={selectedDay}
          posts={selectedDayPosts}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          onPostUpdated={() => user && loadDashboardData(user.id)}
        />

        {/* Create New Post CTA */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Create Content
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Transform your content for Twitter, LinkedIn, and Instagram
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover}`}
            >
              Repurpose Content
            </Link>
            <Link
              href="/generate"
              className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${COLOR_AI.bg} ${COLOR_AI.bgHover}`}
            >
              ✨ Generate from Topic
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p>No posts yet. Create your first one to get started!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {posts.slice(0, 10).map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {post.platform}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.adapted_content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.status === 'scheduled' ? 'Scheduled for' : 'Posted on'} {formatDate(post.scheduled_time || post.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </DashboardLayout>
  )
}
