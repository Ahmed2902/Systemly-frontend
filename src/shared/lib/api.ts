import { refreshAccessToken } from "@/modules/auth/auth.api";
import { getAccessToken } from "@/modules/auth/auth.store";
import { apiUrl } from "./api-url";

const MAX_IN_FLIGHT_GETS = 200;
const inFlightGets = new Map<string, Promise<unknown>>();

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
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

function send(path: string, token: string | null, init: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: headersFor(init, token),
  });
}

async function request(
  path: string,
  fallbackToken: string | null,
  init: RequestInit,
  retryOnUnauthorized: boolean,
): Promise<Response> {
  const tokenUsed = getAccessToken() ?? fallbackToken;
  const response = await send(path, tokenUsed, init);
  if (response.status !== 401 || !retryOnUnauthorized) return response;

  // Another request may have completed a refresh while this request was in
  // flight. Reuse that token before starting another refresh-cookie rotation.
  const currentToken = getAccessToken();
  if (currentToken && currentToken !== tokenUsed) {
    return send(path, currentToken, init);
  }

  const refreshed = await refreshAccessToken();
  return send(path, refreshed.data.accessToken, init);
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

function canCoalesce(init: RequestInit) {
  const method = (init.method ?? "GET").toUpperCase();
  return (
    method === "GET" &&
    init.body === undefined &&
    init.signal === undefined &&
    init.headers === undefined
  );
}

function inFlightKey(
  path: string,
  token: string | null,
  retryOnUnauthorized: boolean,
) {
  // The token is intentionally part of the key so data is never shared across
  // authenticated sessions. The map is bounded and entries are removed as soon
  // as the request settles.
  return `${retryOnUnauthorized ? "retry" : "no-retry"}\n${token ?? "anonymous"}\n${path}`;
}

export async function api<T>(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const retryOnUnauthorized = options.retryOnUnauthorized !== false;
  const execute = async () => {
    const response = await request(
      path,
      accessToken,
      init,
      retryOnUnauthorized,
    );
    return parseEnvelope<T>(response);
  };

  if (!canCoalesce(init)) return execute();

  const token = getAccessToken() ?? accessToken;
  const key = inFlightKey(path, token, retryOnUnauthorized);
  const existing = inFlightGets.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  // Do not allow attacker-controlled query strings to grow this client-side map
  // without bound. Requests still work normally when the limit is reached.
  if (inFlightGets.size >= MAX_IN_FLIGHT_GETS) return execute();

  const pending = execute();
  const clearPending = () => {
    if (inFlightGets.get(key) === pending) inFlightGets.delete(key);
  };
  inFlightGets.set(key, pending);
  pending.then(clearPending, clearPending);
  return pending;
}

export function apiFetch(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
) {
  return request(path, accessToken, init, true);
}
