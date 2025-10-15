import { test, expect } from '@playwright/test'

test.describe('Generate Page', () => {
  test('should load generate page and show connection status', async ({ page }) => {
    // Navigate to login first
    await page.goto('/login')

    // Check if already logged in (will redirect to dashboard)
    await page.waitForTimeout(1000)

    if (page.url().includes('/login')) {
      console.log('ℹ️  Not logged in - test requires authentication')
      test.skip()
      return
    }

    // Navigate to generate page
    await page.goto('/generate')
    await page.waitForLoadState('networkidle')

    // Check that the page loaded
    expect(await page.title()).toContain('Repurpose')

    // Check for main heading
    await expect(page.locator('h1:has-text("Generate Multi-Platform Content")')).toBeVisible()

    // Check for topic input
    await expect(page.locator('textarea[placeholder*="topic"]')).toBeVisible()

    // Check for connection status card (either green or yellow)
    const connectionCard = page.locator('.bg-green-50, .bg-yellow-50').first()
    await expect(connectionCard).toBeVisible()

    // Log the connection status
    const connectionText = await connectionCard.textContent()
    console.log('📊 Connection status:', connectionText?.trim())
  })

  test('should show appropriate message when no accounts connected', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(1000)

    if (page.url().includes('/login')) {
      console.log('ℹ️  Not logged in - skipping test')
      test.skip()
      return
    }

    await page.goto('/generate')
    await page.waitForLoadState('networkidle')

    // Check for either connected accounts or no accounts message
    const hasAccounts = await page.locator('.bg-green-50').count() > 0
    const noAccounts = await page.locator('.bg-yellow-50').count() > 0

    expect(hasAccounts || noAccounts).toBeTruthy()

    if (noAccounts) {
      await expect(page.locator('text=No accounts connected')).toBeVisible()
      await expect(page.locator('text=Connect accounts')).toBeVisible()
    } else {
      await expect(page.locator('text=platform(s) connected')).toBeVisible()
    }
  })

  test('should have generate button disabled when no topic entered', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(1000)

    if (page.url().includes('/login')) {
      console.log('ℹ️  Not logged in - skipping test')
      test.skip()
      return
    }

    await page.goto('/generate')
    await page.waitForLoadState('networkidle')

    const generateButton = page.locator('button:has-text("Generate Content")')
    await expect(generateButton).toBeDisabled()
  })

  test('should enable generate button when topic is entered and accounts connected', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(1000)

    if (page.url().includes('/login')) {
      console.log('ℹ️  Not logged in - skipping test')
      test.skip()
      return
    }

    await page.goto('/generate')
    await page.waitForLoadState('networkidle')

    // Check if accounts are connected
    const hasAccounts = await page.locator('.bg-green-50').count() > 0

    if (!hasAccounts) {
      console.log('ℹ️  No accounts connected - skipping test')
      test.skip()
      return
    }

    // Enter a topic
    await page.fill('textarea[placeholder*="topic"]', 'Test topic for content generation')

    // Check that generate button is enabled
    const generateButton = page.locator('button:has-text("Generate Content")')
    await expect(generateButton).toBeEnabled()
  })
})

test.describe('OAuth Connection Endpoints', () => {
  test('OAuth init endpoints should reject unauthenticated requests', async ({ request }) => {
    const linkedInResponse = await request.post('/api/auth/init-linkedin')
    const twitterResponse = await request.post('/api/auth/init-twitter')

    expect(linkedInResponse.status()).toBe(401)
    expect(twitterResponse.status()).toBe(401)

    const linkedInBody = await linkedInResponse.json()
    const twitterBody = await twitterResponse.json()

    expect(linkedInBody.error).toBe('Unauthorized')
    expect(twitterBody.error).toBe('Unauthorized')
    // codex_agent: Endpoints now rely on Supabase sessions, so unauthenticated callers should fail with 401.
  })
})
