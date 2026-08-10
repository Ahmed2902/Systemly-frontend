"use client";

import { useBooking } from "../booking.context";
import { StepProps } from "../booking.types";

export function StepSelectStaff({ onNext, onBack }: StepProps) {
  const { state, patch } = useBooking();

  const selectedServices = state.services.filter((s) =>
    state.selectedServiceIds.includes(s.id),
  );

  function choose(serviceId: string, staffId: string | "any") {
    patch({ staffChoices: { ...state.staffChoices, [serviceId]: staffId } });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[var(--booking-text)]">
          Choose your staff
        </h2>
        <p className="mt-1 text-sm text-[var(--booking-muted)]">
          Pick who you&apos;d like, or let us assign anyone available.
        </p>
      </div>

      {selectedServices.map((service) => {
        const eligibleStaff = state.staff.filter((st) =>
          service.staffIds.includes(st.id),
        );
        const current = state.staffChoices[service.id] ?? "any";

        return (
          <div key={service.id}>
            <h3 className="mb-2 break-words text-sm font-medium text-[var(--booking-text)]">
              {service.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => choose(service.id, "any")}
                className="min-h-11 rounded-full border px-4 py-2 text-xs font-medium"
                style={
                  current === "any"
                    ? {
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "var(--accent-text)",
                      }
                    : {
                        backgroundColor: "var(--booking-surface)",
                        borderColor: "var(--booking-border)",
                        color: "var(--booking-muted)",
                      }
                }
              >
                Any available
              </button>
              {eligibleStaff.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => choose(service.id, st.id)}
                  className="min-h-11 max-w-full break-words rounded-full border px-4 py-2 text-xs font-medium"
                  style={
                    current === st.id
                      ? {
                          backgroundColor: "var(--accent)",
                          borderColor: "var(--accent)",
                          color: "var(--accent-text)",
                        }
                      : {
                          backgroundColor: "var(--booking-surface)",
                          borderColor: "var(--booking-border)",
                          color: "var(--booking-muted)",
                        }
                  }
                >
                  {st.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}

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
          className="min-h-12 rounded-lg px-3 py-3 text-sm font-semibold sm:flex-1"
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
