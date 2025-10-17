'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Post {
  id: string
  platform: string
  adapted_content: string
  scheduled_time: string
  status: string
}

interface CalendarPostProps {
  post: Post
}

export function CalendarPost({ post }: CalendarPostProps) {
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
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${statusColors[post.status] || statusColors.draft}`}
          >
            {post.platform}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-xs font-medium">{post.platform}</p>
            <p className="text-xs text-gray-600">
              {post.adapted_content.slice(0, 100)}
              {post.adapted_content.length > 100 && '...'}
            </p>
            <p className="text-xs text-gray-400">
              {time} • {post.status}
            </p>
            <p className="text-xs text-gray-400 italic">
              Click day to view all posts
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
