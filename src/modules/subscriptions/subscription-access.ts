export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "EXPIRED"
  | "CANCELED"
  | "SUSPENDED"
  | "INCOMPLETE";

export type SubscriptionAccessMode =
  | "FULL"
  | "OWNER_READ_ONLY"
  | "BLOCKED";

export type SubscriptionAccessSnapshot = {
  businessId: string;
  mode: SubscriptionAccessMode;
  status: SubscriptionStatus | null;
  effectiveStatus: SubscriptionStatus | null;
  planCode: string | null;
  entitlements: string[];
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  businessDeleted: boolean;
  platformAdmin: boolean;
};

export function canReadOperations(
  access: SubscriptionAccessSnapshot | null | undefined,
) {
  return !access || access.mode !== "BLOCKED";
}

export function canMutateOperations(
  access: SubscriptionAccessSnapshot | null | undefined,
) {
  return !access || access.mode === "FULL";
}

export function isBillingRequired(
  access: SubscriptionAccessSnapshot | null | undefined,
) {
  return Boolean(
    access &&
      (access.mode !== "FULL" ||
        access.effectiveStatus === "PAST_DUE" ||
        access.cancelAtPeriodEnd),
  );
}

export function daysUntil(value: string | null | undefined, now = new Date()) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  return Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
  );
}

export function trialDaysRemaining(
  access: SubscriptionAccessSnapshot | null | undefined,
  now = new Date(),
) {
  if (access?.effectiveStatus !== "TRIALING") return null;
  return daysUntil(access.trialEndsAt, now);
}

export function isOwnerRole(role?: string | null) {
  return role === "BusinessAdmin" || role === "SuperAdmin";
}
