# E2E Testing with Playwright

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. E2E tests verify that the application works correctly from a user's perspective, testing complete user flows across multiple pages and interactions.

## Running Tests Locally

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (first time only):
   ```bash
   npx playwright install chromium
   ```

### Running Tests

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run tests in UI mode (interactive):**
```bash
npm run test:e2e:ui
```

**Run tests in headed mode (see browser):**
```bash
npx playwright test --headed
```

**Run specific test file:**
```bash
npx playwright test tests/hero.spec.ts
```

**Run tests in debug mode:**
```bash
npx playwright test --debug
```

### Viewing Test Results

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Test Structure

Tests are located in the `tests/` directory:

```
tests/
├── hero.spec.ts              # Hero section tests
├── check-auth.spec.ts        # Authentication flow tests
├── check-pages.spec.ts       # Page navigation tests
├── generate-page.spec.ts     # Content generation tests
├── schedule-with-login.spec.ts  # Post scheduling tests
├── ui-ux-create-flow.spec.ts    # Creation flow tests
├── ui-ux-dashboard.spec.ts      # Dashboard UI tests
└── ui-ux-landing.spec.ts        # Landing page tests
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/landing')
    
    // Interact with elements
    await page.getByTestId('button-id').click()
    
    // Assert expectations
    await expect(page.getByText('Expected Text')).toBeVisible()
  })
})
```

### Best Practices

1. **Use data-testid attributes:**
   ```typescript
   await page.getByTestId('cta-primary').click()
   ```

2. **Wait for navigation and loading:**
   ```typescript
   await page.waitForLoadState('networkidle')
   ```

3. **Use descriptive test names:**
   ```typescript
   test('renders headline and CTAs on landing page', async ({ page }) => {
     // Test implementation
   })
   ```

4. **Group related tests:**
   ```typescript
   test.describe('Hero Component', () => {
     test('renders headline', async ({ page }) => { /* ... */ })
     test('renders CTAs', async ({ page }) => { /* ... */ })
   })
   ```

5. **Clean up after tests:**
   ```typescript
   test.afterEach(async ({ page }) => {
     await page.close()
   })
   ```

## CI/CD Integration

E2E tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Configuration

The E2E test job in `.github/workflows/ci.yml`:
- Runs after lint, typecheck, and unit tests pass
- Uses headless Chromium browser
- Retries failed tests up to 2 times
- Uploads test artifacts for debugging

### Viewing CI Test Results

1. **GitHub Actions UI:**
   - Go to Actions tab in GitHub
   - Click on the workflow run
   - Navigate to "E2E Tests" job
   - View test results and logs

2. **Artifacts:**
   - Playwright HTML report (30-day retention)
   - Test results JSON
   - Screenshots of failed tests
   - Videos of failed tests
   - Traces for debugging

3. **Download artifacts:**
   ```bash
   gh run download <run-id>
   ```

## Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:
- **testDir**: `./tests` - Where test files are located
- **baseURL**: `http://localhost:3000` - Base URL for tests
- **retries**: 2 retries in CI, 0 locally
- **workers**: 1 worker in CI for stability
- **timeout**: 10s action timeout, 15s navigation timeout
- **screenshots**: Captured only on failure
- **videos**: Retained only on failure
- **traces**: Captured on first retry

### Reporters

In CI, multiple reporters are used:
- **HTML**: Visual test report
- **JSON**: Machine-readable results
- **JUnit**: For CI integrations
- **GitHub**: Annotations on failed tests

## Debugging Failed Tests

### Local Debugging

1. **Run in debug mode:**
   ```bash
   npx playwright test --debug tests/hero.spec.ts
   ```

2. **Use Playwright Inspector:**
   - Pause execution
   - Step through test
   - Inspect page state
   - Try selectors in real-time

3. **View trace:**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

### CI Debugging

1. **Download artifacts from GitHub Actions**
2. **View HTML report:**
   ```bash
   npx playwright show-report playwright-report
   ```
3. **View trace files:**
   ```bash
   npx playwright show-trace test-results/[test-name]/trace.zip
   ```

## Common Issues & Solutions

### Issue: Tests timeout
**Solution:** Increase timeout in config or use `page.waitForLoadState()`

### Issue: Element not found
**Solution:** 
- Verify selector is correct
- Add explicit wait: `await expect(element).toBeVisible()`
- Check if element is in a frame

### Issue: Flaky tests
**Solution:**
- Add proper waits before assertions
- Use `waitForLoadState('networkidle')`
- Avoid hard-coded delays (`page.waitForTimeout()`)
- Use auto-retrying assertions

### Issue: CI tests fail but pass locally
**Solution:**
- Check environment variables in CI
- Verify database/API mocks are configured
- Ensure deterministic test data
- Check for timing issues (CI is slower)

## Performance Tips

1. **Run tests in parallel locally:**
   ```bash
   npx playwright test --workers=4
   ```

2. **Run only changed tests:**
   ```bash
   npx playwright test --only-changed
   ```

3. **Use sharding for large test suites:**
   ```bash
   npx playwright test --shard=1/4
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)

## Test Coverage

Current E2E test coverage:
- ✅ Landing page UI/UX
- ✅ Hero component interactions
- ✅ Authentication flows
- ✅ Page navigation
- ✅ Content generation
- ✅ Post scheduling
- ✅ Dashboard functionality
- ✅ Create flow

For questions or issues, check the GitHub Issues or team documentation.
