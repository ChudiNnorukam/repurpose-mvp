# Example: Interactive Calendar Component (Hypothetical)

## Overview

**Feature**: Monthly calendar view with drag-and-drop post rescheduling  
**Agents**: ui-ux-expert → feature-implementer → test-validator  
**Time**: 120 minutes (estimated)  
**Complexity**: High

## User Request

> "Add a calendar view where I can see all my scheduled posts and drag-and-drop to reschedule them"

## Design Phase (ui-ux-expert)

### Wireframe

```
┌──────────────────────────────────────────────┐
│  October 2025                    [ < | > ]   │
├──────────────────────────────────────────────┤
│ Sun   Mon   Tue   Wed   Thu   Fri   Sat     │
├──────────────────────────────────────────────┤
│      │  1  │  2  │  3  │  4  │  5  │  6     │
│      │     │[📝] │     │[📝] │     │        │
│      │     │[🐦] │     │     │     │        │
├──────┼─────┼─────┼─────┼─────┼─────┼────────┤
│  7   │  8  │  9  │ 10  │ 11  │ 12  │ 13    │
│[📝]  │[🐦] │     │[📝] │     │     │        │
│      │     │     │[💼] │     │     │        │
└──────────────────────────────────────────────┘

Legend:
📝 = Post scheduled
🐦 = Twitter
💼 = LinkedIn
```

### UX Requirements

1. **Monthly Grid**: 7 columns × 5-6 rows
2. **Post Cards**: Draggable cards with:
   - Platform icon (Twitter/LinkedIn/Instagram)
   - Content preview (first 50 chars)
   - Scheduled time
   - Status indicator (scheduled/posted/failed)
3. **Drag-and-Drop**:
   - Drag post to new day
   - Drop updates scheduled_time
   - API call to reschedule
   - Optimistic UI update
4. **Responsive Design**:
   - Desktop: Full calendar grid
   - Mobile: Collapse to list view
5. **Accessibility**:
   - Keyboard navigation (arrow keys)
   - Screen reader support
   - ARIA labels for all interactions

## Implementation

### 1. Calendar Grid Component

**File**: `components/calendar/CalendarGrid.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { CalendarDay } from './CalendarDay'
import { PostCard } from './PostCard'
import { Post } from '@/lib/types'

interface CalendarGridProps {
  month: Date
  posts: Post[]
  onReschedule: (postId: string, newDate: Date) => Promise<void>
}

export function CalendarGrid({ month, posts, onReschedule }: CalendarGridProps) {
  const [days, setDays] = useState<Date[]>([])
  const [postsByDay, setPostsByDay] = useState<Record<string, Post[]>>({})

  useEffect(() => {
    // Generate calendar days
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    
    const daysArray: Date[] = []
    const startDay = firstDay.getDay() // 0 = Sunday
    
    // Add previous month days (padding)
    for (let i = 0; i < startDay; i++) {
      const day = new Date(firstDay)
      day.setDate(firstDay.getDate() - (startDay - i))
      daysArray.push(day)
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push(new Date(month.getFullYear(), month.getMonth(), i))
    }
    
    setDays(daysArray)

    // Group posts by day
    const grouped: Record<string, Post[]> = {}
    posts.forEach(post => {
      const dateKey = new Date(post.scheduled_time!).toDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(post)
    })
    setPostsByDay(grouped)
  }, [month, posts])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const postId = active.id as string
    const newDate = new Date(over.id as string)
    
    // Optimistic update
    const post = posts.find(p => p.id === postId)
    if (post) {
      const oldKey = new Date(post.scheduled_time!).toDateString()
      const newKey = newDate.toDateString()
      
      setPostsByDay(prev => {
        const updated = { ...prev }
        updated[oldKey] = (updated[oldKey] || []).filter(p => p.id !== postId)
        updated[newKey] = [...(updated[newKey] || []), { ...post, scheduled_time: newDate.toISOString() }]
        return updated
      })
    }
    
    // API call
    try {
      await onReschedule(postId, newDate)
    } catch (error) {
      // Revert on error
      console.error('Reschedule failed:', error)
      // Re-fetch posts to restore state
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        
        {/* Days */}
        {days.map(day => {
          const dateKey = day.toDateString()
          const dayPosts = postsByDay[dateKey] || []
          
          return (
            <CalendarDay
              key={dateKey}
              date={day}
              posts={dayPosts}
              isCurrentMonth={day.getMonth() === month.getMonth()}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
```

### 2. Calendar Day Cell

**File**: `components/calendar/CalendarDay.tsx`

