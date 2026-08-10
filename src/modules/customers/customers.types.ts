export type CustomerFilter =
  | "all"
  | "upcoming"
  | "no_upcoming"
  | "no_shows"
  | "recent";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_business"
  | "cancelled_by_customer"
  | "no_show";

export type BookingChannel =
  | "UNKNOWN"
  | "WEBSITE"
  | "FRONT_DESK"
  | "WHATSAPP"
  | "PHONE"
  | "OTHER";

export type CustomerGender = "male" | "female";

export interface CustomerProfile {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string | null;
  dateOfBirth?: string | null;
  gender?: CustomerGender | null;
  acquisitionSource: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListItem extends CustomerProfile {
  visits: number;
  noShows: number;
  lastVisitAt: string | null;
  nextAppointment: {
    id: string;
    startsAt: string;
    status: AppointmentStatus;
  } | null;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  total: number;
  page: number;
  perPage: number;
}

export interface CustomerAppointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  bookingChannel: BookingChannel;
  invoice: { status: string } | null;
  appointmentServices: Array<{
    id: string;
    startsAt: string;
    endsAt: string;
    service: { id: string; name: string };
    staff: { id: string; name: string };
  }>;
}

export interface CustomerClinicalHistoryEntry {
  appointmentId: string;
  startsAt: string;
  endsAt: string;
  status: "completed";
  services: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
  diagnosisAssessment: string | null;
  clinicalSessionNotes: string | null;
  planAndPrescription: string | null;
}

export interface CustomerWorkspaceResponse {
  customer: CustomerProfile;
  stats: {
    visits: number;
    noShows: number;
    lastVisitAt: string | null;
    nextAppointmentAt: string | null;
  };
  upcoming: CustomerAppointment[];
  history: CustomerAppointment[];
  historyHasMore?: boolean;
  clinicalHistory?: CustomerClinicalHistoryEntry[];
}

export interface CustomerInput {
  name: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: CustomerGender | null;
  acquisitionSource?: string | null;
  notes?: string | null;
}
