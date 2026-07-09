// src/modules/wizard/wizard.types.ts

export type StepProps = {
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export type WizardService = {
  clientId: string;
  name: string;
  durationMin: number;
  priceEgp: number;
  category?: string;
};

export type WizardStaffMember = {
  id: string;
  clientId: string;
  name: string;
  role: string;
  serviceIds: string[]; // WizardService.clientId references
  photoUrl?: string | null;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
};

export type WizardFaq = { clientId: string; question: string; answer: string };

export type WizardState = {
  vertical: "salon" | "clinic" | null;
  name: string;
  slug: string;
  phone: string;
  city: string;
  address: string;

  services: WizardService[];
  staff: WizardStaffMember[];

  tagline: string;
  aboutText: string;
  heroPhotoUrl: string | null;
  galleryPhotoUrls: string[];
  primaryColor: string;
  sectionOrder: string[];
  showTeam: boolean;
  showFaq: boolean;

  faqs: WizardFaq[];
};
