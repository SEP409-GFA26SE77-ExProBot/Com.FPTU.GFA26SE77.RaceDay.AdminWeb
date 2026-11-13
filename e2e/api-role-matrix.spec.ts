import { test, expect } from "@playwright/test";
import { loginAs, SEED_PASSWORD } from "./helpers";

const API = process.env.E2E_BACKEND || "http://localhost:5080";

async function bearerLogin(username: string) {
  const res = await fetch(`${API}/api/v1/iam/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: SEED_PASSWORD }),
  });
  expect(res.ok, `login ${username}`).toBeTruthy();
  const body = (await res.json()) as { accessToken?: string };
  expect(body.accessToken, `API phải trả accessToken cho ${username}`).toBeTruthy();
  return body.accessToken!;
}

test.describe("BE role matrix (Admin vs Manager)", () => {
  test("Manager: event/manager OK; iam/admin Forbidden; finance/manager OK; finance/admin 404", async () => {
    const token = await bearerLogin(process.env.E2E_MANAGER_USER || "manager");
    const h = { Authorization: `Bearer ${token}` };

    const pending = await fetch(`${API}/api/v1/event/manager/pending`, { headers: h });
    expect(pending.status).toBe(200);

    const users = await fetch(`${API}/api/v1/iam/admin/users?page=1&pageSize=1`, {
      headers: h,
    });
    expect([401, 403]).toContain(users.status);

    const overview = await fetch(`${API}/api/v1/finance/admin/overview`, { headers: h });
    expect(overview.status).toBe(404);

    const payouts = await fetch(`${API}/api/v1/finance/manager/payouts`, { headers: h });
    expect(payouts.status).toBe(200);
  });

  test("Admin: iam/admin OK; event/manager Forbidden; finance/manager OK; finance/admin 404", async () => {
    const token = await bearerLogin(process.env.E2E_ADMIN_USER || "admin");
    const h = { Authorization: `Bearer ${token}` };

    const users = await fetch(`${API}/api/v1/iam/admin/users?page=1&pageSize=1`, {
      headers: h,
    });
    expect(users.status).toBe(200);

    const overview = await fetch(`${API}/api/v1/finance/admin/overview`, { headers: h });
    expect(overview.status).toBe(404);

    const pending = await fetch(`${API}/api/v1/event/manager/pending`, { headers: h });
    expect([401, 403]).toContain(pending.status);

    const payouts = await fetch(`${API}/api/v1/finance/manager/payouts`, { headers: h });
    expect(payouts.status).toBe(200);
  });
});

test.describe("FE BFF proxies đúng prefix", () => {
  test("Manager session → event/manager/pending = 200", async ({ page, request }) => {
    await loginAs(page, process.env.E2E_MANAGER_USER || "manager");
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await request.get("/api/backend/api/v1/event/manager/pending", {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
  });
});
