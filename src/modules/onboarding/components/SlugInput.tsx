// src/modules/onboarding/components/SlugInput.tsx
"use client";

import { useEffect, useState } from "react";
import { checkSlugAvailability } from "../onboarding.api";

export function SlugInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  useEffect(() => {
    if (!value || value.length < 3 || error) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    const timeout = setTimeout(async () => {
      const available = await checkSlugAvailability(value);
      setStatus(available ? "available" : "taken");
    }, 400);

    return () => clearTimeout(timeout);
  }, [value, error]);

  return (
    <div className="onboarding-field">
      <label>Website address <span className="font-normal text-[var(--onboarding-muted)]">(optional)</span></label>
      <div className="onboarding-input flex items-center overflow-hidden p-0 focus-within:border-[rgba(123,29,58,.75)] focus-within:shadow-[0_0_0_3px_rgba(106,18,46,.11)]">
        <span className="border-r border-[var(--onboarding-border)] px-3.5 text-sm text-[var(--onboarding-muted)]">hgezli.com/</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm text-[var(--onboarding-text)] outline-none placeholder:text-[#4b474d]"
          placeholder="your-business"
        />
      </div>
      {error && <p className="onboarding-error">{error}</p>}
      {!error && status === "checking" && <p className="text-xs text-[var(--onboarding-muted)]">Checking availability...</p>}
      {!error && status === "available" && <p className="text-xs text-[#a44362]">Available</p>}
      {!error && status === "taken" && <p className="onboarding-error">Already taken</p>}
    </div>
  );
}
