import { notFound } from "next/navigation";
import {
  renderTemplate,
  resolveTemplateForVertical,
} from "@/modules/templates/template-registry";
import { completePublicSectionOrder } from "@/modules/templates/section-order";
import type {
  PublicSiteLanguage,
  TemplateData,
  TemplateVertical,
} from "@/modules/templates/template.types";
import { apiUrl } from "../../shared/lib/api-url";

type PublicBusinessPhoto = {
  kind: string;
  url: string;
};

type PublicBusinessService = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  priceEgp: number;
  durationMin: number;
};

type PublicBusinessStaffMember = {
  id: string;
  name: string;
  role: string;
  jobTitle?: string | null;
  bio?: string | null;
  yearsExperience?: number | null;
  photoUrl?: string | null;
};

type PublicBusinessFaq = {
  question: string;
  answer: string;
};

type PublicBusinessWebsiteContent = {
  tagline?: string | null;
  aboutText?: string | null;
  template?: string | null;
  primaryColor?: string | null;
  sectionOrder?: string[] | null;
  showTeam?: boolean | null;
  showFaq?: boolean | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
};

type PublicBusiness = {
  name: string;
  vertical: string;
  websiteContent: PublicBusinessWebsiteContent | null;
  photos: PublicBusinessPhoto[];
  logoUrl: string | null;
  coverUrl: string | null;
  services: PublicBusinessService[];
  staff: PublicBusinessStaffMember[];
  faqs: PublicBusinessFaq[];
  phone: string;
  address: string | null;
  city: string | null;
  timezone: string;
  language: string;
};

type PublicBusinessResponse = {
  data: PublicBusiness | null;
};

function isTemplateVertical(value: string): value is TemplateVertical {
  return value === "salon" || value === "clinic";
}

async function getBusiness(slug: string): Promise<PublicBusiness | null> {
  const res = await fetch(apiUrl(`/businesses/public/${slug}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load business: ${res.status} ${await res.text()}`);
  const json: PublicBusinessResponse = await res.json();
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

  if (!isTemplateVertical(business.vertical)) notFound();
  const vertical = business.vertical;

  const content = business.websiteContent;
  const template = resolveTemplateForVertical(content?.template ?? "", vertical);
  if (!template) notFound();
  const language: PublicSiteLanguage = business.language === "ar" ? "ar" : "en";

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
    services: business.services.map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category ?? undefined,
      description: service.description ?? null,
      priceEgp: Number(service.priceEgp),
      durationMin: service.durationMin,
    })),
    staff: business.staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      role: staff.role,
      jobTitle: staff.jobTitle ?? null,
      bio: staff.bio ?? null,
      yearsExperience: staff.yearsExperience ?? null,
      photoUrl: staff.photoUrl ?? null,
    })),
    faqs: business.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
    phone: business.phone,
    address: business.address ?? undefined,
    city: business.city ?? undefined,
    instagram: content?.instagramUrl ?? undefined,
    whatsapp: content?.whatsappNumber ?? undefined,
    timezone: business.timezone || "Africa/Cairo",
    language,
    bookingHref: `/${slug}/book`,
    previewMode: false,
  };

  const templateData: TemplateData = vertical === "clinic"
    ? { ...commonData, vertical: "clinic" }
    : { ...commonData, vertical: "salon" };

  return renderTemplate(templateData);
}
