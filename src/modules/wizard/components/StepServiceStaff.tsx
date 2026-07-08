// src/modules/wizard/components/StepServicesStaff.tsx
"use client";

import { useState } from "react";
import { useWizard } from "../wizard.context";
import { StepProps, WizardService, WizardStaffMember } from "../wizard.types";
import { Button } from "@/shared/components/ui/button";

function uid() {
  return Math.random().toString(36).slice(2, 10);
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
      clientId: uid(),
      name: "",
      role: "Staff",
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
    <div className="space-y-10">
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
              className="flex gap-3 rounded-md border border-surfaceBorder bg-surface p-3"
            >
              <input
                value={service.name}
                onChange={(e) =>
                  updateService(service.clientId, { name: e.target.value })
                }
                placeholder="Service name"
                className="flex-1 rounded-md border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                type="number"
                value={service.durationMin}
                onChange={(e) =>
                  updateService(service.clientId, {
                    durationMin: Number(e.target.value),
                  })
                }
                placeholder="Minutes"
                className="w-24 rounded-md border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                type="number"
                value={service.priceEgp}
                onChange={(e) =>
                  updateService(service.clientId, {
                    priceEgp: Number(e.target.value),
                  })
                }
                placeholder="EGP"
                className="w-24 rounded-md border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <button
                onClick={() => removeService(service.clientId)}
                className="text-sm text-red-400"
              >
                Remove
              </button>
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
              className="flex gap-3 rounded-md border border-surfaceBorder bg-surface p-3"
            >
              <input
                value={member.name}
                onChange={(e) =>
                  updateStaff(member.clientId, { name: e.target.value })
                }
                placeholder="Full name"
                className="flex-1 rounded-md border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                value={member.role}
                onChange={(e) =>
                  updateStaff(member.clientId, { role: e.target.value })
                }
                placeholder="Role (e.g. Stylist)"
                className="w-40 rounded-md border border-surfaceBorder bg-background px-3 py-2 text-sm text-foreground"
              />
              <button
                onClick={() => removeStaff(member.clientId)}
                className="text-sm text-red-400"
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
