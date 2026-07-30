import type { SignupInput, LoginInput } from "./auth.schema";
import type { AuthSessionResponse } from "./auth.types";
import { apiUrl } from "../../shared/lib/api-url";
import { clearCsrfToken, getCsrfToken } from "@/shared/lib/csrf";
import { setAccessToken } from "./auth.store";

export type ApiError = {
  success: false;
  error?: string;
  message?: string;
  code?: string;
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

function isInvalidCsrf(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as ApiError).code === "EBADCSRFTOKEN"
  );
}

async function requestWithCsrf<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const csrfToken = await getCsrfToken();
    const headers = new Headers(init.headers);
    headers.set("CSRF-Token", csrfToken);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(apiUrl(path), {
      ...init,
      method: init.method ?? "POST",
      credentials: "include",
      cache: "no-store",
      headers,
    });

    try {
      return await handle<T>(response);
    } catch (error) {
      if (attempt === 0 && isInvalidCsrf(error)) {
        clearCsrfToken();
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to validate the secure session");
}

export async function registerUser(payload: SignupInput) {
  const res = await fetch(apiUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  await handle(res);
  clearCsrfToken();
  return loginUser({ email: payload.email, password: payload.password });
}

export async function loginUser(payload: LoginInput) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const session = await handle<AuthSessionResponse>(res);
  clearCsrfToken();
  return session;
}

let refreshPromise: Promise<RefreshResponse> | null = null;

export function refreshAccessToken(): Promise<RefreshResponse> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = requestWithCsrf<RefreshResponse>("/auth/refresh", {
    body: JSON.stringify({}),
  })
    .then((json) => {
      setAccessToken(json.data.accessToken);
      return json;
    })
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
  try {
    return await requestWithCsrf("/auth/logout");
  } finally {
    clearCsrfToken();
    setAccessToken(null);
  }
}
