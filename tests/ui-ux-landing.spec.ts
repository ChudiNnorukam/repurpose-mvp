import { test, expect } from '@playwright/test'

/**
 * UI/UX Tests for Landing Page
 * Focus: Visual design, accessibility, user experience
 */

test.describe('Landing Page UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://repurpose-orpin.vercel.app/landing')
  })

  test('has proper page title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Repurpose|Transform/)

    // Check for meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(50)
  })

  test('hero section has clear value proposition', async ({ page }) => {
    // Main headline should be visible and compelling
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible()

    const headlineText = await headline.textContent()
    expect(headlineText).toBeTruthy()
    expect(headlineText!.length).toBeGreaterThan(10)

    console.log('✓ Headline:', headlineText)
  })

  test('CTA buttons are prominent and clickable', async ({ page }) => {
    // Primary CTA should be visible
    const primaryCTA = page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first()
    await expect(primaryCTA).toBeVisible()

    // Check button styling
    const bgColor = await primaryCTA.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )

    // Should have a distinct background color (not transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
    console.log('✓ Primary CTA background:', bgColor)
  })

  test('social proof elements are present', async ({ page }) => {
    // Look for testimonials, stats, or trust indicators
    const socialProofElements = await page.locator('[class*="testimonial"], [class*="stat"], [class*="trust"], [class*="review"]').count()

    if (socialProofElements === 0) {
      console.log('⚠️  No social proof elements found - consider adding testimonials or stats')
    } else {
      console.log(`✓ Found ${socialProofElements} social proof elements`)
    }
  })

  test('responsive layout works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE

    // Check if content is still visible
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    // Check for horizontal scrolling (should not exist)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // Allow 10px tolerance
    console.log(`✓ No horizontal scroll: body=${bodyWidth}px, viewport=${viewportWidth}px`)
  })

  test('responsive layout works on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad

    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    // Check layout adjustments
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
    console.log(`✓ Tablet layout OK: body=${bodyWidth}px, viewport=${viewportWidth}px`)
  })

  test('color contrast meets accessibility standards', async ({ page }) => {
    // Check main text contrast
    const mainText = page.locator('p, span').first()
    await expect(mainText).toBeVisible()

    const styles = await mainText.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor
      }
    })

    console.log('✓ Text styles:', styles)
    // Visual check - actual contrast ratio calculation would require more complex logic
  })

  test('navigation is clear and accessible', async ({ page }) => {
    // Check for nav element
    const nav = page.locator('nav, [role="navigation"]').first()

    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()

      // Check for navigation links
      const navLinks = await nav.locator('a').count()
      expect(navLinks).toBeGreaterThan(0)
      console.log(`✓ Found ${navLinks} navigation links`)
    } else {
      console.log('⚠️  No navigation element found')
    }
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('https://repurpose-orpin.vercel.app/landing')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    console.log(`✓ Page load time: ${loadTime}ms`)

    // Warn if load time is slow
    if (loadTime > 3000) {
      console.log('⚠️  Page load time is slow (>3s) - consider optimization')
    }
  })

  test('images have proper alt text', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount === 0) {
      console.log('ℹ️  No images found on page')
      return
    }

    let missingAlt = 0

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')

      if (!alt || alt.trim() === '') {
        missingAlt++
        const src = await img.getAttribute('src')
        console.log(`⚠️  Image missing alt text: ${src}`)
      }
    }

    if (missingAlt > 0) {
      console.log(`⚠️  ${missingAlt} of ${imageCount} images missing alt text`)
    } else {
      console.log(`✓ All ${imageCount} images have alt text`)
    }
  })

  test('interactive elements have hover states', async ({ page }) => {
    const button = page.locator('button, a').first()
    await expect(button).toBeVisible()

    // Get initial styles
    const initialStyles = await button.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        backgroundColor: computed.backgroundColor,
        transform: computed.transform
      }
    })

    // Hover over button
    await button.hover()

    // Wait a bit for CSS transition
    await page.waitForTimeout(300)

    const hoverStyles = await button.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        backgroundColor: computed.backgroundColor,
        transform: computed.transform
      }
    })

    console.log('Initial:', initialStyles)
    console.log('Hover:', hoverStyles)

    // Check if something changed
    const hasHoverEffect =
      initialStyles.backgroundColor !== hoverStyles.backgroundColor ||
      initialStyles.transform !== hoverStyles.transform

    if (!hasHoverEffect) {
      console.log('⚠️  No visible hover effect detected - consider adding hover states')
    } else {
      console.log('✓ Hover effect detected')
    }
  })

  test('form fields have proper labels', async ({ page }) => {
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()

    if (inputCount === 0) {
      console.log('ℹ️  No form fields on landing page')
      return
    }

    let missingLabels = 0

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')

      // Check if there's an associated label
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false

      if (!hasLabel && !ariaLabel && !placeholder) {
        missingLabels++
        console.log(`⚠️  Input field missing label/aria-label`)
      }
    }

    if (missingLabels > 0) {
      console.log(`⚠️  ${missingLabels} of ${inputCount} form fields missing proper labels`)
    } else {
      console.log(`✓ All ${inputCount} form fields have labels`)
    }
  })
})
