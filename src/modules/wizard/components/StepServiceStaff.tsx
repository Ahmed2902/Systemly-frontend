// src/modules/wizard/components/StepServicesStaff.tsx
"use client";

import { useState } from "react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";
import { Button } from "@/shared/components/ui/button";

const STAFF_ROLE_OPTIONS = ["Staff", "Receptionist"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function StepperInput({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  step: number;
}) {
  return (
    <div className="flex w-26 flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-xl border border-surfaceBorder bg-background">
        <button
          type="button"
          onClick={() =>
            onChange(clampNumber(value - step, min, Number.MAX_SAFE_INTEGER))
          }
          className="flex h-10 w-10 items-center justify-center border-r border-surfaceBorder text-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <input
          value={Number.isFinite(value) ? value : min}
          onChange={(e) => {
            const nextValue = Number(e.target.value);
            onChange(Number.isFinite(nextValue) ? nextValue : min);
          }}
          inputMode="numeric"
          className="h-10 w-full border-0 bg-transparent px-3 text-center text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(value + step)}
          className="flex h-10 w-10 items-center justify-center border-l border-surfaceBorder text-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function StepServicesStaff({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();
  const [error, setError] = useState<string | null>(null);

  function addService() {
    const newService: WizardService = {
      clientId: uid(),
      name: "",
      durationMin: 30,
      priceEgp: 0,
    };
    patch({ services: [...state.services, newService] });
  }

  function updateService(clientId: string, updates: Partial<WizardService>) {
    patch({
      services: state.services.map((s) =>
        s.clientId === clientId ? { ...s, ...updates } : s,
      ),
    });
  }

  function removeService(clientId: string) {
    patch({
      services: state.services.filter((s) => s.clientId !== clientId),
      staff: state.staff.map((st) => ({
        ...st,
        serviceIds: st.serviceIds.filter((id) => id !== clientId),
      })),
    });
  }

  function addStaff() {
    const newStaff: WizardStaffMember = {
      id: uid(),
      clientId: uid(),
      name: "",
      role: STAFF_ROLE_OPTIONS[0],
      serviceIds: [],
      availability: [],
    };
    patch({ staff: [...state.staff, newStaff] });
  }

  function updateStaff(clientId: string, updates: Partial<WizardStaffMember>) {
    patch({
      staff: state.staff.map((s) =>
        s.clientId === clientId ? { ...s, ...updates } : s,
      ),
    });
  }

  function removeStaff(clientId: string) {
    patch({ staff: state.staff.filter((s) => s.clientId !== clientId) });
  }

  function validateAndNext() {
    if (state.services.length === 0)
      return setError("Add at least one service");
    if (state.staff.length === 0)
      return setError("Add at least one staff member");
    if (state.services.some((s) => !s.name.trim()))
      return setError("Every service needs a name");
    if (state.staff.some((s) => !s.name.trim()))
      return setError("Every staff member needs a name");
    setError(null);
    onNext();
  }

  return (
    <div className="space-y-10 ">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Services & Staff
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add what you offer and who's on your team.
        </p>
      </div>

      {/* Services */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Services</h2>
          <Button
            type="button"
            onClick={addService}
            className="bg-surface text-foreground border border-surfaceBorder hover:bg-surface/70"
          >
            + Add service
          </Button>
        </div>

        <div className="space-y-3">
          {state.services.map((service) => (
            <div
              key={service.clientId}
              className="flex flex-col gap-3 rounded-xl border border-surfaceBorder bg-surface p-4 lg:flex-row lg:items-end"
            >
              <input
                value={service.name}
                onChange={(e) =>
                  updateService(service.clientId, { name: e.target.value })
                }
                placeholder="Service name"
                className="min-w-0 flex-1 rounded-xl border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex flex-wrap items-end gap-3">
                <StepperInput
                  label="Minutes"
                  value={service.durationMin}
                  min={5}
                  step={5}
                  onChange={(nextValue) =>
                    updateService(service.clientId, {
                      durationMin: clampNumber(nextValue, 5, 24 * 60),
                    })
                  }
                />
                <StepperInput
                  label="Price"
                  value={service.priceEgp}
                  min={0}
                  step={10}
                  onChange={(nextValue) =>
                    updateService(service.clientId, {
                      priceEgp: clampNumber(nextValue, 0, 1_000_000),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeService(service.clientId)}
                  className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {state.services.length === 0 && (
            <p className="text-sm text-muted">No services yet.</p>
          )}
        </div>
      </section>

      {/* Staff */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Staff</h2>
          <Button
            type="button"
            onClick={addStaff}
            className="bg-surface text-foreground border border-surfaceBorder hover:bg-surface/70"
          >
            + Add staff member
          </Button>
        </div>

        <div className="space-y-3">
          {state.staff.map((member) => (
            <div
              key={member.clientId}
              className="flex flex-col gap-3 rounded-xl border border-surfaceBorder bg-surface p-4 lg:flex-row lg:items-start"
            >
              <input
                value={member.name}
                onChange={(e) =>
                  updateStaff(member.clientId, { name: e.target.value })
                }
                placeholder="Full name"
                className="min-w-0 flex-1 rounded-xl border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex flex-1 flex-wrap gap-2">
                {STAFF_ROLE_OPTIONS.map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() =>
                      updateStaff(member.clientId, { role: roleOption })
                    }
                    className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      member.role === roleOption
                        ? "border-accent bg-accent text-black"
                        : "border-surfaceBorder bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => removeStaff(member.clientId)}
                className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          {state.staff.length === 0 && (
            <p className="text-sm text-muted">No staff yet.</p>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          className="flex-1 bg-surface text-foreground border border-surfaceBorder hover:bg-surface/70"
        >
          Back
        </Button>
        <Button
          onClick={validateAndNext}
          className="flex-1 bg-accent text-black hover:bg-accent/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
