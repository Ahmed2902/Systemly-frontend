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
  role: "Staff" | "Receptionist";
  jobTitle?: string;
  bio?: string;
  yearsExperience?: number;
  photoUrl?: string;
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
  aboutText: string;
  heroPhotoUrl: string | null;
  logoUrl: string | null;
  galleryPhotoUrls: string[];
  primaryColor: string;
  sectionOrder: string[];
  showTeam: boolean;
  showFaq: boolean;
  instagram: string;
  whatsapp: string;
  faqs: WizardFaq[];
};
