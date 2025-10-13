'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Trash2, Calendar, Copy, X, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BulkSelectToolbarProps {
  selectedCount: number
  selectedPostIds: string[]
  userId: string
  onAction: () => void
  onClear: () => void
}

export function BulkSelectToolbar({
  selectedCount,
  selectedPostIds,
  userId,
  onAction,
  onClear
}: BulkSelectToolbarProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [newScheduledTime, setNewScheduledTime] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedCount} post(s)? This action cannot be undone.`)) {
      return
    }

    setProcessing(true)
    const loadingToast = toast.loading(`Deleting ${selectedCount} post(s)...`)

    try {
      const response = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          postIds: selectedPostIds,
          userId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete posts')
      }

      toast.success(data.message || `Deleted ${data.deletedCount} post(s)`, { id: loadingToast })
      onAction()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete posts', { id: loadingToast })
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkReschedule = async () => {
    if (!newScheduledTime) {
      toast.error('Please select a new date and time')
      return
    }

    setProcessing(true)
    const loadingToast = toast.loading(`Rescheduling ${selectedCount} post(s)...`)

    try {
      const localDateTime = new Date(newScheduledTime)
      const isoString = localDateTime.toISOString()

      const response = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reschedule',
          postIds: selectedPostIds,
          userId,
          scheduledTime: isoString
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reschedule posts')
      }

      toast.success(data.message || `Rescheduled ${data.rescheduledCount} post(s)`, { id: loadingToast })
      setShowReschedule(false)
      setNewScheduledTime('')
      onAction()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule posts', { id: loadingToast })
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkDuplicate = async () => {
    setProcessing(true)
    const loadingToast = toast.loading(`Duplicating ${selectedCount} post(s)...`)

    try {
      const response = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          postIds: selectedPostIds,
          userId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to duplicate posts')
      }

      toast.success(data.message || `Duplicated ${data.duplicatedCount} post(s) as drafts`, { id: loadingToast })
      onAction()
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate posts', { id: loadingToast })
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkCancelSchedule = async () => {
    if (!confirm(`Cancel ${selectedCount} scheduled post(s) from queue? Posts will be converted to drafts.`)) {
      return
    }

    setProcessing(true)
    const loadingToast = toast.loading(`Canceling ${selectedCount} scheduled post(s)...`)

    try {
      const response = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          postIds: selectedPostIds,
          userId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel scheduled posts')
      }

      toast.success(data.message || `Canceled ${data.canceledCount} scheduled post(s)`, { id: loadingToast })
      onAction()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel scheduled posts', { id: loadingToast })
    } finally {
      setProcessing(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-lg px-6 py-4 flex items-center gap-4 border border-gray-200 z-50 animate-in slide-in-from-bottom-8 duration-300">
      <span className="text-sm font-medium text-gray-900">
        {selectedCount} selected
      </span>

      <Separator orientation="vertical" className="h-6" />

      {showReschedule ? (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={newScheduledTime}
            onChange={(e) => setNewScheduledTime(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Button
            size="sm"
            onClick={handleBulkReschedule}
            disabled={processing || !newScheduledTime}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowReschedule(false)
              setNewScheduledTime('')
            }}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkDelete}
            disabled={processing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReschedule(true)}
            disabled={processing}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reschedule
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkDuplicate}
            disabled={processing}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkCancelSchedule}
            disabled={processing}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Schedule
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={processing}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
