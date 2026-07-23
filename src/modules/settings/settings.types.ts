export type WebsiteSettings = {
  tagline: string | null;
  aboutText: string | null;
  template: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  font: string | null;
  showTeam: boolean;
  showFaq: boolean;
  showReviews: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
};

export type SettingsWorkspace = {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  phone: string;
  address: string | null;
  city: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  timezone: string;
  language: "en" | "ar";
  isActive: boolean;
  websiteContent: WebsiteSettings | null;
};

export type BusinessSettingsInput = {
  name: string;
  phone: string;
  address: string | null;
  city: string | null;
  timezone: string;
  language: "en" | "ar";
};

export type WebsiteSettingsInput = WebsiteSettings;
export type BrandingKind = "logo" | "cover";
