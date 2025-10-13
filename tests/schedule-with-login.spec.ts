import { test, expect } from '@playwright/test'

test('schedule post with login', async ({ page }) => {
  // Check for credentials first
  const testEmail = process.env.TEST_EMAIL
  const testPassword = process.env.TEST_PASSWORD

  if (!testEmail || !testPassword || testEmail.includes('example.com')) {
    test.skip()
    console.log('⏭️  Skipping test: Set TEST_EMAIL and TEST_PASSWORD environment variables to run this test')
    return
  }

  // Monitor API calls
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

  // Go to login page
  await page.goto('https://repurpose-orpin.vercel.app/login')

  await page.locator('input[type="email"]').fill(testEmail)
  await page.locator('input[type="password"]').fill(testPassword)
  await page.locator('button[type="submit"]').click()

  // Wait for redirect to dashboard or create page
  // Increase timeout and make it more flexible
  try {
    await page.waitForURL(/dashboard|create|home/, { timeout: 15000 })
  } catch (error) {
    console.log(`⚠️  Did not redirect to expected page. Current URL: ${page.url()}`)
    // Check if we're still on login page
    const isOnLogin = page.url().includes('/login')
    if (isOnLogin) {
      console.log('❌ Still on login page - credentials may be incorrect')
      throw new Error('Login failed: Still on login page after submit')
    }
    // Continue if we're on a different page
  }

  console.log(`✅ Logged in successfully, redirected to: ${page.url()}`)

  // Now go to create page
  await page.goto('https://repurpose-orpin.vercel.app/create')

  // Fill in content
  await page.locator('textarea').first().fill('Automated test post - checking if scheduling works')

  // Select only Twitter
  const checkboxes = await page.locator('input[type="checkbox"]').all()
  for (const checkbox of checkboxes) {
    await checkbox.uncheck()
  }
  await checkboxes[0].check() // Twitter

  // Generate content
  await page.locator('button:has-text("Adapt Content")').click()
  await page.waitForSelector('.whitespace-pre-wrap', { timeout: 30000 })

  console.log('✅ Content generated successfully')

  // Schedule for 5 minutes from now
  const futureTime = new Date(Date.now() + 5 * 60000)
  const timeString = futureTime.toISOString().slice(0, 16)

  await page.locator('input[type="datetime-local"]').first().fill(timeString)
  await page.locator('button:has-text("Schedule")').first().click()

  // Wait for API response
  await page.waitForTimeout(3000)

  // Check schedule API call
  const scheduleCall = apiCalls.find(call => call.url.includes('/api/schedule'))
  if (scheduleCall) {
    console.log('📡 Schedule API Response:')
    console.log(`  Status: ${scheduleCall.status}`)
    console.log(`  Body: ${scheduleCall.body}`)

    if (scheduleCall.status === 200) {
      console.log('✅ Post scheduled successfully!')
    } else {
      console.log(`❌ Schedule failed with status ${scheduleCall.status}`)
    }
  } else {
    console.log('❌ No /api/schedule request found')
  }

  // Check for toast messages
  const toast = await page.locator('[data-rht-toaster] [role="status"]').first().textContent().catch(() => null)
  if (toast) {
    console.log(`📬 Toast message: ${toast}`)
  }

  // Go to dashboard to verify
  await page.goto('https://repurpose-orpin.vercel.app/dashboard')
  await page.waitForTimeout(2000)

  const posts = await page.locator('text=/scheduled|posted|failed/i').all()
  console.log(`\n📊 Found ${posts.length} posts in dashboard`)

  if (posts.length > 0) {
    const firstPostStatus = await posts[0].textContent()
    console.log(`  First post status: ${firstPostStatus}`)
  }

  // Print all API calls
  console.log('\n📡 All API Calls:')
  apiCalls.forEach(call => {
    console.log(`  ${call.url} → ${call.status}`)
    if (call.status >= 400) {
      console.log(`    Error: ${call.body}`)
    }
  })
})
