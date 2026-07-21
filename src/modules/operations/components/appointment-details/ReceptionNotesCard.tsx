import { Info } from "lucide-react";

interface Props {
  notes: string;
  disabled: boolean;
  onChange: (notes: string) => void;
}

export function ReceptionNotesCard({ notes, disabled, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Info size={17} className="text-blue-600" />
        <h2 className="font-semibold text-slate-950">Reception Notes</h2>
      </div>

      <textarea
        value={notes}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Add notes for reception and the operations team…"
        rows={6}
        className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </section>
  );
}
