"use client";

import { useState } from "react";
import { Building2, Check, MapPin, Scissors, Stethoscope } from "lucide-react";
import { useWizard } from "../wizard.context";
import { StepProps } from "../wizard.types";
import { SlugInput } from "@/modules/onboarding/components/SlugInput";
import {
  getDefaultTemplateId,
  getTemplatesForVertical,
  type TemplateVertical,
} from "@/modules/templates/template-registry";

export function StepBusinessInfo({ onNext }: StepProps) {
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

  const selectedVertical = state.vertical as TemplateVertical | null;
  const templates = getTemplatesForVertical(selectedVertical);

  return (
    <div>
      <div className="onboarding-grid-two" style={{ gridTemplateColumns: "minmax(0, 1.08fr) minmax(360px, .92fr)", gap: 14 }}>
        <section className="onboarding-card p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--onboarding-border)] bg-[rgba(38,101,87,.18)] text-[var(--onboarding-mint)]">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-[23px] font-semibold leading-tight tracking-[-.03em]">Set up your business</h1>
              <p className="mt-1 text-sm text-[var(--onboarding-muted)]">The essentials first. You can refine everything later.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="onboarding-field">
              <label>Business name</label>
              <input value={state.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Hgezli Beauty Studio" className="onboarding-input" />
              {errors.name ? <p className="onboarding-error">{errors.name}</p> : null}
            </div>

            <div className="onboarding-field">
              <label>Business vertical</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => selectVertical("salon")} className={`onboarding-choice flex min-h-16 items-center gap-3 p-3 text-left ${state.vertical === "salon" ? "is-selected" : ""}`}>
                  <Scissors size={19} className="text-[var(--onboarding-mint)]" />
                  <span><strong className="block text-sm">Salon</strong><small className="mt-0.5 block text-[11px] text-[var(--onboarding-muted)]">Hair, nails and beauty</small></span>
                  {state.vertical === "salon" ? <Check className="ml-auto text-[var(--onboarding-mint)]" size={17} /> : null}
                </button>
                <button type="button" onClick={() => selectVertical("clinic")} className={`onboarding-choice flex min-h-16 items-center gap-3 p-3 text-left ${state.vertical === "clinic" ? "is-selected" : ""}`}>
                  <Stethoscope size={19} className="text-[var(--onboarding-mint)]" />
                  <span><strong className="block text-sm">Clinic</strong><small className="mt-0.5 block text-[11px] text-[var(--onboarding-muted)]">Medical and wellness</small></span>
                  {state.vertical === "clinic" ? <Check className="ml-auto text-[var(--onboarding-mint)]" size={17} /> : null}
                </button>
              </div>
              {errors.vertical ? <p className="onboarding-error">{errors.vertical}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="onboarding-field"><label>Phone number</label><input value={state.phone} onChange={(event) => patch({ phone: event.target.value })} placeholder="+20 100 123 4567" className="onboarding-input" />{errors.phone ? <p className="onboarding-error">{errors.phone}</p> : null}</div>
              <div className="onboarding-field"><label>City</label><input value={state.city} onChange={(event) => patch({ city: event.target.value })} placeholder="Cairo" className="onboarding-input" /></div>
            </div>

            <div className="onboarding-field">
              <label>Address</label>
              <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--onboarding-muted)]" /><input value={state.address} onChange={(event) => patch({ address: event.target.value })} placeholder="123 El Tahrir Street, Downtown Cairo" className="onboarding-input pl-10" /></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="onboarding-field"><label>Timezone</label><select className="onboarding-select" defaultValue="Africa/Cairo"><option value="Africa/Cairo">(GMT+02:00) Cairo</option></select></div>
              <div className="onboarding-field"><label>Language</label><select className="onboarding-select" defaultValue="en"><option value="en">English</option><option value="ar">العربية</option></select></div>
            </div>

            <SlugInput value={state.slug} onChange={(value) => patch({ slug: value })} error={errors.slug} />
          </div>
        </section>

        <section className="onboarding-card p-5">
          <h2 className="text-[22px] font-semibold leading-tight tracking-[-.03em]">Choose a template built for your industry.</h2>
          <p className="mt-1 text-sm text-[var(--onboarding-muted)]">Pick a starting point while the visual theme remains visible around the form.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(templates.length ? templates : getTemplatesForVertical("salon")).map((template) => {
              const selected = state.template === template.id;
              return (
                <button type="button" key={template.id} onClick={() => patch({ template: template.id })} className={`onboarding-choice overflow-hidden p-3 text-left ${selected ? "is-selected" : ""}`}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--onboarding-border)] bg-[linear-gradient(145deg,#101918,#050908)] p-3">
                    <div className="h-1.5 w-16 rounded bg-white/80" />
                    <div className="mt-5 max-w-[75%] text-base font-bold leading-tight">{template.vertical === "clinic" ? "Compassionate care, every step." : "Beauty that brings out you."}</div>
                    <div className="mt-2 h-5 w-20 rounded bg-[var(--onboarding-mint)]" />
                    <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1.5">{[1,2,3].map((item) => <div key={item} className="h-9 rounded bg-white/5" />)}</div>
                    {selected ? <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--onboarding-mint)] text-[#071010]"><Check size={14} /></span> : null}
                  </div>
                  <strong className="mt-3 block text-sm">{template.label}</strong><span className="mt-1 block text-[11px] text-[var(--onboarding-muted)]">Modern and ready to customise.</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-2 border-t border-[var(--onboarding-border)] pt-4 sm:grid-cols-3">
            {["Online booking", "Operations", "Analytics"].map((item) => <div key={item} className="rounded-lg border border-[var(--onboarding-border)] p-3"><strong className="block text-xs">{item}</strong><span className="mt-1 block text-[10px] leading-4 text-[var(--onboarding-muted)]">Connected from day one.</span></div>)}
          </div>
        </section>
      </div>

      <footer className="onboarding-footer !mt-3 !py-3"><p className="onboarding-secure-copy">Your information is secure and never shared.</p><div className="onboarding-footer-actions"><button type="button" className="onboarding-secondary-button">Save draft</button><button type="button" onClick={validateAndNext} className="onboarding-primary-button">Continue →</button></div></footer>
    </div>
  );
}
