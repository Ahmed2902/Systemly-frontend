import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  tone?: "slate" | "green" | "red" | "blue";
  disabled?: boolean;
  onClick: () => void;
}

const tones = {
  slate:
    "bg-[var(--op-surface-soft)] text-[var(--op-text-secondary)] hover:bg-[var(--op-hover)] hover:text-[var(--op-text)]",
  green:
    "bg-[var(--op-success-soft)] text-[var(--op-success)] hover:brightness-105",
  red:
    "bg-[var(--op-danger-soft)] text-[var(--op-danger)] hover:brightness-105",
  blue:
    "bg-[var(--op-info-soft)] text-[var(--op-info)] hover:brightness-105",
};
const iconTones = {
  slate: "bg-[var(--op-surface)] text-[var(--op-text-secondary)]",
  green: "bg-[var(--op-success)] text-[var(--op-primary-text)]",
  red: "bg-[var(--op-danger)] text-white",
  blue: "bg-[var(--op-info)] text-white",
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
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTones[tone]}`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
