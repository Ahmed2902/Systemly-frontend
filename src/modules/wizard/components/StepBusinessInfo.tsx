"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import { useState } from "react";
import { Building2, Check, LockKeyhole, MapPin, Scissors, Stethoscope } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { SlugInput } from "@/modules/onboarding/components/SlugInput";
import {
  getDefaultTemplateId,
  type TemplateVertical,
} from "@/modules/templates/template-registry";

export function StepBusinessInfo({ onNext }: StepProps) {
  const text = usePlatformText();
  const { state, patch } = useWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function selectVertical(vertical: TemplateVertical) {
    patch({ vertical, template: getDefaultTemplateId(vertical) });
  }

  function validateAndNext() {
    const nextErrors: Record<string, string> = {};
    if (!state.vertical) nextErrors.vertical = "Choose a business type";
    if (!state.name.trim()) nextErrors.name = "Business name is required";
    if (!/^[a-z0-9-]{3,}$/.test(state.slug)) nextErrors.slug = "Choose a valid website address";
    if (!state.phone.trim()) nextErrors.phone = "Phone number is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext();
  }

  return (
    <div>
      <div className="onboarding-page-intro">
        <p className="onboarding-kicker">{text("Business profile")}</p>
        <h1 className="onboarding-page-title">Start with the business.</h1>
        <p className="onboarding-page-copy">
          These details shape your Operations workspace, public website, booking flow, and customer communications.
        </p>
      </div>

      <div className="onboarding-form-frame">
        <section className="onboarding-card">
          <header className="onboarding-form-header">
            <div className="flex items-center gap-3">
              <div className="onboarding-icon-tile"><Building2 size={20} /></div>
              <div>
                <h2 className="text-base font-semibold">Business details</h2>
                <p className="mt-1 text-xs text-[var(--onboarding-muted)]">Add the information customers and staff will rely on.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--onboarding-border)] px-3 py-2 text-[11px] text-[var(--onboarding-muted)]">
              <LockKeyhole size={13} className="text-[var(--onboarding-mint)]" /> Secure &amp; private
            </span>
          </header>

          <div className="onboarding-form-body">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="onboarding-field">
                <label>{text("Business name")}</label>
                <input value={state.name} onChange={(event) => patch({ name: event.target.value })} placeholder="e.g. Noir Studio" className="onboarding-input" />
                {errors.name ? <p className="onboarding-error">{errors.name}</p> : null}
              </div>
              <div className="onboarding-field">
                <label>{text("Phone number")}</label>
                <input value={state.phone} onChange={(event) => patch({ phone: event.target.value })} placeholder="+20 100 123 4567" className="onboarding-input" />
                {errors.phone ? <p className="onboarding-error">{errors.phone}</p> : null}
              </div>
            </div>

            <div className="onboarding-form-section border-t border-[var(--onboarding-border)] pt-6">
              <div className="onboarding-field">
                <label>Business vertical</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button type="button" onClick={() => selectVertical("salon")} className={`onboarding-choice flex min-h-20 items-center gap-4 p-4 text-left ${state.vertical === "salon" ? "is-selected" : ""}`}>
                    <span className="onboarding-icon-tile is-small"><Scissors size={18} /></span>
                    <span><strong className="block text-sm">{text("Salon")}</strong><small className="mt-1 block text-[11px] text-[var(--onboarding-muted)]">Hair, nails and beauty</small></span>
                    {state.vertical === "salon" ? <Check className="ml-auto text-[var(--onboarding-mint)]" size={17} /> : null}
                  </button>
                  <button type="button" onClick={() => selectVertical("clinic")} className={`onboarding-choice flex min-h-20 items-center gap-4 p-4 text-left ${state.vertical === "clinic" ? "is-selected" : ""}`}>
                    <span className={`onboarding-icon-tile is-small ${state.vertical === "clinic" ? "" : "is-muted"}`}><Stethoscope size={18} /></span>
                    <span><strong className="block text-sm">{text("Clinic")}</strong><small className="mt-1 block text-[11px] text-[var(--onboarding-muted)]">Medical, dental and wellness</small></span>
                    {state.vertical === "clinic" ? <Check className="ml-auto text-[var(--onboarding-mint)]" size={17} /> : null}
                  </button>
                </div>
                {errors.vertical ? <p className="onboarding-error">{errors.vertical}</p> : null}
              </div>
            </div>

            <div className="onboarding-form-section border-t border-[var(--onboarding-border)] pt-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="onboarding-field">
                  <label>{text("City")}</label>
                  <input value={state.city} onChange={(event) => patch({ city: event.target.value })} placeholder="e.g. Cairo" className="onboarding-input" />
                </div>
                <div className="onboarding-field">
                  <label>{text("Address")}</label>
                  <div className="relative">
                    {!state.address ? <MapPin size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--onboarding-muted)]" /> : null}
                    <input value={state.address} onChange={(event) => patch({ address: event.target.value })} placeholder="e.g. 123 Street, Maadi" className={`onboarding-input ${state.address ? "pl-3.5" : "pl-10"}`} />
                  </div>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="onboarding-field">
                  <label>{text("Timezone")}</label>
                  <select className="onboarding-select" value={state.timezone} onChange={(event) => patch({ timezone: event.target.value })}>
                    <option value="Africa/Cairo">(GMT+02:00) Cairo</option>
                  </select>
                </div>
                <div className="onboarding-field">
                  <label>{text("Primary language")}</label>
                  <select className="onboarding-select" value={state.language} onChange={(event) => patch({ language: event.target.value as "en" | "ar" })}>
                    <option value="en">{text("English")}</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
              <SlugInput value={state.slug} onChange={(value) => patch({ slug: value })} error={errors.slug} />
            </div>
          </div>
        </section>

        <footer className="onboarding-footer">
          <p className="onboarding-secure-copy">You can edit these details later from Settings.</p>
          <div className="onboarding-footer-actions">
            <button type="button" onClick={validateAndNext} className="onboarding-primary-button">Save and continue →</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
