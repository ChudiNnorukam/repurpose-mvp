/**
 * Design Token System
 * 
 * Centralized color and style constants for consistent UI/UX.
 * Based on UI/UX audit recommendations.
 */

// ============================================================================
// SEMANTIC COLOR TOKENS
// ============================================================================

/**
 * Primary brand color - used for main CTAs and brand elements
 * Use: Main buttons, links, active navigation, brand accents
 */
export const COLOR_PRIMARY = {
  bg: 'bg-blue-600',
  bgHover: 'hover:bg-blue-700',
  bgActive: 'active:bg-blue-800',
  bgLight: 'bg-blue-50',
  text: 'text-blue-600',
  textHover: 'hover:text-blue-700',
  border: 'border-blue-600',
  ring: 'ring-blue-500',
  textDark: 'text-blue-700',
  from: 'from-blue-600',
  to: 'to-blue-700',
} as const

/**
 * AI/Generate features - distinct from primary for AI-specific actions
 * Use: Generate buttons, AI-powered features, smart suggestions
 */
export const COLOR_AI = {
  bg: 'bg-purple-600',
  bgHover: 'hover:bg-purple-700',
  bgActive: 'active:bg-purple-800',
  bgLight: 'bg-purple-50',
  text: 'text-purple-600',
  textHover: 'hover:text-purple-700',
  border: 'border-purple-600',
  ring: 'ring-purple-500',
  textDark: 'text-purple-700',
  from: 'from-purple-600',
  to: 'to-purple-700',
} as const

/**
 * Success states - confirmations, completed actions
 * Use: Success messages, completed states, positive feedback
 */
export const COLOR_SUCCESS = {
  bg: 'bg-green-600',
  bgHover: 'hover:bg-green-700',
  bgLight: 'bg-green-50',
  text: 'text-green-600',
  textDark: 'text-green-700',
  textLight: 'text-green-800',
  border: 'border-green-200',
  ring: 'ring-green-500',
} as const

/**
 * Destructive actions - deletions, errors, warnings
 * Use: Delete buttons, error messages, destructive confirmations
 */
export const COLOR_DESTRUCTIVE = {
  bg: 'bg-red-600',
  bgHover: 'hover:bg-red-700',
  bgLight: 'bg-red-50',
  text: 'text-red-600',
  textDark: 'text-red-700',
  textLight: 'text-red-800',
  border: 'border-red-200',
  ring: 'ring-red-500',
} as const

/**
 * Warning states - cautions, pending actions
 * Use: Warning messages, pending states, attention needed
 */
export const COLOR_WARNING = {
  bg: 'bg-yellow-600',
  bgHover: 'hover:bg-yellow-700',
  bgLight: 'bg-yellow-50',
  text: 'text-yellow-600',
  textDark: 'text-yellow-700',
  textLight: 'text-yellow-800',
  border: 'border-yellow-200',
} as const

/**
 * Info/Secondary actions
 * Use: Secondary buttons, informational messages, optional actions
 */
export const COLOR_SECONDARY = {
  bg: 'bg-gray-600',
  bgHover: 'hover:bg-gray-700',
  bgLight: 'bg-gray-50',
  text: 'text-gray-600',
  textDark: 'text-gray-700',
  textLight: 'text-gray-900',
  border: 'border-gray-300',
  ring: 'ring-gray-500',
} as const

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export const BUTTON_VARIANTS = {
  primary: `${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover} text-white font-medium rounded-md px-4 py-2 transition-colors focus:outline-none focus:ring-2 ${COLOR_PRIMARY.ring} focus:ring-offset-2`,
  
  ai: `${COLOR_AI.bg} ${COLOR_AI.bgHover} text-white font-medium rounded-md px-4 py-2 transition-colors focus:outline-none focus:ring-2 ${COLOR_AI.ring} focus:ring-offset-2`,
  
  success: `${COLOR_SUCCESS.bg} ${COLOR_SUCCESS.bgHover} text-white font-medium rounded-md px-4 py-2 transition-colors focus:outline-none focus:ring-2 ${COLOR_SUCCESS.ring} focus:ring-offset-2`,
  
  destructive: `${COLOR_DESTRUCTIVE.bg} ${COLOR_DESTRUCTIVE.bgHover} text-white font-medium rounded-md px-4 py-2 transition-colors focus:outline-none focus:ring-2 ${COLOR_DESTRUCTIVE.ring} focus:ring-offset-2`,
  
  secondary: `bg-white ${COLOR_SECONDARY.bgHover} ${COLOR_SECONDARY.text} font-medium rounded-md px-4 py-2 border ${COLOR_SECONDARY.border} transition-colors focus:outline-none focus:ring-2 ${COLOR_SECONDARY.ring} focus:ring-offset-2`,
  
  ghost: `bg-transparent hover:bg-gray-100 ${COLOR_SECONDARY.text} font-medium rounded-md px-4 py-2 transition-colors`,
} as const

