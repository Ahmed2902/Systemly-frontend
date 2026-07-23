import { apiUrl } from "@/shared/lib/api-url";
import type {
  CommissionType,
  StaffAvailabilityEntry,
  StaffBreakInput,
  StaffDirectoryResponse,
  StaffProfileInput,
  StaffRole,
  StaffStatusFilter,
  StaffTimeOffInput,
  StaffWorkspaceResponse,
} from "./staff.types";

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

function isStaffDirectoryResponse(
  value: unknown,
): value is StaffDirectoryResponse {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StaffDirectoryResponse>;
  const metrics = candidate.metrics;

  return (
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.serviceOptions) &&
    typeof candidate.total === "number" &&
    typeof candidate.page === "number" &&
    typeof candidate.perPage === "number" &&
    typeof candidate.canManageMoney === "boolean" &&
    typeof candidate.canManageProtectedFields === "boolean" &&
    Boolean(metrics) &&
    typeof metrics?.total === "number" &&
    typeof metrics.active === "number" &&
    typeof metrics.availableToday === "number" &&
    typeof metrics.onTimeOff === "number"
  );
}

export function getStaffDirectory(
  accessToken: string,
  filters: {
    search?: string;
    status?: StaffStatusFilter;
    role?: StaffRole | "";
    serviceId?: string;
    availableToday?: boolean;
  } = {},
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.role) params.set("role", filters.role);
  if (filters.serviceId) params.set("serviceId", filters.serviceId);
  if (filters.availableToday) params.set("availableToday", "true");
  const query = params.toString();
  return api<unknown>(`/staff${query ? `?${query}` : ""}`, accessToken).then(
    (response) => {
      if (!isStaffDirectoryResponse(response)) {
        throw new Error(
          "The staff directory response is incomplete. Please refresh after the API is updated.",
        );
      }
      return response;
    },
  );
}

export function getStaffWorkspace(staffId: string, accessToken: string) {
  return api<StaffWorkspaceResponse>(
    `/staff/${encodeURIComponent(staffId)}/workspace`,
    accessToken,
  );
}

export function createStaff(input: StaffProfileInput, accessToken: string) {
  return api<{ id: string }>("/staff", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStaff(
  staffId: string,
  input: Partial<StaffProfileInput>,
  accessToken: string,
) {
  return api<{ id: string }>(`/staff/${encodeURIComponent(staffId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deactivateStaff(staffId: string, accessToken: string) {
  return api<{ id: string; isActive: false }>(
    `/staff/${encodeURIComponent(staffId)}`,
    accessToken,
    { method: "DELETE" },
  );
}

export function replaceStaffAvailability(
  staffId: string,
  entries: StaffAvailabilityEntry[],
  accessToken: string,
) {
  return api<{ success: true }>(
    `/staff/${encodeURIComponent(staffId)}/availability`,
    accessToken,
    { method: "PUT", body: JSON.stringify(entries) },
  );
}

export function assignStaffService(
  staffId: string,
  input: {
    serviceId: string;
    commissionType?: CommissionType;
    commissionAmount?: number;
  },
  accessToken: string,
) {
  return api<unknown>(`/staff/${encodeURIComponent(staffId)}/services`, accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStaffServiceCommission(
  staffId: string,
  serviceId: string,
  input: { commissionType: CommissionType; commissionAmount: number },
  accessToken: string,
) {
  return api<unknown>(
    `/staff/${encodeURIComponent(staffId)}/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function unassignStaffService(
  staffId: string,
  serviceId: string,
  accessToken: string,
) {
  return api<unknown>(
    `/staff/${encodeURIComponent(staffId)}/services/${encodeURIComponent(serviceId)}`,
    accessToken,
    { method: "DELETE" },
  );
}

export function createStaffTimeOff(
  staffId: string,
  input: StaffTimeOffInput,
  accessToken: string,
) {
  return api<unknown>(`/staff/${encodeURIComponent(staffId)}/time-off`, accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteStaffTimeOff(
  staffId: string,
  timeOffId: string,
  accessToken: string,
) {
  return api<unknown>(
    `/staff/${encodeURIComponent(staffId)}/time-off/${encodeURIComponent(timeOffId)}`,
    accessToken,
    { method: "DELETE" },
  );
}

export function createStaffBreak(
  staffId: string,
  input: StaffBreakInput,
  accessToken: string,
) {
  return api<unknown>(`/staff/${encodeURIComponent(staffId)}/breaks`, accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteStaffBreak(
  staffId: string,
  breakId: string,
  accessToken: string,
) {
  return api<unknown>(
    `/staff/${encodeURIComponent(staffId)}/breaks/${encodeURIComponent(breakId)}`,
    accessToken,
    { method: "DELETE" },
  );
}
