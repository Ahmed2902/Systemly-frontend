// src/modules/wizard/components/LivePreviewPane.tsx
"use client";

import { ScaledPreview } from "@/shared/components/ScaledPreview";
import { useWizard } from "../wizard.context";
import { SalonTemplate } from "@/modules/templates/salon/SalonTemplate";

export function LivePreviewPane() {
  const { state } = useWizard();

  return (
    <div className="overflow-hidden rounded-lg border border-surfaceBorder bg-surface">
      <div className="flex items-center gap-1.5 border-b border-surfaceBorder px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-muted">
          hgezli.com/{state.slug || "your-business"}
        </span>
      </div>

      <div className="max-h-[800px] w-full overflow-y-auto">
        <ScaledPreview baseWidth={800}>
          <SalonTemplate
            businessName={state.name}
            tagline={state.tagline}
            aboutText={state.aboutText}
            heroPhotoUrl={state.heroPhotoUrl}
            galleryPhotoUrls={state.galleryPhotoUrls}
            primaryColor={state.primaryColor}
            sectionOrder={state.sectionOrder}
            showTeam={state.showTeam}
            showFaq={state.showFaq}
            services={state.services.map((s) => ({
              id: s.clientId,
              name: s.name,
              category: s.category,
              priceEgp: s.priceEgp,
            }))}
            staff={state.staff.map((s) => ({
              id: s.clientId,
              name: s.name,
              role: s.role,
            }))}
            phone={state.phone}
            address={state.address}
            faqs={state.faqs.map((f) => ({
              id: f.clientId,
              question: f.question,
              answer: f.answer,
            }))}
          />
        </ScaledPreview>
      </div>
    </div>
  );
}
