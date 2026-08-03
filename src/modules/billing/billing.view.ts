import type {
  BillingSubscription,
  SubscriptionPaymentStatus,
} from "./billing.types";

const FAILED_PAYMENT_STATUSES = new Set<SubscriptionPaymentStatus>([
  "FAILED",
  "EXPIRED",
  "CANCELED",
  "REFUNDED",
]);

const TERMINAL_PAYMENT_STATUSES = new Set<SubscriptionPaymentStatus>([
  "SUCCEEDED",
  ...FAILED_PAYMENT_STATUSES,
]);

export function formatBillingMoney(
  amountCents: number,
  currency: string,
  locale: string,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export function formatBillingDate(
  value: string | null | undefined,
  locale: string,
) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function isSuccessfulPayment(status: SubscriptionPaymentStatus) {
  return status === "SUCCEEDED";
}

export function isFailedPayment(status: SubscriptionPaymentStatus) {
  return FAILED_PAYMENT_STATUSES.has(status);
}

export function isTerminalPayment(status: SubscriptionPaymentStatus) {
  return TERMINAL_PAYMENT_STATUSES.has(status);
}

export function isActiveSubscription(
  subscription: BillingSubscription | null | undefined,
) {
  return subscription?.effectiveStatus === "ACTIVE";
}
