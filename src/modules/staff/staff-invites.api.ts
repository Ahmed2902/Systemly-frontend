import { api } from "@/shared/lib/api";

export type StaffInviteResult = {
  id: string;
  branch?: { id: string; name: string };
  expiresAt: string;
  acceptUrl: string;
};

export type StaffInviteResolution = {
  email: string;
  accountExists: boolean;
  businessName: string;
  branch?: { id: string; name: string };
  expiresAt: string;
};

export type AcceptedStaffInvite = {
  user: {
    id: string;
    businessId: string | null;
    branchId?: string | null;
    role: string;
  };
  accessToken: string;
};

export function createStaffInvite(
  input: { email: string; branchId: string; expiresInDays?: number },
  accessToken: string,
) {
  return api<StaffInviteResult>("/staff/invites", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resolveStaffInvite(token: string) {
  return api<StaffInviteResolution>(
    `/staff/invites/resolve?token=${encodeURIComponent(token)}`,
    null,
    {},
    { retryOnUnauthorized: false },
  );
}

export function acceptStaffInvite(token: string, accessToken: string) {
  return api<AcceptedStaffInvite>("/staff/invites/accept", accessToken, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
