import { api } from "@/shared/lib/api";

export type InviteRole = "Staff" | "Receptionist";

export type StaffInviteResult = {
  id: string;
  expiresAt: string;
  acceptUrl?: string;
};

export function createStaffInvite(
  input: { email: string; role: InviteRole; expiresInDays?: number },
  accessToken: string,
) {
  return api<StaffInviteResult>("/staff/invites", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function acceptStaffInvite(token: string, accessToken: string) {
  return api<{ userId: string; staff: { id: string; name: string } }>(
    "/staff/invites/accept",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
}
