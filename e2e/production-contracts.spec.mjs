import { test, expect } from "@playwright/test";
import { apiJson, loginApi, requiredEnv } from "./helpers.mjs";

test("production backend health and Google OAuth callback never point to localhost", async ({ request }) => {
  const backend = requiredEnv("E2E_BACKEND_URL");
  const health = await request.get(`${backend}/health/ready`);
  expect(health.ok()).toBeTruthy();

  const oauth = await request.get(`${backend}/api/auth/oauth/google`, {
    maxRedirects: 0,
  });
  expect([302, 303, 307, 308]).toContain(oauth.status());

  const googleLocation = oauth.headers()["location"];
  expect(googleLocation).toBeTruthy();
  const authorizationUrl = new URL(googleLocation);
  expect(authorizationUrl.hostname).toBe("accounts.google.com");

  const redirectUri = authorizationUrl.searchParams.get("redirect_uri");
  expect(redirectUri).toBe(`${backend}/api/auth/oauth/google/callback`);
  expect(redirectUri).not.toMatch(/localhost|127\.0\.0\.1|0\.0\.0\.0/i);
});

test("@mobile public auth and marketing surfaces render without horizontal overflow", async ({ page }) => {
  for (const path of ["/", "/login", "/signup", "/forgot-password"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} has horizontal overflow`).toBeLessThanOrEqual(2);
  }
});

test("tenant A cannot read a tenant B resource", async ({ request }) => {
  test.skip(
    !process.env.E2E_OWNER_EMAIL ||
      !process.env.E2E_OWNER_PASSWORD ||
      !process.env.E2E_FOREIGN_STAFF_ID,
    "Set owner credentials and E2E_FOREIGN_STAFF_ID for cross-tenant verification",
  );

  const token = await loginApi(
    request,
    process.env.E2E_OWNER_EMAIL,
    process.env.E2E_OWNER_PASSWORD,
  );
  const { response } = await apiJson(
    request,
    `/api/staff/${process.env.E2E_FOREIGN_STAFF_ID}/workspace`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  expect([403, 404]).toContain(response.status());
});

test("simultaneous public booking attempts cannot double-book one slot", async ({ request }) => {
  test.skip(!process.env.E2E_BOOKING_PAYLOAD_JSON, "Set E2E_BOOKING_PAYLOAD_JSON to an isolated future staging slot");
  const payload = JSON.parse(process.env.E2E_BOOKING_PAYLOAD_JSON);

  const [first, second] = await Promise.all([
    apiJson(request, "/api/bookings", { method: "POST", data: payload }),
    apiJson(request, "/api/bookings", { method: "POST", data: payload }),
  ]);

  const statuses = [first.response.status(), second.response.status()].sort((a, b) => a - b);
  expect(statuses.filter((status) => status >= 200 && status < 300)).toHaveLength(1);
  expect(statuses.some((status) => status === 409)).toBeTruthy();
});

test("double collect-payment cannot create two successful paid transitions", async ({ request }) => {
  test.skip(
    !process.env.E2E_OWNER_EMAIL ||
      !process.env.E2E_OWNER_PASSWORD ||
      !process.env.E2E_PAYMENT_APPOINTMENT_ID,
    "Set owner credentials and an isolated completed appointment for payment concurrency testing",
  );

  const token = await loginApi(
    request,
    process.env.E2E_OWNER_EMAIL,
    process.env.E2E_OWNER_PASSWORD,
  );
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    data: { appointmentId: process.env.E2E_PAYMENT_APPOINTMENT_ID, paymentMethod: "CASH" },
  };

  const [first, second] = await Promise.all([
    apiJson(request, "/api/invoices/collect-payment", options),
    apiJson(request, "/api/invoices/collect-payment", options),
  ]);

  const successful = [first, second].filter(({ response }) => response.ok());
  expect(successful.length).toBeLessThanOrEqual(1);
  expect([first.response.status(), second.response.status()].some((status) => status === 409 || status === 400)).toBeTruthy();
});
