const ITEMS = [
  { label: "Pending", tone: "warning" },
  { label: "Confirmed", tone: "info" },
  { label: "In progress", tone: "violet" },
  { label: "Completed", tone: "success" },
  { label: "No-show", tone: "warning" },
  { label: "Paid / locked", tone: "neutral" },
] as const;

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--op-border)] px-4 py-2.5 text-[10px] font-semibold text-[var(--op-text-muted)]">
      {ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <i
            aria-hidden="true"
            className={`h-2 w-2 rounded-full calendar-legend-${item.tone}`}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
