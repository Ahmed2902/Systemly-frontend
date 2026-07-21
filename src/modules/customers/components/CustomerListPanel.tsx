"use client";

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
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">Customers</h2>
            <p className="mt-0.5 text-xs text-slate-500">{total} records</p>
          </div>
          <button
            type="button"
            onClick={onNewCustomer}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <UserRoundPlus size={16} />
            New
          </button>
        </div>

        <label className="relative mt-4 block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, phone, or email"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
          />
        </label>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === item.value
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
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
                className="h-20 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">No customers found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or create a new customer.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer.id)}
                className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                  selectedId === customer.id
                    ? "border-l-4 border-blue-600 bg-blue-50/70 pl-3"
                    : "hover:bg-slate-50"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {initials(customer.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-slate-900">
                    {customer.name}
                  </span>
                  <span className="mt-1 block truncate text-sm text-slate-500">
                    {customer.phone}
                    {customer.email ? ` · ${customer.email}` : ""}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {customer.visits} visits · {customer.noShows} no-shows
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
