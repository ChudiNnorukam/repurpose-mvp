'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLOR_PRIMARY } from '@/lib/design-tokens'

interface CalendarEntry {
  id: string
  scheduled_date: string
  platform: string
  content_type: string
  topic_theme: string
  hook: string
  status: string
  estimated_engagement_score: number
}

export default function ContentCalendarPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    fetchCalendar()
  }, [])

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/content-calendar/import')
      const result = await response.json()
      
      if (result.success && result.imported) {
        // Fetch full calendar
        const calResponse = await fetch('/api/content-calendar')
        const calData = await calResponse.json()
        setEntries(calData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const response = await fetch('/api/content-calendar/import', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Imported ${result.data.total_entries} calendar entries!`)
        fetchCalendar()
      } else {
        alert(`❌ Import failed: ${result.error}`)
      }
    } catch (error) {
      alert('Import failed')
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              90-Day Content Calendar
            </h1>
            <p className="text-gray-600 mb-6">
              Import your research-backed content strategy to get started.
            </p>
            <button
              onClick={handleImport}
              disabled={importing}
              className={`${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover} text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50`}
            >
              {importing ? 'Importing...' : 'Import 90-Day Calendar'}
            </button>
            <div className="mt-8 text-left bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ 245 content pieces (LinkedIn + Twitter)</li>
                <li>✓ Pre-scheduled for optimal engagement times</li>
                <li>✓ Research-backed post formats (carousels, threads, stories)</li>
                <li>✓ SEO-optimized with hashtags and keywords</li>
                <li>✓ AI detection tested (90%+ human scores)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600 mt-1">{entries.length} posts scheduled</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {view === 'list' ? 'Calendar View' : 'List View'}
              </button>
              <button
                onClick={() => router.push('/create')}
                className={`${COLOR_PRIMARY.bg} text-white px-4 py-2 rounded-lg`}
              >
                Create New Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {new Date(entry.scheduled_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                      entry.platform === 'twitter' ? 'bg-sky-100 text-sky-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {entry.platform}
                    </span>
                    <span className="text-xs text-gray-500">{entry.content_type}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {entry.topic_theme}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {entry.hook}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Engagement: {entry.estimated_engagement_score}/10</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      entry.status === 'published' ? 'bg-green-100 text-green-800' :
                      entry.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
