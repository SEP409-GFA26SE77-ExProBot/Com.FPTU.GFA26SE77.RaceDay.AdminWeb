import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

/**
 * Requires: Admin FE :3001 + API :5080 + seed (manager@raceday.vn).
 */
test.describe("Manager — duyệt giải + map course", () => {
  test("login → /approvals → mở chi tiết không bị forbidden API course", async ({
    page,
  }) => {
    await loginAs(page, process.env.E2E_MANAGER_USER || "manager");

    await page.goto("/approvals");
    await expect(page).toHaveURL(/\/approvals/);
    await expect(page.getByText(/Hồ sơ chờ duyệt/i).first()).toBeVisible({
      timeout: 20_000,
    });

    const detailLink = page.locator('a[href*="/approvals/"]').first();
    await expect(
      detailLink,
      "Seed phải có Trail Draft PendingApproval — chạy clear-and-seed.ps1"
    ).toBeVisible({ timeout: 20_000 });

    const courseResponses: { url: string; status: number }[] = [];
    page.on("response", (res) => {
      const url = res.url();
      if (url.includes("/api/v1/map/") && url.includes("/course")) {
        courseResponses.push({ url, status: res.status() });
      }
    });

    await detailLink.click();
    await expect(page).toHaveURL(/\/approvals\/[0-9a-f-]+/i);

    // Ban đầu FE có thể gọi course khi tab Bản đồ / distance chọn.
    const mapTab = page.getByRole("button", { name: /Bản đồ|Map/i }).or(
      page.getByText("Bản đồ", { exact: false })
    );
    if ((await mapTab.count()) > 0) {
      await mapTab.first().click();
    }

    await page.waitForTimeout(1500);

    const denied = courseResponses.find((r) => r.status === 400 || r.status === 403);
    expect(
      denied,
      denied
        ? `Course API bị từ chối: ${denied.status} ${denied.url}`
        : undefined
    ).toBeUndefined();

    await expect(
      page.getByText("Bạn không có quyền xem course của giải này.")
    ).toHaveCount(0);
  });

  test("Manager không vào được /users (Admin)", async ({ page }) => {
    await loginAs(page, process.env.E2E_MANAGER_USER || "manager");
    await page.goto("/users");
    await expect(page).toHaveURL(/\/forbidden/);
  });
});
