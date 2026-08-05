export type StepProps = {
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export type WizardService = {
  clientId: string;
  name: string;
  category?: string;
  description?: string;
  durationMin: number;
  priceEgp: number;
};

export type AvailabilityEntry = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type WizardStaffMember = {
  id: string;
  clientId: string;
  name: string;
  role: string;
  jobTitle?: string;
  bio?: string;
  yearsExperience?: number;
  photoUrl?: string;
  photoObjectPath?: string;
  serviceIds: string[];
  availability: AvailabilityEntry[];
};

export type WizardFaq = {
  clientId: string;
  question: string;
  answer: string;
};

export type WizardState = {
  vertical: "salon" | "clinic" | null;
  template: string;
  name: string;
  slug: string;
  phone: string;
  city: string;
  address: string;
  timezone: string;
  language: "en" | "ar";
  services: WizardService[];
  staff: WizardStaffMember[];
  tagline: string;
  heroDescription: string;
  heroCardText: string;
  aboutText: string;
  heroPhotoUrl: string | null;
  heroPhotoObjectPath: string | null;
  logoUrl: string | null;
  logoObjectPath: string | null;
  galleryPhotoUrls: string[];
  galleryPhotoObjectPaths: string[];
  primaryColor: string;
  sectionOrder: string[];
  showTeam: boolean;
  showFaq: boolean;
  showServicePrices: boolean;
  instagram: string;
  whatsapp: string;
  faqs: WizardFaq[];
};
