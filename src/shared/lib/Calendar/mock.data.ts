import type {
  CalendarDayData,
  ServiceCatalogItem,
} from "../../../modules/operations/appointment.types";

const DATE = new Date().toISOString().slice(0, 10);

export const mockServiceCatalog: ServiceCatalogItem[] = [
  {
    id: "svc-1",
    name: "Initial Consultation",
    defaultDurationMinutes: 45,
    defaultPrice: 15000,
  },
  {
    id: "svc-2",
    name: "Dermatological Assessment",
    defaultDurationMinutes: 30,
    defaultPrice: 15000,
  },
  {
    id: "svc-3",
    name: "Laser Prep Routine",
    defaultDurationMinutes: 30,
    defaultPrice: 0,
  },
  {
    id: "svc-4",
    name: "Clinical Consult",
    defaultDurationMinutes: 60,
    defaultPrice: 20000,
  },
  {
    id: "svc-5",
    name: "Mobility Training",
    defaultDurationMinutes: 60,
    defaultPrice: 18000,
  },
  {
    id: "svc-6",
    name: "Adjustments",
    defaultDurationMinutes: 45,
    defaultPrice: 12000,
  },
  {
    id: "svc-7",
    name: "Follow-up Exam",
    defaultDurationMinutes: 30,
    defaultPrice: 10000,
  },
];

export const mockCalendarDay: CalendarDayData = {
  timezone: "Africa/Cairo",
  date: DATE,
  staff: [
    { id: "staff-1", name: "Dr. Alaric Smith", role: "Physician" },
    { id: "staff-2", name: "Sarah Jenkins", role: "Physical Therapist" },
    { id: "staff-3", name: "Nurse E. Chen", role: "Nurse" },
    { id: "staff-4", name: "David Wilson", role: "Nurse" },
    { id: "staff-5", name: "Lisa Wong", role: "Audiologist" },
  ],
  breaks: [
    {
      id: "break-1",
      staffId: "staff-1",
      startsAt: `${DATE}T12:00:00`,
      endsAt: `${DATE}T12:30:00`,
      label: "Lunch",
    },
  ],
  appointments: [
    {
      id: "apt-1",
      date: DATE,
      customer: {
        id: "cust-1",
        name: "Michael Robertson",
        phone: "+1 555 010 1111",
        visits: 3,
        noShows: 0,
      },
      status: "confirmed",
      isLocked: false,
      isPaid: false,
      discount: 0,
      customItems: [],
      notes: "",
      segments: [
        {
          id: "seg-1",
          appointmentId: "apt-1",
          serviceId: "svc-1",
          serviceName: "Initial Consultation",
          staffId: "staff-1",
          startsAt: `${DATE}T08:15:00`,
          endsAt: `${DATE}T09:00:00`,
          price: 15000,
          segmentIndex: 1,
          segmentCount: 1,
        },
      ],
    },
    {
      id: "apt-2",
      date: DATE,
      customer: {
        id: "cust-2",
        name: "Marcus Sterling",
        phone: "+1 555 010 2222",
        visits: 12,
        noShows: 0,
      },
      status: "confirmed",
      isLocked: false,
      isPaid: false,
      discount: 0,
      customItems: [],
      notes: "Patient requested a quiet room if possible.",
      segments: [
        {
          id: "seg-2a",
          appointmentId: "apt-2",
          serviceId: "svc-2",
          serviceName: "Dermatological Assessment",
          staffId: "staff-3",
          startsAt: `${DATE}T10:30:00`,
          endsAt: `${DATE}T11:00:00`,
          price: 15000,
          segmentIndex: 1,
          segmentCount: 2,
        },
        {
          id: "seg-2b",
          appointmentId: "apt-2",
          serviceId: "svc-3",
          serviceName: "Laser Prep Routine",
          staffId: "staff-3",
          startsAt: `${DATE}T11:00:00`,
          endsAt: `${DATE}T11:30:00`,
          price: 0,
          segmentIndex: 2,
          segmentCount: 2,
        },
      ],
    },
    {
      id: "apt-3",
      date: DATE,
      customer: {
        id: "cust-3",
        name: "Emma Watson",
        phone: "+1 555 010 3333",
        visits: 5,
        noShows: 1,
      },
      status: "confirmed",
      isLocked: false,
      isPaid: false,
      discount: 0,
      customItems: [],
      notes: "",
      segments: [
        {
          id: "seg-3a",
          appointmentId: "apt-3",
          serviceId: "svc-4",
          serviceName: "Clinical Consult",
          staffId: "staff-1",
          startsAt: `${DATE}T11:00:00`,
          endsAt: `${DATE}T12:00:00`,
          price: 20000,
          segmentIndex: 1,
          segmentCount: 2,
        },
        {
          id: "seg-3b",
          appointmentId: "apt-3",
          serviceId: "svc-5",
          serviceName: "Mobility Training",
          staffId: "staff-2",
          startsAt: `${DATE}T12:00:00`,
          endsAt: `${DATE}T13:00:00`,
          price: 18000,
          segmentIndex: 2,
          segmentCount: 2,
        },
      ],
    },
    {
      id: "apt-4",
      date: DATE,
      customer: {
        id: "cust-4",
        name: "Amanda Huggins",
        phone: "+1 555 010 4444",
        visits: 8,
        noShows: 0,
      },
      status: "completed",
      isLocked: true,
      isPaid: true,
      discount: 0,
      customItems: [],
      notes: "",
      segments: [
        {
          id: "seg-4",
          appointmentId: "apt-4",
          serviceId: "svc-6",
          serviceName: "Adjustments",
          staffId: "staff-4",
          startsAt: `${DATE}T08:00:00`,
          endsAt: `${DATE}T08:45:00`,
          price: 12000,
          segmentIndex: 1,
          segmentCount: 1,
        },
      ],
    },
    {
      id: "apt-5",
      date: DATE,
      customer: {
        id: "cust-5",
        name: "Tom Haverford",
        phone: "+1 555 010 5555",
        visits: 1,
        noShows: 2,
      },
      status: "no_show",
      isLocked: false,
      isPaid: false,
      discount: 0,
      customItems: [],
      notes: "",
      segments: [
        {
          id: "seg-5",
          appointmentId: "apt-5",
          serviceId: "svc-7",
          serviceName: "Follow-up Exam",
          staffId: "staff-5",
          startsAt: `${DATE}T10:00:00`,
          endsAt: `${DATE}T10:30:00`,
          price: 10000,
          segmentIndex: 1,
          segmentCount: 1,
        },
      ],
    },
  ],
};

export async function getCalendarDay(
  _businessId: string,
  _date: string,
): Promise<CalendarDayData> {
  // TODO: fetch(`/api/businesses/${businessId}/calendar?date=${date}`)
  return mockCalendarDay;
}

export async function getServiceCatalog(
  _businessId: string,
): Promise<ServiceCatalogItem[]> {
  // TODO: fetch(`/api/businesses/${businessId}/services`)
  return mockServiceCatalog;
}
