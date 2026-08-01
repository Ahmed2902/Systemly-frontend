"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { CalendarDays, Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
export type SortMode = "soonest" | "latest" | "customer" | "status";
interface Props {
  query: string;
  date: string;
  staffFilter: string;
  statusFilter: string;
  sort: SortMode;
  staff: Array<{ id: string; name: string }>;
  onQueryChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStaffFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
}
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.value === value)?.label ?? label;
  return (
    <div className="relative min-w-[150px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-blue-300 focus:ring-2 focus:ring-blue-100"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown
          size={15}
          className={`ml-2 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${option.value === value ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {option.label}
              {option.value === value ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
export function AppointmentsToolbar({
  query,
  date,
  staffFilter,
  statusFilter,
  sort,
  staff,
  onQueryChange,
  onDateChange,
  onStaffFilterChange,
  onStatusFilterChange,
  onSortChange,
}: Props) {
  const text = usePlatformText();
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-500">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search customers, phone, or services"
            className="w-full outline-none"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
          <CalendarDays size={16} />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="outline-none"
          />
        </label>
        <FilterDropdown
          label={text("All staff")}
          value={staffFilter}
          onChange={onStaffFilterChange}
          options={[
            { value: "all", label: text("All staff") },
            ...staff.map((member) => ({
              value: member.id,
              label: member.name,
            })),
          ]}
        />
        <FilterDropdown
          label={text("All statuses")}
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={[
            { value: "all", label: text("All statuses") },
            { value: "pending", label: text("Pending") },
            { value: "confirmed", label: text("Confirmed") },
            { value: "in_progress", label: text("In progress") },
            { value: "no_show", label: text("No-show") },
            { value: "completed", label: text("Completed") },
            { value: "cancelled", label: text("Cancelled") },
          ]}
        />
        <FilterDropdown
          label={text("Soonest first")}
          value={sort}
          onChange={(value) => onSortChange(value as SortMode)}
          options={[
            { value: "soonest", label: text("Soonest first") },
            { value: "latest", label: text("Latest first") },
            { value: "customer", label: text("Customer name") },
            { value: "status", label: text("Status") },
          ]}
        />
      </div>
    </div>
  );
}
