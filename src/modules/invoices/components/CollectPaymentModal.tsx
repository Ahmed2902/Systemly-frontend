"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, Landmark, Loader2, Smartphone, X } from "lucide-react";
import type { CollectPaymentInput, PaymentMethod } from "../invoices.types";

const methods: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "CASH", label: "Cash", icon: <Banknote size={18} /> },
  { value: "CARD", label: "Card", icon: <CreditCard size={18} /> },
  { value: "BANK_TRANSFER", label: "Bank transfer", icon: <Landmark size={18} /> },
  { value: "MOBILE_WALLET", label: "Mobile wallet", icon: <Smartphone size={18} /> },
];

const money = (cents: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(cents / 100);

export function CollectPaymentModal({
  open,
  appointmentId,
  subtotalCents,
  initialDiscountCents,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  appointmentId: string;
  subtotalCents: number;
  initialDiscountCents: number;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CollectPaymentInput) => Promise<void>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [discountCents, setDiscountCents] = useState(initialDiscountCents);
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("CASH");
      setDiscountCents(initialDiscountCents);
      setPaymentReference("");
      setNotes("");
    }
  }, [initialDiscountCents, open]);

  if (!open) return null;
  const totalCents = Math.max(0, subtotalCents - discountCents);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close payment form"
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            appointmentId,
            paymentMethod,
            discountCents,
            paymentReference: paymentReference.trim() || undefined,
            notes: notes.trim() || undefined,
          });
        }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Collect payment</h2>
            <p className="mt-1 text-sm text-slate-500">
              Payment completes the appointment and creates a receipt.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 px-6 py-6">
          <section>
            <p className="text-sm font-semibold text-slate-800">Payment method</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {methods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    paymentMethod === method.value
                      ? "border-violet-300 bg-violet-50 text-violet-800 ring-2 ring-violet-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    {method.icon}
                  </span>
                  {method.label}
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Discount
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
                  EGP
                </span>
                <input
                  type="number"
                  min={0}
                  max={subtotalCents / 100}
                  step="0.01"
                  value={discountCents / 100}
                  onChange={(event) =>
                    setDiscountCents(
                      Math.min(
                        subtotalCents,
                        Math.max(0, Math.round((Number(event.target.value) || 0) * 100)),
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Reference <span className="font-normal text-slate-400">optional</span>
              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Transaction or transfer ID"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Receipt notes <span className="font-normal text-slate-400">optional</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <section className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span>{money(subtotalCents)}</span>
            </div>
            {discountCents > 0 ? (
              <div className="flex justify-between text-rose-600">
                <span>Discount</span><span>-{money(discountCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold text-slate-950">
              <span>Total</span><span>{money(totalCents)}</span>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Collect {money(totalCents)}
          </button>
        </footer>
      </form>
    </div>
  );
}
