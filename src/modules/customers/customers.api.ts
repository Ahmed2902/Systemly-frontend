import { apiUrl } from "@/shared/lib/api-url";
import type {
  CustomerFilter,
  CustomerInput,
  CustomerListResponse,
  CustomerProfile,
  CustomerWorkspaceResponse,
} from "./customers.types";

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

export function listCustomers(
  accessToken: string,
  options: {
    search?: string;
    filter?: CustomerFilter;
    page?: number;
    perPage?: number;
  } = {},
) {
  const params = new URLSearchParams();
  if (options.search) params.set("search", options.search);
  if (options.filter) params.set("filter", options.filter);
  params.set("page", String(options.page ?? 1));
  params.set("perPage", String(options.perPage ?? 20));

  return api<CustomerListResponse>(`/customers?${params.toString()}`, accessToken);
}

export function getCustomerWorkspace(customerId: string, accessToken: string) {
  return api<CustomerWorkspaceResponse>(
    `/customers/${encodeURIComponent(customerId)}/workspace`,
    accessToken,
  );
}

export function createCustomer(input: CustomerInput, accessToken: string) {
  return api<CustomerProfile>("/customers", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCustomer(
  customerId: string,
  input: Partial<CustomerInput>,
  accessToken: string,
) {
  return api<CustomerProfile>(
    `/customers/${encodeURIComponent(customerId)}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
