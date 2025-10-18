"use client"

import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ChecklistItemProps {
  title: string
  description: string
  completed: boolean
  icon: LucideIcon
  actionLabel: string
  onAction: () => void
  disabled?: boolean
}

export function ChecklistItem({
  title,
  description,
  completed,
  icon: Icon,
  actionLabel,
  onAction,
  disabled = false,
}: ChecklistItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all',
        completed 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-card border-border hover:border-primary/40'
      )}
    >
      <div className="mt-1">
        {completed ? (
          <CheckCircle2 className="h-6 w-6 text-primary" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn(
            'h-5 w-5',
            completed ? 'text-primary' : 'text-muted-foreground'
          )} />
          <h3 className={cn(
            'font-semibold',
            completed && 'text-muted-foreground line-through'
          )}>
            {title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {description}
        </p>
        {!completed && (
          <Button 
            size="sm" 
            onClick={onAction}
            disabled={disabled}
            variant={disabled ? 'outline' : 'default'}
          >
            {actionLabel}
          </Button>
        )}
      </div>

      {completed && (
        <div className="mt-1">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
      )}
    </div>
  )
}
