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
    }, 400); // debounce so we're not hitting the endpoint on every keystroke

    return () => clearTimeout(timeout);
  }, [value, error]);

  return (
    <div>
      <label className="text-sm text-muted">Website address</label>
      <div className="mt-1 flex items-center rounded-md border border-surfaceBorder bg-background focus-within:border-accent">
        <span className="pl-3 text-sm text-muted">hgezli.com/</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="w-full bg-transparent px-1 py-2 text-foreground outline-none"
          placeholder="your-business"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      {!error && status === "checking" && (
        <p className="mt-1 text-sm text-muted">Checking availability...</p>
      )}
      {!error && status === "available" && (
        <p className="mt-1 text-sm text-accent">Available</p>
      )}
      {!error && status === "taken" && (
        <p className="mt-1 text-sm text-red-400">Already taken</p>
      )}
    </div>
  );
}
