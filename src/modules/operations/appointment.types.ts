export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_business"
  | "cancelled_by_customer"
  | "no_show";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  serviceIds?: string[]; // optional array of service IDs that this staff member can perform
  availability?: AvailabilityEntry[];
  availabilityOverrides?: AvailabilityOverride[];
}

export interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakAfterMin?: number | null;
}

export interface AvailabilityOverride {
  id: string;
  overrideDate: string;
  isDayOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  defaultDurationMinutes: number;
  defaultPrice: number; // cents
}

export interface CustomLineItem {
  id: string;
  description: string;
  price: number; // cents
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  visits: number;
  noShows: number;
}

export interface AppointmentSegment {
  id: string;
  appointmentId: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startsAt: string; // ISO 8601
  endsAt: string; // ISO 8601
  price: number; // cents
  segmentIndex: number; // 1-based position within the appointment
  segmentCount: number; // total segments in the appointment
}

export interface AppointmentSummary {
  id: string;
  date: string; // YYYY-MM-DD
  customer: CustomerProfile;
  status: AppointmentStatus;
  /** true once Complete or Collect Payment has fired — freezes the record */
  isLocked: boolean;
  isPaid: boolean;
  segments: AppointmentSegment[];
  customItems: CustomLineItem[];
  discount: number; // cents, flat
  notes?: string;
  clinicVisitRecord?: ClinicVisitRecord | null;
}

export interface ClinicVisitRecord {
  notes?: string | null;
  diagnosis?: string | null;
  prescriptionJson?: Record<string, unknown> | null;
}

export interface StaffBreak {
  id: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  label?: string;
}

export interface CalendarDayData {
  date: string;
  timezone: string;
  staff: StaffMember[];
  appointments: AppointmentSummary[];
  breaks: StaffBreak[];
}
