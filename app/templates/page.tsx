'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Template {
  id: string
  title: string
  template_text: string
  category: string
  platforms: string[]
  is_recurring: boolean
  schedule_pattern: string | null
  last_used_at: string | null
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [templateText, setTemplateText] = useState('')
  const [category, setCategory] = useState('educational')
  const [platforms, setPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [isRecurring, setIsRecurring] = useState(false)
  const [schedulePattern, setSchedulePattern] = useState('')
  const [generating, setGenerating] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchTemplates()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('content_templates')
        .insert({
          user_id: user.id,
          title,
          template_text: templateText,
          category,
          platforms,
          is_recurring: isRecurring,
          schedule_pattern: isRecurring ? schedulePattern : null,
        })

      if (error) throw error

      toast.success('Template created!')
      resetForm()
      setShowCreateModal(false)
      fetchTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return

    try {
      const { error } = await supabase
        .from('content_templates')
        .update({
          title,
          template_text: templateText,
          category,
          platforms,
          is_recurring: isRecurring,
          schedule_pattern: isRecurring ? schedulePattern : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTemplate.id)

      if (error) throw error

      toast.success('Template updated!')
      resetForm()
      setEditingTemplate(null)
      fetchTemplates()
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const { error } = await supabase
        .from('content_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Template deleted')
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleUseTemplate = async (template: Template) => {
    // Store template in localStorage to use in create page
    localStorage.setItem('selectedTemplate', JSON.stringify(template))

    // Update last_used_at
    await supabase
      .from('content_templates')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', template.id)

    router.push('/create')
  }

  const startEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTitle(template.title)
    setTemplateText(template.template_text)
    setCategory(template.category)
    setPlatforms(template.platforms)
    setIsRecurring(template.is_recurring)
    setSchedulePattern(template.schedule_pattern || '')
    setShowCreateModal(true)
  }

  const resetForm = () => {
    setTitle('')
    setTemplateText('')
    setCategory('educational')
    setPlatforms(['twitter', 'linkedin'])
    setIsRecurring(false)
    setSchedulePattern('')
    setEditingTemplate(null)
  }

  const handleGenerateWithAI = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, platform: 'linkedin' }),
      })

      if (!response.ok) throw new Error('Failed to generate')

      const data = await response.json()
      setTemplateText(data.content)
      toast.success('Template generated with AI!')
    } catch (error) {
      console.error('Error generating template:', error)
      toast.error('Failed to generate template')
    } finally {
      setGenerating(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const categoryColors = {
    educational: 'bg-blue-100 text-blue-800',
    product: 'bg-purple-100 text-purple-800',
    engagement: 'bg-green-100 text-green-800',
    social_proof: 'bg-yellow-100 text-yellow-800',
    behind_the_scenes: 'bg-pink-100 text-pink-800',
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
              <Link href="/templates" className="text-gray-900 font-semibold">Templates</Link>
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
              <Link href="/templates" className="block py-2 text-gray-900 font-semibold">Templates</Link>
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
            <h2 className="text-3xl font-bold text-gray-900">Content Templates</h2>
            <p className="text-gray-600 mt-1">Manage and reuse your promotional content templates</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No templates yet. Create your first template!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${categoryColors[template.category as keyof typeof categoryColors]}`}>
                    {template.category}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{template.template_text}</p>

                <div className="flex gap-2 mb-4">
                  {template.platforms.map((platform) => (
                    <span key={platform} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {platform}
                    </span>
                  ))}
                </div>

                {template.is_recurring && (
                  <div className="mb-4 text-sm">
                    <span className="text-green-600 font-semibold">🔁 Recurring: </span>
                    <span className="text-gray-600">{template.schedule_pattern}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => startEditTemplate(template)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>

            <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="educational">Educational</option>
                  <option value="product">Product Update</option>
                  <option value="engagement">Engagement</option>
                  <option value="social_proof">Social Proof</option>
                  <option value="behind_the_scenes">Behind the Scenes</option>
                </select>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Template Content</label>
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={generating}
                    className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {generating ? '✨ Generating...' : '✨ Generate with AI'}
                  </button>
                </div>
                <textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-40"
                  required
                  placeholder="Write your template or click 'Generate with AI' to create one automatically..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={platforms.includes('twitter')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlatforms([...platforms, 'twitter'])
                        } else {
                          setPlatforms(platforms.filter(p => p !== 'twitter'))
                        }
                      }}
                      className="mr-2"
                    />
                    Twitter
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={platforms.includes('linkedin')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPlatforms([...platforms, 'linkedin'])
                        } else {
                          setPlatforms(platforms.filter(p => p !== 'linkedin'))
                        }
                      }}
                      className="mr-2"
                    />
                    LinkedIn
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Make this a recurring post</span>
                </label>
              </div>

              {isRecurring && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Pattern</label>
                  <select
                    value={schedulePattern}
                    onChange={(e) => setSchedulePattern(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required={isRecurring}
                  >
                    <option value="">Select schedule...</option>
                    <option value="weekly_monday_9am">Weekly - Monday 9:00 AM</option>
                    <option value="weekly_wednesday_1pm">Weekly - Wednesday 1:00 PM</option>
                    <option value="weekly_friday_3pm">Weekly - Friday 3:00 PM</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
