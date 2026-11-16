import { expect, test, type Locator } from "@playwright/test";
import { loginAs } from "./helpers";

test.use({ actionTimeout: 20_000, video: "off", launchOptions: {
  ...(process.env.E2E_BROWSER_PATH ? { executablePath: process.env.E2E_BROWSER_PATH } : {}),
} });
test.skip(process.env.STAFF_CHECKPOINT_E2E !== "1", "Requires both frontends and an isolated seeded API/database.");

async function expectSolidRed(button: Locator) {
  const colors = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    return [style.backgroundColor, style.color].map((color) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    });
  });
  expect(colors[0][0]).toBeGreaterThan(120);
  expect(colors[0][1]).toBeLessThan(70);
  expect(colors[0][2]).toBeLessThan(70);
  expect(colors[0][3]).toBe(255);
  expect(colors[1]).toEqual([255, 255, 255, 255]);
}

test("organizer approves/rejects DQ in UI, retries safely and never commits automatically", async ({ page: staff, browser, request }) => {
  test.setTimeout(180_000);
  const backend = process.env.E2E_BACKEND || "http://localhost:5080";
  const eventId = process.env.E2E_STAFF_EVENT || "5aff0000-0000-4000-8000-000000000100";
  const distanceId = process.env.E2E_STAFF_DISTANCE || "5aff0000-0000-4000-8000-000000000101";
  const userOrigin = process.env.E2E_USER_ORIGIN || "http://localhost:3000";
  const auth = await request.post(`${backend}/api/v1/iam/auth/login`, { data: {
    username: process.env.E2E_ORGANIZER_USER || "cuong.le", password: process.env.E2E_PASSWORD || "MatKhau@123",
  } });
  expect(auth.ok()).toBeTruthy();
  const { accessToken } = await auth.json();
  const headers = { Authorization: `Bearer ${accessToken}` };
  const post = async (path: string, data?: unknown) => {
    const response = await request.post(`${backend}/api/v1/simulation${path}`, { headers, data });
    expect(response.ok(), await response.text()).toBeTruthy();
    return response.json();
  };
  let run = await post(`/events/${eventId}/distances/${distanceId}/runs`, { runnerCount: 3, seed: 7 });
  run = await post(`/runs/${run.runId}/new`, { runnerCount: 3, seed: 7, confirmDiscard: true });
  const [approved, rejected] = run.athletes;
  await loginAs(staff, process.env.E2E_STAFF_USER || "coord1");
  await staff.goto(`/checkpoint/events/${eventId}`);
  await expect(staff.getByText("Đang cập nhật trực tiếp", { exact: true })).toBeVisible();
  for (const athlete of [approved, rejected]) {
    const row = staff.getByRole("row").filter({ has: staff.getByText(athlete.bib, { exact: true }) });
    await row.getByRole("button", { name: "Báo vi phạm", exact: true }).click();
    await staff.getByLabel("Lý do *", { exact: true }).fill(`Check route ${athlete.bib}`);
    await staff.getByLabel("Mô tả / đường dẫn bằng chứng").fill(`Evidence ${athlete.bib}`);
    await staff.getByRole("button", { name: "Gửi báo cáo", exact: true }).click();
    await expect(staff.getByRole("dialog")).not.toBeVisible();
  }

  const organizer = await browser.newPage({ baseURL: userOrigin });
  const viewport = async (width: number) => {
    await organizer.setViewportSize({ width, height: 900 });
    await organizer.getByRole("banner", { includeHidden: true }).evaluate(async (header) => {
      const layout = header.parentElement!;
      layout.getBoundingClientRect();
      await Promise.all(layout.getAnimations().map((animation) => animation.finished.catch(() => {})));
    });
  };
  await loginAs(organizer, process.env.E2E_ORGANIZER_USER || "cuong.le");
  await organizer.goto(`/organizer/events/${eventId}/race-simulation`);
  const reviews = organizer.getByRole("dialog");
  const openReviews = organizer.getByRole("button", { name: /^Báo cáo DQ từ staff,/ });
  await expect(openReviews).toHaveAccessibleName("Báo cáo DQ từ staff, 2 chờ duyệt");
  await expect(reviews).not.toBeVisible();
  const map = organizer.locator(".leaflet-container").first();
  const mapBefore = await map.boundingBox();
  await openReviews.click();
  await expect(reviews.getByText("2 báo cáo chờ duyệt", { exact: true })).toBeVisible();
  expect((await map.boundingBox())!.height).toBe(mapBefore!.height);
  let commitRequests = 0;
  organizer.on("request", (req) => { if (req.url().endsWith("/commit")) commitRequests++; });
  const approvedCard = reviews.getByRole("listitem").filter({ hasText: `BIB ${approved.bib}` });
  await expect(approvedCard).toContainText(`Evidence ${approved.bib}`);
  await expectSolidRed(approvedCard.getByRole("button", { name: "Duyệt DQ", exact: true }));
  await approvedCard.getByRole("button", { name: "Duyệt DQ", exact: true }).click();
  await organizer.getByRole("button", { name: "Hủy", exact: true }).click();
  await expect(reviews.getByRole("heading", { name: "Báo cáo DQ từ staff", exact: true })).toBeFocused();
  await approvedCard.getByRole("button", { name: "Duyệt DQ", exact: true }).click();
  await organizer.getByRole("button", { name: "Xác nhận duyệt DQ", exact: true }).click();
  await expect(organizer.getByRole("dialog").getByRole("alert")).toContainText("Nhập lý do");
  await organizer.getByLabel("Lý do xử lý *", { exact: true }).fill("Confirmed route violation");
  await organizer.keyboard.press("Tab");
  await expect(organizer.getByRole("button", { name: "Hủy", exact: true })).toBeFocused();
  await organizer.keyboard.press("Tab");
  await expect(organizer.getByRole("button", { name: "Xác nhận duyệt DQ", exact: true })).toBeFocused();
  await expectSolidRed(organizer.getByRole("button", { name: "Xác nhận duyệt DQ", exact: true }));
  const operations: string[] = [];
  await organizer.route("**/api/backend/api/v1/simulation/runs/*/decisions/*/review", async (route) => {
    operations.push(route.request().postDataJSON().operationId);
    if (operations.length === 1) await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Lỗi thử nghiệm, hãy thử lại." }) });
    else await route.continue();
  });
  await organizer.getByRole("button", { name: "Xác nhận duyệt DQ", exact: true }).click();
  await expect(organizer.getByRole("dialog").getByRole("alert")).toContainText("Lỗi thử nghiệm");
  await expect(organizer.getByLabel("Lý do xử lý *", { exact: true })).toHaveValue("Confirmed route violation");
  for (const width of [375, 768, 1280]) {
    await viewport(width);
    const dialog = organizer.getByRole("dialog");
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await organizer.screenshot({ path: `test-results/organizer-dq-dialog-${width}.png` });
  }
  await organizer.getByRole("button", { name: "Xác nhận duyệt DQ", exact: true }).click();
  await expect(reviews.getByRole("heading", { name: "Báo cáo DQ từ staff", exact: true })).toBeVisible();
  expect(operations).toHaveLength(2);
  expect(operations[0]).toBe(operations[1]);
  await reviews.getByRole("button", { name: "Đã xử lý (1)", exact: true }).click();
  await expect(reviews.getByText("Đã duyệt DQ", { exact: true })).toBeVisible();
  await expect(reviews).toContainText("Confirmed route violation");
  await reviews.getByRole("button", { name: "Chờ duyệt (1)", exact: true }).click();
  await organizer.keyboard.press("Escape");
  await expect(reviews).not.toBeVisible();
  await expect(openReviews).toBeFocused();

  for (const athlete of run.athletes.filter((a: { registrationId: string }) => a.registrationId !== approved.registrationId)) {
    await post(`/runs/${run.runId}/athletes/${athlete.registrationId}/speed`, { kmh: 40 });
  }
  await post(`/runs/${run.runId}/playback`, { rate: 60 });
  await organizer.getByRole("button", { name: "Bắt đầu", exact: true }).click();
  await expect(staff.getByText("Đã kết thúc", { exact: true })).toBeVisible({ timeout: 35_000 });
  await expect(organizer.getByRole("button", { name: "Ghi kết quả", exact: true })).toBeDisabled();
  await expect(staff.getByRole("button", { name: "Gửi cho organizer", exact: true })).toBeDisabled();
  await openReviews.click();
  const rejectedCard = reviews.getByRole("listitem").filter({ hasText: `BIB ${rejected.bib}` });
  await rejectedCard.getByRole("button", { name: "Từ chối", exact: true }).click();
  await organizer.getByLabel("Lý do xử lý *", { exact: true }).fill("No violation");
  await organizer.context().setOffline(true);
  await expect(organizer.getByRole("button", { name: "Xác nhận từ chối", exact: true })).toBeDisabled();
  await expect(organizer.getByLabel("Lý do xử lý *", { exact: true })).toHaveValue("No violation");
  await organizer.context().setOffline(false);
  await expect(organizer.getByRole("button", { name: "Xác nhận từ chối", exact: true })).toBeEnabled();
  await organizer.getByRole("button", { name: "Xác nhận từ chối", exact: true }).click();
  await expect(reviews.getByRole("heading", { name: "Báo cáo DQ từ staff", exact: true })).toBeVisible();
  await organizer.keyboard.press("Escape");
  await expect(organizer.getByRole("button", { name: "Ghi kết quả", exact: true })).toBeEnabled();
  await openReviews.click();
  await reviews.getByRole("button", { name: "Đã xử lý (2)", exact: true }).click();
  await expect(reviews.getByText("Đã từ chối", { exact: true })).toBeVisible();
  const snapshotResponse = await request.get(`${backend}/api/v1/simulation/runs/${run.runId}`, { headers });
  const snapshot = await snapshotResponse.json();
  expect(snapshot.commitState).toBe("Idle");
  expect(snapshot.athletes.find((a: { registrationId: string }) => a.registrationId === approved.registrationId).motion).toBe("Dq");
  expect(snapshot.athletes.find((a: { registrationId: string }) => a.registrationId === rejected.registrationId).motion).toBe("Finished");
  expect(commitRequests).toBe(0);
  await expect(staff.getByRole("button", { name: "Gửi cho organizer", exact: true })).toBeEnabled();
  await staff.getByRole("tab", { name: "Nhật ký thao tác", exact: true }).click();
  await expect(staff.getByText("Lý do: Confirmed route violation", { exact: true })).toBeVisible();
  await expect(staff.getByText("Lý do: No violation", { exact: true })).toBeVisible();
  await staff.getByLabel("Người thực hiện").selectOption("mine");
  await expect(staff.getByText("Lý do: No violation", { exact: true })).not.toBeVisible();
  await staff.getByLabel("Người thực hiện").selectOption("all");
  for (const width of [375, 768, 1280]) {
    await viewport(width);
    await expect.poll(() => organizer.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const box = await reviews.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
    await organizer.screenshot({ path: `test-results/organizer-dq-reviewed-${width}.png`, fullPage: true });
  }
  await organizer.keyboard.press("Escape");
  organizer.once("dialog", (dialog) => dialog.accept());
  await organizer.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(openReviews).toHaveAccessibleName("Báo cáo DQ từ staff, 0 chờ duyệt");
  await staff.getByRole("tab", { name: "Vận động viên", exact: true }).click();
  await staff.getByRole("row").filter({ has: staff.getByText(approved.bib, { exact: true }) }).getByRole("button", { name: "Báo vi phạm", exact: true }).click();
  await staff.getByLabel("Lý do *", { exact: true }).fill("New run report");
  await staff.getByRole("button", { name: "Gửi báo cáo", exact: true }).click();
  await openReviews.click();
  await reviews.getByRole("button", { name: "Chờ duyệt (1)", exact: true }).click();
  await reviews.getByRole("button", { name: "Từ chối", exact: true }).click();
  await organizer.getByLabel("Lý do xử lý *", { exact: true }).fill("Old draft");
  const preview = await request.get(`${backend}/api/v1/simulation/events/${eventId}/distances/${distanceId}`, { headers });
  await post(`/runs/${(await preview.json()).activeRunId}/reset`, { confirmDiscard: true });
  await expect(organizer.getByRole("dialog")).not.toBeVisible();
  await staff.getByRole("tab", { name: "Nhật ký thao tác", exact: true }).click();
  await staff.getByLabel("Lượt giả lập").selectOption(run.runId);
  await expect(staff.getByText("Lý do: Confirmed route violation", { exact: true })).toBeVisible();
  await organizer.close();
});
