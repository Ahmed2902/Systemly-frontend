import type { WizardState } from "./wizard.types";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/lib/api-url";

const ALLOWED_ONBOARDING_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type OnboardingUploadTicket = {
  objectPath: string;
  uploadUrl: string;
  contentType: string;
};

type ConfirmedOnboardingUpload = {
  objectPath: string;
  publicId: string;
  publicUrl: string;
  url: string;
};

function normalizeCategory(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const res = await fetch(apiUrl(`/businesses/check-slug/${slug}`));
  if (!res.ok) return false;
  const json = await res.json();
  return json.available;
}

export async function uploadImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  if (!ALLOWED_ONBOARDING_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }

  const ticket = await api<OnboardingUploadTicket>(
    "/onboarding/media/asset/presign",
    null,
    {
      method: "POST",
      body: JSON.stringify({ contentType: file.type }),
    },
  );

  const cloudRes = await fetch(ticket.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": ticket.contentType },
    body: file,
  });
  if (!cloudRes.ok) {
    throw new Error("Direct cloud storage delivery transaction failed.");
  }

  const confirmed = await api<ConfirmedOnboardingUpload>(
    "/onboarding/media/asset/confirm",
    null,
    {
      method: "POST",
      body: JSON.stringify({ objectPath: ticket.objectPath }),
    },
  );

  return { url: confirmed.url, publicId: confirmed.publicId };
}

export async function submitOnboarding(state: WizardState) {
  const payload = {
    vertical: state.vertical,
    templateId: state.template,
    name: state.name,
    slug: state.slug,
    phone: state.phone,
    city: state.city,
    address: state.address,
    timezone: state.timezone,
    language: state.language,
    tagline: state.tagline,
    aboutText: state.aboutText,
    logoUrl: state.logoUrl || undefined,
    heroPhotoUrl: state.heroPhotoUrl || undefined,
    galleryPhotoUrls: state.galleryPhotoUrls,
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    sectionOrder: state.sectionOrder,
    showTeam: state.showTeam,
    showFaq: state.showFaq,
    instagram: state.instagram || undefined,
    whatsapp: state.whatsapp || undefined,
    services: state.services.map((service) => ({
      clientId: service.clientId,
      name: service.name.trim(),
      category: normalizeCategory(service.category || "") || undefined,
      description: service.description?.trim() || undefined,
      priceEgp: service.priceEgp,
      durationMin: service.durationMin,
    })),
    staff: state.staff.map((staffMember) => ({
      clientId: staffMember.clientId,
      name: staffMember.name.trim(),
      role: staffMember.role,
      jobTitle: staffMember.jobTitle?.trim() || undefined,
      bio: staffMember.bio?.trim() || undefined,
      yearsExperience: staffMember.yearsExperience,
      photoUrl: staffMember.photoUrl || undefined,
      serviceClientIds: staffMember.serviceIds,
      availability: staffMember.availability,
    })),
    faqs: state.faqs.map((faq) => ({
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    })),
  };

  return api("/onboarding/complete", null, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
