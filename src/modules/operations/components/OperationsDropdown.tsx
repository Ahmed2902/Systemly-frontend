"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export interface OperationsDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  tone?: "default" | "active" | "inactive";
}

interface Props {
  value: string;
  options: OperationsDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
  "aria-label"?: string;
}

const toneClass = {
  default: "text-slate-700",
  active: "text-emerald-700",
  inactive: "text-slate-500",
};

export function OperationsDropdown({
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
  icon,
  align = "left",
  width = "w-full",
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    return selectedIndex >= 0 ? selectedIndex : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [options, value]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const selectableIndex = (start: number, direction: 1 | -1) => {
    if (options.length === 0) return 0;
    let index = start;
    for (let count = 0; count < options.length; count += 1) {
      if (!options[index]?.disabled) return index;
      index = (index + direction + options.length) % options.length;
    }
    return start;
  };

  const moveActive = (direction: 1 | -1) => {
    setActiveIndex((current) =>
      selectableIndex(
        (current + direction + options.length) % options.length,
        direction,
      ),
    );
  };

  const selectOption = (option: OperationsDropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) setOpen(true);
      moveActive(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(
        selectableIndex(event.key === "Home" ? 0 : options.length - 1, event.key === "Home" ? 1 : -1),
      );
      setOpen(true);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        const option = options[activeIndex];
        if (option) selectOption(option);
      } else {
        setOpen(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-w-0 ${width} ${open ? "z-30" : "z-0"} ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <span className="shrink-0 text-slate-400">{icon}</span>
          ) : null}
          <span
            className={`truncate ${selected ? toneClass[selected.tone ?? "default"] : "text-slate-400"}`}
          >
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-violet-600" : ""}`}
        />
      </button>

      <div
        id={listboxId}
        role="listbox"
        aria-hidden={!open}
        className={`absolute ${align === "right" ? "right-0" : "left-0"} top-[calc(100%+8px)] z-[100] max-h-72 w-full min-w-[12rem] origin-top overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 transition duration-150 ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0"}`}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isActive = index === activeIndex;
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={option.disabled}
              tabIndex={-1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isSelected
                  ? "bg-violet-50 font-semibold text-violet-700"
                  : isActive
                    ? "bg-slate-100 text-slate-800"
                    : `${toneClass[option.tone ?? "default"]} hover:bg-slate-50`
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span>{option.label}</span>
              {isSelected ? (
                <Check size={15} className="shrink-0 text-violet-600" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
