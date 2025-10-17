# Design Token System

## Overview

This project uses a centralized design token system to ensure consistent colors, spacing, and styling across the application.

**File**: `lib/design-tokens.ts`

## Color System

### Semantic Colors

We use **semantic color tokens** instead of hardcoded Tailwind classes:

| Token | Use Case | Color |
|-------|----------|-------|
| `COLOR_PRIMARY` | Main application actions | Blue (`blue-600`) |
| `COLOR_AI` | AI-specific features | Purple (`purple-600`) |
| `COLOR_SUCCESS` | Positive outcomes | Green (`green-600`) |
| `COLOR_DESTRUCTIVE` | Dangerous actions | Red (`red-600`) |
| `COLOR_WARNING` | Caution states | Yellow (`yellow-600`) |
| `COLOR_SECONDARY` | Supporting actions | Gray (`gray-600`) |

### Usage Examples

#### ❌ Before (Inconsistent)
```tsx
// Bad: Hardcoded colors, inconsistent usage
<button className="bg-blue-600 hover:bg-blue-700">Create</button>
<button className="bg-purple-600 hover:bg-purple-700">Create</button> // Different color for same action!
```

#### ✅ After (Consistent)
```tsx
import { COLOR_PRIMARY, COLOR_AI } from '@/lib/design-tokens'

// Good: Semantic tokens
<button className={`${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover}`}>
  Create Content
</button>

<button className={`${COLOR_AI.bg} ${COLOR_AI.bgHover}`}>
  Generate with AI
</button>
```

### Pre-built Variants

Use pre-built variants for common components:

```tsx
import { BUTTON_VARIANTS } from '@/lib/design-tokens'

<button className={BUTTON_VARIANTS.primary}>Primary Action</button>
<button className={BUTTON_VARIANTS.ai}>AI Feature</button>
<button className={BUTTON_VARIANTS.success}>Schedule</button>
<button className={BUTTON_VARIANTS.destructive}>Delete</button>
```

## Component Variants

### Buttons
```tsx
BUTTON_VARIANTS.primary      // Main CTAs
BUTTON_VARIANTS.ai           // AI-powered actions
BUTTON_VARIANTS.success      // Positive actions (Schedule, Publish)
BUTTON_VARIANTS.destructive  // Dangerous actions (Delete, Remove)
BUTTON_VARIANTS.secondary    // Supporting actions
BUTTON_VARIANTS.ghost        // Subtle actions
```

### Badges
```tsx
BADGE_VARIANTS.default       // Neutral info
BADGE_VARIANTS.primary       // Highlighted info
BADGE_VARIANTS.success       // Success states
BADGE_VARIANTS.warning       // Warning states
BADGE_VARIANTS.destructive   // Error states
```

### Alerts/Banners
```tsx
ALERT_VARIANTS.success       // Success messages
ALERT_VARIANTS.error         // Error messages
ALERT_VARIANTS.warning       // Warning messages
ALERT_VARIANTS.info          // Info messages
```

## Usage Guidelines

### 1. PRIMARY (Blue) - Main Actions
**When to use:**
- Main CTAs: "Create Content", "Save", "Continue"
- Active navigation states
- Primary links and buttons

**Examples:**
```tsx
<button className={BUTTON_VARIANTS.primary}>
  Create Content
</button>
```

### 2. AI (Purple) - AI Features
**When to use:**
- AI-powered features: "Generate Content", "AI Adapt"
- Smart suggestions, automated features
- Anything that uses LLM/AI

**Examples:**
```tsx
<button className={BUTTON_VARIANTS.ai}>
  Generate with AI
</button>
```

### 3. SUCCESS (Green) - Positive Outcomes
**When to use:**
- Success messages and confirmations
- Completed actions: "Published", "Scheduled", "Connected"
- Positive status indicators

**Examples:**
```tsx
<div className={ALERT_VARIANTS.success}>
  Content published successfully!
</div>
```

