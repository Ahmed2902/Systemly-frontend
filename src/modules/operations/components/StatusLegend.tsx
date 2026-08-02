"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
const ITEMS = [
  { label: "Pending", color: "#d97706" },
  { label: "Confirmed", color: "#3b82f6" },
  { label: "In progress", color: "#14b8a6" },
  { label: "Completed", color: "#10b981" },
  { label: "No-show", color: "#e11d48" },
  { label: "Cancelled", color: "#ef4444" },
  { label: "Paid / locked", color: "var(--op-text-muted)" },
] as const;

export function StatusLegend() {
  const text = usePlatformText();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--op-border)] bg-[var(--op-surface-soft)] px-4 py-2.5 text-[10px] font-semibold text-[var(--op-text-muted)]">
      <span className="mr-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--op-text-faint)]">
        {text("Status")}
      </span>
      {ITEMS.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--op-border)] bg-[var(--op-surface)] px-2.5 py-1"
        >
          <i
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
