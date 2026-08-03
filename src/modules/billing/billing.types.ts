import type {
  SubscriptionAccessSnapshot,
  SubscriptionStatus,
} from "@/modules/subscriptions/subscription-access";

export type BillingInterval = "MONTHLY";
export type SubscriptionPaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "SUCCEEDED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED"
  | "REFUNDED";

export type BillingPrice = {
  id: string;
  amountCents: number;
  currency: string;
  interval: BillingInterval;
};

export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: BillingPrice | null;
  entitlements: Array<{ key: string; limit: number | null }>;
};

export type BillingSubscription = {
  id: string;
  status: SubscriptionStatus;
  effectiveStatus: SubscriptionStatus;
  renewalMode: "MANUAL" | "AUTOMATIC";
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  endedAt: string | null;
  provider: "EASYKASH" | null;
  plan: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    entitlements: Array<{ key: string; limit: number | null }>;
  };
  price: BillingPrice | null;
};

export type BillingPayment = {
  id: string;
  status: SubscriptionPaymentStatus;
  amountCents: number;
  currency: string;
  checkoutUrl: string | null;
  failureCode: string | null;
  failureReason: string | null;
  paidAt: string | null;
  failedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  plan: { id: string; code: string; name: string };
  price: BillingPrice;
};

export type BillingSubscriptionResponse = {
  subscription: BillingSubscription | null;
  access: SubscriptionAccessSnapshot;
};

export type BillingPaymentsResponse = {
  items: BillingPayment[];
  total: number;
  page: number;
  perPage: number;
};

export type BillingCheckoutResponse = {
  payment: {
    id: string;
    status: SubscriptionPaymentStatus;
    amountCents: number;
    currency: string;
    expiresAt: string | null;
  };
  checkoutUrl: string;
  reused: boolean;
};
