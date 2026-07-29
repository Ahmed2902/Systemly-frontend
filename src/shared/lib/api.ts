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

const MAX_IN_FLIGHT_GETS = 100;
const anonymousRequestScope = Symbol("anonymous-request-scope");
const inFlightGets = new Map<string | symbol, Map<string, Promise<unknown>>>();
let inFlightGetCount = 0;
let mutationGeneration = 0;
let refreshInFlight: Promise<string> | null = null;

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

function requestMethod(init: RequestInit) {
  return (init.method ?? "GET").toUpperCase();
}

function send(path: string, token: string | null, init: RequestInit) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: headersFor(init, token),
  });
}

function refreshTokenOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken()
      .then((response) => response.data.accessToken)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
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

  const refreshedToken = await refreshTokenOnce();
  return send(path, refreshedToken, init);
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

function canDeduplicate(init: RequestInit) {
  return (
    requestMethod(init) === "GET" &&
    init.body === undefined &&
    init.signal === undefined &&
    init.headers === undefined
  );
}

function deduplicatedGet<T>(
  path: string,
  accessToken: string | null,
  retryOnUnauthorized: boolean,
  loader: () => Promise<T>,
): Promise<T> {
  if (inFlightGetCount >= MAX_IN_FLIGHT_GETS) return loader();

  const token = getAccessToken() ?? accessToken;
  const scope = token ?? anonymousRequestScope;
  const key = `${path}\u0000retry:${retryOnUnauthorized ? "1" : "0"}\u0000generation:${mutationGeneration}`;
  let requests = inFlightGets.get(scope);

  if (!requests) {
    requests = new Map<string, Promise<unknown>>();
    inFlightGets.set(scope, requests);
  }

  const existing = requests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  inFlightGetCount += 1;
  const promise = loader().finally(() => {
    requests?.delete(key);
    inFlightGetCount = Math.max(0, inFlightGetCount - 1);
    if (requests?.size === 0) inFlightGets.delete(scope);
  });

  requests.set(key, promise);
  return promise;
}

export function api<T>(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
  options: { retryOnUnauthorized?: boolean } = {},
): Promise<T> {
  const method = requestMethod(init);
  const retryOnUnauthorized = options.retryOnUnauthorized !== false;

  // A read started before a mutation may contain stale data. Advancing the
  // generation before every mutation ensures any follow-up GET performs a new
  // request instead of attaching to that older promise.
  if (method !== "GET" && method !== "HEAD") mutationGeneration += 1;

  const execute = async () => {
    const response = await request(
      path,
      accessToken,
      init,
      retryOnUnauthorized,
    );
    return parseEnvelope<T>(response);
  };

  return canDeduplicate(init)
    ? deduplicatedGet(path, accessToken, retryOnUnauthorized, execute)
    : execute();
}

export function apiFetch(
  path: string,
  accessToken: string | null,
  init: RequestInit = {},
) {
  // Response bodies are streams and cannot safely be shared between callers.
  return request(path, accessToken, init, true);
}
