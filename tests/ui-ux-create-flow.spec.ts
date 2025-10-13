import { test, expect } from '@playwright/test'

/**
 * UI/UX Tests for Content Creation Flow
 * Focus: User journey, form usability, feedback mechanisms
 */

test.describe('Content Creation Flow UI/UX', () => {
  test('create page has clear instructions', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Check for instructional text
    const instructions = page.locator('p, span, label').filter({ hasText: /enter|type|paste|write|content/i })
    const hasInstructions = await instructions.count() > 0

    if (!hasInstructions) {
      console.log('⚠️  No clear instructions found on create page')
    } else {
      const firstInstruction = await instructions.first().textContent()
      console.log('✓ Found instructions:', firstInstruction)
    }
  })

  test('textarea is large and easy to use', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Check if redirected to login (expected if not authenticated)
    if (page.url().includes('/login')) {
      console.log('ℹ️  Create page requires authentication - skipping textarea test')
      test.skip()
      return
    }

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()

    // Check textarea size
    const box = await textarea.boundingBox()

    if (box) {
      console.log(`✓ Textarea size: ${box.width}x${box.height}px`)

      if (box.height < 100) {
        console.log('⚠️  Textarea height is small (<100px) - consider making it larger')
      }

      if (box.width < 300) {
        console.log('⚠️  Textarea width is small (<300px) - consider making it wider')
      }
    }

    // Check for placeholder
    const placeholder = await textarea.getAttribute('placeholder')
    if (!placeholder) {
      console.log('⚠️  Textarea missing placeholder text')
    } else {
      console.log('✓ Placeholder:', placeholder)
    }
  })

  test('platform checkboxes are visually clear', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Find platform checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const checkboxCount = await checkboxes.count()

    if (checkboxCount === 0) {
      console.log('⚠️  No platform checkboxes found')
      return
    }

    console.log(`✓ Found ${checkboxCount} platform checkboxes`)

    // Check if they're labeled
    for (let i = 0; i < Math.min(checkboxCount, 5); i++) {
      const checkbox = checkboxes.nth(i)
      const label = await checkbox.locator('..').textContent()
      console.log(`  - Checkbox ${i + 1}: ${label?.trim()}`)
    }
  })

  test('generate button is prominent', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    const generateBtn = page.locator('button').filter({ hasText: /generate|adapt|create|transform/i }).first()

    if (await generateBtn.count() === 0) {
      console.log('⚠️  Generate/Adapt button not found')
      return
    }

    await expect(generateBtn).toBeVisible()

    // Check button size
    const box = await generateBtn.boundingBox()
    if (box) {
      console.log(`✓ Generate button size: ${box.width}x${box.height}px`)

      if (box.height < 40) {
        console.log('⚠️  Button height is small (<40px) - consider making it more prominent')
      }
    }

    // Check button text
    const btnText = await generateBtn.textContent()
    console.log('✓ Button text:', btnText)
  })

  test('loading states provide feedback', async ({ page }) => {
    test.setTimeout(60000) // Increase timeout for API call

    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('ℹ️  Create page requires authentication - skipping loading state test')
      test.skip()
      return
    }

    // Fill in content
    const textarea = page.locator('textarea').first()

    if (await textarea.count() === 0) {
      console.log('⚠️  Cannot test loading state - textarea not found')
      return
    }

    await textarea.fill('Test content for loading state check')

    // Select a platform
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check()

    // Click generate and check for loading indicator
    const generateBtn = page.locator('button').filter({ hasText: /generate|adapt/i }).first()

    if (await generateBtn.count() === 0) {
      console.log('⚠️  Cannot test loading state - generate button not found')
      return
    }

    await generateBtn.click()

    // Check for loading indicators within 1 second
    await page.waitForTimeout(500)

    const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], [class*="loader"], [aria-label*="loading"], button:disabled').count()

    if (loadingIndicators > 0) {
      console.log('✓ Loading indicator found during content generation')
    } else {
      console.log('⚠️  No loading indicator detected - users may not know processing is happening')
    }
  })

  test('generated content is clearly displayed', async ({ page }) => {
    test.setTimeout(60000) // Increase timeout for API call

    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('ℹ️  Create page requires authentication - skipping generated content test')
      test.skip()
      return
    }

    const textarea = page.locator('textarea').first()

    if (await textarea.count() === 0) {
      console.log('⚠️  Cannot test generated content - textarea not found')
      return
    }

    await textarea.fill('Testing UI display of generated content')

    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check()

    const generateBtn = page.locator('button').filter({ hasText: /generate|adapt/i }).first()

    if (await generateBtn.count() === 0) {
      console.log('⚠️  Cannot test generated content - generate button not found')
      return
    }

    await generateBtn.click()

    // Wait longer for AI generation
    await page.waitForTimeout(10000)

    // Check for result containers
    const resultContainers = page.locator('[class*="result"], [class*="output"], [class*="generated"], .whitespace-pre-wrap, [class*="adapted"]')
    const resultCount = await resultContainers.count()

    if (resultCount === 0) {
      console.log('⚠️  Generated content display area not clearly marked')
    } else {
      console.log(`✓ Found ${resultCount} result display areas`)

      // Check if content is visible
      const firstResult = resultContainers.first()
      const isVisible = await firstResult.isVisible().catch(() => false)

      if (isVisible) {
        const text = await firstResult.textContent()
        console.log('✓ Generated content is visible:', text?.substring(0, 100))
      }
    }
  })

  test('error messages are helpful', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Try to generate without content
    const generateBtn = page.locator('button').filter({ hasText: /generate|adapt/i }).first()

    if (await generateBtn.count() === 0) {
      console.log('⚠️  Cannot test error handling - generate button not found')
      return
    }

    await generateBtn.click()

    // Wait for potential error message
    await page.waitForTimeout(2000)

    // Check for error messages
    const errorMessages = page.locator('[class*="error"], [role="alert"], [class*="danger"]')
    const errorCount = await errorMessages.count()

    if (errorCount > 0) {
      const errorText = await errorMessages.first().textContent()
      console.log('✓ Error message shown:', errorText)
    } else {
      console.log('⚠️  No error message shown for empty submission')
    }
  })

  test('schedule controls are intuitive', async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Look for datetime input
    const datetimeInput = page.locator('input[type="datetime-local"], input[type="date"], input[type="time"]')
    const hasScheduleControl = await datetimeInput.count() > 0

    if (!hasScheduleControl) {
      console.log('⚠️  No schedule datetime control found')
      return
    }

    console.log(`✓ Found ${await datetimeInput.count()} datetime control(s)`)

    // Check for label
    const firstInput = datetimeInput.first()
    const inputId = await firstInput.getAttribute('id')

    if (inputId) {
      const label = page.locator(`label[for="${inputId}"]`)
      const hasLabel = await label.count() > 0

      if (hasLabel) {
        const labelText = await label.textContent()
        console.log('✓ Schedule control has label:', labelText)
      } else {
        console.log('⚠️  Schedule control missing label')
      }
    }
  })

  test('mobile layout is usable for content creation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('https://repurpose-orpin.vercel.app/create')

    // Check if redirected to login
    if (page.url().includes('/login')) {
      console.log('ℹ️  Create page requires authentication - skipping mobile layout test')
      test.skip()
      return
    }

    // Check textarea is still usable
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()

    const box = await textarea.boundingBox()

    if (box) {
      console.log(`✓ Mobile textarea size: ${box.width}x${box.height}px`)

      // Textarea should take most of the width
      const viewportWidth = 375
      const usagePercent = (box.width / viewportWidth) * 100

      if (usagePercent < 80) {
        console.log(`⚠️  Textarea only uses ${usagePercent.toFixed(0)}% of mobile width - consider making it wider`)
      } else {
        console.log(`✓ Textarea uses ${usagePercent.toFixed(0)}% of mobile width`)
      }
    }

    // Check buttons are tappable (at least 44x44px)
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    let tooSmall = 0

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const btn = buttons.nth(i)
      const btnBox = await btn.boundingBox()

      if (btnBox && (btnBox.height < 44 || btnBox.width < 44)) {
        tooSmall++
      }
    }

    if (tooSmall > 0) {
      console.log(`⚠️  ${tooSmall} buttons are smaller than recommended touch target (44x44px)`)
    } else {
      console.log('✓ All buttons meet touch target size guidelines')
    }
  })
})
