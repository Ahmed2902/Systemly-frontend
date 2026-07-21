import { apiUrl } from "@/shared/lib/api-url";
import type {
  CatalogService,
  ServiceCatalogResponse,
  ServiceInput,
  ServiceStatusFilter,
} from "./services.types";

async function api<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });

  const body: unknown = await response.json().catch(() => ({}));
  const envelope = body as {
    success?: boolean;
    message?: string;
    data?: T;
  };

  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.message ?? `Request failed: ${response.status}`);
  }

  return envelope.data ?? (body as T);
}

export function getServiceCatalog(
  accessToken: string,
  options: {
    search?: string;
    category?: string;
    status?: ServiceStatusFilter;
  } = {},
) {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.category) params.set("category", options.category);
  if (options.status) params.set("status", options.status);

  const query = params.toString();
  return api<ServiceCatalogResponse>(
    `/services${query ? `?${query}` : ""}`,
    accessToken,
  );
}

export function createService(input: ServiceInput, accessToken: string) {
  return api<CatalogService>("/services", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateService(
  serviceId: string,
  input: Partial<ServiceInput>,
  accessToken: string,
) {
  return api<CatalogService>(
    `/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function archiveService(serviceId: string, accessToken: string) {
  return api<{ id: string; isActive: false }>(
    `/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    { method: "DELETE" },
  );
}
