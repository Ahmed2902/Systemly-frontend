import { api } from "@/shared/lib/api";

const BRANCH_INVITE_WARNING_KEY = "systemly:branch-invite-not-queued";

export type BranchRecord = {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BranchPricing = {
  basePriceCents: number;
  includedBranchCount: number;
  activeBranchCount: number;
  additionalBranchCount: number;
  additionalBranchUnitPriceCents: number;
  additionalBranchTotalCents: number;
  nextRenewalAmountCents: number;
  currency: string;
};

type BranchMutationInput = {
  name?: string;
  slug?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  timezone?: string;
};

export type BranchSetupInput = {
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  timezone: "Africa/Cairo";
  receptionistEmail?: string;
  services: Array<{
    clientId: string;
    name: string;
    category?: string;
    description?: string;
    durationMin: number;
    priceEgp: number;
  }>;
  staff: Array<{
    clientId: string;
    name: string;
    jobTitle?: string;
    serviceClientIds: string[];
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
  }>;
};

export type BranchSetupResult = {
  branch: BranchRecord;
  invitation: {
    id: string;
    expiresAt: string;
    acceptUrl: string;
    delivery: "queued" | "not_queued";
  } | null;
};

export function consumeBranchInviteWarning() {
  if (typeof window === "undefined") return false;
  const shouldWarn =
    window.sessionStorage.getItem(BRANCH_INVITE_WARNING_KEY) === "true";
  window.sessionStorage.removeItem(BRANCH_INVITE_WARNING_KEY);
  return shouldWarn;
}

export function listBranches(
  token: string | null,
  includeInactive = false,
) {
  const query = includeInactive ? "?includeInactive=true" : "";
  return api<BranchRecord[]>(`/branches${query}`, token);
}

export async function setupBranch(token: string | null, input: BranchSetupInput) {
  const result = await api<BranchSetupResult>("/branches/setup", token, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (
    typeof window !== "undefined" &&
    result.invitation?.delivery === "not_queued"
  ) {
    window.sessionStorage.setItem(BRANCH_INVITE_WARNING_KEY, "true");
  }

  return result;
}

export function updateBranch(
  token: string | null,
  branchId: string,
  input: BranchMutationInput,
) {
  return api<BranchRecord>(`/branches/${encodeURIComponent(branchId)}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deactivateBranch(token: string | null, branchId: string) {
  return api<BranchRecord>(
    `/branches/${encodeURIComponent(branchId)}/deactivate`,
    token,
    { method: "POST" },
  );
}

export function reactivateBranch(token: string | null, branchId: string) {
  return api<BranchRecord>(
    `/branches/${encodeURIComponent(branchId)}/reactivate`,
    token,
    { method: "POST" },
  );
}

export async function getBranchPricing(token: string | null) {
  const result = await api<{ pricing: BranchPricing }>("/billing/pricing", token);
  return result.pricing;
}

export function inviteReceptionist(
  token: string | null,
  branchId: string,
  email: string,
) {
  return api("/staff/invites", token, {
    method: "POST",
    body: JSON.stringify({ branchId, email }),
  });
}