// ============================================================================
// BADGE/PILL VARIANTS  
// ============================================================================

export const BADGE_VARIANTS = {
  default: `${COLOR_SECONDARY.bgLight} ${COLOR_SECONDARY.text} text-xs font-semibold px-2.5 py-0.5 rounded-full`,
  
  primary: `bg-blue-100 ${COLOR_PRIMARY.text} text-xs font-semibold px-2.5 py-0.5 rounded-full`,
  
  success: `${COLOR_SUCCESS.bgLight} ${COLOR_SUCCESS.textDark} text-xs font-semibold px-2.5 py-0.5 rounded-full`,
  
  warning: `${COLOR_WARNING.bgLight} ${COLOR_WARNING.textDark} text-xs font-semibold px-2.5 py-0.5 rounded-full`,
  
  destructive: `${COLOR_DESTRUCTIVE.bgLight} ${COLOR_DESTRUCTIVE.textDark} text-xs font-semibold px-2.5 py-0.5 rounded-full`,
} as const

// ============================================================================
// ALERT/BANNER VARIANTS
// ============================================================================

export const ALERT_VARIANTS = {
  success: `${COLOR_SUCCESS.bgLight} ${COLOR_SUCCESS.border} ${COLOR_SUCCESS.textLight} border rounded-lg p-4`,
  
  error: `${COLOR_DESTRUCTIVE.bgLight} ${COLOR_DESTRUCTIVE.border} ${COLOR_DESTRUCTIVE.textLight} border rounded-lg p-4`,
  
  warning: `${COLOR_WARNING.bgLight} ${COLOR_WARNING.border} ${COLOR_WARNING.textLight} border rounded-lg p-4`,
  
  info: `${COLOR_SECONDARY.bgLight} ${COLOR_SECONDARY.border} ${COLOR_SECONDARY.textLight} border rounded-lg p-4`,
} as const

// ============================================================================
// GRADIENT BACKGROUNDS
// ============================================================================

export const GRADIENT_BACKGROUNDS = {
  primarySubtle: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
  aiSubtle: 'bg-gradient-to-br from-purple-50 via-white to-blue-50',
  landing: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
} as const

// ============================================================================
// SPACING & SIZING
// ============================================================================

export const CONTAINER = {
  maxWidth: 'max-w-7xl',
  padding: 'px-4 sm:px-6 lg:px-8',
  section: 'py-12',
} as const

export const CARD = {
  base: 'bg-white rounded-lg shadow',
  padding: 'p-6',
  hover: 'hover:shadow-lg transition-shadow',
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TEXT = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  body: 'text-gray-700',
  muted: 'text-gray-500',
  small: 'text-sm text-gray-600',
} as const

// ============================================================================
// USAGE GUIDELINES
// ============================================================================

/**
 * USAGE GUIDELINES:
 * 
 * 1. PRIMARY (Blue) - Main application actions
 *    - "Create Content", "Save", "Continue"
 *    - Main navigation active states
 *    - Primary CTAs
 * 
 * 2. AI (Purple) - AI-specific features
 *    - "Generate Content", "AI Adapt", "Smart Suggestions"
 *    - Anything powered by AI/LLM
 *    - Distinguishes AI features from regular features
 * 
 * 3. SUCCESS (Green) - Positive outcomes
 *    - Success messages, completed actions
 *    - "Schedule", "Publish", "Connected"
 *    - Confirmation banners
 * 
 * 4. DESTRUCTIVE (Red) - Dangerous actions
 *    - "Delete", "Remove", "Cancel"
 *    - Error states, failed actions
 *    - Warning messages requiring attention
 * 
 * 5. WARNING (Yellow) - Caution states
 *    - "Not connected", "Pending", "Needs attention"
 *    - Warnings that aren't errors
 * 
 * 6. SECONDARY (Gray) - Supporting actions
 *    - "Cancel", "Back", "Skip"
 *    - Secondary buttons, ghost buttons
 *    - Neutral information
 * 
 * ANTI-PATTERNS TO AVOID:
 * - Don't mix blue-600 and purple-600 for the same type of action
 * - Don't use hardcoded colors - use these tokens instead
 * - Don't use primary blue for AI features - use AI purple
 * - Don't use random accent colors - stick to the semantic set
 */
