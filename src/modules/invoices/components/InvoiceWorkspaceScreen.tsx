"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { OperationsDropdown } from "@/modules/operations/components/OperationsDropdown";
import {
  OperationsAlert,
  OperationsPage,
  OperationsPageHeader,
  OperationsPageInner,
  OperationsState,
  OperationsToolbar,
} from "@/modules/operations/components/OperationsUI";
import {
  useOnOperationsMutation,
  useOperations,
} from "@/modules/operations/operations.context";
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
  const text = usePlatformText();
  const { locale } = useLocale();
  const { accessToken, loading: authLoading } = useAuth();
  const { notifyMutation } = useOperations();
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
  const [refreshing, setRefreshing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionRunning, setActionRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = useCallback(
    async (background = false) => {
      if (!accessToken) return;
      if (background) setRefreshing(true);
      else setLoading(true);
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
        setError(null);
      } catch (caught: unknown) {
        setError(caught instanceof Error ? caught.message : text("Unable to load invoices"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, debouncedSearch, from, paymentMethod, status, to],
  );

  useEffect(() => {
    if (!authLoading) void loadList();
  }, [authLoading, loadList]);
  useOnOperationsMutation(["invoice", "appointment"], () => void loadList(true));

  useEffect(() => {
    if (!selectedId || !accessToken) {
      setSelected(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    void getInvoice(selectedId, accessToken)
      .then((invoice) => {
        if (active) {
          setSelected(invoice);
          setError(null);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : text("Unable to load invoice"));
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
      await downloadInvoiceReceipt(selected.id, selected.invoiceNumber, accessToken, locale);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to download receipt"));
    } finally {
      setActionRunning(false);
    }
  };

  const voidSelected = async () => {
    if (!selected || !accessToken) return;
    const reason = window.prompt(
      text("Why are you voiding this invoice? The appointment will return to In progress."),
    );
    if (!reason?.trim()) return;
    const confirmed = window.confirm(
      text("Void this invoice and reopen the appointment for editing and payment?"),
    );
    if (!confirmed) return;
    setActionRunning(true);
    setError(null);
    try {
      const updated = await voidInvoice(selected.id, reason.trim(), accessToken);
      setSelected(updated);
      notifyMutation({ scope: "invoice", entityId: selected.id });
      notifyMutation({ scope: "appointment", entityId: selected.appointment?.id });
      await loadList(true);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : text("Unable to void invoice"));
    } finally {
      setActionRunning(false);
    }
  };

  if (authLoading || (loading && !catalog)) {
    return (
      <OperationsPage>
        <OperationsPageInner className="flex min-h-full items-center justify-center">
          <OperationsState loading title={text("Loading invoices")} description={text("Preparing payments and receipts.")} />
        </OperationsPageInner>
      </OperationsPage>
    );
  }

  return (
    <OperationsPage>
      <OperationsPageInner>
        <OperationsPageHeader
          eyebrow={text("Management / Invoices")}
          title={text("Invoices")}
          description={text("Review completed payments, download receipts, and safely void invoices.")}
          actions={
            <button type="button" className="op-button" disabled={refreshing} onClick={() => void loadList(true)}>
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> {text("Refresh")}
            </button>
          }
        />

        <OperationsToolbar className="relative z-40 mb-4">
          <div className="grid gap-2 lg:grid-cols-[minmax(15rem,1fr)_11rem_13rem_10rem_10rem_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-3 text-[var(--op-text-muted)]" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text("Search invoice, customer, or phone")}
                className="op-input h-10 min-h-10 pl-10"
              />
            </label>
            <OperationsDropdown
              value={status}
              options={statusOptions.map((option) => ({ ...option, label: text(option.label) }))}
              onChange={(value) => setStatus(value as InvoiceStatus | "")}
              aria-label={text("Invoice status")}
            />
            <OperationsDropdown
              value={paymentMethod}
              options={paymentOptions.map((option) => ({ ...option, label: text(option.label) }))}
              onChange={(value) => setPaymentMethod(value as PaymentMethod | "")}
              aria-label={text("Payment method")}
            />
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-3 text-[var(--op-text-muted)]" size={15} />
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                aria-label={text("Invoices from date")}
                className="op-input h-10 min-h-10 pl-9"
              />
            </label>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label={text("Invoices to date")}
              className="op-input h-10 min-h-10"
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
              className="op-button"
            >
              {text("Clear")}
            </button>
          </div>
        </OperationsToolbar>

        {error ? <OperationsAlert tone="danger" className="mb-4">{error}</OperationsAlert> : null}

        <div className="mb-3 flex items-center justify-between text-xs text-[var(--op-text-muted)]">
          <span>{visibleTotal} {text(visibleTotal === 1 ? "invoice" : "invoices")}</span>
          {loading || refreshing ? <span>{text("Refreshing…")}</span> : null}
        </div>

        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_25rem] [&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
          <InvoiceListPanel
            invoices={catalog?.items ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="xl:sticky xl:top-5 [&>section]:border-[var(--op-border)] [&>section]:bg-[var(--op-surface)] [&>section]:shadow-[var(--op-shadow)]">
            <InvoiceDetailPanel
              invoice={selected}
              loading={detailLoading}
              actionRunning={actionRunning}
              onDownload={() => void download()}
              onVoid={() => void voidSelected()}
            />
          </div>
        </div>
      </OperationsPageInner>
    </OperationsPage>
  );
}
