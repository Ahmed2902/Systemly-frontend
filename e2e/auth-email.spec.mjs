import { test, expect } from "@playwright/test";
import { extractFrontendActionUrl, runId, waitForResendEmail } from "./helpers.mjs";

const password = "SystemlyE2E!2026";

test("new owner can register, receive a real verification email, verify, and enter the app", async ({ page }) => {
  const id = runId();
  const email = `delivered+systemly-e2e-${id}@resend.dev`;

  await page.goto("/signup");
  await page.locator("#signup-name").fill(`E2E Owner ${id}`);
  await page.locator("#signup-email").fill(email);
  await page.locator("#signup-phone").fill(`010${String(Date.now()).slice(-8)}`);
  await page.locator("#signup-password").fill(password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/resend-verification/);

  const verificationEmail = await waitForResendEmail({ to: email });
  expect(verificationEmail.last_event).toBeTruthy();
  expect(verificationEmail.html).toContain(email.split("@")[0].split("+")[0] || "");

  const verificationUrl = extractFrontendActionUrl(verificationEmail.html, "/verify-email");
  await page.goto(verificationUrl);
  await expect(page.getByText(/Email verified\. Opening your workspace/i)).toBeVisible();
  await page.waitForURL((url) => !url.pathname.includes("verify-email"), { timeout: 30_000 });

  expect(page.url()).not.toContain("/login");
});

test("password reset sends a real email and the link reaches the reset page", async ({ page }) => {
  test.skip(!process.env.E2E_EXISTING_USER_EMAIL, "Set E2E_EXISTING_USER_EMAIL to exercise password-reset delivery");
  const email = process.env.E2E_EXISTING_USER_EMAIL;

  await page.goto("/forgot-password");
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill(email);
  await page.locator('button[type="submit"]').click();

  const resetEmail = await waitForResendEmail({ to: email });
  const resetUrl = extractFrontendActionUrl(resetEmail.html, "/reset-password");
  await page.goto(resetUrl);
  await expect(page).toHaveURL(/\/reset-password\?token=/);
});
