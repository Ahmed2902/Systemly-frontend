import { refreshAccessToken } from "@/modules/auth/auth.api";
import { getAccessToken } from "@/modules/auth/auth.store";
import { apiUrl } from "./api-url";

const MAX_IN_FLIGHT_GETS = 100;
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

  // refreshAccessToken itself coalesces concurrent refresh attempts.
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

function canCoalesceGet(init: RequestInit, token: string | null) {
  const method = (init.method ?? "GET").toUpperCase();
  return (
    method === "GET" &&
    Boolean(token) &&
    init.body === undefined &&
    init.headers === undefined &&
    init.signal === undefined
  );
}

export function api<T>(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const retryOnUnauthorized = options.retryOnUnauthorized !== false;
  const effectiveToken = getAccessToken() ?? accessToken;

  const execute = async () => {
    const response = await request(
      path,
      accessToken,
      init,
      retryOnUnauthorized,
    );
    return parseEnvelope<T>(response);
  };

  if (!canCoalesceGet(init, effectiveToken)) return execute();

  // Token scoping prevents data from one authenticated session being shared
  // with another. The hard cap prevents an attacker-controlled path stream from
  // growing this temporary map without bound.
  const key = `${effectiveToken}\n${retryOnUnauthorized ? "1" : "0"}\n${path}`;
  const existing = inFlightGets.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  if (inFlightGets.size >= MAX_IN_FLIGHT_GETS) return execute();

  const pending = execute().finally(() => {
    if (inFlightGets.get(key) === pending) inFlightGets.delete(key);
  });
  inFlightGets.set(key, pending);
  return pending;
}

export function apiFetch(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
) {
  return request(path, accessToken, init, true);
}