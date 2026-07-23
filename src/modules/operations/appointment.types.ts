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
  serviceIds?: string[];
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
  defaultPrice: number;
}

export interface CustomLineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
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
  startsAt: string;
  endsAt: string;
  price: number;
  segmentIndex: number;
  segmentCount: number;
}

export interface AppointmentSummary {
  id: string;
  date: string;
  customer: CustomerProfile;
  status: AppointmentStatus;
  isLocked: boolean;
  isPaid: boolean;
  segments: AppointmentSegment[];
  customItems: CustomLineItem[];
  discount: number;
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
