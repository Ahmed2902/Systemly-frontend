import { refreshAccessToken } from "@/modules/auth/auth.api";
import { getAccessToken } from "@/modules/auth/auth.store";
import { apiUrl } from "./api-url";

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: unknown;
};

function headersFor(init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function request(
  path: string,
  fallbackToken: string | null,
  init: RequestInit,
  retryOnUnauthorized: boolean,
): Promise<Response> {
  const token = getAccessToken() ?? fallbackToken;
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: headersFor(init, token),
  });

  if (response.status !== 401 || !retryOnUnauthorized) return response;

  const refreshed = await refreshAccessToken();
  const nextToken = refreshed.data.accessToken;
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: headersFor(init, nextToken),
  });
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || body.success === false) {
    throw new ApiRequestError(
      body.message ?? body.error ?? `Request failed: ${response.status}`,
      response.status,
      body.code,
      body.details,
    );
  }
  return body.data !== undefined ? body.data : (body as T);
}

export async function api<T>(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const response = await request(
    path,
    accessToken,
    init,
    options.retryOnUnauthorized !== false,
  );
  return parseEnvelope<T>(response);
}

export function apiFetch(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
) {
  return request(path, accessToken, init, true);
}
