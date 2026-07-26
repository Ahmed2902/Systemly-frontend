// src/modules/wizard/wizard.api.ts
import { WizardState } from "./wizard.types";
import { api } from "@/shared/lib/api";
import { apiUrl } from "@/shared/lib/api-url";

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

/**
 * High-performance Direct-to-Cloud Upload
 * 1. Requests a secure presigned upload ticket from Express backend
 * 2. Uploads binary data straight to Supabase Storage CDN
 */
export async function uploadImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const storagePath = `gallery/${uniqueId}.${fileExt}`;

  const presignRes = await fetch(apiUrl("/photos/gallery/presign"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      filePath: storagePath,
      contentType: file.type,
    }),
  });

  const presignJson = await presignRes.json();
  if (!presignRes.ok || presignJson.success === false) {
    throw presignJson;
  }

  const { uploadUrl, publicUrl } = presignJson.data;

  const cloudRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!cloudRes.ok) {
    throw new Error("Direct cloud storage delivery transaction failed.");
  }

  return {
    url: publicUrl,
    publicId: storagePath,
  };
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
    tagline: state.tagline,
    aboutText: state.aboutText,
    logoUrl: state.logoUrl || undefined,
    heroPhotoUrl: state.heroPhotoUrl || undefined,
    galleryPhotoUrls: state.galleryPhotoUrls,
    primaryColor: state.primaryColor,
    sectionOrder: state.sectionOrder,
    showTeam: state.showTeam,
    showFaq: state.showFaq,
    instagram: state.instagram || undefined,
    whatsapp: state.whatsapp || undefined,
    services: state.services.map((service) => ({
      clientId: service.clientId,
      name: service.name.trim(),
      category: normalizeCategory(service.category || ""),
      priceEgp: service.priceEgp,
      durationMin: service.durationMin,
    })),
    staff: state.staff.map((staffMember) => ({
      clientId: staffMember.clientId,
      name: staffMember.name,
      role: staffMember.role,
      photoUrl: staffMember.photoUrl || undefined,
      serviceClientIds: staffMember.serviceIds,
      availability: staffMember.availability,
    })),
    faqs: state.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  };

  return api("/onboarding/complete", null, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
