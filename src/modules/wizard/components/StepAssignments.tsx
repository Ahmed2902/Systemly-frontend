// src/modules/wizard/components/StepAssignments.tsx
"use client";

import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { Button } from "@/shared/components/ui/button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StepAssignments({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();

  function toggleService(staffId: string, serviceId: string) {
    patch({
      staff: state.staff.map((s) => {
        if (s.clientId !== staffId) return s;
        const has = s.serviceIds.includes(serviceId);
        return {
          ...s,
          serviceIds: has
            ? s.serviceIds.filter((id) => id !== serviceId)
            : [...s.serviceIds, serviceId],
        };
      }),
    });
  }

  function toggleDay(staffId: string, dayOfWeek: number) {
    patch({
      staff: state.staff.map((s) => {
        if (s.clientId !== staffId) return s;
        const exists = s.availability.find((a) => a.dayOfWeek === dayOfWeek);
        return {
          ...s,
          availability: exists
            ? s.availability.filter((a) => a.dayOfWeek !== dayOfWeek)
            : [
                ...s.availability,
                { dayOfWeek, startTime: "09:00", endTime: "17:00" },
              ],
        };
      }),
    });
  }

  function updateHours(
    staffId: string,
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    patch({
      staff: state.staff.map((s) => {
        if (s.clientId !== staffId) return s;
        return {
          ...s,
          availability: s.availability.map((a) =>
            a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a,
          ),
        };
      }),
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Assignments & Hours
        </h1>
        <p className="mt-2 text-sm text-muted">
          Set what each staff member does and when they work.
        </p>
      </div>

      {state.staff.map((member) => (
        <div
          key={member.clientId}
          className="rounded-lg border border-surfaceBorder bg-surface p-5"
        >
          <h3 className="font-medium text-foreground">
            {member.name || "Unnamed staff"}
          </h3>

          <div className="mt-4">
            <p className="text-sm text-muted">Provides these services:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {state.services.map((service) => (
                <button
                  key={service.clientId}
                  type="button"
                  onClick={() =>
                    toggleService(member.clientId, service.clientId)
                  }
                  className={`rounded-full px-3 py-1 text-xs ${
                    member.serviceIds.includes(service.clientId)
                      ? "bg-accent text-black"
                      : "border border-surfaceBorder text-muted"
                  }`}
                >
                  {service.name || "Untitled"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted">Working days:</p>
            <div className="mt-2 space-y-2">
              {DAYS.map((day, dayOfWeek) => {
                const entry = member.availability.find(
                  (a) => a.dayOfWeek === dayOfWeek,
                );
                return (
                  <div key={day} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDay(member.clientId, dayOfWeek)}
                      className={`w-16 rounded-md px-2 py-1 text-xs ${
                        entry
                          ? "bg-accent text-black"
                          : "border border-surfaceBorder text-muted"
                      }`}
                    >
                      {day}
                    </button>
                    {entry && (
                      <>
                        <input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) =>
                            updateHours(
                              member.clientId,
                              dayOfWeek,
                              "startTime",
                              e.target.value,
                            )
                          }
                          className="rounded-md border border-surfaceBorder bg-background px-2 py-1 text-sm text-foreground"
                        />
                        <span className="text-muted">to</span>
                        <input
                          type="time"
                          value={entry.endTime}
                          onChange={(e) =>
                            updateHours(
                              member.clientId,
                              dayOfWeek,
                              "endTime",
                              e.target.value,
                            )
                          }
                          className="rounded-md border border-surfaceBorder bg-background px-2 py-1 text-sm text-foreground"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <Button
          onClick={onBack}
          className="flex-1 bg-surface text-foreground border border-surfaceBorder hover:bg-surface/70"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-accent text-black hover:bg-accent/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
