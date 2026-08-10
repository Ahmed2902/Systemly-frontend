"use client";

import { useBooking } from "../booking.context";
import { StepProps } from "../booking.types";

export function StepSelectServices({ onNext }: StepProps) {
  const { state, patch } = useBooking();

  function toggle(serviceId: string) {
    const selected = state.selectedServiceIds.includes(serviceId)
      ? state.selectedServiceIds.filter((id) => id !== serviceId)
      : [...state.selectedServiceIds, serviceId];
    patch({ selectedServiceIds: selected });
  }

  const canContinue = state.selectedServiceIds.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--booking-text)]">
          What would you like?
        </h2>
        <p className="mt-1 text-sm text-[var(--booking-muted)]">
          Select one or more services.
        </p>
      </div>

      <div className="space-y-2.5">
        {state.services.map((service) => {
          const selected = state.selectedServiceIds.includes(service.id);
          const disabled = service.staffIds.length === 0;
          return (
            <button
              key={service.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(service.id)}
              className="flex min-h-16 w-full items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-colors"
              style={{
                borderColor: selected
                  ? "var(--accent)"
                  : "var(--booking-border)",
                backgroundColor: selected
                  ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                  : "var(--booking-surface)",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <div className="min-w-0">
                <div className="break-words text-sm font-medium text-[var(--booking-text)]">
                  {service.name}
                </div>
                <div className="mt-0.5 text-xs text-[var(--booking-muted)]">
                  {service.durationMin} min · {service.priceEgp} EGP
                  {disabled && " · unavailable"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="min-h-12 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-text)",
        }}
      >
        Continue
      </button>
    </div>
  );
}
