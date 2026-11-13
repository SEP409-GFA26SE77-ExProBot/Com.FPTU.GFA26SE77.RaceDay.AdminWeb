import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Requires: Admin FE :3001 + API :5080 + seed (admin@raceday.vn).
 * Finance / hoàn lỗi HT ops thuộc Manager — Admin chỉ users + audit.
 */
test.describe("Admin — không còn finance UI", () => {
  test("login → /finance + /refund-claims redirect /users; không gọi finance/admin", async ({
    page,
  }) => {
    const adminFinanceCalls: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/finance/admin/")) adminFinanceCalls.push(url);
    });

    await loginAs(page, process.env.E2E_ADMIN_USER || "admin");

    await page.goto("/finance");
    await expect(page).toHaveURL(/\/users/);

    await page.goto("/refund-claims");
    await expect(page).toHaveURL(/\/users/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/users/);

    expect(
      adminFinanceCalls.length,
      "Admin không còn gọi /api/v1/finance/admin/*"
    ).toBe(0);
  });

  test("Admin không vào được /approvals (Manager)", async ({ page }) => {
    await loginAs(page, process.env.E2E_ADMIN_USER || "admin");
    await page.goto("/approvals");
    await expect(page).toHaveURL(/\/forbidden/);
  });
});
