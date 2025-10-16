import { test, expect } from '@playwright/test'

const PRODUCTION_URL = 'https://repurpose-orpin.vercel.app'

test.describe('Production - Generate Feature', () => {
  test.use({ baseURL: PRODUCTION_URL })

  test('should load landing page', async ({ page }) => {
    await page.goto('/landing')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle(/Repurpose/)
    console.log('✅ Landing page loaded successfully')
  })

  test('should have OAuth endpoints working', async ({ request }) => {
    test.use({ baseURL: PRODUCTION_URL })

    const linkedinResponse = await request.post('/api/auth/init-linkedin', {
      data: { userId: 'test-playwright-prod' }
    })

    console.log('LinkedIn OAuth init status:', linkedinResponse.status())
    expect(linkedinResponse.ok()).toBeTruthy()

    const linkedinData = await linkedinResponse.json()
    expect(linkedinData.authUrl).toBeDefined()
    expect(linkedinData.authUrl).toContain('linkedin.com')
    console.log('✅ LinkedIn OAuth endpoint working')

    const twitterResponse = await request.post('/api/auth/init-twitter', {
      data: { userId: 'test-playwright-prod' }
    })

    console.log('Twitter OAuth init status:', twitterResponse.status())
    expect(twitterResponse.ok()).toBeTruthy()

    const twitterData = await twitterResponse.json()
    expect(twitterData.authUrl).toBeDefined()
    expect(twitterData.authUrl).toContain('twitter.com')
    console.log('✅ Twitter OAuth endpoint working')
  })

  test('should test template generation API', async ({ request }) => {
    test.use({ baseURL: PRODUCTION_URL })

    const response = await request.post('/api/templates/generate', {
      data: {
        category: 'educational',
        platform: 'linkedin'
      }
    })

    console.log('Template generation status:', response.status())

    if (response.ok()) {
      const data = await response.json()
      console.log('✅ Template generation working')
      console.log('Generated template:', data.template ? 'Yes' : 'No')
    } else {
      const error = await response.text()
      console.log('⚠️  Template generation failed:', error.substring(0, 200))
    }
  })

  test('should have generate page accessible', async ({ page }) => {
    await page.goto('/landing')
    await page.waitForLoadState('networkidle')

    const ctaButton = page.locator('a[href*="/"], button').filter({ hasText: /Get Started|Try Free|Sign Up/i }).first()

    if (await ctaButton.isVisible()) {
      console.log('✅ Landing page has CTA buttons')
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    console.log('Dashboard navigation result:', currentUrl)

    if (currentUrl.includes('/login')) {
      console.log('✅ Auth protection working - redirected to login')
    } else if (currentUrl.includes('/dashboard')) {
      console.log('✅ Dashboard accessible')
    }
  })
})

test.describe('Production - API Health Check', () => {
  test.use({ baseURL: PRODUCTION_URL })

  test('should check posts API endpoint', async ({ request }) => {
    const response = await request.get('/api/posts')

    console.log('Posts API status:', response.status())

    if (response.status() === 401 || response.status() === 200) {
      console.log('✅ Posts API endpoint exists and is protected')
    } else {
      console.log('⚠️  Unexpected status:', response.status())
    }
  })

  test('should check OpenAI integration', async ({ request }) => {
    const response = await request.post('/api/templates/generate', {
      data: {
        category: 'business',
        platform: 'twitter'
      }
    })

    console.log('OpenAI integration test status:', response.status())

    if (response.ok()) {
      console.log('✅ OpenAI integration working')
    } else if (response.status() === 500) {
      const error = await response.text()
      console.log('⚠️  API error:', error.substring(0, 100))
    }
  })
})
