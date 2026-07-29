import { defineConfig, devices } from "@playwright/test";

/**
 * Minimal Playwright setup for the critical Early Access flow.
 *
 * Runs against a local `next dev` server (started automatically) so the
 * suite can be executed the same way in CI and locally with no extra
 * services required. Network calls to `/api/early-access` are mocked at
 * the page level in the relevant tests, so no database/email provider is
 * needed to exercise the UI flow end-to-end.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : "html",
  timeout: 30_000,

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
