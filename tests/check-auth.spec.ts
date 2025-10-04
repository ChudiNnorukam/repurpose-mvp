import { test } from '@playwright/test'

test('check if user is logged in on production', async ({ page }) => {
  console.log('🔍 Checking authentication status on production...\n')

  // Go to create page
  await page.goto('https://repurpose-orpin.vercel.app/create')
  await page.waitForTimeout(2000)

  const currentUrl = page.url()
  console.log(`Current URL: ${currentUrl}`)

  if (currentUrl.includes('/login')) {
    console.log('❌ NOT LOGGED IN - Redirected to login page')
    console.log('\nYou need to:')
    console.log('1. Go to https://repurpose-orpin.vercel.app/login')
    console.log('2. Log in with your credentials')
    console.log('3. Then try scheduling again')
    return
  }

  // Check if email is visible in header
  const emailVisible = await page.locator('text=/.*@.*\\..*/')
    .first()
    .isVisible()
    .catch(() => false)

  if (emailVisible) {
    const userEmail = await page.locator('text=/.*@.*\\..*/')
      .first()
      .textContent()
    console.log(`✅ LOGGED IN as: ${userEmail}`)

    // Check if social accounts are connected
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')
    await page.waitForTimeout(2000)

    const twitterConnected = await page.locator('text=/twitter|connected/i').isVisible().catch(() => false)
    const linkedinConnected = await page.locator('text=/linkedin|connected/i').isVisible().catch(() => false)

    console.log(`\n📱 Social Accounts:`)
    console.log(`  Twitter: ${twitterConnected ? '✅ Connected' : '❌ Not connected'}`)
    console.log(`  LinkedIn: ${linkedinConnected ? '✅ Connected' : '❌ Not connected'}`)

    // Check for existing posts
    await page.goto('https://repurpose-orpin.vercel.app/dashboard')
    await page.waitForTimeout(2000)

    const posts = await page.locator('[data-testid*="post"], .post-item, text=/scheduled|posted|failed/i').all()
    console.log(`\n📊 Posts in dashboard: ${posts.length}`)

    if (posts.length > 0) {
      for (let i = 0; i < Math.min(3, posts.length); i++) {
        const text = await posts[i].textContent()
        console.log(`  ${i + 1}. ${text?.substring(0, 100)}...`)
      }
    }
  } else {
    console.log('❌ NOT LOGGED IN - No email found in header')
  }
})
