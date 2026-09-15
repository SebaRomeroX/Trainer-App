import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should redirect to login when accessing protected route", async ({
    page,
  }) => {
    await page.goto("/dashboard/trainer")
    await expect(page).toHaveURL(/.*login/)
  })

  test("should show login form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible()
    await expect(
      page.getByRole("textbox", { name: /password/i })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible()
  })

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/email is required/i)).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("textbox", { name: /email/i }).fill("wrong@email.com")
    await page.getByRole("textbox", { name: /password/i }).fill("wrongpass")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /sign up/i }).click()
    await expect(page).toHaveURL(/.*register/)
  })
})

test.describe("Navigation", () => {
  test("should show landing page", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/trainer/i)
  })
})
