import { api } from "@/shared/lib/api";
import type {
  BillingCheckoutResponse,
  BillingPayment,
  BillingPaymentsResponse,
  BillingPlan,
  BillingSubscription,
  BillingSubscriptionResponse,
} from "./billing.types";

export function getBillingSubscription(accessToken: string) {
  return api<BillingSubscriptionResponse>(
    "/billing/subscription",
    accessToken,
  );
}

export async function getBillingPlans(accessToken: string) {
  const response = await api<{ items: BillingPlan[] }>(
    "/billing/plans",
    accessToken,
  );
  return response.items;
}

export function getBillingPayments(
  accessToken: string,
  page = 1,
  perPage = 20,
) {
  return api<BillingPaymentsResponse>(
    `/billing/payments?page=${page}&perPage=${perPage}`,
    accessToken,
  );
}

export async function getBillingPayment(
  paymentId: string,
  accessToken: string,
) {
  const response = await api<{ payment: BillingPayment }>(
    `/billing/payments/${encodeURIComponent(paymentId)}`,
    accessToken,
  );
  return response.payment;
}

export function createBillingCheckout(
  planId: string,
  accessToken: string,
) {
  return api<BillingCheckoutResponse>("/billing/checkout", accessToken, {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export async function cancelBillingSubscription(accessToken: string) {
  const response = await api<{ subscription: BillingSubscription }>(
    "/billing/cancel",
    accessToken,
    { method: "POST", body: JSON.stringify({}) },
  );
  return response.subscription;
}

export async function resumeBillingSubscription(accessToken: string) {
  const response = await api<{ subscription: BillingSubscription }>(
    "/billing/resume",
    accessToken,
    { method: "POST", body: JSON.stringify({}) },
  );
  return response.subscription;
}
