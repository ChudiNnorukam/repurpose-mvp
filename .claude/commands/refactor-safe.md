# /refactor-safe - Safe Refactoring with Tests

Refactor code safely with test protection and incremental changes

## What this command does:

1. Shows current messy/complex code
2. Proposes refactoring approach with specific steps
3. **Waits for your approval**
4. Makes changes incrementally:
   - Refactor one function/component
   - Run tests immediately
   - If tests fail, revert with /rewind
   - Commit working state
5. Moves to next refactoring

## Refactoring Priorities:

1. Extract duplicated code into shared utilities
2. Break down complex functions (>50 lines → smaller functions)
3. Improve naming (vague → descriptive)
4. Add proper types/interfaces
5. Organize imports and file structure
6. Add error handling where missing

## Safety Rules:

- ✅ Keep diffs small (<200 lines per commit)
- ✅ Run tests after EVERY change
- ✅ No "while we're here" extras - stay focused
- ✅ Use /rewind liberally if something breaks
- ✅ Document WHY for non-obvious refactors
- ❌ NO behavior changes - only structure improvements

## Usage:

```bash
/refactor-safe [file]

# Examples:
/refactor-safe app/create/page.tsx
/refactor-safe lib/twitter.ts
/refactor-safe  # Suggests highest priority refactoring
```

## Example Flow:

```
You: "/refactor-safe app/create/page.tsx"

Claude: "Found 366-line component with mixed concerns.

Proposed refactoring:
1. Extract useContentAdaptation hook (lines 121-161)
2. Extract usePostScheduling hook (lines 76-119)
3. Extract PlatformSelector component (lines 244-273)
4. Extract AdaptedContentCard component (lines 307-358)

This will:
- Reduce main component to ~150 lines
- Improve testability
- Enable component reuse

Approve? (y/n)"

You: "y"

Claude: "Starting with Step 1: useContentAdaptation hook

Creating hooks/useContentAdaptation.ts...
[creates file]

Updating app/create/page.tsx to use hook...
[modifies component]

Running tests...
✅ All tests pass

Created commit: 'refactor: extract useContentAdaptation hook from CreatePage'

Ready for Step 2? (y/n)"
```

## When to use:

- After Phase 1 (critical fixes) is complete
- After Phase 2 (test coverage) is in place
- When code is working but hard to maintain
- Before adding new features to messy code

## Prerequisites:

Tests must exist for the code being refactored. If no tests:
1. First run `/add-tests [file]`
2. Then run `/refactor-safe [file]`

## What this command WON'T do:

- ❌ Change behavior or fix bugs (use /fix-critical instead)
- ❌ Add new features
- ❌ Refactor without tests
- ❌ Make large sweeping changes
