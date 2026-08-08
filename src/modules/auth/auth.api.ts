import type {
  EmailRequestInput,
  LoginInput,
  SignupInput,
} from "./auth.schema";
import type { AuthSessionResponse, AuthUser } from "./auth.types";
import type { AppLocale } from "@/i18n/config";
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

type BackendErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
  fieldErrors?: unknown;
};

type RefreshResponse = {
  success: true;
  data: { accessToken: string };
};

type RegisterResponse = {
  success: true;
  data: { userId: string; message: string };
};

type MessageResponse = {
  success: true;
  data: { sent?: boolean; success?: boolean; message: string };
};

type CurrentUserResponse = {
  success: true;
  data: AuthUser;
};

type LanguagePreferenceResponse = {
  success: true;
  data: { preferredLanguage: AppLocale };
};

function normalizeApiError(json: unknown, status: number): ApiError {
  const response =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : {};
  const nested =
    typeof response.error === "object" && response.error !== null
      ? (response.error as BackendErrorPayload)
      : undefined;
  const message =
    (typeof response.message === "string" ? response.message : undefined) ??
    nested?.message ??
    (typeof response.error === "string" ? response.error : undefined) ??
    `Request failed: ${status}`;

  return {
    success: false,
    error: message,
    message,
    code:
      (typeof response.code === "string" ? response.code : undefined) ??
      nested?.code,
    details: response.details ?? nested?.details ?? nested?.fieldErrors,
  };
}

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw normalizeApiError(json, res.status);
  }
  return json as T;
}

async function publicRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  return handle<T>(response);
}

function isInvalidCsrf(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "CSRF_INVALID"
  );
}

async function requestWithCsrf<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const csrfToken = await getCsrfToken();
    const headers = new Headers(init.headers);
    headers.set("x-csrf-token", csrfToken);

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

export async function registerUser(
  payload: SignupInput & { preferredLanguage?: AppLocale },
) {
  const response = await publicRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  clearCsrfToken();
  return response;
}

export async function loginUser(payload: LoginInput) {
  const session = await publicRequest<AuthSessionResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  clearCsrfToken();
  return session;
}

export async function verifyEmail(token: string) {
  const session = await publicRequest<AuthSessionResponse>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
  clearCsrfToken();
  return session;
}

export async function getCurrentUser(accessToken: string) {
  return publicRequest<CurrentUserResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function updatePreferredLanguage(
  locale: AppLocale,
  accessToken: string,
) {
  return requestWithCsrf<LanguagePreferenceResponse>("/auth/preferences", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ preferredLanguage: locale }),
  });
}

export function resendVerification(payload: EmailRequestInput) {
  return publicRequest<MessageResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(payload: EmailRequestInput) {
  return publicRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPassword(token: string, password: string) {
  return publicRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
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
