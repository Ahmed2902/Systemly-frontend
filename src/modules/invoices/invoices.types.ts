export type InvoiceStatus = "paid" | "voided";
export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "MOBILE_WALLET";

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string | null;
  voidedAt?: string | null;
  paymentMethod?: PaymentMethod | null;
  totalCents: number;
  currency: string;
  customer: { id: string; name: string; phone: string };
  appointment?: { id: string; startsAt: string } | null;
  services: string[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  service?: { id: string; name: string } | null;
  staff?: { id: string; name: string } | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  notes?: string | null;
  paymentReference?: string | null;
  voidReason?: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  };
  appointment?: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
    bookingChannel: string;
  } | null;
  business: {
    id: string;
    name: string;
    logoUrl?: string | null;
    timezone: string;
  };
  paidBy?: { id: string; name: string } | null;
  voidedBy?: { id: string; name: string } | null;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceListResponse {
  items: InvoiceListItem[];
  total: number;
  page: number;
  perPage: number;
}

export interface CollectPaymentInput {
  appointmentId: string;
  discountCents: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}
