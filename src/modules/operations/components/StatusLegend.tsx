const ITEMS: Array<{ label: string; dotClass: string }> = [
  { label: "Pending", dotClass: "bg-amber-500" },
  { label: "Confirmed", dotClass: "bg-teal-500" },
  { label: "In progress", dotClass: "bg-violet-500" },
  { label: "Cancelled", dotClass: "bg-rose-500" },
  { label: "Completed", dotClass: "bg-green-500" },
  { label: "No-show", dotClass: "bg-amber-500" },
  { label: "Paid / locked", dotClass: "bg-slate-500" },
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 px-4 py-2 text-xs text-slate-600">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
