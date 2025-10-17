'use client'

import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
  id: string
  platform: string
  adapted_content: string
  scheduled_time: string
  status: string
}

interface PostCardProps {
  post: Post
  onEdit: () => void
  onDelete: () => void
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    posted: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700'
  }

  const time = new Date(post.scheduled_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="capitalize text-sm font-medium text-gray-900">
            {post.platform}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[post.status] || statusColors.draft}`}>
            {post.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>

      <p className="text-sm text-gray-700 line-clamp-3 mb-3">
        {post.adapted_content}
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="flex items-center gap-1"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </Button>
      </div>
    </div>
  )
}
