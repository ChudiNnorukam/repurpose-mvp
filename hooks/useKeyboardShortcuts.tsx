import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutConfig {
  key: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow Escape key to work in input fields
        if (event.key !== 'Escape') {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchesCtrl = !shortcut.ctrlOrCmd || (event.metaKey || event.ctrlKey)
        const matchesShift = !shortcut.shift || event.shiftKey
        const matchesAlt = !shortcut.alt || event.altKey

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

// Global shortcuts available everywhere
export function useGlobalKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      ctrlOrCmd: true,
      callback: () => router.push('/create'),
      description: 'Create new post',
    },
    {
      key: '/',
      ctrlOrCmd: true,
      callback: () => {
        // Focus search if exists
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]')
        searchInput?.focus()
      },
      description: 'Focus search',
    },
  ]

  useKeyboardShortcuts(shortcuts)
}

// Helper to show keyboard shortcut hint
export function KeyboardShortcut({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      {keys.map((key, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-0.5">+</span>}
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  )
}
