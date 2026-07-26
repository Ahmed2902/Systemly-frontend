"use client";

import { ScaledPreview } from "@/shared/components/ScaledPreview";
import { useWizard } from "../wizard.context";
import {
  getTemplatesForVertical,
  getTemplateById,
} from "../../templates/template-registry";
import type { SalonTemplateData } from "@/modules/templates/salon/salon.types";
import hero from "../../../../images/hero.jpg";

export function LivePreviewPane({ expanded = false }: { expanded?: boolean }) {
  const { state, patch } = useWizard();
  const vertical = (state.vertical ?? "salon") as "salon" | "clinic";
  const options = getTemplatesForVertical(vertical);
  const activeTemplate = getTemplateById(state.template) ?? options[0];

  const templateData: SalonTemplateData = {
    businessName: state.name,
    tagline: state.tagline,
    vertical,
    template: state.template,
    aboutText: state.aboutText,
    heroPhotoUrl: state.heroPhotoUrl ?? hero.src,
    logoUrl: state.logoUrl ?? null,
    galleryPhotoUrls: state.galleryPhotoUrls,
    primaryColor: state.primaryColor,
    sectionOrder: state.sectionOrder,
    showTeam: state.showTeam,
    showFaq: state.showFaq,
    services: state.services.map((s) => ({
      id: s.clientId,
      name: s.name,
      category: s.category,
      priceEgp: s.priceEgp,
      durationMin: s.durationMin,
    })),
    staff: state.staff.map((s) => ({
      id: s.clientId,
      name: s.name,
      role: s.role,
      photoUrl: s.photoUrl ?? null,
    })),
    faqs: state.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    phone: state.phone,
    address: state.address,
    instagram: state.instagram,
    whatsapp: state.whatsapp,
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--onboarding-border)] bg-[#080a09]">
      {options.length > 1 && (
        <div className="flex gap-2 border-b border-[var(--onboarding-border)] px-3 py-2">
          {options.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => patch({ template: template.id })}
              className={`rounded-md px-3 py-1 text-xs ${
                state.template === template.id
                  ? "bg-[var(--onboarding-mint)] text-white"
                  : "border border-[var(--onboarding-border)] text-[var(--onboarding-muted)]"
              }`}
            >
              {template.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-[var(--onboarding-border)] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-[var(--onboarding-muted)]">
          hgezli.com/{state.slug || "your-business"}
        </span>
      </div>

      <div className={`onboarding-live-preview-scroll ${expanded ? "is-expanded" : ""}`}>
        <ScaledPreview baseWidth={800}>
          {activeTemplate?.component(templateData)}
        </ScaledPreview>
      </div>
    </div>
  );
}
