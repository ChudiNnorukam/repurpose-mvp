'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PostCard } from './PostCard'
import { motion, AnimatePresence } from 'framer-motion'
import { COLOR_PRIMARY } from '@/lib/design-tokens'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase-client'

interface Post {
  id: string
  platform: string
  adapted_content: string
  scheduled_time: string
  status: string
  qstash_message_id: string | null
  tone: string | null
}

interface DayDetailModalProps {
  date: Date | null
  posts: Post[]
  isOpen: boolean
  onClose: () => void
  onPostUpdated: () => void
}

export function DayDetailModal({
  date,
  posts,
  isOpen,
  onClose,
  onPostUpdated
}: DayDetailModalProps) {
  const router = useRouter()
  const supabase = createClient()

  if (!date) return null

  const sortedPosts = [...posts].sort((a, b) => 
    new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  )

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      toast.success('Post deleted successfully')
      onPostUpdated()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleEdit = (post: Post) => {
    // Navigate to posts page with the post ID for editing
    router.push(`/posts?edit=${post.id}`)
  }

  const handleQuickSchedule = () => {
    // Navigate to create page with pre-filled date
    router.push(`/create?date=${date.toISOString().split('T')[0]}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col sm:max-h-[85vh] max-sm:max-h-screen max-sm:w-screen max-sm:rounded-none">
        <DialogHeader>
          <DialogTitle>{dateStr}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'} scheduled
          </p>
        </DialogHeader>

        {/* Scrollable post list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          <AnimatePresence>
            {sortedPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 mb-4">No posts scheduled for this day</p>
                <Button onClick={handleQuickSchedule} className={COLOR_PRIMARY.bg}>
                  Quick Schedule
                </Button>
              </motion.div>
            ) : (
              sortedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard
                    post={post}
                    onEdit={() => handleEdit(post)}
                    onDelete={() => handleDelete(post.id)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Quick action footer */}
        <div className="border-t pt-4 flex justify-between items-center">
          {sortedPosts.length > 0 && (
            <Button variant="outline" onClick={handleQuickSchedule}>
              Add Another Post
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className={sortedPosts.length === 0 ? 'w-full' : ''}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
