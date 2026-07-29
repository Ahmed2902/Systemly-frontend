import { refreshAccessToken } from "@/modules/auth/auth.api";
import { getAccessToken } from "@/modules/auth/auth.store";
import { apiUrl } from "./api-url";

const MAX_IN_FLIGHT_GETS = 100;
const inFlightGets = new Map<string, Promise<Response>>();

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

function canCoalesce(init: RequestInit) {
  const method = (init.method ?? "GET").toUpperCase();
  return method === "GET" && init.body === undefined && init.signal === undefined;
}

function removeInFlight(key: string, request: Promise<Response>) {
  if (inFlightGets.get(key) === request) inFlightGets.delete(key);
}

async function send(path: string, token: string | null, init: RequestInit) {
  const execute = () =>
    fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      headers: headersFor(init, token),
    });

  if (!canCoalesce(init) || inFlightGets.size >= MAX_IN_FLIGHT_GETS) {
    return execute();
  }

  // The token is used only in this short-lived in-memory key. It prevents two
  // authenticated users from ever sharing a response and is removed as soon
  // as the request settles. Nothing is persisted or logged.
  const key = `${token ?? "anonymous"}\n${path}`;
  let pending = inFlightGets.get(key);

  if (!pending) {
    pending = execute();
    inFlightGets.set(key, pending);
    void pending.then(
      () => removeInFlight(key, pending!),
      () => removeInFlight(key, pending!),
    );
  }

  // Every caller gets its own body stream while sharing the same network call.
  return (await pending).clone();
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
