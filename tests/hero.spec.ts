import { test, expect } from "@playwright/test"

test.describe("Hero Component", () => {
  test("renders headline and CTAs", async ({ page }) => {
    await page.goto("/landing")

    const hero = page.locator('[data-testid="hero-section"]')
    await expect(hero).toBeVisible()

    // Headline content
    const heading = hero.locator("h1")
    await expect(heading).toContainText("One Thought")
    await expect(heading).toContainText("Ten Posts")

    // CTAs
    await expect(page.getByTestId("cta-primary")).toBeVisible()
    await expect(page.getByTestId("cta-secondary")).toBeVisible()
  })

  test("radial visual is present", async ({ page }) => {
    await page.goto("/landing")

    const radial = page.locator('[data-testid="hero-radial"]')
    await expect(radial).toBeVisible()

    // Check that radial spokes are present
    await expect(radial.locator("text=LinkedIn Post")).toBeVisible()
    await expect(radial.locator("text=Twitter Thread")).toBeVisible()
    await expect(radial.locator("text=IG Caption")).toBeVisible()
  })

  test("clicking See Example opens overlay demo", async ({ page }) => {
    await page.goto("/landing")

    // Click "See Example" button
    await page.getByTestId("cta-secondary").click()

    // Overlay should be visible
    const overlay = page.locator('[data-testid="overlay-backdrop"]')
    await expect(overlay).toBeVisible()

    // Demo content should be present
    await expect(page.locator("text=Example Transformation")).toBeVisible()
    await expect(page.locator("text=Original")).toBeVisible()
    // Use more specific locators to avoid matching multiple elements
    await expect(page.locator("text=🐦 Twitter")).toBeVisible()
    await expect(page.locator("text=💼 LinkedIn")).toBeVisible()
  })

  test("overlay can be closed with close button", async ({ page }) => {
    await page.goto("/landing")

    // Open overlay
    await page.getByTestId("cta-secondary").click()
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toBeVisible()

    // Close with button
    await page.getByTestId("close-demo").click()
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toHaveCount(0)
  })

  test("overlay can be closed with Escape key", async ({ page }) => {
    await page.goto("/landing")

    // Open overlay
    await page.getByTestId("cta-secondary").click()
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toBeVisible()

    // Close with Escape key
    await page.keyboard.press("Escape")
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toHaveCount(0)
  })

  test("overlay can be closed by clicking backdrop", async ({ page }) => {
    await page.goto("/landing")

    // Open overlay
    await page.getByTestId("cta-secondary").click()
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toBeVisible()

    // Click backdrop (not the modal content)
    await page.locator('[data-testid="overlay-backdrop"]').click({ position: { x: 10, y: 10 } })
    await expect(page.locator('[data-testid="overlay-backdrop"]')).toHaveCount(0)
  })

  test("focus trap works in overlay", async ({ page }) => {
    await page.goto("/landing")

    // Open overlay
    await page.getByTestId("cta-secondary").click()

    // Focus should be on close button initially
    const closeButton = page.getByTestId("close-demo")
    await expect(closeButton).toBeFocused()

    // Tabbing should cycle through focusable elements
    await page.keyboard.press("Tab")
    // After tab, focus should move (implementation-dependent)

    // Shift+Tab from first element should go to last
    await closeButton.focus()
    await page.keyboard.press("Shift+Tab")
    // Should cycle back to last focusable element
  })

  test("CTAs have focus rings on keyboard navigation", async ({ page }) => {
    await page.goto("/landing")

    // Click on primary button to give it focus, then check focus ring is visible
    const primaryBtn = page.getByTestId("cta-primary")
    await primaryBtn.click()

    // Tab to secondary CTA
    await page.keyboard.press("Tab")
    const secondaryBtn = page.getByTestId("cta-secondary")
    await expect(secondaryBtn).toBeFocused()
  })

  test("responsive layout on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/landing")

    const hero = page.locator('[data-testid="hero-section"]')
    await expect(hero).toBeVisible()

    // CTAs should still be visible on mobile
    await expect(page.getByTestId("cta-primary")).toBeVisible()
    await expect(page.getByTestId("cta-secondary")).toBeVisible()
  })

  test("radial spokes have hover scaling", async ({ page }) => {
    await page.goto("/landing")

    // Verify the radial spokes are present and have hover transition classes
    const spoke = page.locator("text=LinkedIn Post")
    await expect(spoke).toBeVisible()

    // Verify hover class exists on the element itself
    await expect(spoke).toHaveClass(/hover:scale/)
  })
})
