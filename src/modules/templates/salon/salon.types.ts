// src/modules/templates/salon/salon.types.ts

export type SalonTemplateData = {
  businessName: string;
  tagline: string;
  aboutText: string;
  heroPhotoUrl: string | null;
  galleryPhotoUrls: string[];
  primaryColor: string;
  sectionOrder: string[];
  showTeam: boolean;
  showFaq: boolean;
  services: {
    id: string;
    name: string;
    category?: string;
    priceEgp: number;
    durationMin: number;
  }[];
  staff: { id: string; name: string; role: string; photoUrl?: string | null }[];
  faqs?: { question: string; answer: string }[];
  phone?: string;
  address?: string;
};
