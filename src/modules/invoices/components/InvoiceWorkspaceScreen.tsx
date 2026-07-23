"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Loader2, Search, WalletCards } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  downloadInvoiceReceipt,
  getInvoice,
  getInvoices,
  voidInvoice,
} from "../invoices.api";
import type {
  InvoiceDetail,
  InvoiceListResponse,
  InvoiceStatus,
  PaymentMethod,
} from "../invoices.types";
import { InvoiceDetailPanel } from "./InvoiceDetailPanel";
import { InvoiceListPanel } from "./InvoiceListPanel";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "paid", label: "Paid", tone: "active" as const },
  { value: "voided", label: "Voided", tone: "inactive" as const },
];
const paymentOptions = [
  { value: "", label: "All payment methods" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MOBILE_WALLET", label: "Mobile wallet" },
];

export default function InvoiceWorkspaceScreen() {
  const { accessToken, loading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState<InvoiceListResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<InvoiceDetail | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionRunning, setActionRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getInvoices(accessToken, {
        search: debouncedSearch || undefined,
        status,
        paymentMethod,
        from: from || undefined,
        to: to || undefined,
      });
      setCatalog(response);
      setSelectedId((current) =>
        current && response.items.some((item) => item.id === current)
          ? current
          : response.items[0]?.id ?? null,
      );
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, [accessToken, debouncedSearch, from, paymentMethod, status, to]);

  useEffect(() => {
    if (!authLoading) void loadList();
  }, [authLoading, loadList]);

  useEffect(() => {
    if (!selectedId || !accessToken) {
      setSelected(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    void getInvoice(selectedId, accessToken)
      .then((invoice) => {
        if (active) setSelected(invoice);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Unable to load invoice");
        }
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, selectedId]);

  const hasFilters = Boolean(search || status || paymentMethod || from || to);
  const visibleTotal = useMemo(() => catalog?.total ?? 0, [catalog]);

  const download = async () => {
    if (!selected || !accessToken) return;
    setActionRunning(true);
    setError(null);
    try {
      await downloadInvoiceReceipt(selected.id, selected.invoiceNumber, accessToken);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to download receipt");
    } finally {
      setActionRunning(false);
    }
  };

  const voidSelected = async () => {
    if (!selected || !accessToken) return;
    const reason = window.prompt(
      "Why are you voiding this invoice? The appointment will return to In progress.",
    );
    if (!reason?.trim()) return;
    const confirmed = window.confirm(
      "Void this invoice and reopen the appointment for editing and payment?",
    );
    if (!confirmed) return;
    setActionRunning(true);
    setError(null);
    try {
      const updated = await voidInvoice(selected.id, reason.trim(), accessToken);
      setSelected(updated);
      await loadList();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to void invoice");
    } finally {
      setActionRunning(false);
    }
  };

  if (authLoading || (loading && !catalog)) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-emerald-50/50">
        <Loader2 size={27} className="animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50/60 via-slate-50 to-emerald-50/30">
      <div className="mx-auto max-w-[1540px] space-y-5 px-5 py-7 lg:px-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <WalletCards size={13} /> Payments and receipts
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Invoices
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Review completed payments, download receipts, and manage voided invoices.
          </p>
        </header>

        <section className="relative z-40 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_11rem_13rem_10rem_10rem_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-3 text-slate-400" size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search invoice, customer, or phone..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>
            <OperationsDropdown
              value={status}
              options={statusOptions}
              onChange={(value) => setStatus(value as InvoiceStatus | "")}
              aria-label="Invoice status"
            />
            <OperationsDropdown
              value={paymentMethod}
              options={paymentOptions}
              onChange={(value) => setPaymentMethod(value as PaymentMethod | "")}
              aria-label="Payment method"
            />
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                aria-label="Invoices from date"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </label>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label="Invoices to date"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
            />
            <button
              type="button"
              disabled={!hasFilters}
              onClick={() => {
                setSearch("");
                setStatus("");
                setPaymentMethod("");
                setFrom("");
                setTo("");
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </section>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={17} /> {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{visibleTotal} invoices</span>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <InvoiceListPanel
            invoices={catalog?.items ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="xl:sticky xl:top-5">
            <InvoiceDetailPanel
              invoice={selected}
              loading={detailLoading}
              actionRunning={actionRunning}
              onDownload={() => void download()}
              onVoid={() => void voidSelected()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
