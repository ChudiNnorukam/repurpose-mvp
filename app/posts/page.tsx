'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PostEditorModal } from '@/components/posts/PostEditorModal'
import { BulkSelectToolbar } from '@/components/posts/BulkSelectToolbar'
import { Checkbox } from '@/components/ui/checkbox'
import { COLOR_PRIMARY, COLOR_SUCCESS, BUTTON_VARIANTS } from '@/lib/design-tokens'


interface Post {
  id: string
  platform: string
  adapted_content: string
  original_content: string
  scheduled_time: string
  status: string
  created_at: string
  posted_at: string | null
  error_message: string | null
  qstash_message_id: string | null
  tone: string | null
  is_draft: boolean
}

export default function PostsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'posted' | 'failed'>('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
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
      await loadPosts(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async (userId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading posts:', error)
      toast.error('Failed to load posts')
      return
    }

    setPosts(data || [])
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    const loadingToast = toast.loading('Deleting post...')

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      toast.error('Failed to delete post', { id: loadingToast })
      return
    }

    toast.success('Post deleted', { id: loadingToast })
    await loadPosts(user.id)
    setSelectedPost(null)
  }

  const handleRetry = async (postId: string) => {
    const loadingToast = toast.loading('Retrying post...')

    try {
      const response = await fetch('/api/post/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id })
      })

      if (!response.ok) {
        throw new Error('Failed to retry post')
      }

      toast.success('Post retry scheduled', { id: loadingToast })
      await loadPosts(user.id)
    } catch (error) {
      toast.error('Failed to retry post', { id: loadingToast })
    }
  }

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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const filteredPosts = filter === 'all'
    ? posts
    : filter === 'draft'
    ? posts.filter(p => p.is_draft)
    : posts.filter(p => p.status === filter && !p.is_draft)

  const toggleSelectPost = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPostIds.length === filteredPosts.length) {
      setSelectedPostIds([])
    } else {
      setSelectedPostIds(filteredPosts.map(p => p.id))
    }
  }

  const handleBulkActionComplete = async () => {
    setSelectedPostIds([])
    if (user) {
      await loadPosts(user.id)
    }
  }

  const handleEditComplete = async () => {
    setEditingPost(null)
    if (user) {
      await loadPosts(user.id)
    }
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

  return (
    <DashboardLayout user={user}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Manage Posts</h2>
          <p className="mt-2 text-gray-600">View, edit, and delete your scheduled and posted content</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? `${COLOR_PRIMARY.bg} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'draft'
                ? `${COLOR_PRIMARY.bg} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Drafts ({posts.filter(p => p.is_draft).length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'scheduled'
                ? `${COLOR_PRIMARY.bg} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Scheduled ({posts.filter(p => p.status === 'scheduled' && !p.is_draft).length})
          </button>
          <button
            onClick={() => setFilter('posted')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'posted'
                ? `${COLOR_PRIMARY.bg} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Posted ({posts.filter(p => p.status === 'posted').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'failed'
                ? `${COLOR_PRIMARY.bg} text-white`
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Failed ({posts.filter(p => p.status === 'failed').length})
          </button>
        </div>

        {/* Posts List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts List Column */}
          <div className="lg:col-span-2">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>No posts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-md">
                  <Checkbox
                    checked={selectedPostIds.length === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedPostIds.length > 0
                      ? `${selectedPostIds.length} selected`
                      : 'Select all'
                    }
                  </span>
                </div>

                {/* Posts List */}
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                      selectedPost?.id === post.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedPostIds.includes(post.id)}
                          onCheckedChange={() => toggleSelectPost(post.id)}
                        />
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {post.platform}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                              {post.is_draft ? 'draft' : post.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {post.scheduled_time ? formatDate(post.scheduled_time) : 'Not scheduled'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.adapted_content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post Details Column */}
          <div className="lg:col-span-1">
            {selectedPost ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Platform</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPost.platform}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPost.status)}`}>
                        {selectedPost.status}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Scheduled Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPost.scheduled_time)}</p>
                  </div>

                  {selectedPost.posted_at && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Posted At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPost.posted_at)}</p>
                    </div>
                  )}

                  {selectedPost.error_message && (
                    <div>
                      <label className="text-xs font-medium text-red-500 uppercase">Error</label>
                      <p className="mt-1 text-sm text-red-600">{selectedPost.error_message}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Content</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedPost.adapted_content}
                    </p>
                  </div>

                  {selectedPost.original_content && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Original Content</label>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                        {selectedPost.original_content}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-2">
                    {/* Edit Button for Drafts and Scheduled Posts */}
                    {(selectedPost.status === 'scheduled' || selectedPost.is_draft) && (
                      <button
                        onClick={() => setEditingPost(selectedPost)}
                        className={BUTTON_VARIANTS.primary}
                      >
                        Edit Post
                      </button>
                    )}

                    {selectedPost.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(selectedPost.id)}
                        className={BUTTON_VARIANTS.success}
                      >
                        Retry Post
                      </button>
                    )}
                    {selectedPost.status === 'scheduled' && (
                      <button
                        onClick={() => handleDelete(selectedPost.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                      >
                        Cancel Schedule
                      </button>
                    )}
                    {selectedPost.status !== 'scheduled' && (
                      <button
                        onClick={() => handleDelete(selectedPost.id)}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 sticky top-4 text-center text-gray-500">
                <p>Select a post to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Post Editor Modal */}
        <PostEditorModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleEditComplete}
        />

        {/* Bulk Select Toolbar */}
        <BulkSelectToolbar
          selectedCount={selectedPostIds.length}
          selectedPostIds={selectedPostIds}
          userId={user?.id || ''}
          onAction={handleBulkActionComplete}
          onClear={() => setSelectedPostIds([])}
        />
    </DashboardLayout>
  )
}
