// src/modules/wizard/wizard.api.ts
import { WizardState } from "./wizard.types";
import { apiUrl } from "@/shared/lib/api-url";

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
  // Generate a clean target file path reference
  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const storagePath = `gallery/${uniqueId}.${fileExt}`;

  // Step 1: Request the secure signed upload token from your Express backend
  const presignRes = await fetch(apiUrl("/photos/gallery/presign"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Cookie carries auth to authorize the signature generation
    body: JSON.stringify({
      filePath: storagePath,
      contentType: file.type,
    }),
  });

  const presignJson = await presignRes.json();
  if (!presignRes.ok || presignJson.success === false) {
    throw presignJson;
  }

  // Expecting backend to return { uploadUrl, publicUrl } inside data wrapper
  const { uploadUrl, publicUrl } = presignJson.data;

  // Step 2: Upload the compressed file BINARY directly to Supabase Storage
  const cloudRes = await fetch(uploadUrl, {
    method: "PUT", // Supabase requires a binary HTTP PUT method for signed upload targets
    headers: { "Content-Type": file.type },
    body: file, // Direct binary file buffer payload
  });

  if (!cloudRes.ok) {
    throw new Error("Direct cloud storage delivery transaction failed.");
  }

  // Return the data object expected by your frontend modules
  return {
    url: publicUrl,
    publicId: storagePath, // Storing the inner path lets deleteFile work effortlessly later
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
    services: state.services.map((s) => ({
      clientId: s.clientId,
      name: s.name,
      category: s.category,
      priceEgp: s.priceEgp,
      durationMin: s.durationMin,
    })),
    staff: state.staff.map((s) => ({
      clientId: s.clientId,
      name: s.name,
      role: s.role,
      photoUrl: s.photoUrl || undefined,
      serviceClientIds: s.serviceIds,
      availability: s.availability,
    })),
    faqs: state.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
  };

  const res = await fetch(apiUrl("/onboarding/complete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) throw json;
  return json;
}
