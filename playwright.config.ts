import { defineConfig, devices } from "@playwright/test";

/**
 * UI smoke against a running Admin FE (:3001) + RaceDay API (:5080).
 * Does not start servers — reuse local/dev-up / docker compose.
 *
 *   npm run test:e2e
 *   npm run test:e2e:ui
 */
const baseURL = process.env.E2E_ORIGIN || "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
