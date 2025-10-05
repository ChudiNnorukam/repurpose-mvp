# /format-all - Format Entire Codebase

Applies consistent formatting across all code files

## What this command does:

1. Runs Prettier on all TypeScript/TSX files
2. Fixes ESLint auto-fixable issues
3. Organizes imports
4. Removes unused imports/variables
5. Standardizes quote style
6. Fixes indentation
7. Creates single commit for all formatting changes

## Usage:

```bash
/format-all
```

## What gets formatted:

- All `.ts` and `.tsx` files in `app/` and `lib/`
- Excluded: `node_modules/`, `.next/`, `build/`

## Configuration:

Uses existing config files:
- `.prettierrc` (or Prettier defaults)
- `eslint.config.mjs`
- `tsconfig.json`

## Safety:

- ✅ Formatting-only changes (no logic changes)
- ✅ Single commit: "style: format entire codebase"
- ✅ Runs tests after formatting to ensure nothing broke
- ✅ Can be reverted easily if needed

## Example Output:

```
Formatting 32 files...

✓ app/create/page.tsx - formatted
✓ app/api/schedule/route.ts - formatted
✓ lib/twitter.ts - formatted
✓ lib/anthropic.ts - formatted
...

Fixed issues:
- Inconsistent quote style: 24 files
- Mixed indentation: 8 files
- Unused imports: 12 files
- Import ordering: 18 files

Running tests...
✅ All tests pass

Created commit: "style: format entire codebase with Prettier"
```

## When to use:

- Phase 4: Documentation & Polish
- Before creating a pull request
- After large refactoring
- Weekly code cleanup

## Manual formatting:

If you prefer to format specific files:

```bash
npx prettier --write app/create/page.tsx
npx eslint --fix lib/twitter.ts
```

## Note:

This command focuses ONLY on formatting. For code quality improvements (extracting functions, renaming variables, etc.), use `/refactor-safe` instead.
