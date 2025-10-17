// shadcn/ui Form + Dialog Template for Repurpose MVP
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Example 1: Create Post Dialog
// ---------------------------

const createPostSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'instagram'], {
    required_error: 'Please select a platform',
  }),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(3000, 'Content cannot exceed 3000 characters'),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'enthusiastic']),
  scheduledTime: z.string().optional(),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

export function CreatePostDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      platform: 'twitter',
      content: '',
      tone: 'professional',
    },
  })

  async function onSubmit(data: CreatePostFormData) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      setOpen(false)
      form.reset()
      // Optionally: trigger refetch of posts list
    } catch (error) {
      console.error('Error creating post:', error)
      form.setError('root', {
        message: 'Failed to create post. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Fill in the details for your post. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Platform Select */}
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="twitter">
                        <div className="flex items-center gap-2">
                          <span>🐦</span>
                          <span>Twitter</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">
                          <span>💼</span>
                          <span>LinkedIn</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="instagram">
                        <div className="flex items-center gap-2">
                          <span>📷</span>
                          <span>Instagram</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Textarea */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post content..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/3000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tone Select */}
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled Time (Optional) */}
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule For (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to save as draft
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {form.formState.errors.root && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Dialog Footer */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Example 2: Edit Post Dialog (with pre-populated data)
// ----------------------------------------------------

interface EditPostDialogProps {
  post: {
    id: string
    platform: string
    content: string
    tone: string
  }
  onUpdate: () => void
}

export function EditPostDialog({ post, onUpdate }: EditPostDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      platform: post.platform as any,
      content: post.content,
      tone: post.tone as any,
    },
  })

  async function onSubmit(data: CreatePostFormData) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Update failed')

      setOpen(false)
      onUpdate() // Trigger parent refresh
    } catch (error) {
      console.error('Error updating post:', error)
      form.setError('root', { message: 'Failed to update post' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Same form fields as CreatePostDialog */}
            {/* ... */}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Example 3: Confirm Delete Dialog
// -------------------------------

interface ConfirmDeleteDialogProps {
  title: string
  description: string
  onConfirm: () => Promise<void>
  triggerButton?: React.ReactNode
}

export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  triggerButton,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConfirm() {
    setIsDeleting(true)
    
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Repurpose-Specific Patterns
export const RepurposeFormDialogPatterns = {
  // Pattern 1: Design tokens for consistent styling
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
  buttonDestructive: 'bg-red-600 hover:bg-red-700 text-white',
  
  // Pattern 2: Standard form field height
  inputHeight: 'h-10',
  textareaMinHeight: 'min-h-[150px]',
  
  // Pattern 3: Dialog widths
  smallDialog: 'sm:max-w-[425px]',
  mediumDialog: 'sm:max-w-[600px]',
  largeDialog: 'sm:max-w-[800px]',
  
  // Pattern 4: Accessibility
  ariaLabels: {
    closeDialog: 'Close dialog',
    submitForm: 'Submit form',
    cancelForm: 'Cancel'
  }
}
