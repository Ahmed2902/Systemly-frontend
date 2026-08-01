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

export function AppointmentDropdown({ value, options, disabled, onChange, align = "left" }: Props) {
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
    <div ref={containerRef} className={`relative min-w-0 ${open ? "z-20" : "z-0"}`}>
      <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="listbox" className="flex min-h-11 w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 px-3.5 py-2.5 text-left text-sm font-medium text-slate-800 outline-none transition-colors duration-150 hover:bg-slate-100/80 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/60 disabled:cursor-not-allowed disabled:bg-slate-50/60 disabled:text-slate-400">
        <span className={`truncate ${align === "center" ? "flex-1 text-center" : ""}`}>{selected?.label ?? "Select..."}</span>
        <ChevronDown size={15} className={`ml-2 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled ? <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-60 overflow-y-auto rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200/60">
        {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${option.value === value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"}`}>
          {text(option.label)}{option.value === value ? <Check size={14} /> : null}
        </button>)}
      </div> : null}
    </div>
  );
}
