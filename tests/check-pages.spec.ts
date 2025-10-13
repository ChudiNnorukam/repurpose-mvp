import { test, expect } from '@playwright/test'

test('check dashboard page loads', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('https://repurpose-orpin.vercel.app/dashboard')

  // Wait a bit for redirect or content
  await page.waitForTimeout(3000)

  // Log current URL
  console.log('Current URL:', page.url())

  // Check for any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text())
    }
  })

  // Take screenshot
  await page.screenshot({ path: 'test-results/dashboard-check.png', fullPage: true })

  // Check page title
  const title = await page.title()
  console.log('Page title:', title)

  // Check for error messages on page
  const bodyText = await page.locator('body').textContent()
  console.log('Page content length:', bodyText?.length)
  console.log('First 500 chars:', bodyText?.substring(0, 500))
})

test('check create page loads', async ({ page }) => {
  await page.goto('https://repurpose-orpin.vercel.app/create')
  await page.waitForTimeout(3000)

  console.log('Current URL:', page.url())

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text())
    }
  })

  await page.screenshot({ path: 'test-results/create-check.png', fullPage: true })

  const title = await page.title()
  console.log('Page title:', title)

  const bodyText = await page.locator('body').textContent()
  console.log('Page content length:', bodyText?.length)
  console.log('First 500 chars:', bodyText?.substring(0, 500))
})

test('check connections page loads', async ({ page }) => {
  await page.goto('https://repurpose-orpin.vercel.app/connections')
  await page.waitForTimeout(3000)

  console.log('Current URL:', page.url())

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text())
    }
  })

  await page.screenshot({ path: 'test-results/connections-check.png', fullPage: true })

  const title = await page.title()
  console.log('Page title:', title)

  const bodyText = await page.locator('body').textContent()
  console.log('Page content length:', bodyText?.length)
  console.log('First 500 chars:', bodyText?.substring(0, 500))
})
