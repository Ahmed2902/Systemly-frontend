const ITEMS = [
  { label: "Pending", color: "var(--op-warning)" },
  { label: "Confirmed", color: "var(--op-info)" },
  { label: "In progress", color: "var(--op-violet)" },
  { label: "Completed", color: "var(--op-success)" },
  { label: "No-show", color: "var(--op-warning)" },
  { label: "Paid / locked", color: "var(--op-text-muted)" },
] as const;

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--op-border)] px-4 py-2.5 text-[10px] font-semibold text-[var(--op-text-muted)]">
      {ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <i
            aria-hidden="true"
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
