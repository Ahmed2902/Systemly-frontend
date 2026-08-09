import { expect } from "@playwright/test";

export function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for this E2E suite`);
  return value.replace(/\/$/, "");
}

export function runId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function apiJson(request, path, options = {}) {
  const backend = requiredEnv("E2E_BACKEND_URL");
  const response = await request.fetch(`${backend}${path}`, options);
  const body = await response.json().catch(() => null);
  return { response, body };
}

export async function loginApi(request, email, password) {
  const { response, body } = await apiJson(request, "/api/auth/login", {
    method: "POST",
    data: { email, password },
  });
  expect(response.ok(), JSON.stringify(body)).toBeTruthy();
  const accessToken = body?.data?.accessToken;
  expect(accessToken).toBeTruthy();
  return accessToken;
}

export async function waitForResendEmail({ to, subjectIncludes, timeoutMs = 60_000 }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is required for real-email E2E");

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const listResponse = await fetch("https://api.resend.com/emails?limit=100", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!listResponse.ok) {
      throw new Error(`Resend list failed: ${listResponse.status} ${await listResponse.text()}`);
    }

    const list = await listResponse.json();
    const match = (list.data ?? []).find((item) => {
      const recipients = Array.isArray(item.to) ? item.to : [item.to];
      return recipients.includes(to) && (!subjectIncludes || item.subject?.includes(subjectIncludes));
    });

    if (match?.id) {
      const emailResponse = await fetch(`https://api.resend.com/emails/${match.id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!emailResponse.ok) {
        throw new Error(`Resend retrieve failed: ${emailResponse.status} ${await emailResponse.text()}`);
      }
      return emailResponse.json();
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(`Timed out waiting for Resend email to ${to}`);
}

export function extractFrontendActionUrl(html, pathname) {
  const frontend = requiredEnv("E2E_FRONTEND_URL");
  const escaped = frontend.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`${escaped}${pathname.replace("/", "\\/")}[^\"'<>\\s]*`, "i");
  const match = html?.match(expression);
  if (!match) throw new Error(`Could not find ${pathname} action URL in email HTML`);
  return match[0].replace(/&amp;/g, "&");
}
