"use client";

import { useState } from "react";
import { useBooking } from "../booking.context";
import { StepProps } from "../booking.types";
import { submitBooking } from "../booking.api";

export function StepConfirm({ onBack }: StepProps) {
  const { state, patch } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedServices = state.services.filter((service) =>
    state.selectedServiceIds.includes(service.id),
  );
  const totalDuration = selectedServices.reduce(
    (total, service) => total + (Number(service.durationMin) || 0),
    0,
  );
  const totalPrice = selectedServices.reduce(
    (total, service) => total + (Number(service.priceEgp) || 0),
    0,
  );

  async function handleConfirm() {
    if (!state.selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const services = state.selectedServiceIds.map((serviceId) => {
        const choice = state.staffChoices[serviceId];
        return {
          serviceId,
          staffId: choice === "any" || !choice ? undefined : choice,
        };
      });

      await submitBooking({
        businessId: state.businessId,
        branchId: state.branchId,
        services,
        startsAt: state.selectedSlot.time,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        dateOfBirth: state.dateOfBirth || undefined,
        gender: state.gender || undefined,
        notes: state.notes || undefined,
      });
      setDone(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-text)]">
          ✓
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--booking-text)]">
          You&apos;re booked!
        </h2>
        <p className="mx-auto max-w-sm text-sm text-[var(--booking-muted)]">
          We&apos;ve reserved your slot. We look forward to seeing you at your
          appointment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--booking-text)]">
          Confirm your booking
        </h2>
        <p className="mt-1 text-xs tracking-wide text-[var(--booking-muted)]">
          Please review your selection details below.
        </p>
      </div>

      <div
        className="space-y-4 rounded-lg border p-4 sm:p-5"
        style={{
          borderColor: "var(--booking-border)",
          backgroundColor: "var(--booking-bg)",
          opacity: 0.9,
        }}
      >
        <div className="space-y-3 divide-y divide-[var(--booking-border)]/40">
          {selectedServices.map((service, index) => (
            <div
              key={service.id}
              className={`flex items-center justify-between gap-3 text-sm ${index > 0 ? "pt-3" : ""}`}
            >
              <div className="min-w-0 flex flex-col">
                <span className="break-words font-semibold capitalize text-[var(--booking-text)]">
                  {service.name}
                </span>
                <span className="text-xs text-[var(--booking-muted)]">
                  {service.durationMin} min
                </span>
              </div>
              <span className="shrink-0 font-mono font-medium text-[var(--booking-text)]">
                {service.priceEgp} EGP
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-baseline justify-between border-t pt-3"
          style={{ borderColor: "var(--booking-border)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--booking-text)]">
              Total Selection
            </span>
            <span className="text-xs font-medium text-[var(--booking-muted)]">
              ({totalDuration} min)
            </span>
          </div>
          <span className="font-mono text-lg font-bold text-[var(--booking-text)]">
            {totalPrice} EGP
          </span>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3.5 text-sm font-semibold"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.01)",
          borderColor: "var(--booking-border)",
          color: "var(--booking-text)",
        }}
      >
        <span className="capitalize">
          {new Date(state.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="opacity-30">•</span>
        <span>at {state.selectedSlot?.display}</span>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--booking-text)] opacity-80">
            Your name
          </label>
          <input
            value={state.customerName}
            onChange={(event) => patch({ customerName: event.target.value })}
            className="mt-1.5 min-h-12 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{
              borderColor: "var(--booking-border)",
              backgroundColor: "rgba(0, 0, 0, 0.01)",
              color: "var(--booking-text)",
            }}
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--booking-text)] opacity-80">
            Phone number
          </label>
          <input
            type="tel"
            value={state.customerPhone}
            onChange={(event) => patch({ customerPhone: event.target.value })}
            className="mt-1.5 min-h-12 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{
              borderColor: "var(--booking-border)",
              backgroundColor: "rgba(0, 0, 0, 0.01)",
              color: "var(--booking-text)",
            }}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--booking-text)] opacity-80">
              Date of birth <span className="normal-case font-medium">(optional)</span>
            </label>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={state.dateOfBirth}
              onChange={(event) => patch({ dateOfBirth: event.target.value })}
              className="mt-1.5 min-h-12 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{
                borderColor: "var(--booking-border)",
                backgroundColor: "rgba(0, 0, 0, 0.01)",
                color: "var(--booking-text)",
              }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--booking-text)] opacity-80">
              Gender <span className="normal-case font-medium">(optional)</span>
            </label>
            <select
              value={state.gender}
              onChange={(event) =>
                patch({ gender: event.target.value as "" | "male" | "female" })
              }
              className="mt-1.5 min-h-12 w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{
                borderColor: "var(--booking-border)",
                backgroundColor: "rgba(0, 0, 0, 0.01)",
                color: "var(--booking-text)",
              }}
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--booking-text)] opacity-80">
            Notes (optional)
          </label>
          <textarea
            value={state.notes}
            onChange={(event) => patch({ notes: event.target.value })}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            style={{
              borderColor: "var(--booking-border)",
              backgroundColor: "rgba(0, 0, 0, 0.01)",
              color: "var(--booking-text)",
            }}
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="grid grid-cols-[minmax(5rem,0.7fr)_minmax(0,1.3fr)] gap-3 pt-2 sm:flex sm:gap-4">
        <button
          onClick={onBack}
          disabled={submitting}
          className="min-h-12 rounded-lg border px-3 py-3 text-sm font-semibold tracking-wide transition-all active:scale-[0.99] disabled:opacity-50 sm:flex-1"
          style={{
            borderColor: "var(--booking-border)",
            backgroundColor: "var(--booking-surface)",
            color: "var(--booking-text)",
          }}
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting || !state.customerName || !state.customerPhone}
          className="min-h-12 rounded-lg px-3 py-3 text-sm font-bold tracking-wide transition-all active:scale-[0.99] disabled:opacity-50 sm:flex-1"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-text)",
          }}
        >
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
