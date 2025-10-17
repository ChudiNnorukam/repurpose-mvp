// shadcn/ui Calendar Component Template for Repurpose MVP
'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

// Example 1: Basic Date Picker
// --------------------------

export function DatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Example 2: Schedule Time Picker (Date + Time)
// -------------------------------------------

export function ScheduleTimePicker({
  value,
  onChange,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
}) {
  const [date, setDate] = useState<Date | undefined>(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          ) : (
            <span>Select date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              // Preserve time if updating date
              if (date) {
                selectedDate.setHours(date.getHours())
                selectedDate.setMinutes(date.getMinutes())
              } else {
                // Default to 10 AM
                selectedDate.setHours(10, 0, 0, 0)
              }
            }
            setDate(selectedDate)
            onChange(selectedDate)
          }}
          disabled={(date) => date < new Date()}
          initialFocus
        />
        {date && (
          <div className="border-t p-3">
            <label className="text-sm font-medium mb-2 block">Time</label>
            <input
              type="time"
              className="w-full border rounded-md px-3 py-2"
              value={date.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                const newDate = new Date(date)
                newDate.setHours(parseInt(hours), parseInt(minutes))
                setDate(newDate)
                onChange(newDate)
              }}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Example 3: Posts Calendar View
// ----------------------------

type Post = {
  id: string
  platform: 'twitter' | 'linkedin' | 'instagram'
  content: string
  status: 'scheduled' | 'posted' | 'failed'
  scheduledTime: string
}

export function PostsCalendar({ posts }: { posts: Post[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    const dateKey = new Date(post.scheduledTime).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(post)
    return acc
  }, {} as Record<string, Post[]>)

  // Get posts for selected date
  const selectedDatePosts = selectedDate
    ? postsByDate[selectedDate.toDateString()] || []
    : []

  const platformIcons = {
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {currentMonth.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentMonth)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setCurrentMonth(newDate)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(currentMonth)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setCurrentMonth(newDate)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => {
                  const dateKey = date.toDateString()
                  const dayPosts = postsByDate[dateKey] || []
                  const hasScheduled = dayPosts.some(p => p.status === 'scheduled')
                  const hasPosted = dayPosts.some(p => p.status === 'posted')
                  const hasFailed = dayPosts.some(p => p.status === 'failed')

                  return (
                    <div
                      className={cn(
                        'relative p-2 text-center cursor-pointer rounded-md hover:bg-gray-100',
                        date.toDateString() === selectedDate?.toDateString() &&
                          'bg-blue-100 text-blue-700'
                      )}
                      {...props}
                    >
                      <div>{date.getDate()}</div>
                      {dayPosts.length > 0 && (
                        <div className="flex gap-0.5 justify-center mt-1">
                          {hasScheduled && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                          {hasPosted && (
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          )}
                          {hasFailed && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Posted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Failed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Posts */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDatePosts.length > 0 ? (
              <div className="space-y-3">
                {selectedDatePosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {platformIcons[post.platform]}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            post.status === 'scheduled' && 'bg-blue-100 text-blue-700',
                            post.status === 'posted' && 'bg-green-100 text-green-700',
                            post.status === 'failed' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {post.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                {selectedDate ? 'No posts on this date' : 'Select a date to view posts'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Repurpose-Specific Calendar Patterns
export const RepurposeCalendarPatterns = {
  // Pattern 1: Default scheduling time
  defaultScheduleTime: { hours: 10, minutes: 0 }, // 10:00 AM

  // Pattern 2: Prevent past dates
  disablePastDates: (date: Date) => date < new Date(),

  // Pattern 3: Highlight optimal posting times
  optimalTimes: {
    twitter: [9, 12, 17], // 9 AM, 12 PM, 5 PM
    linkedin: [8, 12, 17], // 8 AM, 12 PM, 5 PM
    instagram: [11, 13, 19], // 11 AM, 1 PM, 7 PM
  },

  // Pattern 4: Status indicators
  statusDots: {
    scheduled: 'bg-blue-500',
    posted: 'bg-green-500',
    failed: 'bg-red-500',
  },
}
