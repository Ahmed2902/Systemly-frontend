"use client";

import { useState, useEffect } from "react";
import { useBooking } from "../booking.context";
import { StepProps, AvailableSlot } from "../booking.types";
import { getAvailability } from "../booking.api";

export function StepPickSlot({ onNext, onBack }: StepProps) {
  const { state, patch } = useBooking();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = state.selectedServiceIds.map((serviceId) => {
    const choice = state.staffChoices[serviceId];
    return {
      serviceId,
      staffId: choice === "any" || !choice ? undefined : choice,
    };
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAvailability(state.businessId, services, state.date)
      .then((result) => {
        if (!cancelled) setSlots(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn't load available times. Please try another date.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state.date]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--booking-text)]">
          Pick a time
        </h2>
        <p className="mt-1 text-sm text-[var(--booking-muted)]">
          Available slots for {state.date}.
        </p>
      </div>

      <input
        type="date"
        value={state.date}
        min={new Date().toISOString().slice(0, 10)}
        onChange={(e) => patch({ date: e.target.value, selectedSlot: null })}
        className="min-h-11 w-full rounded-lg border px-3 py-2 text-sm sm:w-auto"
        style={{
          borderColor: "var(--booking-border)",
          backgroundColor: "var(--booking-surface)",
          color: "var(--booking-text)",
        }}
      />

      {loading && (
        <p className="text-sm text-[var(--booking-muted)]">Loading times...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && slots.length === 0 && (
        <p className="text-sm text-[var(--booking-muted)]">
          No available times for this date. Try another day.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => patch({ selectedSlot: slot })}
            className="min-h-11 rounded-lg border px-3 py-2 text-sm font-medium"
            style={
              state.selectedSlot?.time === slot.time
                ? {
                    backgroundColor: "var(--accent)",
                    borderColor: "var(--accent)",
                    color: "var(--accent-text)",
                  }
                : {
                    backgroundColor: "var(--booking-surface)",
                    borderColor: "var(--booking-border)",
                    color: "var(--booking-text)",
                  }
            }
          >
            {slot.display}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(5rem,0.7fr)_minmax(0,1.3fr)] gap-3 sm:flex">
        <button
          onClick={onBack}
          className="min-h-12 rounded-lg border px-3 py-3 text-sm font-medium sm:flex-1"
          style={{
            borderColor: "var(--booking-border)",
            backgroundColor: "var(--booking-surface)",
            color: "var(--booking-text)",
          }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!state.selectedSlot}
          className="min-h-12 rounded-lg px-3 py-3 text-sm font-semibold disabled:opacity-50 sm:flex-1"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-text)",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
