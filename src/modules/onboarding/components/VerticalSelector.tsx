"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
// src/modules/onboarding/components/VerticalSelector.tsx
const options = [
  {
    value: "salon",
    label: "Salon",
    description: "Hair, nails, skin, and beauty services",
  },
  {
    value: "clinic",
    label: "Clinic",
    description: "Medical consultations and treatments",
  },
] as const;

export function VerticalSelector({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: "salon" | "clinic") => void;
}) {
  const text = usePlatformText();
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border p-5 text-left transition-colors ${
            value === opt.value
              ? "border-accent bg-accent/10"
              : "border-surfaceBorder bg-surface hover:border-accent/50"
          }`}
        >
          <h3 className="font-medium text-foreground">{text(opt.label)}</h3>
          <p className="mt-1 text-sm text-muted">{text(opt.description)}</p>
        </button>
      ))}
    </div>
  );
}
