import { refreshAccessToken } from "@/modules/auth/auth.api";
import { getAccessToken } from "@/modules/auth/auth.store";
import { getOperationalBranchId } from "@/modules/operations/branch-scope";
import { getInstalledApiTransport } from "./api-transport";
import { apiUrl } from "./api-url";

const MAX_IN_FLIGHT_GETS = 100;
const inFlightGets = new Map<string, Promise<unknown>>();

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ApiErrorPayload = {
  code?: string;
  message?: string;
  requestId?: string;
  fieldErrors?: unknown;
  details?: unknown;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string | ApiErrorPayload;
  code?: string;
  details?: unknown;
};

function headersFor(init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const branchId = getOperationalBranchId();
  if (token && branchId && !headers.has("X-Branch-Id")) {
    headers.set("X-Branch-Id", branchId);
  }
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

function send(path: string, token: string | null, init: RequestInit) {
  const requestInit: RequestInit = {
    ...init,
    credentials: "include",
    headers: headersFor(init, token),
  };
  const url = apiUrl(path);
  const transport = getInstalledApiTransport();

  return transport
    ? transport.request({ path, url, token, init: requestInit })
    : fetch(url, requestInit);
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
    const nestedError =
      typeof body.error === "object" && body.error !== null
        ? body.error
        : undefined;
    const message =
      body.message ??
      nestedError?.message ??
      (typeof body.error === "string" ? body.error : undefined) ??
      `Request failed: ${response.status}`;
    const code = body.code ?? nestedError?.code;
    const details =
      body.details ?? nestedError?.details ?? nestedError?.fieldErrors;

    throw new ApiRequestError(message, response.status, code, details);
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

  const branchId = getOperationalBranchId() ?? "";
  const key = `${effectiveToken}\n${branchId}\n${retryOnUnauthorized ? "1" : "0"}\n${path}`;
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
