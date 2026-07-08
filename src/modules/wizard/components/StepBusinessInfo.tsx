// src/modules/wizard/components/StepBusinessInfo.tsx
"use client";

import { useState } from "react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { VerticalSelector } from "@/modules/onboarding/components/VerticalSelector";
import { SlugInput } from "@/modules/onboarding/components/SlugInput";
import { Button } from "@/shared/components/ui/button";

export function StepBusinessInfo({ onNext }: StepProps) {
  const { state, patch } = useWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateAndNext() {
    const newErrors: Record<string, string> = {};
    if (!state.vertical) newErrors.vertical = "Choose a business type";
    if (!state.name.trim()) newErrors.name = "Business name is required";
    if (!/^[a-z0-9-]{3,}$/.test(state.slug))
      newErrors.slug = "Choose a valid website address";
    if (!state.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Tell us about your business
        </h1>
        <p className="mt-2 text-sm text-muted">This takes about a minute.</p>
      </div>

      <div>
        <label className="text-sm text-muted">Business type</label>
        <div className="mt-2">
          <VerticalSelector
            value={state.vertical ?? undefined}
            onChange={(v) => patch({ vertical: v })}
          />
        </div>
        {errors.vertical && (
          <p className="mt-1 text-sm text-red-400">{errors.vertical}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted">Business name</label>
        <input
          value={state.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>

      <SlugInput
        value={state.slug}
        onChange={(v) => patch({ slug: v })}
        error={errors.slug}
      />

      <div>
        <label className="text-sm text-muted">Phone</label>
        <input
          value={state.phone}
          onChange={(e) => patch({ phone: e.target.value })}
          placeholder="01012345678"
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-muted">City</label>
        <input
          value={state.city}
          onChange={(e) => patch({ city: e.target.value })}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm text-muted">Address</label>
        <input
          value={state.address}
          onChange={(e) => patch({ address: e.target.value })}
          className="mt-1 w-full rounded-md border border-surfaceBorder bg-background px-3 py-2 text-foreground"
        />
      </div>

      <Button
        onClick={validateAndNext}
        className="w-full bg-accent text-black hover:bg-accent/90"
      >
        Continue
      </Button>
    </div>
  );
}
