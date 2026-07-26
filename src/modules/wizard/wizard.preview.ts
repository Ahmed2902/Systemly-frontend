import hero from "../../../images/hero.jpg";
import type { ClinicTemplateData } from "../templates/clinic/clinic.types";
import type { SalonTemplateData } from "../templates/salon/salon.types";
import type { WizardState } from "./wizard.types";

export const WIZARD_PREVIEW_STORAGE_KEY = "hgezli:onboarding-preview:v1";

export function wizardStateToTemplateData(
  state: WizardState & { vertical: "salon" },
): SalonTemplateData;
export function wizardStateToTemplateData(
  state: WizardState & { vertical: "clinic" },
): ClinicTemplateData;
export function wizardStateToTemplateData(
  state: WizardState,
): SalonTemplateData | ClinicTemplateData;

export function wizardStateToTemplateData(
  state: WizardState,
): SalonTemplateData | ClinicTemplateData {
  const commonData = {
    businessName: state.name,
    tagline: state.tagline,
    template: state.template,
    aboutText: state.aboutText,
    heroPhotoUrl: state.heroPhotoUrl ?? hero.src,
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
      priceEgp: service.priceEgp,
      durationMin: service.durationMin,
    })),
    staff: state.staff.map((staffMember) => ({
      id: staffMember.clientId,
      name: staffMember.name,
      role: staffMember.role,
      photoUrl: staffMember.photoUrl ?? null,
    })),
    faqs: state.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
    phone: state.phone,
    address: state.address,
    instagram: state.instagram,
    whatsapp: state.whatsapp,
  };

  return state.vertical === "clinic"
    ? { ...commonData, vertical: "clinic" }
    : { ...commonData, vertical: "salon" };
}
