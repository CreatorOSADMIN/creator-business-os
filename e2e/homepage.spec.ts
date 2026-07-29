import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows the hero + CTA to Early Access", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();

    await expect(page).toHaveTitle(/CreatorOS/i);

    // Hero heading should be present (main landmark renders server-side).
    await expect(page.locator("main")).toBeVisible();

    // At least one link should point to the Early Access form.
    const earlyAccessLink = page.locator("a[href='/early-access']").first();
    await expect(earlyAccessLink).toBeVisible();
  });

  test("navigates to the Early Access form from the homepage", async ({ page }) => {
    await page.goto("/");
    await page.locator("a[href='/early-access']").first().click();
    await expect(page).toHaveURL(/\/early-access/);
  });
});
