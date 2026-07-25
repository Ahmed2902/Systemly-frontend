"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Globe2, Plus } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StepAssignments({ onNext, onBack }: StepProps) {
  const { state, patch } = useWizard();
  const [selectedStaffId, setSelectedStaffId] = useState(state.staff[0]?.clientId ?? "");
  const selectedStaff = state.staff.find((member) => member.clientId === selectedStaffId) ?? state.staff[0];

  const weeklyHours = useMemo(() => {
    if (!selectedStaff) return 0;
    return selectedStaff.availability.reduce((sum, slot) => {
      const [startHour, startMinute] = slot.startTime.split(":").map(Number);
      const [endHour, endMinute] = slot.endTime.split(":").map(Number);
      return sum + Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
    }, 0) / 60;
  }, [selectedStaff]);

  function updateSelected(updater: (member: typeof selectedStaff) => typeof selectedStaff) {
    if (!selectedStaff) return;
    patch({
      staff: state.staff.map((member) => member.clientId === selectedStaff.clientId ? updater(member) : member),
    });
  }

  function toggleDay(dayOfWeek: number) {
    if (!selectedStaff) return;
    updateSelected((member) => {
      if (!member) return member;
      const exists = member.availability.some((slot) => slot.dayOfWeek === dayOfWeek);
      return {
        ...member,
        availability: exists
          ? member.availability.filter((slot) => slot.dayOfWeek !== dayOfWeek)
          : [...member.availability, { dayOfWeek, startTime: "09:00", endTime: "18:00" }],
      };
    });
  }

  function updateHours(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
    updateSelected((member) => {
      if (!member) return member;
      return {
        ...member,
        availability: member.availability.map((slot) => slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot),
      };
    });
  }

  return (
    <div>
      <div className="onboarding-grid-two">
        <section className="onboarding-card onboarding-card-pad">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--onboarding-border)] text-[var(--onboarding-mint)]"><CalendarDays /></div>
            <div><h1 className="onboarding-card-title">Set your availability</h1><p className="onboarding-card-subtitle">Choose who works when and set regular hours.</p></div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {state.staff.map((member) => (
              <button
                type="button"
                key={member.clientId}
                onClick={() => setSelectedStaffId(member.clientId)}
                className={`onboarding-choice flex min-w-44 items-center gap-3 p-3 text-left ${selectedStaff?.clientId === member.clientId ? "is-selected" : ""}`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(155,233,214,.12)] text-sm font-semibold text-[var(--onboarding-mint)]">{member.name?.slice(0, 1).toUpperCase() || "?"}</span>
                <span><strong className="block text-sm">{member.name || "Unnamed"}</strong><small className="text-[var(--onboarding-muted)]">{member.role}</small></span>
              </button>
            ))}
          </div>

          <div className="onboarding-table mt-5">
            <div className="onboarding-table-row onboarding-table-head grid-cols-[1fr_100px_1.8fr_80px]">
              <span>Day</span><span>Working</span><span>Working hours</span><span>Add hours</span>
            </div>
            {DAYS.map((day, dayOfWeek) => {
              const slot = selectedStaff?.availability.find((item) => item.dayOfWeek === dayOfWeek);
              return (
                <div key={day} className="onboarding-table-row grid-cols-[1fr_100px_1.8fr_80px] gap-3">
                  <span className="text-sm font-medium">{day}</span>
                  <button type="button" onClick={() => toggleDay(dayOfWeek)} className={`relative h-7 w-12 rounded-full transition-colors ${slot ? "bg-[var(--onboarding-mint-strong)]" : "bg-white/10"}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${slot ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  {slot ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={slot.startTime} onChange={(event) => updateHours(dayOfWeek, "startTime", event.target.value)} className="onboarding-input" />
                      <span className="text-[var(--onboarding-muted)]">to</span>
                      <input type="time" value={slot.endTime} onChange={(event) => updateHours(dayOfWeek, "endTime", event.target.value)} className="onboarding-input" />
                    </div>
                  ) : <span className="text-sm text-[var(--onboarding-muted)]">Closed</span>}
                  <button type="button" disabled={!slot} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--onboarding-border)] text-[var(--onboarding-mint)] disabled:opacity-30"><Plus size={16} /></button>
                </div>
              );
            })}
          </div>

          <button type="button" className="mt-5 flex w-full items-center justify-between rounded-xl border border-[var(--onboarding-border)] p-4 text-left hover:border-[var(--onboarding-border-strong)]">
            <span><strong className="block">Add date range</strong><small className="mt-1 block text-[var(--onboarding-muted)]">Set special hours for holidays or temporary changes.</small></span><span>→</span>
          </button>
        </section>

        <section className="onboarding-card onboarding-card-pad">
          <h2 className="onboarding-card-title text-[24px]">How your availability will appear</h2>
          <p className="onboarding-card-subtitle">This is how clients will understand your available times.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-xl border border-[var(--onboarding-border)] p-5">
              <div className="flex items-center justify-between"><button>‹</button><strong>May 2026</strong><button>›</button></div>
              <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs text-[var(--onboarding-muted)]">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((label) => <span key={label}>{label}</span>)}
                {Array.from({ length: 35 }, (_, index) => {
                  const day = index - 2;
                  const active = day > 0 && day <= 31 && selectedStaff?.availability.some((slot) => slot.dayOfWeek === index % 7);
                  return <span key={index} className={`grid aspect-square place-items-center rounded-full ${active ? "border border-[var(--onboarding-mint)] bg-[rgba(69,151,131,.2)] text-white" : ""}`}>{day > 0 && day <= 31 ? day : ""}</span>;
                })}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--onboarding-border)] p-5">
              <h3 className="font-semibold">Daily working hours</h3>
              <div className="mt-4 space-y-4 text-sm">
                {selectedStaff?.availability.slice().sort((a,b) => a.dayOfWeek - b.dayOfWeek).map((slot) => (
                  <div key={slot.dayOfWeek} className="flex justify-between gap-3 border-b border-[var(--onboarding-border)] pb-3"><span>{DAYS[slot.dayOfWeek]}</span><span className="text-[var(--onboarding-muted)]">{slot.startTime} – {slot.endTime}</span></div>
                ))}
                {!selectedStaff?.availability.length ? <p className="text-[var(--onboarding-muted)]">No working days configured yet.</p> : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--onboarding-border)] p-5"><Clock3 className="text-[var(--onboarding-mint)]" /><h3 className="mt-3 font-semibold">Booking policies</h3><div className="mt-3 space-y-2 text-sm text-[var(--onboarding-muted)]"><p>Minimum notice <span className="float-right text-white">2 hours</span></p><p>Advance booking <span className="float-right text-white">30 days</span></p><p>Weekly hours <span className="float-right text-white">{weeklyHours.toFixed(1)}</span></p></div></div>
            <div className="rounded-xl border border-[var(--onboarding-border)] p-5"><Globe2 className="text-[var(--onboarding-mint)]" /><h3 className="mt-3 font-semibold">Timezone</h3><p className="mt-3 text-sm">Cairo, Egypt (GMT+2)</p><p className="mt-2 text-xs text-[var(--onboarding-muted)]">All booking times will be displayed in this timezone.</p></div>
          </div>
        </section>
      </div>

      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">← Back</button>
        <div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={onNext} className="onboarding-primary-button">Continue →</button></div>
      </footer>
    </div>
  );
}
