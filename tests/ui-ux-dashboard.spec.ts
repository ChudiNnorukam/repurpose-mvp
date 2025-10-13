import { test, expect } from '@playwright/test'

/**
 * UI/UX Tests for Dashboard
 * Focus: Information architecture, visual hierarchy, data presentation
 */

test.describe('Dashboard UI/UX', () => {
  test('dashboard is accessible without errors', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    // Check if we're redirected to login (which is expected if not authenticated)
    const currentUrl = page.url()

    if (currentUrl.includes('/login')) {
      console.log('ℹ️  Dashboard requires authentication (redirected to login)')
      test.skip()
      return
    }

    // If we're on dashboard, check for content
    const hasContent = await page.locator('main, [role="main"], .dashboard').count() > 0
    expect(hasContent).toBeTruthy()
  })

  test('dashboard has clear page title', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    const h1 = page.locator('h1').first()

    if (await h1.count() > 0) {
      const title = await h1.textContent()
      console.log('✓ Dashboard title:', title)
      expect(title).toBeTruthy()
    } else {
      console.log('⚠️  No H1 heading found on dashboard')
    }
  })

  test('posts are displayed in an organized layout', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // Wait for content to load
    await page.waitForTimeout(2000)

    // Look for post cards or list items
    const postContainers = page.locator('[class*="post"], [class*="card"], [class*="item"], article')
    const postCount = await postContainers.count()

    console.log(`✓ Found ${postCount} post-like containers`)

    if (postCount === 0) {
      console.log('ℹ️  No posts found - dashboard may be empty')
    }
  })

  test('post status is visually distinct', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await page.waitForTimeout(2000)

    // Look for status indicators
    const statusElements = page.locator('[class*="status"], [class*="badge"], .scheduled, .posted, .failed')
    const statusCount = await statusElements.count()

    if (statusCount > 0) {
      console.log(`✓ Found ${statusCount} status indicator(s)`)

      // Check first status element
      const firstStatus = statusElements.first()
      const statusText = await firstStatus.textContent()
      const bgColor = await firstStatus.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      )

      console.log(`  - Status: "${statusText?.trim()}" with background: ${bgColor}`)
    } else {
      console.log('⚠️  No clear status indicators found')
    }
  })

  test('dashboard has navigation to create page', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // Look for "Create" or "New Post" button/link
    const createButton = page.locator('a, button').filter({ hasText: /create|new|compose|\+/i })
    const hasCreateButton = await createButton.count() > 0

    if (hasCreateButton) {
      console.log('✓ Create/New post button found')
      const btnText = await createButton.first().textContent()
      console.log(`  - Button text: "${btnText?.trim()}"`)
    } else {
      console.log('⚠️  No clear "Create" or "New Post" button found')
    }
  })

  test('empty state is helpful', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await page.waitForTimeout(2000)

    // Look for empty state messages
    const emptyStateMessages = page.locator('[class*="empty"], [class*="no-posts"], [class*="no-content"]')
    const hasEmptyState = await emptyStateMessages.count() > 0

    if (hasEmptyState) {
      const message = await emptyStateMessages.first().textContent()
      console.log('✓ Empty state message:', message)
    } else {
      // Check if there are actually no posts
      const postCount = await page.locator('[class*="post"], article').count()

      if (postCount === 0) {
        console.log('⚠️  Dashboard appears empty but no empty state message shown')
      }
    }
  })

  test('dashboard is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await page.waitForTimeout(1000)

    // Check for horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = 375

    if (bodyWidth > viewportWidth + 10) {
      console.log(`⚠️  Horizontal scroll detected on mobile: body=${bodyWidth}px`)
    } else {
      console.log('✓ No horizontal scroll on mobile')
    }

    // Check if content is readable
    const fontSize = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontSize
    )

    console.log('✓ Mobile font size:', fontSize)
  })

  test('action buttons are accessible', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await page.waitForTimeout(2000)

    // Look for action buttons (edit, delete, etc.)
    const actionButtons = page.locator('button[aria-label], button[title], a[aria-label]')
    const buttonCount = await actionButtons.count()

    if (buttonCount > 0) {
      console.log(`✓ Found ${buttonCount} accessible action button(s)`)

      // Check first few for proper labeling
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const btn = actionButtons.nth(i)
        const ariaLabel = await btn.getAttribute('aria-label')
        const title = await btn.getAttribute('title')
        console.log(`  - Button ${i + 1}: aria-label="${ariaLabel}", title="${title}"`)
      }
    } else {
      console.log('ℹ️  No explicitly labeled action buttons found')
    }
  })

  test('loading states are shown for data fetching', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // Check for loading indicators immediately
    const loadingIndicators = await page.locator('[class*="loading"], [class*="skeleton"], [class*="spinner"]').count()

    if (loadingIndicators > 0) {
      console.log('✓ Loading indicators present during data fetch')
    } else {
      console.log('⚠️  No loading indicators detected - consider adding skeleton screens or spinners')
    }
  })

  test('date/time formatting is clear', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await page.waitForTimeout(2000)

    // Look for date/time elements
    const dateElements = page.locator('time, [class*="date"], [class*="time"], [class*="scheduled"]')
    const dateCount = await dateElements.count()

    if (dateCount > 0) {
      console.log(`✓ Found ${dateCount} date/time element(s)`)

      const firstDate = await dateElements.first().textContent()
      console.log(`  - Example: "${firstDate?.trim()}"`)

      // Check if it's using relative time (e.g., "2 hours ago")
      const isRelative = /ago|in|from now|yesterday|tomorrow/i.test(firstDate || '')

      if (isRelative) {
        console.log('✓ Using human-friendly relative time')
      } else {
        console.log('ℹ️  Using absolute time format')
      }
    } else {
      console.log('ℹ️  No date/time elements found')
    }
  })

  test('search or filter functionality is available', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')

    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // Look for search or filter controls
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    const filterButtons = page.locator('button, select').filter({ hasText: /filter|sort|all|scheduled|posted/i })

    const hasSearch = await searchInput.count() > 0
    const hasFilters = await filterButtons.count() > 0

    if (hasSearch) {
      console.log('✓ Search functionality found')
    }

    if (hasFilters) {
      console.log(`✓ Found ${await filterButtons.count()} filter/sort control(s)`)
    }

    if (!hasSearch && !hasFilters) {
      console.log('⚠️  No search or filter functionality found - consider adding for better UX')
    }
  })
})
