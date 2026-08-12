import { api } from "@/shared/lib/api";

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

export function listBranches(
  token: string | null,
  includeInactive = false,
) {
  const query = includeInactive ? "?includeInactive=true" : "";
  return api<BranchRecord[]>(`/branches${query}`, token);
}

export function createBranch(
  token: string | null,
  input: Required<Pick<BranchMutationInput, "name" | "slug" | "timezone">> &
    Omit<BranchMutationInput, "name" | "slug" | "timezone">,
) {
  return api<BranchRecord>("/branches", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setupBranch(token: string | null, input: BranchSetupInput) {
  return api<BranchSetupResult>("/branches/setup", token, {
    method: "POST",
    body: JSON.stringify(input),
  });
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
