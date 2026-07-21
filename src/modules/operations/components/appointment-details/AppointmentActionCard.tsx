import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  tone?: "slate" | "green" | "red" | "blue";
  disabled?: boolean;
  onClick: () => void;
}

const tones = {
  slate: "bg-slate-50 text-slate-700 hover:bg-slate-100",
  green: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  red: "text-red-600 hover:bg-red-50",
  blue: "bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700",
};
const iconTones = {
  slate: "bg-white/70 text-slate-500",
  green: "bg-emerald-100/70 text-emerald-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-white/15 text-white",
};

export function AppointmentActionCard({ icon, label, tone = "slate", disabled, onClick }: Props) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTones[tone]}`}>{icon}</span>{label}</button>;
}
