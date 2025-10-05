'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  platform: string
  adapted_content: string
  scheduled_time: string
  status: string
  qstash_message_id: string | null
  tone: string | null
}

interface PostEditorModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function PostEditorModal({ post, isOpen, onClose, onSave }: PostEditorModalProps) {
  const [content, setContent] = useState(post?.adapted_content || '')
  const [scheduledTime, setScheduledTime] = useState(post?.scheduled_time || '')
  const [saving, setSaving] = useState(false)

  // Reset form when post changes
  useState(() => {
    if (post) {
      setContent(post.adapted_content)
      // Convert ISO to datetime-local format
      const date = new Date(post.scheduled_time)
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setScheduledTime(localDateTime)
    }
  })

  const handleSave = async () => {
    if (!post) return

    if (!content.trim()) {
      toast.error('Content cannot be empty')
      return
    }

    setSaving(true)
    const loadingToast = toast.loading('Updating post...')

    try {
      // Convert datetime-local to ISO
      const localDateTime = new Date(scheduledTime)
      const isoString = localDateTime.toISOString()

      const updates: any = {
        adapted_content: content,
        updated_at: new Date().toISOString()
      }

      // If scheduled time changed, need to reschedule
      const timeChanged = new Date(isoString).getTime() !== new Date(post.scheduled_time).getTime()

      if (timeChanged) {
        updates.scheduled_time = isoString

        // Cancel old QStash message and create new one
        if (post.qstash_message_id) {
          // Cancel old schedule
          await fetch('/api/schedule/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: post.qstash_message_id })
          })

          // Create new schedule
          const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId: post.id,
              platform: post.platform,
              content,
              originalContent: post.adapted_content, // Keep original for reference
              scheduledTime: isoString,
              userId: (await supabase.auth.getUser()).data.user?.id
            })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.qstashMessageId) {
              updates.qstash_message_id = data.qstashMessageId
            }
          }
        }
      }

      // Update post in database
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', post.id)

      if (error) throw error

      toast.success('Post updated successfully!', { id: loadingToast })
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error updating post:', error)
      toast.error(error.message || 'Failed to update post', { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  if (!post) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-xs font-medium text-gray-500 uppercase">Platform</Label>
            <p className="mt-1 text-sm font-medium capitalize">{post.platform}</p>
          </div>

          <div>
            <Label htmlFor="content" className="mb-2">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full"
              placeholder="Enter your post content..."
            />
            <div className="mt-2 text-sm text-gray-500">
              {content.length} characters
            </div>
          </div>

          {post.status === 'scheduled' && (
            <div>
              <Label htmlFor="scheduledTime" className="mb-2">
                Scheduled Time
              </Label>
              <input
                id="scheduledTime"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={(() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const month = String(now.getMonth() + 1).padStart(2, '0')
                  const day = String(now.getDate()).padStart(2, '0')
                  const hours = String(now.getHours()).padStart(2, '0')
                  const minutes = String(now.getMinutes()).padStart(2, '0')
                  return `${year}-${month}-${day}T${hours}:${minutes}`
                })()}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
