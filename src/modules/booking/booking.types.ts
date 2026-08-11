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
  branchId: string;
  services: BookingService[];
  staff: BookingStaff[];

  selectedServiceIds: string[];
  staffChoices: Record<string, string | "any">;

  date: string;
  selectedSlot: AvailableSlot | null;

  customerName: string;
  customerPhone: string;
  dateOfBirth: string;
  gender: "" | "male" | "female";
  notes: string;
};

export type StepProps = {
  onNext: () => void;
  onBack: () => void;
};
