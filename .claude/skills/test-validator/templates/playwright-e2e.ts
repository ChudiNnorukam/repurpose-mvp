// Playwright E2E Test Template for Repurpose MVP
import { test, expect, Page } from '@playwright/test'

// Test Fixtures and Setup
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!'
}

// Helper: Login before tests
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('[name=email]', TEST_USER.email)
  await page.fill('[name=password]', TEST_USER.password)
  await page.click('button[type=submit]')
  await expect(page).toHaveURL('/dashboard')
}

// Example 1: Content Adaptation Flow
test.describe('Content Adaptation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('user can adapt content for multiple platforms', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create')

    // Enter original content
    await page.fill('textarea[name=content]', 'Check out our new product launch!')

    // Select platforms
    await page.check('[value=twitter]')
    await page.check('[value=linkedin]')

    // Select tone
    await page.selectOption('select[name=tone]', 'professional')

    // Click adapt button
    await page.click('button:has-text("Adapt")')

    // Wait for adaptation to complete
    await expect(page.locator('.adapted-content')).toBeVisible({ timeout: 10000 })

    // Verify Twitter content
    const twitterContent = page.locator('[data-platform=twitter] .adapted-content')
    await expect(twitterContent).toBeVisible()
    await expect(twitterContent).toContainText('Check out')

    // Verify LinkedIn content
    const linkedinContent = page.locator('[data-platform=linkedin] .adapted-content')
    await expect(linkedinContent).toBeVisible()
    
    // Verify character counts
    const twitterCount = page.locator('[data-platform=twitter] .char-count')
    await expect(twitterCount).toContainText(/\d+\/280/)
  })

  test('handles content exceeding platform limits', async ({ page }) => {
    await page.goto('/create')

    // Enter very long content (> 280 chars)
    const longContent = 'a'.repeat(300)
    await page.fill('textarea[name=content]', longContent)
    
    await page.check('[value=twitter]')
    await page.click('button:has-text("Adapt")')

    // Should show error or warning
    await expect(page.locator('.error-message, .warning-message')).toBeVisible()
    await expect(page.locator('.error-message, .warning-message'))
      .toContainText(/exceeds.*limit|too long/i)
  })

  test('shows real-time character count', async ({ page }) => {
    await page.goto('/create')
    
    const textarea = page.locator('textarea[name=content]')
    const charCount = page.locator('.char-count')

    // Type content
    await textarea.fill('Test content')

    // Verify character count updates
    await expect(charCount).toContainText('12')

    // Add more text
    await textarea.fill('Test content with more text')
    await expect(charCount).toContainText('29')
  })
})

// Example 2: Post Scheduling Flow
test.describe('Post Scheduling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('user can schedule post for future time', async ({ page }) => {
    await page.goto('/create')

    // Adapt content
    await page.fill('textarea[name=content]', 'Scheduled post test')
    await page.check('[value=twitter]')
    await page.click('button:has-text("Adapt")')
    await expect(page.locator('.adapted-content')).toBeVisible()

    // Set scheduled time (1 hour from now)
    const futureTime = new Date(Date.now() + 60 * 60 * 1000)
    const formattedTime = futureTime.toISOString().slice(0, 16)
    
    await page.fill('input[type=datetime-local]', formattedTime)

    // Schedule post
    await page.click('button:has-text("Schedule")')

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message')).toContainText(/scheduled/i)

    // Verify redirect to posts page
    await expect(page).toHaveURL(/\/posts/)

    // Verify post appears in scheduled posts
    await expect(page.locator('.post-card')).toBeVisible()
    await expect(page.locator('.post-card [data-status=scheduled]')).toBeVisible()
  })

  test('prevents scheduling posts in the past', async ({ page }) => {
    await page.goto('/create')

    await page.fill('textarea[name=content]', 'Test content')
    await page.check('[value=twitter]')
    await page.click('button:has-text("Adapt")')
    await expect(page.locator('.adapted-content')).toBeVisible()

    // Try to set past time
    const pastTime = new Date(Date.now() - 60 * 60 * 1000)
    const formattedPastTime = pastTime.toISOString().slice(0, 16)
    
    await page.fill('input[type=datetime-local]', formattedPastTime)
    await page.click('button:has-text("Schedule")')

    // Should show error
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message'))
      .toContainText(/must be.*future|cannot schedule.*past/i)
  })
})

