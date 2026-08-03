import type { ApiTransportRequest } from "@/shared/lib/api-transport";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export type DemoRequest = ApiTransportRequest & {
  method: string;
  pathname: string;
  searchParams: URLSearchParams;
};

export interface DemoRequestHandler {
  canHandle(request: DemoRequest): boolean;
  handle(request: DemoRequest): Promise<Response> | Response;
}

export function normalizeRequest(input: ApiTransportRequest): DemoRequest {
  const url = new URL(input.path, "https://demo.systemly.local");
  return {
    ...input,
    method: (input.init.method ?? "GET").toUpperCase(),
    pathname: url.pathname,
    searchParams: url.searchParams,
  };
}

export function parseBody(request: ApiTransportRequest): unknown {
  if (!request.init.body || typeof request.init.body !== "string") return {};
  return JSON.parse(request.init.body) as unknown;
}

export function objectBody(request: ApiTransportRequest): Record<string, unknown> {
  const value = parseBody(request);
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function ok(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: JSON_HEADERS,
  });
}

export function fail(message: string, status: number) {
  return new Response(
    JSON.stringify({ success: false, message, code: "DEMO_REQUEST_FAILED" }),
    { status, headers: JSON_HEADERS },
  );
}

export function stringOrNull(value: unknown) {
  return value == null || value === "" ? null : String(value);
}
