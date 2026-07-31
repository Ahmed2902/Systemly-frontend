const ITEMS = [
  { label: "Pending", color: "var(--op-warning)" },
  { label: "Confirmed", color: "var(--op-info)" },
  { label: "In progress", color: "var(--op-info)" },
  { label: "Completed", color: "var(--op-success)" },
  { label: "No-show", color: "var(--op-warning)" },
  { label: "Cancelled", color: "var(--op-danger)" },
  { label: "Paid / locked", color: "var(--op-text-muted)" },
] as const;

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--op-border)] bg-[var(--op-surface-soft)] px-4 py-2.5 text-[10px] font-semibold text-[var(--op-text-muted)]">
      <span className="mr-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--op-text-faint)]">
        Status
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
