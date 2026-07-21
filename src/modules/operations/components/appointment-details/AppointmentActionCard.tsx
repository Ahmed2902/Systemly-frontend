import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  icon: ReactNode;
  label: string;
  tone?: "slate" | "green" | "red" | "blue";
  disabled?: boolean;
  onClick: () => void;
}

const tones = {
  slate: "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40 hover:text-blue-700",
  green: "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/70",
  red: "border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100/70",
  blue: "border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100",
};

const iconTones = {
  slate: "bg-slate-50 text-slate-500",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
};

export function AppointmentActionCard({
  icon,
  label,
  tone = "slate",
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTones[tone]}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronRight size={15} className="shrink-0 opacity-55" />
    </button>
  );
}
