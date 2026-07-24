import { api } from "@/shared/lib/api";
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
  return api<StaffDirectoryResponse>(
    `/staff${query ? `?${query}` : ""}`,
    accessToken,
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

export async function uploadStaffPhoto(
  staffId: string,
  file: File,
  accessToken: string,
) {
  const encodedStaffId = encodeURIComponent(staffId);
  const ticket = await api<{
    uploadUrl: string;
    publicUrl: string;
    publicId: string;
  }>(`/staff/${encodedStaffId}/photo/presign`, accessToken, {
    method: "POST",
    body: JSON.stringify({ contentType: file.type }),
  });

  const upload = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error(`Image upload failed: ${upload.status}`);

  return api(`/staff/${encodedStaffId}/photo/confirm`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      publicId: ticket.publicId,
      publicUrl: ticket.publicUrl,
    }),
  });
}

export function removeStaffPhoto(staffId: string, accessToken: string) {
  return api(`/staff/${encodeURIComponent(staffId)}/photo`, accessToken, {
    method: "DELETE",
  });
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
