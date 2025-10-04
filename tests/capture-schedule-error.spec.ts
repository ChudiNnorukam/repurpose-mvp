import { test } from '@playwright/test'

test('capture actual scheduling error from your browser session', async ({ page }) => {
  // Capture all console messages
  const logs: string[] = []
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`)
  })

  // Capture all network requests and responses
  const networkCalls: any[] = []

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      networkCalls.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        body: request.postData()
      })
    }
  })

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const body = await response.text().catch(() => 'Could not read body')
      networkCalls.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: body
      })
    }
  })

  // Navigate to create page
  await page.goto('https://repurpose-orpin.vercel.app/create')
  await page.waitForTimeout(3000)

  console.log(`📍 Current URL: ${page.url()}\n`)

  // Take screenshot
  await page.screenshot({ path: 'debug-create-page.png', fullPage: true })
  console.log('📸 Screenshot saved to debug-create-page.png\n')

  // Try to find and click schedule button (even if no content)
  const scheduleButtons = await page.locator('button:has-text("Schedule")').all()
  console.log(`Found ${scheduleButtons.length} schedule buttons\n`)

  if (scheduleButtons.length > 0) {
    console.log('Attempting to click first schedule button...')
    await scheduleButtons[0].click().catch(e => console.log(`Error clicking: ${e.message}`))
    await page.waitForTimeout(3000)
  }

  // Print all network calls
  console.log('📡 Network Activity:')
  console.log('=' .repeat(80))

  for (const call of networkCalls) {
    if (call.type === 'request') {
      console.log(`\n→ ${call.method} ${call.url}`)
      if (call.body) {
        console.log(`  Body: ${call.body}`)
      }
    } else {
      console.log(`← Response: ${call.status} ${call.statusText}`)
      console.log(`  Body: ${call.body}`)
    }
  }

  // Print console logs
  console.log('\n\n🖥️  Browser Console:')
  console.log('=' .repeat(80))
  logs.forEach(log => console.log(log))

  // Check for error messages in the page
  const errorText = await page.locator('text=/error|failed/i').all()
  if (errorText.length > 0) {
    console.log('\n\n❌ Errors found on page:')
    for (const err of errorText) {
      const text = await err.textContent()
      console.log(`  - ${text}`)
    }
  }

  // Check dashboard for posts
  await page.goto('https://repurpose-orpin.vercel.app/dashboard')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: 'debug-dashboard.png', fullPage: true })
  console.log('\n📸 Dashboard screenshot saved to debug-dashboard.png')

  const pageContent = await page.textContent('body')
  const hasScheduled = pageContent?.toLowerCase().includes('scheduled')
  const hasPosted = pageContent?.toLowerCase().includes('posted')
  const hasFailed = pageContent?.toLowerCase().includes('failed')

  console.log('\n📊 Dashboard Status:')
  console.log(`  Contains "scheduled": ${hasScheduled}`)
  console.log(`  Contains "posted": ${hasPosted}`)
  console.log(`  Contains "failed": ${hasFailed}`)
})
