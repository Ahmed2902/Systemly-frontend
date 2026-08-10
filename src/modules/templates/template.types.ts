export type TemplateVertical = "salon" | "clinic";
export type PublicSiteLanguage = "en" | "ar";

export type PublicService = {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  priceEgp: number;
  durationMin: number;
};

export type PublicStaffMember = {
  id: string;
  name: string;
  role?: string;
  jobTitle?: string | null;
  bio?: string | null;
  yearsExperience?: number | null;
  photoUrl?: string | null;
};

export type PublicFaq = {
  question: string;
  answer: string;
};

export type TemplateRuntime = {
  bookingHref: string;
  previewMode?: boolean;
};

export type BaseTemplateData = TemplateRuntime & {
  businessName: string;
  tagline: string;
  template: string;
  heroDescription: string;
  heroCardText: string;
  aboutText: string;
  heroPhotoUrl: string | null;
  logoUrl: string | null;
  galleryPhotoUrls: string[];
  primaryColor: string;
  secondaryColor?: string | null;
  sectionOrder: string[];
  showTeam: boolean;
  showFaq: boolean;
  showServicePrices: boolean;
  services: PublicService[];
  staff: PublicStaffMember[];
  faqs?: PublicFaq[];
  phone?: string;
  address?: string;
  city?: string;
  instagram?: string;
  whatsapp?: string;
  timezone: string;
  language: PublicSiteLanguage;
};

export type SalonTemplateData = BaseTemplateData & {
  vertical: "salon";
};

export type ClinicTemplateData = BaseTemplateData & {
  vertical: "clinic";
};

export type TemplateData = SalonTemplateData | ClinicTemplateData;
