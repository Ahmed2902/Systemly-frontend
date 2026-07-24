import { notFound } from "next/navigation";
import { getTemplateById } from "@/modules/templates/template-registry";
import type { SalonTemplateData } from "@/modules/templates/salon/salon.types";
import { apiUrl } from "../../shared/lib/api-url";

async function getBusiness(slug: string) {
  const url = apiUrl(`/businesses/public/${slug}`);
  const res = await fetch(url, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `Failed to load business: ${res.status} ${await res.text()}`,
    );
  }
  const json = await res.json();
  return json.data;
}

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusiness(slug);

  if (!business) notFound();

  const content = business.websiteContent;
  const template = getTemplateById(content?.template ?? "aura-wellness");

  if (!template) notFound();

  const legacyHeroUrl = business.photos.find(
    (photo: { kind: string; url: string }) => photo.kind === "hero",
  )?.url;

  const templateData: SalonTemplateData = {
    businessName: business.name,
    tagline: content?.tagline ?? "",
    vertical: business.vertical,
    template: content?.template ?? "",
    aboutText: content?.aboutText ?? "",
    logoUrl: business.logoUrl ?? null,
    heroPhotoUrl: business.coverUrl ?? legacyHeroUrl ?? null,
    galleryPhotoUrls: business.photos
      .filter((photo: { kind: string; url: string }) => photo.kind === "gallery")
      .map((photo: { kind: string; url: string }) => photo.url),
    primaryColor: content?.primaryColor ?? "#2B2420",
    sectionOrder: content?.sectionOrder ?? [
      "hero",
      "about",
      "services",
      "gallery",
      "team",
      "contact",
      "faq",
    ],
    showTeam: content?.showTeam ?? true,
    showFaq: content?.showFaq ?? true,
    services: business.services.map(
      (service: {
        id: string;
        name: string;
        category?: string;
        priceEgp: number;
        durationMin: number;
      }) => ({
        id: service.id,
        name: service.name,
        category: service.category ?? undefined,
        priceEgp: Number(service.priceEgp),
        durationMin: service.durationMin,
      }),
    ),
    staff: business.staff.map(
      (staff: {
        id: string;
        name: string;
        role: string;
        photoUrl?: string | null;
      }) => ({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        photoUrl: staff.photoUrl,
      }),
    ),
    faqs: business.faqs.map(
      (faq: { question: string; answer: string }) => ({
        question: faq.question,
        answer: faq.answer,
      }),
    ),
    phone: business.phone,
    address: business.address ?? undefined,
    instagram: content?.instagramUrl ?? undefined,
    whatsapp: content?.whatsappNumber ?? undefined,
  };

  return template.component(templateData);
}
