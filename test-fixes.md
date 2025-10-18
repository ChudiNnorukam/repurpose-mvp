# Critical Fixes for Hero Page & Command Palette

## Fix #1: Subheading Color Contrast (CRITICAL)

**File**: /Users/chudinnorukam/Downloads/Repurpose MVP /app/landing/page.tsx
**Line**: 197-199

### Current Code:
```typescript
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.25, duration: 0.6 }}
  className="mt-6 max-w-2xl text-xl text-muted-foreground"
  data-testid="hero-subtext"
>
  Write once. Our AI adapts it for LinkedIn, Twitter, Instagram — instantly.
</motion.p>
```

### Fixed Code:
```typescript
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.25, duration: 0.6 }}
  className="mt-6 max-w-2xl text-xl text-gray-300"
  data-testid="hero-subtext"
>
  Write once. Our AI adapts it for LinkedIn, Twitter, Instagram — instantly.
</motion.p>
```

**Change**: `text-muted-foreground` → `text-gray-300`
**Reason**: Improves contrast ratio from ~3.2:1 to 7.5:1 (exceeds WCAG AA 4.5:1 requirement)

---

## Fix #2: Command Palette ARIA Attributes (CRITICAL)

**File**: /Users/chudinnorukam/Downloads/Repurpose MVP /components/ui/command-palette.tsx
**Lines**: 52-62

### Current Code:
```typescript
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
```

### Fixed Code:
```typescript
return (
  <div 
    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="command-palette-title"
  >
    <div 
      className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4"
      onClick={(e) => e.stopPropagation()}
    >
      <Command 
        className="rounded-lg border border-gray-200 bg-white shadow-2xl"
        shouldFilter={true}
      >
        <span id="command-palette-title" className="sr-only">Command Palette</span>
```

**Changes**:
1. Added `role="dialog"` to backdrop
2. Added `aria-modal="true"` to backdrop
3. Added `aria-labelledby="command-palette-title"` to backdrop
4. Added hidden title for screen readers
5. Added `px-4` for mobile padding

---

## Fix #3: ShimmerButton Responsive Width (WARNING)

**File**: /Users/chudinnorukam/Downloads/Repurpose MVP /app/landing/page.tsx
**Line**: 209-216

### Current Code:
```typescript
<ShimmerButton
  onClick={() => router.push('/signup')}
  className="text-xl px-10 py-6"
  aria-label="Start creating content with AI"
>
  Start Creating Content
</ShimmerButton>
```

### Fixed Code:
```typescript
<ShimmerButton
  onClick={() => router.push('/signup')}
  className="w-full sm:w-auto text-base sm:text-xl px-6 sm:px-10 py-4 sm:py-6"
  aria-label="Start creating content with AI"
>
  Start Creating Content
</ShimmerButton>
```

**Changes**:
- Added `w-full sm:w-auto` for full-width on mobile
- Changed `text-xl` → `text-base sm:text-xl` for responsive text sizing
- Changed `px-10 py-6` → `px-6 sm:px-10 py-4 sm:py-6` for responsive padding

---

## Fix #4: Navigation Buttons Focus Indicators (WARNING)

**File**: /Users/chudinnorukam/Downloads/Repurpose MVP /app/landing/page.tsx
**Lines**: 168-177

### Current Code:
```typescript
<Link href="/login">
  <Button variant="ghost" size="sm">
    Login
  </Button>
</Link>
<Link href="/signup">
  <Button size="sm" className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover}`}>
    Sign Up
  </Button>
</Link>
```

### Fixed Code:
```typescript
<Link href="/login">
  <Button 
    variant="ghost" 
    size="sm"
    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
  >
    Login
  </Button>
</Link>
<Link href="/signup">
  <Button 
    size="sm" 
    className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900`}
  >
    Sign Up
  </Button>
</Link>
```

**Changes**:
- Added `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` to Login button
- Added `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900` to Sign Up button

---

## Fix #5: ShimmerButton Animation Performance (WARNING)

**File**: /Users/chudinnorukam/Downloads/Repurpose MVP /components/magicui/shimmer-button.tsx
**Lines**: 27-36

### Current Code:
```typescript
<motion.div
  className="absolute inset-0 z-0"
  initial={{ backgroundPosition: "-200% 0" }}
  animate={{ backgroundPosition: "200% 0" }}
  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  style={{
    background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
    backgroundSize: "200% 100%"
  }}
/>
```

### Fixed Code:
```typescript
<motion.div
  className="absolute inset-0 z-0"
  initial={{ backgroundPosition: "-200% 0" }}
  animate={{ backgroundPosition: "200% 0" }}
  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  style={{
    background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
    backgroundSize: "200% 100%",
    willChange: "background-position"
  }}
/>
```

**Change**: Added `willChange: "background-position"` to optimize animation performance

---

## Application Order

Apply fixes in this order:

1. **Fix #1** (Critical): Subheading contrast
2. **Fix #2** (Critical): Command palette ARIA
3. **Fix #3** (Warning): ShimmerButton responsive
4. **Fix #4** (Warning): Navigation focus indicators
5. **Fix #5** (Warning): Animation performance

Total estimated time: 30-45 minutes

---

## Verification Steps

After applying fixes:

1. **Contrast Check**: Use browser DevTools to verify text-gray-300 contrast
2. **Screen Reader Test**: Use VoiceOver (Mac) or NVDA (Windows) to test Command palette
3. **Responsive Test**: Resize browser to 375px, 768px, 1024px widths
4. **Keyboard Test**: Tab through all interactive elements, verify focus rings
5. **Performance Test**: Open Chrome DevTools Performance tab, record 6 seconds of ShimmerButton animation

---

## Expected Results

After fixes:

- ✅ WCAG 2.1 AA color contrast compliance
- ✅ Screen reader announces "Command Palette" dialog
- ✅ ShimmerButton adapts to mobile width
- ✅ All buttons show focus indicators
- ✅ ShimmerButton animation maintains 60fps
