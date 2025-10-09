// Platform character limits and constraints
export const PLATFORM_LIMITS = {
  twitter: {
    maxLength: 280,
    recommendedLength: 240,
    name: 'Twitter',
    icon: '𝕏',
    color: 'blue',
  },
  linkedin: {
    maxLength: 3000,
    recommendedLength: 1300,
    name: 'LinkedIn',
    icon: 'in',
    color: 'blue',
  },
  instagram: {
    maxLength: 2200,
    recommendedLength: 150,
    name: 'Instagram',
    icon: 'IG',
    color: 'pink',
  },
} as const

export type Platform = keyof typeof PLATFORM_LIMITS

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CREATE_POST: 'k',
  SEARCH: '/',
  SAVE_DRAFT: 's',
  SCHEDULE: 'enter',
  CLOSE: 'escape',
} as const

// Toast positions
export const TOAST_CONFIG = {
  position: 'top-right' as const,
  duration: 3000,
  success: {
    icon: '✅',
    style: {
      background: '#10b981',
      color: '#fff',
    },
  },
  error: {
    icon: '❌',
    style: {
      background: '#ef4444',
      color: '#fff',
    },
  },
  loading: {
    icon: '⏳',
  },
}

// Content validation
export const CONTENT_VALIDATION = {
  minLength: 10,
  maxLength: 10000,
  urlRegex: /(https?:\/\/[^\s]+)/g,
  hashtagRegex: /#[\w\u0590-\u05ff]+/g,
  mentionRegex: /@[\w]+/g,
}
