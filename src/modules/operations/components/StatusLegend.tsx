// components/calendar/StatusLegend.tsx

const ITEMS: Array<{ label: string; dotClass: string }> = [
  { label: "Confirmed", dotClass: "bg-blue-500" },
  { label: "In progress", dotClass: "bg-violet-500" },
  { label: "Cancelled", dotClass: "bg-red-500" },
  { label: "No-show", dotClass: "bg-amber-500" },
  { label: "Completed / Paid (locked)", dotClass: "bg-slate-400" },
];

export function StatusLegend() {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 px-4 py-2 text-xs text-slate-600">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${item.dotClass}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
