import { apiUrl } from "@/shared/lib/api-url";
import type {
  CollectPaymentInput,
  InvoiceDetail,
  InvoiceListResponse,
  InvoiceStatus,
  PaymentMethod,
} from "./invoices.types";

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
  const envelope = body as { success?: boolean; message?: string; data?: T };
  if (!response.ok || envelope.success === false) {
    throw new Error(envelope.message ?? `Request failed: ${response.status}`);
  }
  return envelope.data ?? (body as T);
}

export function getInvoices(
  accessToken: string,
  filters: {
    search?: string;
    status?: InvoiceStatus | "";
    paymentMethod?: PaymentMethod | "";
    from?: string;
    to?: string;
  } = {},
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const query = params.toString();
  return api<InvoiceListResponse>(`/invoices${query ? `?${query}` : ""}`, accessToken);
}

export function getInvoice(invoiceId: string, accessToken: string) {
  return api<InvoiceDetail>(`/invoices/${encodeURIComponent(invoiceId)}`, accessToken);
}

export function collectPayment(input: CollectPaymentInput, accessToken: string) {
  return api<InvoiceDetail>("/invoices/collect-payment", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function voidInvoice(invoiceId: string, reason: string, accessToken: string) {
  return api<InvoiceDetail>(
    `/invoices/${encodeURIComponent(invoiceId)}/void`,
    accessToken,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}

export async function downloadInvoiceReceipt(
  invoiceId: string,
  invoiceNumber: string,
  accessToken: string,
) {
  const response = await fetch(
    apiUrl(`/invoices/${encodeURIComponent(invoiceId)}/receipt`),
    {
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok) throw new Error("Unable to download receipt");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `receipt-${invoiceNumber}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
