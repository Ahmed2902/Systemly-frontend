import type { ReactNode } from "react";

export function AppointmentActionCard({
  icon,
  label,
  tone = "slate",
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tone?: "slate" | "green" | "red" | "blue";
  disabled?: boolean;
  onClick: () => void;
}) {
  const tones = {
    slate: "border-slate-200 text-slate-700 hover:border-slate-300",
    green: "border-emerald-200 text-emerald-700 hover:border-emerald-300",
    red: "border-red-200 text-red-700 hover:border-red-300",
    blue: "border-blue-200 text-blue-700 hover:border-blue-300",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left text-sm font-semibold shadow-sm transition hover:shadow ${tones[tone]} disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
        {icon}
      </span>
      {label}
      <span className="ml-auto text-slate-300">›</span>
    </button>
  );
}
