// src/modules/auth/auth.api.ts
import { SignupInput, LoginInput } from "./auth.schema";
import { apiUrl } from "../../shared/lib/api-url";
import { getCsrfToken } from "@/shared/lib/csrf";

export type ApiError = {
  success: false;
  error: string;
  code: string;
  details?: unknown;
};

async function handle(res: Response) {
  const json = await res.json();
  if (!res.ok || json.success === false) throw json as ApiError;
  return json;
}

export async function registerUser(payload: SignupInput) {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handle(res); // registration succeeded, but no token returned

  // immediately log in with the same credentials to get a session
  return loginUser({ email: payload.email, password: payload.password });
}

export async function loginUser(payload: LoginInput) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// src/modules/auth/auth.api.ts — add
export async function refreshAccessToken() {
  const csrfToken = await getCsrfToken();
  const res = await fetch(apiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json;
}

export async function logoutUser() {
  const csrfToken = await getCsrfToken();
  const res = await fetch(apiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: { "CSRF-Token": csrfToken },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json;
}
