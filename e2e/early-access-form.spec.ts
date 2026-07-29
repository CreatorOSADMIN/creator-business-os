import { test, expect, Page } from "@playwright/test";

/** Fills every required field of the Early Access form with valid data. */
async function fillValidForm(page: Page) {
  await page.getByPlaceholder("Jane Doe").fill("Jane Doe");
  await page.getByPlaceholder("@janedoe").fill("@janedoe-e2e");
  await page.getByPlaceholder("jane@example.com").fill(`e2e-${Date.now()}@example.com`);
  await page.locator("select").first().selectOption({ index: 1 });

  // Section 02 — pick one platform.
  await page.getByText("YouTube", { exact: true }).click();

  // Section 03 — audience size (first radio option).
  await page.locator("input[name='audienceSize']").first().check();

  // Section 04 — publishing frequency + experience (first option each).
  await page.locator("input[name='publishingFrequency']").first().check();
  await page.locator("input[name='creatorExperience']").first().check();

  // Section 05 — free text challenge (min 10 characters).
  await page.getByPlaceholder("Tell us in your own words...").fill("Finding time to analyze what content actually works.");

  // Section 06 — at least one product interest.
  await page.getByText("Understanding my audience", { exact: true }).click();

  // Section 08 — required consent checkbox (privacy policy).
  await page
    .locator("label", { hasText: "I have read and accept the" })
    .locator("input[type='checkbox']")
    .check();
}

test.describe("Early Access form", () => {
  test("opens the form and renders every section", async ({ page }) => {
    await page.goto("/early-access");
    await expect(page.getByRole("heading", { name: "Basic Information" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Consent" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Join the Early Access Program/i })).toBeVisible();
  });

  test("shows validation errors when submitting an empty form", async ({ page }) => {
    await page.goto("/early-access");
    await page.getByRole("button", { name: /Join the Early Access Program/i }).click();

    // Client-side zod validation blocks submission and surfaces field errors
    // without ever calling the API.
    await expect(page.getByText("Full name is required")).toBeVisible();
    await expect(page).toHaveURL(/\/early-access$/);
  });

  test("submits successfully and redirects to the pending page", async ({ page }) => {
    // Mock the API so the flow can be verified without a real database or
    // email provider — this test only asserts the client's contract with
    // the API (request shape in, redirect behavior out).
    await page.route("**/api/early-access", async (route) => {
      const request = route.request();
      expect(request.method()).toBe("POST");
      const payload = request.postDataJSON();
      expect(payload.email).toContain("@example.com");
      expect(payload.privacyAccepted).toBe(true);

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          pending: true,
          creatorId: "e2e-mock-id",
          email: payload.email,
          createdAt: new Date().toISOString(),
          emailSent: true,
        }),
      });
    });

    await page.goto("/early-access");
    await fillValidForm(page);
    await page.getByRole("button", { name: /Join the Early Access Program/i }).click();

    await expect(page).toHaveURL(/\/early-access\/pending/);
    await expect(page.getByText(/Check your email to confirm your registration/i)).toBeVisible();
  });

  test("surfaces a server error without redirecting", async ({ page }) => {
    await page.route("**/api/early-access", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: "Too many submissions. Please try again later." }),
      });
    });

    await page.goto("/early-access");
    await fillValidForm(page);
    await page.getByRole("button", { name: /Join the Early Access Program/i }).click();

    await expect(page.getByText("Too many submissions. Please try again later.")).toBeVisible();
    await expect(page).toHaveURL(/\/early-access$/);
  });
});
