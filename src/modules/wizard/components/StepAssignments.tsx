"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Globe2, UserRoundCheck } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StepAssignments({ onNext, onBack }: StepProps) {
  const text = usePlatformText();
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
    patch({ staff: state.staff.map((member) => member.clientId === selectedStaff.clientId ? updater(member) : member) });
  }

  function toggleDay(dayOfWeek: number) {
    if (!selectedStaff) return;
    updateSelected((member) => {
      if (!member) return member;
      const exists = member.availability.some((slot) => slot.dayOfWeek === dayOfWeek);
      return { ...member, availability: exists ? member.availability.filter((slot) => slot.dayOfWeek !== dayOfWeek) : [...member.availability, { dayOfWeek, startTime: "09:00", endTime: "18:00" }] };
    });
  }

  function updateHours(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
    updateSelected((member) => {
      if (!member) return member;
      return { ...member, availability: member.availability.map((slot) => slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot) };
    });
  }

  const workingDays = selectedStaff?.availability.length ?? 0;

  return (
    <div>
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">{text("Availability")}</p>
        <h1 className="onboarding-page-title">{text("Set the rhythm of the week.")}</h1>
        <p className="onboarding-page-copy">{text("Choose each team member and define the hours customers can book with them.")}</p>
      </div>

      <div className="onboarding-grid-two" style={{ gridTemplateColumns: "minmax(0,1.15fr) minmax(330px,.85fr)" }}>
        <section className="onboarding-card p-5">
          <div className="flex items-start gap-3">
            <div className="onboarding-icon-tile"><CalendarDays size={20} /></div>
            <div><h2 className="text-[23px] font-semibold tracking-[-.03em]">{text("Regular working hours")}</h2><p className="mt-1 text-sm text-[var(--onboarding-muted)]">{text("Choose a team member, then configure their week.")}</p></div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {state.staff.map((member) => (
              <button type="button" key={member.clientId} onClick={() => setSelectedStaffId(member.clientId)} className={`onboarding-choice flex min-w-40 items-center gap-2.5 p-2.5 text-left ${selectedStaff?.clientId === member.clientId ? "is-selected" : ""}`}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--onboarding-mint-soft)] text-xs font-semibold text-[var(--onboarding-mint-strong)]">{member.name?.slice(0, 1).toUpperCase() || "?"}</span>
                <span><strong className="block text-sm">{member.name || "Unnamed"}</strong><small className="text-[11px] text-[var(--onboarding-muted)]">{member.role}</small></span>
              </button>
            ))}
          </div>

          <div className="onboarding-table mt-4">
            <div className="onboarding-table-row onboarding-table-head grid-cols-[1fr_90px_1.8fr]"><span>{text("Day")}</span><span>{text("Working")}</span><span>{text("Working hours")}</span></div>
            {DAYS.map((day, dayOfWeek) => {
              const slot = selectedStaff?.availability.find((item) => item.dayOfWeek === dayOfWeek);
              return (
                <div key={day} className="onboarding-table-row grid-cols-[1fr_90px_1.8fr] gap-3 !min-h-[58px] !py-2">
                  <span className="text-sm font-medium">{day}</span>
                  <button type="button" onClick={() => toggleDay(dayOfWeek)} className={`relative h-7 w-12 rounded-full transition-colors ${slot ? "bg-[var(--onboarding-mint-strong)]" : "bg-[#d7d9d5]"}`} aria-label={`${slot ? text("Disable") : text("Enable")} ${day}`} aria-pressed={Boolean(slot)}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${slot ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  {slot ? (
                    <div className="flex items-center gap-2">
                      <input type="time" value={slot.startTime} onChange={(event) => updateHours(dayOfWeek, "startTime", event.target.value)} className="onboarding-input" aria-label={`${day} start time`} />
                      <span className="text-[var(--onboarding-muted)]">to</span>
                      <input type="time" value={slot.endTime} onChange={(event) => updateHours(dayOfWeek, "endTime", event.target.value)} className="onboarding-input" aria-label={`${day} end time`} />
                    </div>
                  ) : <span className="text-sm text-[var(--onboarding-muted)]">{text("Closed")}</span>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="onboarding-card p-5">
          <h2 className="text-[22px] font-semibold tracking-[-.03em]">{text("Availability summary")}</h2>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">{text("A live summary of the schedule you configured.")}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4"><UserRoundCheck className="text-[var(--onboarding-mint)]" size={20} /><strong className="mt-3 block text-2xl">{workingDays}</strong><span className="mt-1 block text-xs text-[var(--onboarding-muted)]">{text("Working days")}</span></div>
            <div className="rounded-2xl border border-[var(--onboarding-border)] bg-[#fafaf8] p-4"><Clock3 className="text-[var(--onboarding-mint)]" size={20} /><strong className="mt-3 block text-2xl">{weeklyHours.toFixed(1)}</strong><span className="mt-1 block text-xs text-[var(--onboarding-muted)]">{text("Weekly hours")}</span></div>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--onboarding-border)] p-4">
            <h3 className="font-semibold">{text("Configured schedule")}</h3>
            <div className="mt-3 space-y-2 text-sm">
              {selectedStaff?.availability.slice().sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((slot) => <div key={slot.dayOfWeek} className="flex justify-between gap-3 border-b border-[var(--onboarding-border)] pb-2"><span>{DAYS[slot.dayOfWeek]}</span><span className="text-[var(--onboarding-muted)]">{slot.startTime} – {slot.endTime}</span></div>)}
              {!selectedStaff?.availability.length ? <p className="text-[var(--onboarding-muted)]">{text("No working days configured yet.")}</p> : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--onboarding-border)] p-4"><Clock3 className="text-[var(--onboarding-mint)]" size={18} /><h3 className="mt-2 text-sm font-semibold">{text("Booking policies")}</h3><div className="mt-2 space-y-1.5 text-xs text-[var(--onboarding-muted)]"><p>{text("Minimum notice")} <span className="float-right font-semibold text-[var(--onboarding-text)]">{text("2 hours")}</span></p><p>{text("Advance booking")} <span className="float-right font-semibold text-[var(--onboarding-text)]">{text("30 days")}</span></p></div></div>
            <div className="rounded-2xl border border-[var(--onboarding-border)] p-4"><Globe2 className="text-[var(--onboarding-mint)]" size={18} /><h3 className="mt-2 text-sm font-semibold">{text("Timezone")}</h3><p className="mt-2 text-xs">{text("Cairo, Egypt (GMT+2)")}</p><p className="mt-1 text-[11px] text-[var(--onboarding-muted)]">{text("All booking times use this timezone.")}</p></div>
          </div>
        </section>
      </div>

      <footer className="onboarding-footer">
        <button type="button" onClick={onBack} className="onboarding-secondary-button">{text("← Back")}</button>
        <div className="onboarding-footer-actions"><button type="button" onClick={onNext} className="onboarding-primary-button">{text("Continue →")}</button></div>
      </footer>
    </div>
  );
}
