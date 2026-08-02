"use client";

import { ReceiptText } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPlatformCurrency, formatPlatformDate } from "@/i18n/format";
import { usePlatformText } from "@/i18n/usePlatformText";
import type { InvoiceListItem } from "../invoices.types";

const paymentLabels: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  MOBILE_WALLET: "Mobile wallet",
};

export function InvoiceListPanel({
  invoices,
  selectedId,
  onSelect,
}: {
  invoices: InvoiceListItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const text = usePlatformText();
  const { locale } = useLocale();
  const money = (cents: number) => formatPlatformCurrency(cents / 100, locale);
  const paymentMethodLabel = (value?: string | null) =>
    value ? text(paymentLabels[value] ?? value.replace(/_/g, " ")) : text("Not recorded");
  const invoiceDate = (value: string) =>
    formatPlatformDate(value, locale, { day: "numeric", month: "short", year: "numeric" });

  if (invoices.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
        <ReceiptText size={28} className="text-violet-500" />
        <p className="mt-3 font-semibold text-slate-800">{text("No invoices found")}</p>
        <p className="mt-1 text-sm text-slate-500">
          {text("Paid receipts will appear after payment is collected from an appointment.")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="hidden grid-cols-[1.05fr_1.3fr_.8fr_.9fr_.75fr_.65fr] gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
        <span>{text("Invoice")}</span>
        <span>{text("Customer")}</span>
        <span>{text("Date")}</span>
        <span>{text("Payment method")}</span>
        <span>{text("Amount")}</span>
        <span>{text("Status")}</span>
      </div>
      {invoices.map((invoice) => {
        const selected = selectedId === invoice.id;
        return (
          <button
            type="button"
            key={invoice.id}
            aria-pressed={selected}
            onClick={() => onSelect(invoice.id)}
            className={`grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-start transition last:border-b-0 lg:grid-cols-[1.05fr_1.3fr_.8fr_.9fr_.75fr_.65fr] lg:items-center ${
              selected ? "invoice-row-selected" : "hover:bg-slate-50"
            } ${invoice.status === "voided" ? "opacity-65" : ""}`}
          >
            <div>
              <p className="font-semibold text-slate-900" dir="ltr">{invoice.invoiceNumber}</p>
              <p className="mt-1 text-xs text-slate-500 lg:hidden">
                {invoiceDate(invoice.issuedAt)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800" dir="auto">
                {invoice.customer.name}
              </p>
              <p className="truncate text-xs text-slate-500" dir="auto">
                {invoice.services.join(" · ") || text("Appointment payment")}
              </p>
            </div>
            <p className="hidden text-sm text-slate-600 lg:block">
              {invoiceDate(invoice.issuedAt)}
            </p>
            <p className="text-sm font-medium text-slate-700">
              {paymentMethodLabel(invoice.paymentMethod)}
            </p>
            <p className="font-semibold text-slate-900">{money(invoice.totalCents)}</p>
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {invoice.status === "paid" ? text("Paid") : text("Voided")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
