# /review-phase - Review Changes Before Committing

Reviews all changes in current phase before committing

## What this command does:

1. Shows all changed files since last commit
2. Summarizes what changed (added, modified, deleted)
3. Verifies tests still pass
4. Checks for common issues:
   - Leftover console.log statements
   - Commented-out code
   - TODO comments
   - Debugging code
5. Suggests descriptive commit message
6. **Waits for your approval** before committing

## Usage:

```bash
/review-phase
```

## Example Output:

```
=== Phase Review ===

Files changed: 5
- Modified: app/api/schedule/route.ts
- Modified: lib/qstash.ts
- Modified: lib/supabase.ts
- Added: lib/supabase.test.ts
- Deleted: debug-test.js

Summary of changes:
✅ Added authentication check to /api/schedule
✅ Improved error handling in QStash scheduling
✅ Added unit tests for Supabase client
✅ Removed debug script

Checks:
✅ No console.log statements added
✅ No commented-out code
✅ No debugging code left
⚠️  Found 2 TODO comments (acceptable)

Running tests...
✅ All 15 tests pass

Suggested commit message:
"feat(security): add authentication to schedule endpoint

- Add user verification before scheduling posts
- Improve QStash error handling with retry logic
- Add unit tests for Supabase admin client
- Remove obsolete debug scripts

Fixes: CRIT-002
"

Approve this commit? (y/n)
Modify commit message? (m)
Cancel? (c)
```

## When to use:

- After completing a set of related changes
- Before moving to next phase
- End of coding session
- Before creating pull request

## What gets checked:

### Code Quality
- ✅ Tests pass
- ✅ No TypeScript errors
- ✅ No ESLint errors (if configured)

### Code Cleanliness
- ⚠️  Console.log statements (warns if found)
- ⚠️  Commented-out code (warns if found)
- ⚠️  Debug code (process.exit, debugger, etc.)
- ⚠️  TODO/FIXME comments (lists them)

### File Hygiene
- ⚠️  Unintended file changes (.env, package-lock.json)
- ⚠️  Large files added (>100KB)
- ⚠️  Binary files (images, PDFs)

## Commit Message Format:

Follows conventional commits:
```
type(scope): short description

- Detailed change 1
- Detailed change 2
- Detailed change 3

Fixes: ISSUE-001
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

## Interactive Options:

- **y** - Approve and commit
- **n** - Cancel (keep changes unstaged)
- **m** - Modify commit message (opens editor)
- **c** - Cancel and revert changes (uses /rewind)

## Safety:

- ✅ Shows full diff before committing
- ✅ Requires explicit approval
- ✅ Tests must pass
- ✅ Can be reverted with /rewind

## Multiple Commits:

If changes are too large, suggests splitting into multiple commits:

```
⚠️  Warning: Large changeset detected (15 files)

Suggested split:
1. Security fixes (3 files) - commit separately
2. Test additions (8 files) - commit separately
3. Documentation (4 files) - commit separately

Split into multiple commits? (y/n)
```
