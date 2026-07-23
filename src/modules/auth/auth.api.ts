import type { SignupInput, LoginInput } from "./auth.schema";
import type { AuthSessionResponse } from "./auth.types";
import { apiUrl } from "../../shared/lib/api-url";
import { getCsrfToken } from "@/shared/lib/csrf";
import { setAccessToken } from "./auth.store";

export type ApiError = {
  success: false;
  error?: string;
  message?: string;
  code: string;
  details?: unknown;
};

type RefreshResponse = {
  success: true;
  data: { accessToken: string };
};

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw json as ApiError;
  return json as T;
}

export async function registerUser(payload: SignupInput) {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  await handle(res);
  return loginUser({ email: payload.email, password: payload.password });
}

export async function loginUser(payload: LoginInput) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handle<AuthSessionResponse>(res);
}

let refreshPromise: Promise<RefreshResponse> | null = null;

export function refreshAccessToken(): Promise<RefreshResponse> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
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
    const json = await handle<RefreshResponse>(res);
    setAccessToken(json.data.accessToken);
    return json;
  })()
    .catch((error) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function logoutUser() {
  const csrfToken = await getCsrfToken();
  const res = await fetch(apiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
    headers: { "CSRF-Token": csrfToken },
  });
  const json = await handle(res);
  setAccessToken(null);
  return json;
}
