# /add-tests - Generate Tests for Untested Code

Adds comprehensive test coverage for critical functions and components

## What this command does:

1. Analyzes specified file/function
2. Identifies what it's supposed to do
3. Identifies edge cases and error scenarios
4. Proposes test cases (shows you the list first)
5. **Waits for your approval** of test plan
6. Writes the tests (they may fail on current buggy code - that's OK)
7. Creates commit: "test: add tests for [component]"

## Test Priority Order:

1. Core business logic
2. Data manipulation functions
3. API endpoints / external interfaces
4. State management
5. UI components with complex logic

## Usage:

```bash
/add-tests [file or function]

# Examples:
/add-tests lib/twitter.ts
/add-tests app/api/schedule/route.ts
/add-tests lib/social-media/refresh.ts
/add-tests  # Identifies highest priority untested code
```

## Example Flow:

```
You: "/add-tests lib/social-media/refresh.ts"

Claude: "Analyzing refreshIfNeeded function...

This function:
- Checks if refresh token exists
- Calls platform token endpoint
- Updates database with new tokens
- Falls back to old token on failure

Proposed test cases:
1. ✅ Returns existing token when no refresh_token
2. ✅ Successfully refreshes Twitter token
3. ✅ Successfully refreshes LinkedIn token
4. ✅ Handles unsupported platform
5. ✅ Falls back to old token when API call fails
6. ✅ Falls back when token endpoint returns 400
7. ✅ Updates database with new tokens
8. ✅ Preserves old refresh_token if new one not provided

Approve test plan? (y/n)"

You: "y"

Claude: "Creating lib/social-media/__tests__/refresh.test.ts...

[writes tests using Jest + mocks]

Running tests...
❌ 2 tests failed (expected - reveals bugs):
  - Test 5: Falls back but doesn't log error
  - Test 7: Database update has race condition

This is GOOD - tests found bugs before refactoring!

Created commit: 'test: add comprehensive tests for token refresh'

Next steps:
1. Fix bugs revealed by failing tests
2. Then use /refactor-safe to improve code structure
"
```

## Test Framework:

Uses **Jest** with:
- Mocking for external APIs (OpenAI, Twitter, LinkedIn)
- Supertest for API route testing
- Testing Library for React components
- MSW for HTTP mocking

## Safety Notes:

- ✅ Don't fix bugs yet - just write tests
- ✅ If writing tests reveals bugs, NOTE them but don't fix
- ✅ Tests can fail initially - that's expected
- ✅ Commit each test file separately

## When to use:

- Before refactoring (Phase 2 in rescue plan)
- After adding new features
- Before deploying critical code
- When code has no test coverage

## What gets tested:

### For Functions
- Happy path (expected inputs)
- Edge cases (empty, null, undefined)
- Error scenarios (API failures, network issues)
- Boundary conditions (max length, zero values)

### For API Routes
- Valid requests return success
- Missing parameters return 400
- Unauthorized requests return 401
- Server errors return 500
- Database failures are handled

### For Components
- Renders correctly with valid props
- Handles loading states
- Handles error states
- User interactions work
- Form validation

## Output:

- New test file(s) in appropriate location
- All test cases implemented
- Mocks for external dependencies
- Clear test descriptions