### 4. DESTRUCTIVE (Red) - Dangerous Actions
**When to use:**
- Delete, remove, cancel actions
- Error states and messages
- Critical warnings

**Examples:**
```tsx
<button className={BUTTON_VARIANTS.destructive}>
  Delete Post
</button>
```

### 5. WARNING (Yellow) - Cautions
**When to use:**
- Warning messages (not errors)
- States needing attention: "Not connected", "Pending"
- Cautionary information

**Examples:**
```tsx
<div className={ALERT_VARIANTS.warning}>
  No accounts connected. Connect to continue.
</div>
```

### 6. SECONDARY (Gray) - Supporting Actions
**When to use:**
- Secondary buttons: "Cancel", "Back", "Skip"
- Ghost buttons for subtle actions
- Neutral information

**Examples:**
```tsx
<button className={BUTTON_VARIANTS.secondary}>
  Cancel
</button>
```

## Gradients & Backgrounds

```tsx
import { GRADIENT_BACKGROUNDS } from '@/lib/design-tokens'

// Subtle gradient for dashboard pages
<div className={GRADIENT_BACKGROUNDS.primarySubtle}>
  
// Subtle gradient for AI features
<div className={GRADIENT_BACKGROUNDS.aiSubtle}>

// Dark gradient for landing page
<div className={GRADIENT_BACKGROUNDS.landing}>
```

## Typography

```tsx
import { TEXT } from '@/lib/design-tokens'

<h1 className={TEXT.h1}>Page Title</h1>
<h2 className={TEXT.h2}>Section Title</h2>
<p className={TEXT.body}>Body text</p>
<small className={TEXT.muted}>Muted text</small>
```

## Containers & Cards

```tsx
import { CONTAINER, CARD } from '@/lib/design-tokens'

<div className={`${CONTAINER.maxWidth} ${CONTAINER.padding}`}>
  <div className={`${CARD.base} ${CARD.padding} ${CARD.hover}`}>
    Card content
  </div>
</div>
```

## Anti-Patterns to Avoid

### ❌ Don't Mix Colors for Same Action Type
```tsx
// BAD: Using different colors for the same type of action
<button className="bg-blue-600">Create</button>
<button className="bg-purple-600">Create</button> // Confusing!
```

### ❌ Don't Hardcode Colors
```tsx
// BAD: Hardcoded colors
<button className="bg-blue-600 hover:bg-blue-700">Click me</button>

// GOOD: Use tokens
<button className={`${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover}`}>Click me</button>
```

### ❌ Don't Use Primary for AI Features
```tsx
// BAD: Using primary blue for AI features
<button className={COLOR_PRIMARY.bg}>Generate with AI</button>

// GOOD: Use AI purple for AI features
<button className={COLOR_AI.bg}>Generate with AI</button>
```

## Migration Checklist

When refactoring existing components:

1. [ ] Replace hardcoded `bg-blue-600` with `COLOR_PRIMARY.bg`
2. [ ] Replace hardcoded `bg-purple-600` with `COLOR_AI.bg` (for AI features only)
3. [ ] Replace hardcoded `bg-green-600` with `COLOR_SUCCESS.bg`
4. [ ] Replace hardcoded `bg-red-600` with `COLOR_DESTRUCTIVE.bg`
5. [ ] Use pre-built `BUTTON_VARIANTS` instead of inline className strings
6. [ ] Use `ALERT_VARIANTS` for success/error messages
7. [ ] Use `BADGE_VARIANTS` for status pills
8. [ ] Test that all states (hover, focus, active) still work correctly

## Benefits

✅ **Consistency**: All pages use the same colors for the same purposes  
✅ **Maintainability**: Change colors in one place, updates everywhere  
✅ **Clarity**: Semantic names make intent clear (`COLOR_AI` vs `blue-600`)  
✅ **Type Safety**: TypeScript types prevent typos  
✅ **Documentation**: Self-documenting code with clear usage guidelines  

## Questions?

See the inline documentation in `lib/design-tokens.ts` or refer to the UI/UX audit document for the rationale behind these choices.
