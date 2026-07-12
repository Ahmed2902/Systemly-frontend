export type ServiceSelection = {
  serviceId: string;
  staffId?: string; // undefined = "any eligible staff"
};

export type BookingService = {
  id: string;
  name: string;
  category?: string;
  priceEgp: number;
  durationMin: number;
  staffIds: string[];
};

export type BookingStaff = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string | null;
};

export type SlotAssignment = {
  serviceId: string;
  staffId: string;
};

export type AvailableSlot = {
  time: string; // ISO
  display: string; // "HH:mm"
  assignments: SlotAssignment[];
};

export type BookingState = {
  businessId: string;
  services: BookingService[]; // full catalog, passed in from server
  staff: BookingStaff[]; // full roster, passed in from server

  selectedServiceIds: string[];
  staffChoices: Record<string, string | "any">; // serviceId -> staffId | "any"

  date: string; // "YYYY-MM-DD"
  selectedSlot: AvailableSlot | null;

  customerName: string;
  customerPhone: string;
  notes: string;
};

export type StepProps = {
  onNext: () => void;
  onBack: () => void;
};
