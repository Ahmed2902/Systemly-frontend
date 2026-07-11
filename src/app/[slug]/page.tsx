import { notFound } from "next/navigation";
import { getTemplateById } from "@/modules/templates/template-registry";
import type { SalonTemplateData } from "@/modules/templates/salon/salon.types";
import { apiUrl } from "../../shared/lib/api-url";

async function getBusiness(slug: string) {
  const url = apiUrl(`/businesses/public/${slug}`);
  const res = await fetch(url, {
    cache: "no-store",
  });
  console.log("Fetching:", url);
  if (res.status === 404) return null;
  if (!res.ok)
    throw new Error(
      `Failed to load business : ${res.status} ${await res.text()}`,
    );
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
  console.log("business:", business ? "found" : "null");

  if (!business) notFound();

  const content = business.websiteContent;
  const template = getTemplateById(content?.template ?? "aura-wellness");
  console.log(
    "template lookup:",
    content?.template,
    "->",
    template ? "found" : "null",
  );

  if (!template) notFound();

  const templateData: SalonTemplateData = {
    businessName: business.name,
    tagline: content?.tagline ?? "",
    vertical: business.vertical,
    template: content?.template ?? "",
    aboutText: content?.aboutText ?? "",
    logoUrl: business.logoUrl ?? null,
    heroPhotoUrl:
      business.photos.find((p: any) => p.kind === "hero")?.url ?? null,
    galleryPhotoUrls: business.photos
      .filter((p: any) => p.kind === "gallery")
      .map((p: any) => p.url),
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
    services: business.services.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category ?? undefined,
      priceEgp: Number(s.priceEgp),
      durationMin: s.durationMin,
    })),
    staff: business.staff.map((s: any) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      photoUrl: s.photoUrl,
    })),
    faqs: business.faqs.map((f: any) => ({
      question: f.question,
      answer: f.answer,
    })),
    phone: business.phone,
    address: business.address ?? undefined,
    instagram: content?.instagramUrl ?? undefined,
    whatsapp: content?.whatsappNumber ?? undefined,
  };

  return template.component(templateData);
}
