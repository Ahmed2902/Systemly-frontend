export type StaffRole =
  | "SuperAdmin"
  | "BusinessAdmin"
  | "Staff"
  | "Receptionist";

export type StaffStatusFilter = "all" | "active" | "inactive";
export type CommissionType = "NONE" | "FLAT" | "PERCENT";
export type StaffTimeOffType = "VACATION" | "SICK" | "PERSONAL" | "OTHER";

export interface StaffServiceSummary {
  id: string;
  name: string;
  category?: string | null;
  durationMin?: number;
  isActive: boolean;
  priceEgp?: number;
  commissionType?: CommissionType;
  commissionAmount?: number;
}

export interface StaffTimeOff {
  id: string;
  startsOn: string;
  endsOn: string;
  type: StaffTimeOffType;
  label?: string | null;
  notes?: string | null;
}

export interface StaffDirectoryItem {
  id: string;
  name: string;
  role: StaffRole;
  jobTitle?: string | null;
  yearsExperience?: number | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  availableToday: boolean;
  workingDays: number[];
  currentTimeOff?: StaffTimeOff | null;
  services: StaffServiceSummary[];
  updatedAt: string;
}

export interface StaffServiceOption {
  id: string;
  name: string;
  category?: string | null;
  durationMin?: number;
  isActive: boolean;
  priceEgp?: number;
}

export interface StaffDirectoryResponse {
  items: StaffDirectoryItem[];
  total: number;
  page: number;
  perPage: number;
  metrics: {
    total: number;
    active: number;
    availableToday: number;
    onTimeOff: number;
  };
  serviceOptions: StaffServiceOption[];
  canManageMoney: boolean;
  canManageProtectedFields: boolean;
}

export interface StaffAvailabilityEntry {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakAfterMin?: number | null;
}

export interface StaffAvailabilityOverride {
  id: string;
  overrideDate: string;
  isDayOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface StaffBreak {
  id: string;
  breakDate: string;
  startTime: string;
  endTime: string;
  label?: string | null;
}

export interface StaffUpcomingAppointment {
  segmentId: string;
  appointmentId: string;
  status: string;
  startsAt: string;
  endsAt: string;
  service: { id: string; name: string };
  customer: { id: string; name: string; phone: string };
}

export interface StaffWorkspaceResponse {
  staff: Omit<
    StaffDirectoryItem,
    "availableToday" | "workingDays" | "currentTimeOff" | "services"
  > & {
    createdAt: string;
  };
  services: StaffServiceSummary[];
  availability: StaffAvailabilityEntry[];
  overrides: StaffAvailabilityOverride[];
  breaks: StaffBreak[];
  timeOff: StaffTimeOff[];
  upcomingAppointments: StaffUpcomingAppointment[];
  serviceOptions: StaffServiceOption[];
  canManageMoney: boolean;
  canManageProtectedFields: boolean;
}

export interface StaffProfileInput {
  name: string;
  role: StaffRole;
  jobTitle?: string;
  yearsExperience?: number | null;
  bio?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  isActive: boolean;
  serviceIds: string[];
}

export interface StaffTimeOffInput {
  startsOn: string;
  endsOn: string;
  type: StaffTimeOffType;
  label?: string;
  notes?: string;
}

export interface StaffBreakInput {
  breakDate: string;
  startTime: string;
  endTime: string;
  label?: string;
}
