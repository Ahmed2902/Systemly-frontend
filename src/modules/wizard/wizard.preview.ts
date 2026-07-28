import type { TemplateData } from "../templates/template.types";
import type { WizardState } from "./wizard.types";

export const WIZARD_PREVIEW_STORAGE_KEY = "hgezli:onboarding-preview:v1";

export function wizardStateToTemplateData(state: WizardState): TemplateData {
  const vertical = state.vertical === "clinic" ? "clinic" : "salon";
  const defaultHero =
    vertical === "clinic"
      ? "/images/clinic-default.svg"
      : "/images/salon-default.svg";

  const commonData = {
    businessName: state.name,
    tagline: state.tagline,
    template: state.template,
    aboutText: state.aboutText,
    heroPhotoUrl: state.heroPhotoUrl ?? defaultHero,
    logoUrl: state.logoUrl ?? null,
    galleryPhotoUrls: state.galleryPhotoUrls,
    primaryColor: state.primaryColor,
    sectionOrder: state.sectionOrder,
    showTeam: state.showTeam,
    showFaq: state.showFaq,
    services: state.services.map((service) => ({
      id: service.clientId,
      name: service.name,
      category: service.category,
      description: service.description || null,
      priceEgp: service.priceEgp,
      durationMin: service.durationMin,
    })),
    staff: state.staff.map((staffMember) => ({
      id: staffMember.clientId,
      name: staffMember.name,
      role: staffMember.role,
      jobTitle: staffMember.jobTitle || null,
      bio: staffMember.bio || null,
      yearsExperience: staffMember.yearsExperience ?? null,
      photoUrl: staffMember.photoUrl ?? null,
    })),
    faqs: state.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
    phone: state.phone,
    address: state.address,
    city: state.city,
    instagram: state.instagram,
    whatsapp: state.whatsapp,
    timezone: state.timezone,
    language: state.language,
    bookingHref: "#preview-booking",
    previewMode: true,
  };

  return vertical === "clinic"
    ? { ...commonData, vertical: "clinic" }
    : { ...commonData, vertical: "salon" };
}
