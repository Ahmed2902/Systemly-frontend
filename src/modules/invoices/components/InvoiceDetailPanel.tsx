"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import Image from "next/image";
import { Download, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import type { InvoiceDetail } from "../invoices.types";

const money = (cents: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(cents / 100);

const paymentLabel = (value?: string | null) =>
  value
    ? value
        .toLowerCase()
        .split("_")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ")
    : "Not recorded";

export function InvoiceDetailPanel({
  invoice,
  loading,
  actionRunning,
  onDownload,
  onVoid,
}: {
  invoice: InvoiceDetail | null;
  loading: boolean;
  actionRunning: boolean;
  onDownload: () => void;
  onVoid: () => void;
}) {
  const text = usePlatformText();
  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-3xl border border-[var(--op-border)] bg-[var(--op-surface)] shadow-[var(--op-shadow)]">
        <Loader2 className="animate-spin text-[var(--op-info)]" size={25} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-[var(--op-border)] bg-[var(--op-surface)] p-8 text-center text-sm text-[var(--op-text-muted)]">
        {text("Select an invoice to review its receipt and payment details.")}
      </div>
    );
  }

  const serviceItems = invoice.lineItems.filter((item) => item.service);
  const customItems = invoice.lineItems.filter((item) => !item.service);

  return (
    <aside className="overflow-hidden rounded-3xl border border-[var(--op-border)] bg-[var(--op-surface)] shadow-[var(--op-shadow)]">
      <div className="border-b border-[var(--op-border)] bg-[var(--op-surface-soft)] px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[var(--op-text)]">
                {invoice.invoiceNumber}
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  invoice.status === "paid"
                    ? "bg-[var(--op-success-soft)] text-[var(--op-success)]"
                    : "bg-[var(--op-surface-raised)] text-[var(--op-text-muted)]"
                }`}
              >
                {invoice.status === "paid" ? text("Paid") : text("Voided")}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--op-text-muted)]">
              {text("Issued")} {new Date(invoice.issuedAt).toLocaleString("en-GB")}
            </p>
          </div>
          {invoice.business.logoUrl ? (
            <Image
              src={invoice.business.logoUrl}
              alt={`${invoice.business.name} logo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl border border-[var(--op-border)] bg-white object-contain shadow-sm"
            />
          ) : null}
        </div>

        <button
          type="button"
          disabled={actionRunning}
          onClick={onDownload}
          className="op-button op-button-primary mt-4 w-full py-3 disabled:opacity-50"
        >
          <Download size={16} />
          {text("Download receipt")}
        </button>
      </div>

      <div className="space-y-5 p-5">
        <section className="grid gap-3 rounded-2xl bg-[var(--op-surface-soft)] p-4 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[var(--op-text-muted)]">{text("Customer")}</p>
            <p className="mt-1 font-semibold text-[var(--op-text)]">
              {invoice.customer.name}
            </p>
            <p className="text-xs text-[var(--op-text-muted)]">{invoice.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--op-text-muted)]">{text("Payment method")}</p>
            <p className="mt-1 font-semibold text-[var(--op-text)]">
              {paymentLabel(invoice.paymentMethod)}
            </p>
            {invoice.paymentReference ? (
              <p className="text-xs text-[var(--op-text-muted)]">
                {invoice.paymentReference}
              </p>
            ) : null}
          </div>
        </section>

        {invoice.appointment ? (
          <Link
            href={`/operations/appointments/${invoice.appointment.id}`}
            className="flex items-center justify-between rounded-2xl border border-white bg-[#f7f7f4] px-4 py-3 text-sm font-semibold text-[#111411] shadow-sm transition hover:bg-white hover:shadow-md"
          >
            {text("Open appointment")}
            <ExternalLink size={15} />
          </Link>
        ) : null}

        {serviceItems.length > 0 ? (
          <section>
            <h3 className="font-semibold text-[var(--op-text)]">{text("Services")}</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--op-border)]">
              {serviceItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] gap-4 border-b border-[var(--op-border)] px-4 py-3 text-sm last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-[var(--op-text)]">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--op-text-muted)]">
                      {item.quantity} × {money(item.unitPriceCents)}
                      {item.staff ? ` · ${item.staff.name}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--op-text)]">
                    {money(item.totalCents)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {customItems.length > 0 ? (
          <section>
            <h3 className="font-semibold text-[var(--op-text)]">{text("Custom items")}</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--op-border)]">
              {customItems.map((item) => {
                const calculatedTotal = item.unitPriceCents * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--op-border)] px-4 py-3 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--op-text)]">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--op-text-muted)]">
                        {item.quantity} × {money(item.unitPriceCents)}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--op-text)]">
                      {money(calculatedTotal)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-2 rounded-2xl bg-[var(--op-surface-soft)] p-4 text-sm">
          <div className="flex justify-between text-[var(--op-text-secondary)]">
            <span>{text("Subtotal")}</span>
            <span>{money(invoice.subtotalCents)}</span>
          </div>
          {invoice.discountCents > 0 ? (
            <div className="flex justify-between text-[var(--op-danger)]">
              <span>{text("Discount")}</span>
              <span>-{money(invoice.discountCents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[var(--op-border)] pt-3 text-lg font-bold text-[var(--op-text)]">
            <span>{text("Total")}</span>
            <span>{money(invoice.totalCents)}</span>
          </div>
        </section>

        {invoice.notes ? (
          <section className="rounded-2xl border border-[var(--op-warning)] bg-[var(--op-warning-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--op-warning)]">
              {text("Notes")}
            </p>
            <p className="mt-2 text-sm text-[var(--op-text-secondary)]">{invoice.notes}</p>
          </section>
        ) : null}

        {invoice.status === "voided" ? (
          <section className="rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface-soft)] p-4 text-sm text-[var(--op-text-secondary)]">
            <p className="font-semibold text-[var(--op-text)]">{text("Invoice voided")}</p>
            <p className="mt-1">
              {invoice.voidReason ?? "No reason recorded."}
            </p>
          </section>
        ) : (
          <button
            type="button"
            disabled={actionRunning}
            onClick={onVoid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--op-danger)] bg-[var(--op-danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--op-danger)] transition hover:brightness-105 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            {text("Void invoice and reopen appointment")}
          </button>
        )}
      </div>
    </aside>
  );
}
