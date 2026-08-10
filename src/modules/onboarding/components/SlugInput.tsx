"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
// src/modules/onboarding/components/SlugInput.tsx
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
  const text = usePlatformText();
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
      <label>{text("Public website address")}</label>
      <div className="onboarding-input flex items-center overflow-hidden p-0">
        <span className="border-r border-[var(--onboarding-border)] bg-[#f6f6f3] px-3.5 text-sm text-[var(--onboarding-muted)]">systemly.me/</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-sm text-[var(--onboarding-text)] outline-none placeholder:text-[#a2a6a3]"
          placeholder="your-business"
          aria-describedby="slug-status"
        />
      </div>
      <div id="slug-status" aria-live="polite">
        {error ? <p className="onboarding-error">{error}</p> : null}
        {!error && status === "checking" ? <p className="text-xs text-[var(--onboarding-muted)]">{text("Checking availability…")}</p> : null}
        {!error && status === "available" ? <p className="onboarding-success">{text("Available")}</p> : null}
        {!error && status === "taken" ? <p className="onboarding-error">{text("Already taken")}</p> : null}
      </div>
    </div>
  );
}
