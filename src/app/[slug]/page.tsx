import { notFound } from "next/navigation";
import { resolveTemplateForVertical } from "@/modules/templates/template-registry";
import { completePublicSectionOrder } from "@/modules/templates/section-order";
import type { TemplateData, TemplateVertical } from "@/modules/templates/template.types";
import { apiUrl } from "../../shared/lib/api-url";

async function getBusiness(slug: string) {
  const res = await fetch(apiUrl(`/businesses/public/${slug}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load business: ${res.status} ${await res.text()}`);
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

  const vertical = business.vertical as TemplateVertical;
  if (vertical !== "salon" && vertical !== "clinic") notFound();

  const content = business.websiteContent;
  const template = resolveTemplateForVertical(content?.template ?? "", vertical);
  if (!template) notFound();

  const legacyHeroUrl = business.photos.find(
    (photo: { kind: string; url: string }) => photo.kind === "hero",
  )?.url;

  const commonData = {
    businessName: business.name,
    tagline: content?.tagline ?? "",
    template: template.id,
    aboutText: content?.aboutText ?? "",
    logoUrl: business.logoUrl ?? null,
    heroPhotoUrl: business.coverUrl ?? legacyHeroUrl ?? null,
    galleryPhotoUrls: business.photos
      .filter((photo: { kind: string; url: string }) => photo.kind === "gallery")
      .map((photo: { url: string }) => photo.url),
    primaryColor: content?.primaryColor ?? template.theme.primary,
    sectionOrder: completePublicSectionOrder(content?.sectionOrder ?? []),
    showTeam: content?.showTeam ?? true,
    showFaq: content?.showFaq ?? true,
    services: business.services.map((service: any) => ({
      id: service.id,
      name: service.name,
      category: service.category ?? undefined,
      description: service.description ?? null,
      priceEgp: Number(service.priceEgp),
      durationMin: service.durationMin,
    })),
    staff: business.staff.map((staff: any) => ({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      jobTitle: staff.jobTitle ?? null,
      bio: staff.bio ?? null,
      yearsExperience: staff.yearsExperience ?? null,
      photoUrl: staff.photoUrl ?? null,
    })),
    faqs: business.faqs.map((faq: any) => ({ question: faq.question, answer: faq.answer })),
    phone: business.phone,
    address: business.address ?? undefined,
    city: business.city ?? undefined,
    instagram: content?.instagramUrl ?? undefined,
    whatsapp: content?.whatsappNumber ?? undefined,
    timezone: business.timezone || "Africa/Cairo",
    language: business.language === "ar" ? "ar" : "en",
    bookingHref: `/${slug}/book`,
    previewMode: false,
  };

  const templateData: TemplateData = vertical === "clinic"
    ? { ...commonData, vertical: "clinic" }
    : { ...commonData, vertical: "salon" };
  const Template = template.component;

  return <Template {...templateData} />;
}
