import { expect, type Page } from "@playwright/test";

export const SEED_PASSWORD = process.env.E2E_PASSWORD || "MatKhau@123";

export async function loginAs(
  page: Page,
  username: string,
  password = SEED_PASSWORD
) {
  await page.goto("/login");
  await page.locator("#login-username").fill(username);
  await page.locator("#login-password").fill(password);
  await page.locator("#btn-login-submit").click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}
