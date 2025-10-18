# Design Token Migration Plan

## Summary
Due to Claude Code hook restrictions on editing TypeScript files, I'm providing you with a **comprehensive migration guide** that you can apply manually or via a simple script.

## Quick Migration Commands

### 1. Create Page (app/create/page.tsx)

Already has imports partially. Add ALERT_VARIANTS and COLOR_DESTRUCTIVE:

```typescript
import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_DESTRUCTIVE, BUTTON_VARIANTS, ALERT_VARIANTS } from '@/lib/design-tokens'
```

**Find & Replace patterns:**

```bash
# Error banners
bg-red-50 border border-red-200 text-red-800
→ ${ALERT_VARIANTS.error}

# Success banners  
bg-green-50 border border-green-200 text-green-800
→ ${ALERT_VARIANTS.success}

# Destructive buttons (delete/error actions)
border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100
→ border ${COLOR_DESTRUCTIVE.border} px-3 py-1 text-xs font-medium ${COLOR_DESTRUCTIVE.text} ${COLOR_DESTRUCTIVE.bgHover}
```

### 2. Dashboard Page (app/dashboard/page.tsx)

Add imports:
```typescript
import { BADGE_VARIANTS, COLOR_SUCCESS, COLOR_PRIMARY, COLOR_DESTRUCTIVE } from '@/lib/design-tokens'
```

**Status badge function** (around line 120):
```typescript
// Before
function getStatusBadge(status: string) {
  if (status === 'published') {
    return 'text-green-600 bg-green-50'
  }
  if (status === 'scheduled') {
    return 'text-blue-600 bg-blue-50'
  }
  return 'text-red-600 bg-red-50'
}

// After
import { BADGE_VARIANTS } from '@/lib/design-tokens'
function getStatusBadge(status: string) {
  if (status === 'published') {
    return BADGE_VARIANTS.success
  }
  if (status === 'scheduled') {
    return BADGE_VARIANTS.primary
  }
  return BADGE_VARIANTS.destructive
}
```

### 3. Posts Page (app/posts/page.tsx)

Same pattern as Dashboard - update getStatusBadge function and delete button:

```typescript
// Delete button (line ~407)
className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
→
className={`w-full px-4 py-2 text-sm font-medium ${COLOR_DESTRUCTIVE.text} border ${COLOR_DESTRUCTIVE.border} rounded-md ${COLOR_DESTRUCTIVE.bgHover}`}
```

### 4. Connections Page (app/connections/page.tsx)

**Alert banners:**
```typescript
// Success
bg-green-50 border border-green-200 text-green-700
→ ${ALERT_VARIANTS.success}

// Error
bg-red-50 border border-red-200 text-red-700
→ ${ALERT_VARIANTS.error}
```

**Platform icons (line ~181, 217):**
```typescript
// Twitter
bg-blue-500
→ ${COLOR_PRIMARY.bg}

// LinkedIn  
bg-blue-700
→ bg-blue-700  // Keep this (LinkedIn brand color)
```

**Buttons:**
```typescript
// Disconnect (destructive)
text-red-600 border border-red-600 hover:bg-red-50
→ ${COLOR_DESTRUCTIVE.text} border ${COLOR_DESTRUCTIVE.border} ${COLOR_DESTRUCTIVE.bgHover}

// Connect (primary)
text-white bg-blue-700 hover:bg-blue-800
→ text-white ${COLOR_PRIMARY.bg} ${COLOR_PRIMARY.bgHover}
```

### 5. Auth Pages (signup, login, forgot-password, reset-password)

All follow same pattern:

```typescript
// Error alerts
bg-red-50 border border-red-200 text-red-700
→ ${ALERT_VARIANTS.error}

// Success alerts
bg-green-50 border border-green-200 text-green-700
→ ${ALERT_VARIANTS.success}
```

### 6. Templates Page (app/templates/page.tsx)

```typescript
// Warning badges (line ~213)
bg-yellow-100 text-yellow-800
→ ${BADGE_VARIANTS.warning}

// Delete button (line ~298)
border border-red-300 text-red-600 hover:bg-red-50
→ border ${COLOR_DESTRUCTIVE.border} ${COLOR_DESTRUCTIVE.text} ${COLOR_DESTRUCTIVE.bgHover}
```

---

## Automated Migration Script

Create this file as `migrate-design-tokens.sh`:

```bash
#!/bin/bash

# Design Token Migration Script
# Run from project root: bash migrate-design-tokens.sh

echo "🎨 Migrating to Design Tokens..."

# Function to add import if not present
add_import() {
  local file=$1
  local import_line="import { COLOR_PRIMARY, COLOR_SUCCESS, COLOR_DESTRUCTIVE, BUTTON_VARIANTS, ALERT_VARIANTS, BADGE_VARIANTS } from '@/lib/design-tokens'"
  
  if ! grep -q "design-tokens" "$file"; then
    # Add after other imports
    sed -i.bak "/^import.*from/a\\
$import_line
" "$file"
  fi
}

# Migrate Create page
echo "📝 Migrating app/create/page.tsx..."
sed -i.bak \
  -e 's/bg-red-50 border border-red-200 text-red-800/${ALERT_VARIANTS.error}/g' \
  -e 's/bg-green-50 border border-green-200 text-green-800/${ALERT_VARIANTS.success}/g' \
  app/create/page.tsx

# Migrate Dashboard
echo "📊 Migrating app/dashboard/page.tsx..."
sed -i.bak \
  -e "s/text-green-600 bg-green-50/BADGE_VARIANTS.success/g" \
  -e "s/text-blue-600 bg-blue-50/BADGE_VARIANTS.primary/g" \
  -e "s/text-red-600 bg-red-50/BADGE_VARIANTS.destructive/g" \
  app/dashboard/page.tsx

# Migrate Posts page
echo "📄 Migrating app/posts/page.tsx..."
sed -i.bak \
  -e "s/text-green-600 bg-green-50/BADGE_VARIANTS.success/g" \
  -e "s/text-blue-600 bg-blue-50/BADGE_VARIANTS.primary/g" \
  -e "s/text-red-600 bg-red-50/BADGE_VARIANTS.destructive/g" \
  app/posts/page.tsx

# Migrate Connections page
echo "🔗 Migrating app/connections/page.tsx..."
sed -i.bak \
  -e 's/bg-green-50 border border-green-200 text-green-700/${ALERT_VARIANTS.success}/g' \
  -e 's/bg-red-50 border border-red-200 text-red-700/${ALERT_VARIANTS.error}/g' \
  app/connections/page.tsx

# Migrate auth pages
for page in signup forgot-password reset-password; do
  echo "🔐 Migrating app/$page/page.tsx..."
  sed -i.bak \
    -e 's/bg-red-50 border border-red-200 text-red-700/${ALERT_VARIANTS.error}/g' \
    -e 's/bg-green-50 border border-green-200 text-green-700/${ALERT_VARIANTS.success}/g' \
    app/$page/page.tsx
done

echo "✅ Migration complete!"
echo "📝 Backup files created with .bak extension"
echo "🧪 Please test the application and verify visual consistency"
