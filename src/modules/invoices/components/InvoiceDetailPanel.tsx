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
  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-3xl border border-white/80 bg-white/90 shadow-sm">
        <Loader2 className="animate-spin text-violet-600" size={25} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500">
        Select an invoice to review its receipt and payment details.
      </div>
    );
  }

  const serviceItems = invoice.lineItems.filter((item) => item.service);
  const customItems = invoice.lineItems.filter((item) => !item.service);

  return (
    <aside className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-200/50">
      <div className="border-b border-slate-200 bg-gradient-to-br from-violet-50 via-white to-emerald-50 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-950">
                {invoice.invoiceNumber}
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  invoice.status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {invoice.status === "paid" ? "Paid" : "Voided"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Issued {new Date(invoice.issuedAt).toLocaleString("en-GB")}
            </p>
          </div>
          {invoice.business.logoUrl ? (
            <Image
              src={invoice.business.logoUrl}
              alt={`${invoice.business.name} logo`}
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl border border-white bg-white object-contain shadow-sm"
            />
          ) : null}
        </div>

        <button
          type="button"
          disabled={actionRunning}
          onClick={onDownload}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50"
        >
          <Download size={16} />
          Download receipt
        </button>
      </div>

      <div className="space-y-5 p-5">
        <section className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-500">Customer</p>
            <p className="mt-1 font-semibold text-slate-900">
              {invoice.customer.name}
            </p>
            <p className="text-xs text-slate-500">{invoice.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Payment method</p>
            <p className="mt-1 font-semibold text-slate-900">
              {paymentLabel(invoice.paymentMethod)}
            </p>
            {invoice.paymentReference ? (
              <p className="text-xs text-slate-500">
                {invoice.paymentReference}
              </p>
            ) : null}
          </div>
        </section>

        {invoice.appointment ? (
          <Link
            href={`/operations/appointments/${invoice.appointment.id}`}
            className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Open appointment
            <ExternalLink size={15} />
          </Link>
        ) : null}

        {serviceItems.length > 0 ? (
          <section>
            <h3 className="font-semibold text-slate-900">Services</h3>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              {serviceItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.quantity} × {money(item.unitPriceCents)}
                      {item.staff ? ` · ${item.staff.name}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {money(item.totalCents)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {customItems.length > 0 ? (
          <section>
            <h3 className="font-semibold text-slate-900">Custom items</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
              <div className="grid min-w-[32rem] grid-cols-[minmax(10rem,1fr)_7rem_5rem_8rem] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Item</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Quantity</span>
                <span className="text-right">Total</span>
              </div>
              {customItems.map((item) => {
                const calculatedTotal = item.unitPriceCents * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="grid min-w-[32rem] grid-cols-[minmax(10rem,1fr)_7rem_5rem_8rem] gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
                  >
                    <span className="font-medium text-slate-800">
                      {item.description}
                    </span>
                    <span className="text-right text-slate-600">
                      {money(item.unitPriceCents)}
                    </span>
                    <span className="text-right text-slate-600">
                      {item.quantity}
                    </span>
                    <span className="text-right font-semibold text-slate-900">
                      {money(calculatedTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{money(invoice.subtotalCents)}</span>
          </div>
          {invoice.discountCents > 0 ? (
            <div className="flex justify-between text-rose-600">
              <span>Discount</span>
              <span>-{money(invoice.discountCents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-950">
            <span>Total</span>
            <span>{money(invoice.totalCents)}</span>
          </div>
        </section>

        {invoice.notes ? (
          <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Notes
            </p>
            <p className="mt-2 text-sm text-slate-700">{invoice.notes}</p>
          </section>
        ) : null}

        {invoice.status === "voided" ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Invoice voided</p>
            <p className="mt-1">
              {invoice.voidReason ?? "No reason recorded."}
            </p>
          </section>
        ) : (
          <button
            type="button"
            disabled={actionRunning}
            onClick={onVoid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Void invoice and reopen appointment
          </button>
        )}
      </div>
    </aside>
  );
}