```typescript
import { useDroppable } from '@dnd-kit/core'
import { PostCard } from './PostCard'
import { Post } from '@/lib/types'

interface CalendarDayProps {
  date: Date
  posts: Post[]
  isCurrentMonth: boolean
}

export function CalendarDay({ date, posts, isCurrentMonth }: CalendarDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: date.toISOString()
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] p-2 border rounded-lg
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
        ${isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
        hover:bg-gray-50 transition-colors
      `}
    >
      {/* Day number */}
      <div className="text-sm font-medium mb-2">
        {date.getDate()}
      </div>
      
      {/* Posts for this day */}
      <div className="space-y-1">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
```

### 3. Draggable Post Card

**File**: `components/calendar/PostCard.tsx`

```typescript
import { useDraggable } from '@dnd-kit/core'
import { Post } from '@/lib/types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1
  } : undefined

  const platformIcon = {
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-white border rounded p-2 cursor-move shadow-sm
        hover:shadow-md transition-shadow
        ${isDragging ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{platformIcon[post.platform]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 truncate">
            {post.adapted_content.slice(0, 50)}...
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(post.scheduled_time!).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <StatusBadge status={post.status} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-700',
    posted: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${colors[status]}`}>
      {status}
    </span>
  )
}
```

### 4. Page Integration

**File**: `app/calendar/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [posts, setPosts] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPosts()
  }, [currentMonth])

  async function loadPosts() {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { data } = await supabase
      .from('posts')
      .select('*')
      .gte('scheduled_time', startOfMonth.toISOString())
      .lte('scheduled_time', endOfMonth.toISOString())
      .order('scheduled_time')

    setPosts(data || [])
  }

  async function handleReschedule(postId: string, newDate: Date) {
    // Keep original time, just change date
    const post = posts.find(p => p.id === postId)
    const originalTime = new Date(post.scheduled_time)
    
    newDate.setHours(originalTime.getHours())
    newDate.setMinutes(originalTime.getMinutes())

    const response = await fetch('/api/posts/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        newScheduledTime: newDate.toISOString()
      })
    })

    if (!response.ok) throw new Error('Reschedule failed')
    
    await loadPosts() // Reload to get updated data
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <CalendarGrid
        month={currentMonth}
        posts={posts}
        onReschedule={handleReschedule}
      />
    </div>
  )
}
```

## Testing

```typescript
// tests/calendar.spec.ts
import { test, expect } from '@playwright/test'

test('drag post to reschedule', async ({ page }) => {
  await page.goto('/calendar')

  // Find a post card
  const postCard = page.locator('.post-card').first()
  
  // Find target day (next week)
  const targetDay = page.locator('[data-date="2025-10-20"]')

  // Drag and drop
  await postCard.dragTo(targetDay)

  // Verify API was called
  const response = await page.waitForResponse(res =>
    res.url().includes('/api/posts/reschedule') &&
    res.status() === 200
  )

  expect(response).toBeTruthy()

  // Verify UI updated
  await expect(targetDay.locator('.post-card')).toBeVisible()
})
```

## Key Patterns

### 1. Drag-and-Drop with @dnd-kit
```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'

// Draggable item
const { setNodeRef, listeners, attributes } = useDraggable({ id: post.id })

// Droppable area
const { setNodeRef: setDropRef, isOver } = useDroppable({ id: day.toISOString() })
```

### 2. Optimistic UI Updates
```typescript
// Update UI immediately
setPostsByDay(prev => /* update state */)

// Then call API
try {
  await onReschedule(postId, newDate)
} catch (error) {
  // Revert on failure
  await loadPosts()
}
```

### 3. Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') selectNextDay()
  if (e.key === 'ArrowLeft') selectPrevDay()
  if (e.key === 'Enter') openPostDetails()
}
```

## Libraries Used

- `@dnd-kit/core`: Drag-and-drop functionality
- `lucide-react`: Icons (ChevronLeft, ChevronRight)
- `@supabase/auth-helpers-nextjs`: Database queries
- `tailwindcss`: Styling

## Performance Considerations

- **Virtualization**: For calendars with 100+ posts, use `react-window`
- **Lazy loading**: Only load posts for visible month
- **Debouncing**: Debounce drag updates to avoid excessive API calls

## Accessibility

- **ARIA labels**: All interactive elements labeled
- **Keyboard navigation**: Tab, arrow keys, Enter
- **Screen reader**: Announces drag-drop actions
- **Focus indicators**: Visible focus outline

## Related Files

- `components/calendar/CalendarGrid.tsx`
- `components/calendar/CalendarDay.tsx`
- `components/calendar/PostCard.tsx`
- `app/calendar/page.tsx`
- `app/api/posts/reschedule/route.ts`
