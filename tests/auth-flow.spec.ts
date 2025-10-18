import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  const baseURL = 'http://localhost:3000'
  const timestamp = Math.floor(Math.random() * 1000000)
  const testEmail = `test-${timestamp}@example.com`
  const testPassword = 'TestPassword123!'

  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies()
  })

  test('should load login page without errors', async ({ page }) => {
    await page.goto(`${baseURL}/login`)
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for refresh token error in console
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000)
    
    // Check page loaded successfully
    await expect(page.locator('text=Welcome back')).toBeVisible()
    
    // Check for email and password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Verify no refresh token errors
    const hasRefreshTokenError = consoleErrors.some(err => 
      err.includes('Refresh Token') || err.includes('AuthApiError')
    )
    
    if (hasRefreshTokenError) {
      console.error('Refresh token errors found:', consoleErrors)
    }
    
    expect(hasRefreshTokenError).toBe(false)
  })

  test('should protect dashboard route when not logged in', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto(`${baseURL}/dashboard`)
    
    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 })
    
    expect(page.url()).toContain('/login')
  })

  test('should display signup page correctly', async ({ page }) => {
    await page.goto(`${baseURL}/signup`)
    await page.waitForLoadState('networkidle')
    
    // Check for signup elements
    await expect(page.locator('text=Create Account')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible()
  })
})
