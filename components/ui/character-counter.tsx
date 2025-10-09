'use client'

import { PLATFORM_LIMITS, Platform } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

interface CharacterCounterProps {
  content: string
  platform?: Platform
  className?: string
  showIcon?: boolean
  showWarning?: boolean
}

export function CharacterCounter({
  content,
  platform,
  className,
  showIcon = true,
  showWarning = true
}: CharacterCounterProps) {
  const length = content.length

  if (!platform) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        {length.toLocaleString()} characters
      </div>
    )
  }

  const limit = PLATFORM_LIMITS[platform]
  const percentage = (length / limit.maxLength) * 100
  const isOverLimit = length > limit.maxLength
  const isNearLimit = length > limit.recommendedLength && length <= limit.maxLength
  const remaining = limit.maxLength - length

  // Status icon
  const StatusIcon = isOverLimit
    ? AlertCircle
    : isNearLimit
    ? AlertTriangle
    : CheckCircle

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <div className="flex items-center gap-2">
              {showIcon && (
                <StatusIcon className={cn(
                  'w-4 h-4',
                  isOverLimit && 'text-red-600',
                  isNearLimit && 'text-yellow-600',
                  !isNearLimit && !isOverLimit && 'text-green-600'
                )} />
              )}
              <span className={cn(
                'font-medium',
                isOverLimit && 'text-red-600',
                isNearLimit && 'text-yellow-600',
                !isNearLimit && !isOverLimit && 'text-gray-600'
              )}>
                {length.toLocaleString()} / {limit.maxLength.toLocaleString()}
              </span>
            </div>
            {isOverLimit && (
              <span className="text-red-600 text-xs font-semibold animate-pulse">
                {Math.abs(remaining)} over limit
              </span>
            )}
            {isNearLimit && !isOverLimit && (
              <span className="text-yellow-600 text-xs">
                {remaining} remaining
              </span>
            )}
            {!isNearLimit && !isOverLimit && length > 0 && (
              <span className="text-green-600 text-xs">
                {remaining} remaining
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 rounded-full',
                isOverLimit && 'bg-red-500 animate-pulse',
                isNearLimit && 'bg-yellow-500',
                !isNearLimit && !isOverLimit && 'bg-green-500'
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {showWarning && isOverLimit && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Content exceeds {limit.name}'s character limit. Please shorten by {Math.abs(remaining)} characters.
          </span>
        </div>
      )}
      {showWarning && isNearLimit && !isOverLimit && (
        <div className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-md border border-yellow-200">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Approaching {limit.name}'s recommended limit. Consider shortening for better engagement.
          </span>
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export function CompactCharacterCounter({ content, platform, className }: CharacterCounterProps) {
  const length = content.length

  if (!platform) {
    return (
      <span className={cn('text-sm text-gray-500', className)}>
        {length}
      </span>
    )
  }

  const limit = PLATFORM_LIMITS[platform]
  const isOverLimit = length > limit.maxLength
  const isNearLimit = length > limit.recommendedLength && length <= limit.maxLength

  return (
    <span className={cn(
      'text-sm font-medium',
      isOverLimit && 'text-red-600',
      isNearLimit && 'text-yellow-600',
      !isNearLimit && !isOverLimit && 'text-gray-600',
      className
    )}>
      {length}/{limit.maxLength}
    </span>
  )
}