// Example 3: OAuth Connection Flow
test.describe('OAuth Connections', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('user can connect Twitter account', async ({ page, context }) => {
    await page.goto('/connections')

    // Click connect Twitter button
    await page.click('button:has-text("Connect Twitter")')

    // Wait for OAuth redirect
    await page.waitForURL(/twitter\.com\/oauth/i, { timeout: 10000 })

    // Mock OAuth callback (in real test, you'd interact with Twitter's OAuth page)
    // For testing, we'll navigate directly to the callback
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback?code=test_code&state=test_state`
    await page.goto(callbackUrl)

    // Should redirect back to connections page
    await expect(page).toHaveURL('/connections')

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page.locator('.success-message'))
      .toContainText(/connected|success/i)

    // Verify Twitter account appears
    await expect(page.locator('[data-platform=twitter] .connected-badge')).toBeVisible()
  })

  test('shows connected accounts', async ({ page }) => {
    await page.goto('/connections')

    // Verify page loaded
    await expect(page.locator('h1')).toContainText(/connections|accounts/i)

    // Check for platform cards
    await expect(page.locator('[data-platform=twitter]')).toBeVisible()
    await expect(page.locator('[data-platform=linkedin]')).toBeVisible()
    await expect(page.locator('[data-platform=instagram]')).toBeVisible()
  })
})

// Example 4: Dashboard and Navigation
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('displays user stats and recent posts', async ({ page }) => {
    await page.goto('/dashboard')

    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText(/dashboard/i)

    // Check for stat cards
    await expect(page.locator('[data-stat=total-posts]')).toBeVisible()
    await expect(page.locator('[data-stat=scheduled-posts]')).toBeVisible()
    await expect(page.locator('[data-stat=posted-count]')).toBeVisible()

    // Verify recent posts section
    await expect(page.locator('h2:has-text("Recent Posts")')).toBeVisible()
  })

  test('navigation menu works', async ({ page }) => {
    await page.goto('/dashboard')

    // Click on navigation items
    await page.click('nav a:has-text("Create")')
    await expect(page).toHaveURL('/create')

    await page.click('nav a:has-text("Posts")')
    await expect(page).toHaveURL('/posts')

    await page.click('nav a:has-text("Connections")')
    await expect(page).toHaveURL('/connections')
  })
})

// Example 5: Batch Content Generation
test.describe('Batch Create', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('generates 30 days of content', async ({ page }) => {
    await page.goto('/batch-create')

    // Fill in theme
    await page.fill('[name=theme]', 'Social media marketing tips')

    // Select platforms
    await page.check('[value=twitter]')
    await page.check('[value=linkedin]')

    // Select tone
    await page.selectOption('[name=tone]', 'professional')

    // Start generation
    await page.click('button:has-text("Generate")')

    // Wait for progress bar
    await expect(page.locator('.progress-bar')).toBeVisible()

    // Wait for completion (max 2 minutes)
    await expect(page.locator('h2:has-text("Drafts Generated")'))
      .toBeVisible({ timeout: 120000 })

    // Verify draft count (30 topics × 2 platforms = 60)
    const draftCards = page.locator('.draft-card')
    const count = await draftCards.count()
    expect(count).toBeGreaterThanOrEqual(50) // Allow some failures
    expect(count).toBeLessThanOrEqual(60)
  })
})

// Example 6: Error Handling
test.describe('Error Handling', () => {
  test('shows error when API fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/adapt', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    await login(page)
    await page.goto('/create')

    await page.fill('textarea[name=content]', 'Test content')
    await page.check('[value=twitter]')
    await page.click('button:has-text("Adapt")')

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message'))
      .toContainText(/error|failed/i)
  })

  test('handles network errors gracefully', async ({ page, context }) => {
    await login(page)
    
    // Simulate offline
    await context.setOffline(true)
    
    await page.goto('/create')
    await page.fill('textarea[name=content]', 'Test')
    await page.check('[value=twitter]')
    await page.click('button:has-text("Adapt")')

    // Should show network error
    await expect(page.locator('.error-message')).toBeVisible()
  })
})

// Example 7: Accessibility Tests
test.describe('Accessibility', () => {
  test('keyboard navigation works', async ({ page }) => {
    await login(page)
    await page.goto('/create')

    // Tab through form
    await page.keyboard.press('Tab') // Focus textarea
    await expect(page.locator('textarea[name=content]')).toBeFocused()

    await page.keyboard.press('Tab') // Focus tone select
    await expect(page.locator('select[name=tone]')).toBeFocused()

    // Enter key should work on buttons
    await page.locator('button:has-text("Adapt")').focus()
    await page.keyboard.press('Enter')
  })

  test('has proper ARIA labels', async ({ page }) => {
    await login(page)
    await page.goto('/create')

    // Check for ARIA labels
    await expect(page.locator('[aria-label="Content input"]')).toBeVisible()
    await expect(page.locator('[aria-label="Platform selection"]')).toBeVisible()
  })
})

// Repurpose-Specific E2E Patterns
export const RepurposeE2EPatterns = {
  // Pattern 1: Wait for API responses
  waitForAdaptation: async (page: Page) => {
    await page.waitForResponse(
      response => response.url().includes('/api/adapt') && response.status() === 200
    )
  },

  // Pattern 2: Mock external OAuth
  mockOAuthCallback: async (page: Page, platform: string) => {
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback?code=test&state=test`
    await page.goto(callbackUrl)
  },

  // Pattern 3: Verify Supabase data
  verifyPostInDB: async (page: Page, postId: string) => {
    // In real tests, you'd query Supabase directly
    await page.goto(`/posts/${postId}`)
    await expect(page.locator('.post-details')).toBeVisible()
  }
}
