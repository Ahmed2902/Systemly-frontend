"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { Search, UserRoundPlus } from "lucide-react";
import type {
  CustomerFilter,
  CustomerListItem,
} from "../customers.types";

const filters: Array<{ value: CustomerFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no_upcoming", label: "No upcoming" },
  { value: "no_shows", label: "No-shows" },
  { value: "recent", label: "Recent" },
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomerListPanel({
  customers,
  selectedId,
  total,
  search,
  filter,
  loading,
  onSearchChange,
  onFilterChange,
  onSelect,
  onNewCustomer,
}: {
  customers: CustomerListItem[];
  selectedId: string | null;
  total: number;
  search: string;
  filter: CustomerFilter;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: CustomerFilter) => void;
  onSelect: (customerId: string) => void;
  onNewCustomer: () => void;
}) {
  const text = usePlatformText();
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--op-border)] bg-[var(--op-surface)] shadow-[var(--op-shadow)]">
      <div className="border-b border-[var(--op-border)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-[var(--op-text)]">{text("Customers")}</h2>
            <p className="mt-0.5 text-xs text-[var(--op-text-muted)]">{total} records</p>
          </div>
          <button
            type="button"
            onClick={onNewCustomer}
            className="op-button op-button-primary"
          >
            <UserRoundPlus size={16} />
            {text("New")}
          </button>
        </div>

        <label className="relative mt-4 block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--op-text-muted)]"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={text("Search name, phone, or email")}
            className="op-input w-full py-2.5 pl-10 pr-3"
          />
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === item.value
                  ? "border-[var(--op-border-strong)] bg-[var(--op-selected)] text-[var(--op-text)]"
                  : "border-transparent bg-[var(--op-surface-soft)] text-[var(--op-text-muted)] hover:border-[var(--op-border)] hover:bg-[var(--op-hover)] hover:text-[var(--op-text)]"
              }`}
            >
              {text(item.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-[var(--op-surface-soft)]"
              />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-[var(--op-text)]">{text("No customers found")}</p>
            <p className="mt-1 text-sm text-[var(--op-text-muted)]">
              {text("Try another search or create a new customer.")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--op-border)]">
            {customers.map((customer) => {
              const selected = selectedId === customer.id;
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer.id)}
                  className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                    selected
                      ? "border-l-4 border-[var(--op-text-secondary)] bg-[var(--op-selected)] pl-3"
                      : "border-l-4 border-transparent hover:bg-[color-mix(in_srgb,var(--op-primary)_7%,var(--op-surface))]"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition ${
                      selected
                        ? "border-[var(--op-border-strong)] bg-[var(--op-primary)] text-[var(--op-primary-text)]"
                        : "border-[var(--op-border)] bg-[var(--op-surface-soft)] text-[var(--op-text-secondary)] group-hover:bg-[var(--op-surface-raised)] group-hover:text-[var(--op-text)]"
                    }`}
                  >
                    {initials(customer.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[var(--op-text)]">
                      {customer.name}
                    </span>
                    <span className="mt-1 block truncate text-sm text-[var(--op-text-muted)]">
                      {customer.phone}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--op-text-faint)]">
                      {customer.visits} {text("visits ·")} {customer.noShows} no-shows
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
