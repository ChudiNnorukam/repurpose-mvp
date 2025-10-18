'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCalendar()
  }, [])

  const fetchCalendar = async () => {
    try {
      const response = await fetch('/api/content-calendar/import')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.imported) {
        const calResponse = await fetch('/api/content-calendar')
        
        if (!calResponse.ok) {
          throw new Error(`Calendar fetch error: ${calResponse.status}`)
        }
        
        const calData = await calResponse.json()
        setEntries(calData.data || [])
      }
    } catch (err: any) {
      console.error('Failed to fetch calendar:', err)
      setError(err.message || 'Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setError(null)
    try {
      const response = await fetch('/api/content-calendar/import', {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Import failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Imported ${result.data.total_entries} calendar entries!`)
        await fetchCalendar()
      } else {
        throw new Error(result.error || 'Import failed')
      }
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message)
      alert(`❌ Import failed: ${err.message}`)
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Calendar</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Retry
          </button>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
            >
              {importing ? 'Importing...' : 'Import 90-Day Calendar'}
            </button>
            <div className="mt-8 text-left bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ 182 content pieces (LinkedIn + Twitter)</li>
                <li>✓ 52 LinkedIn posts (Mon, Wed, Fri, Sun)</li>
                <li>✓ 130 Twitter one-liners (daily insights)</li>
                <li>✓ 13 weeks mapped (Oct 21 - Jan 19)</li>
                <li>✓ SEO-optimized with keywords</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
              <p className="text-gray-600 mt-1">{entries.length} posts scheduled</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Create New Post
              </button>
            </div>
          </div>
        </div>
      </div>

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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
