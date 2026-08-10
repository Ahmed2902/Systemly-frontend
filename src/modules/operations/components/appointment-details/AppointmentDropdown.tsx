"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
  align?: "left" | "center";
}

export function AppointmentDropdown({
  value,
  options,
  disabled,
  onChange,
  align = "left",
}: Props) {
  const text = usePlatformText();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 ${open ? "z-20" : "z-0"}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-transparent bg-[var(--op-surface-soft)] px-3.5 py-2.5 text-left text-sm font-medium text-[var(--op-text)] outline-none transition hover:bg-[var(--op-hover)] focus:border-[var(--op-border-strong)] focus:bg-[var(--op-surface)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span className={`min-w-0 truncate ${align === "center" ? "flex-1 text-center" : ""}`}>
          {selected?.label ?? "—"}
        </span>
        <ChevronDown
          size={15}
          className={`ml-2 shrink-0 text-[var(--op-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled ? (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-64 min-w-[12rem] max-w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-[var(--op-border)] bg-[var(--op-surface-raised)] p-1.5 shadow-[var(--op-shadow-strong)]"
          style={{ width: "max(100%, 12rem)" }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                option.value === value
                  ? "bg-[var(--op-selected)] font-semibold text-[var(--op-text)]"
                  : "text-[var(--op-text-secondary)] hover:bg-[var(--op-hover)] hover:text-[var(--op-text)]"
              }`}
            >
              <span className="min-w-0 whitespace-normal break-words">{text(option.label)}</span>
              {option.value === value ? <Check size={14} className="shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
