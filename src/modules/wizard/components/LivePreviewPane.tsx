"use client";

import { ScaledPreview } from "@/shared/components/ScaledPreview";
import { useWizard } from "../wizard.context";
import {
  getTemplatesForVertical,
  getTemplateById,
} from "../../templates/template-registry";
import type { SalonTemplateData } from "@/modules/templates/salon/salon.types";
import hero from "../../../../images/hero.jpg";

export function LivePreviewPane() {
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
    <div className="overflow-hidden rounded-lg border border-surfaceBorder bg-surface ">
      {options.length > 1 && (
        <div className="flex gap-2 border-b border-surfaceBorder px-3 py-2">
          {options.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => patch({ template: t.id })}
              className={`rounded-md px-3 py-1 text-xs ${
                state.template === t.id
                  ? "bg-accent text-black"
                  : "border border-surfaceBorder text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-surfaceBorder px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-muted">
          hgezli.com/{state.slug || "your-business"}
        </span>
      </div>

      <div className="max-h-[900px] w-full  overflow-y-auto">
        <ScaledPreview baseWidth={800}>
          {activeTemplate?.component(templateData)}
        </ScaledPreview>
      </div>
    </div>
  );
}
