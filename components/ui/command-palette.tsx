"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { 
  FileText, 
  Calendar, 
  Sparkles, 
  Link as LinkIcon, 
  Settings, 
  Twitter, 
  Linkedin, 
  Instagram,
  Search
} from "lucide-react"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onClose()
      }
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSelect = useCallback((callback: () => void) => {
    callback()
    onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command 
          className="rounded-lg border border-gray-200 bg-white shadow-2xl"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-gray-200 px-4">
            <Search className="mr-2 h-5 w-5 text-gray-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages" className="px-2 py-1 text-xs font-semibold text-gray-500">
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/dashboard"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/create"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                <span>Create Content</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/generate"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Generate from Topic</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/batch-create"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                <span>Batch Create</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/posts"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Calendar className="h-4 w-4" />
                <span>Posts</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/connections"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Connections</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-gray-200" />

            <Command.Group heading="Quick Actions" className="px-2 py-1 text-xs font-semibold text-gray-500">
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/connections?connect=twitter"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
                <span>Connect Twitter</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/connections?connect=linkedin"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                <span>Connect LinkedIn</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => router.push("/connections?connect=instagram"))}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer aria-selected:bg-gray-100"
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                <span>Connect Instagram</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">↵</kbd> Select
              </span>
              <span>
                <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">ESC</kbd> Close
              </span>
            </div>
            <span className="text-gray-400">
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">⌘K</kbd>
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
