import { test, expect } from '@playwright/test'

test('debug scheduling on production', async ({ page }) => {
  // Listen to console logs
  const consoleLogs: string[] = []
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })

  // Listen to network requests
  const apiCalls: any[] = []
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const body = await response.text().catch(() => 'Could not read body')
      apiCalls.push({
        url: response.url(),
        status: response.status(),
        body: body
      })
    }
  })

  // Go to production create page
  await page.goto('https://repurpose-orpin.vercel.app/create')

  // Check if logged in
  const emailVisible = await page.locator('text=/.*@.*\\..*/')
    .first()
    .isVisible()
    .catch(() => false)

  if (!emailVisible) {
    console.log('❌ User is not logged in on production')
    console.log('Redirecting to login...')
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {})
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)
    return
  }

  const userEmail = await page.locator('text=/.*@.*\\..*/')
    .first()
    .textContent()
  console.log(`✅ User logged in as: ${userEmail}`)

  // Try to schedule a post
  console.log('Attempting to generate and schedule content...')

  // Fill in content
  await page.locator('textarea').first().fill('Test content for debugging autopost issue')

  // Select Twitter only
  await page.locator('input[type="checkbox"]').first().uncheck()
  await page.locator('input[type="checkbox"]').nth(1).uncheck()
  await page.locator('input[type="checkbox"]').first().check()

  // Generate content
  await page.locator('button:has-text("Adapt Content")').click()

  // Wait for adapted content
  await page.waitForSelector('text=/Adapted Content/', { timeout: 30000 })

  // Check if content was generated
  const contentGenerated = await page.locator('.whitespace-pre-wrap').first().isVisible()
  console.log(`Content generated: ${contentGenerated}`)

  if (contentGenerated) {
    // Schedule for 5 minutes from now
    const futureTime = new Date(Date.now() + 5 * 60000)
    const timeString = futureTime.toISOString().slice(0, 16)

    await page.locator('input[type="datetime-local"]').first().fill(timeString)

    // Click schedule button
    await page.locator('button:has-text("Schedule")').first().click()

    // Wait a bit for the request
    await page.waitForTimeout(3000)

    // Check API calls
    const scheduleCall = apiCalls.find(call => call.url.includes('/api/schedule'))
    if (scheduleCall) {
      console.log('📡 Schedule API Response:')
      console.log(`  Status: ${scheduleCall.status}`)
      console.log(`  Body: ${scheduleCall.body}`)
    } else {
      console.log('❌ No /api/schedule request found')
    }

    // Check for any error toasts
    const errorToast = await page.locator('[data-rht-toaster] [role="status"]').first().textContent().catch(() => null)
    if (errorToast) {
      console.log(`🔴 Toast message: ${errorToast}`)
    }
  }

  // Check dashboard for posts
  await page.goto('https://repurpose-orpin.vercel.app/dashboard')
  await page.waitForTimeout(2000)

  const postsVisible = await page.locator('text=/scheduled|posted|failed/i').first().isVisible().catch(() => false)
  if (postsVisible) {
    const postStatus = await page.locator('text=/scheduled|posted|failed/i').first().textContent()
    console.log(`✅ Found post with status: ${postStatus}`)
  } else {
    console.log('❌ No posts found in dashboard')
  }

  // Output all console logs
  console.log('\n📋 Browser Console Logs:')
  consoleLogs.forEach(log => console.log(`  ${log}`))

  // Output all API calls
  console.log('\n📡 API Calls:')
  apiCalls.forEach(call => {
    console.log(`  ${call.url} → ${call.status}`)
    if (call.status >= 400) {
      console.log(`    Error: ${call.body}`)
    }
  })
})
