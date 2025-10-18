"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Calendar, BarChart3 } from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to Repurpose!
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            Transform your content across platforms with AI-powered adaptation and intelligent scheduling.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-Powered Adaptation</h3>
              <p className="text-sm text-muted-foreground">
                Automatically adapt your content for Twitter, LinkedIn, and Instagram with platform-optimized formatting and tone.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-primary/10 p-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Schedule posts at optimal times for maximum engagement. Manage your content calendar with drag-and-drop simplicity.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor engagement metrics and analyze what works best across all your platforms in one unified dashboard.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
