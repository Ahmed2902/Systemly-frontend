import type { CustomerProfile } from "@/modules/customers/customers.types";
import type { InvoiceDetail, PaymentMethod } from "@/modules/invoices/invoices.types";
import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";
import type { CatalogService, ServiceCatalogResponse } from "@/modules/services/services.types";
import type { SettingsWorkspace } from "@/modules/settings/settings.types";
import type {
  StaffAvailabilityEntry,
  StaffAvailabilityOverride,
  StaffBreak,
  StaffDirectoryItem,
  StaffTimeOff,
} from "@/modules/staff/staff.types";
import type { BackendAppointment, BackendBreak } from "@/shared/lib/Calendar/adapter";

export const DEMO_TIMEZONE = "Africa/Cairo";
export const DEMO_BUSINESS_ID = "demo-business";

export type DemoStoredStaff = StaffDirectoryItem & {
  availability: StaffAvailabilityEntry[];
  overrides: StaffAvailabilityOverride[];
  breaks: StaffBreak[];
  timeOff: StaffTimeOff[];
};

export type DemoOperationsState = {
  vertical: OperationsVertical;
  businessName: string;
  settings: SettingsWorkspace;
  services: CatalogService[];
  staff: DemoStoredStaff[];
  customers: CustomerProfile[];
  appointments: BackendAppointment[];
  invoices: InvoiceDetail[];
};

const SALON_SERVICES = [
  ["Haircut & blow-dry", "Hair", 60, 450],
  ["Gel manicure", "Nails", 45, 320],
  ["Signature facial", "Skin", 60, 700],
  ["Lash extensions", "Lashes", 90, 900],
  ["Bridal styling", "Bridal", 120, 1800],
  ["Hair colouring", "Hair", 120, 1200],
] as const;
const CLINIC_SERVICES = [
  ["Dental consultation", "Dental", 30, 600],
  ["Teeth cleaning", "Dental", 45, 900],
  ["Teeth whitening", "Dental", 60, 2500],
  ["Dermatology consultation", "Skin", 30, 800],
  ["Laser session", "Skin", 45, 1200],
  ["Follow-up visit", "Follow-up", 20, 400],
] as const;
const SALON_STAFF = [
  ["Nour Khalil", "Senior hair stylist"],
  ["Mona Adel", "Nail artist"],
  ["Lina Hassan", "Skin specialist"],
  ["Farah Samir", "Lash artist"],
  ["Dina Magdy", "Colour specialist"],
] as const;
const CLINIC_STAFF = [
  ["Dr. Mariam Hassan", "Dentist"],
  ["Dr. Omar Nabil", "Dermatologist"],
  ["Dr. Salma Tarek", "Dentist"],
  ["Aya Mostafa", "Dental assistant"],
  ["Youssef Adel", "Laser specialist"],
] as const;
const CUSTOMER_NAMES = [
  "Mariam Adel", "Yasmine Ali", "Salma Tarek", "Farida Ahmed",
  "Nada Hany", "Habiba Samir", "Reem Mostafa", "Dalia Nabil",
  "Hana Karim", "Laila Amr", "Aya Mahmoud", "Nouran Khaled",
] as const;

export function cloneDemoState(state: DemoOperationsState): DemoOperationsState {
  return structuredClone(state);
}

export function createDemoOperationsState(
  vertical: OperationsVertical,
  now = new Date(),
): DemoOperationsState {
  const services = createServices(vertical, now);
  const staff = createStaff(vertical, services, now);
  const customers = createCustomers(now);
  const appointments = createAppointments(vertical, services, staff, customers, now);
  const settings = createSettings(vertical);
  const state: DemoOperationsState = {
    vertical,
    businessName: settings.name,
    settings,
    services,
    staff,
    customers,
    appointments,
    invoices: [],
  };
  state.invoices = appointments
    .filter((appointment) => appointment.invoice?.status === "paid")
    .map((appointment, index) => createInvoice(state, appointment, index));
  return state;
}

export function toServiceCatalogResponse(state: DemoOperationsState): ServiceCatalogResponse {
  const categoryNames = [...new Set(state.services.map((item) => item.category || "Other"))];
  return {
    items: state.services,
    categories: categoryNames.map((name) => {
      const services = state.services.filter((item) => (item.category || "Other") === name);
      return {
        name,
        value: name,
        total: services.length,
        active: services.filter((item) => item.isActive).length,
        services: services.map(({ id, name: serviceName, category, durationMin, priceEgp, isActive }) => ({
          id, name: serviceName, category, durationMin, priceEgp, isActive,
        })),
      };
    }),
    staff: state.staff.map(({ id, name, photoUrl, isActive }) => ({ id, name, photoUrl, isActive })),
    canManageMoney: true,
    total: state.services.length,
    activeTotal: state.services.filter((item) => item.isActive).length,
  };
}

export function toCalendarBreaks(state: DemoOperationsState, date: string): BackendBreak[] {
  return state.staff.flatMap((member) => member.breaks
    .filter((item) => item.breakDate === date)
    .map((item) => ({
      id: item.id,
      staffId: member.id,
      startTime: item.startTime,
      endTime: item.endTime,
      label: item.label ?? undefined,
    })));
}

function createSettings(vertical: OperationsVertical): SettingsWorkspace {
  const clinic = vertical === "clinic";
  return {
    id: DEMO_BUSINESS_ID,
    name: clinic ? "Clarity Dental & Skin Clinic" : "Aura Beauty Lounge",
    slug: clinic ? "clarity-clinic-demo" : "aura-beauty-demo",
    vertical,
    phone: clinic ? "+20 2 2456 7721" : "+20 100 555 0199",
    address: clinic ? "18 El Merghany Street" : "90 Point Mall, Fifth Settlement",
    city: clinic ? "Heliopolis" : "New Cairo",
    logoUrl: null,
    coverUrl: null,
    timezone: DEMO_TIMEZONE,
    language: "en",
    isActive: true,
    websiteContent: {
      tagline: clinic ? "Thoughtful dental and dermatology care" : "Beauty, wellness, and confidence in one place",
      aboutText: clinic ? "A modern multidisciplinary clinic with clear treatment plans." : "A premium beauty lounge for hair, nails, skin, lashes, and bridal services.",
      template: clinic ? "clinic-clarity" : "aura-wellness",
      primaryColor: clinic ? "#0B6B68" : "#5E1836",
      secondaryColor: clinic ? "#D7EFEB" : "#E9D8DF",
      font: null,
      showTeam: true,
      showFaq: true,
      showReviews: true,
      metaTitle: clinic ? "Clarity Clinic" : "Aura Beauty Lounge",
      metaDescription: "Fictional Systemly demonstration business.",
      instagramUrl: clinic ? null : "https://instagram.com/systemly.demo",
      whatsappNumber: "+201005550199",
    },
  };
}

function createServices(vertical: OperationsVertical, now: Date): CatalogService[] {
  const source = vertical === "clinic" ? CLINIC_SERVICES : SALON_SERVICES;
  return source.map(([name, category, durationMin, priceEgp], index) => ({
    id: `service-${index + 1}`,
    name,
    description: vertical === "clinic" ? "Professional care with documented follow-up." : "A premium service tailored to the customer.",
    category,
    durationMin,
    priceEgp,
    isActive: true,
    eligibleStaff: [],
    createdAt: offset(now, -180),
    updatedAt: offset(now, -index),
  }));
}

function createStaff(vertical: OperationsVertical, services: CatalogService[], now: Date): DemoStoredStaff[] {
  const source = vertical === "clinic" ? CLINIC_STAFF : SALON_STAFF;
  const date = cairoDate(now);
  return source.map(([name, jobTitle], index) => {
    const assigned = services.filter((_, serviceIndex) => serviceIndex % source.length === index || serviceIndex === index || (index === 0 && serviceIndex === 5));
    const availability = [0, 1, 2, 3, 4, 6].map((dayOfWeek) => ({
      id: `availability-${index + 1}-${dayOfWeek}`,
      dayOfWeek,
      startTime: "09:00",
      endTime: index % 2 ? "19:00" : "18:00",
      breakAfterMin: null,
    }));
    return {
      id: `staff-${index + 1}`,
      name,
      role: "Staff",
      jobTitle,
      yearsExperience: 3 + index * 2,
      bio: `Experienced ${jobTitle.toLowerCase()} focused on a comfortable customer experience.`,
      phone: `+20 10${index + 1} 555 01${index + 10}`,
      email: `staff${index + 1}@demo.systemly.test`,
      photoUrl: null,
      isActive: true,
      availableToday: true,
      workingDays: availability.map((item) => item.dayOfWeek),
      currentTimeOff: null,
      services: assigned.map((service) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        durationMin: service.durationMin,
        isActive: service.isActive,
        priceEgp: service.priceEgp,
        commissionType: "PERCENT",
        commissionAmount: 10 + index,
      })),
      updatedAt: offset(now, -index),
      availability,
      overrides: [] as StaffAvailabilityOverride[],
      breaks: index < 3 ? [{ id: `break-${index + 1}`, breakDate: date, startTime: "13:00", endTime: "13:30", label: "Lunch" }] : [],
      timeOff: [] as StaffTimeOff[],
    };
  });
}

function createCustomers(now: Date): CustomerProfile[] {
  return CUSTOMER_NAMES.map((name, index) => ({
    id: `customer-${index + 1}`,
    businessId: DEMO_BUSINESS_ID,
    name,
    phone: `+20 10${index % 3} 555 ${String(1000 + index).slice(-4)}`,
    email: index % 3 === 0 ? `customer${index + 1}@example.test` : null,
    acquisitionSource: ["Instagram", "Referral", "WhatsApp", "Walk-in"][index % 4],
    notes: index % 4 === 0 ? "Prefers afternoon appointments." : null,
    createdAt: offset(now, -120 + index * 7),
    updatedAt: offset(now, -index),
  }));
}

function createAppointments(
  vertical: OperationsVertical,
  services: CatalogService[],
  staff: DemoStoredStaff[],
  customers: CustomerProfile[],
  now: Date,
): BackendAppointment[] {
  const statuses = ["confirmed", "confirmed", "in_progress", "completed", "completed", "completed", "pending", "no_show", "cancelled_by_customer", "completed", "confirmed", "completed"];
  const times = ["09:00", "09:30", "10:15", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "10:00", "13:30", "18:00"];
  return customers.flatMap((customer, index) => {
    if (customer.name === "Nada Hany" || customer.name === "Habiba Samir") {
      return [];
    }

    const dayOffset = index < 9 ? 0 : index - 10;
    const serviceIndexes = index === 1 ? [1, 2] : [index % services.length];
    let cursor = cairoIso(now, dayOffset, times[index]);
    const appointmentServices = serviceIndexes.map((serviceIndex, segmentIndex) => {
      const service = services[serviceIndex];
      const member = staff.find((item) => item.services.some((assigned) => assigned.id === service.id)) ?? staff[segmentIndex % staff.length];
      const startsAt = cursor;
      const endsAt = addMinutes(startsAt, service.durationMin);
      cursor = endsAt;
      return {
        id: `segment-${index + 1}-${segmentIndex + 1}`,
        serviceId: service.id,
        staffId: member.id,
        startsAt,
        endsAt,
        priceEgpSnapshot: service.priceEgp,
        service: { name: service.name },
      };
    });
    const completed = statuses[index] === "completed";
    const clinicVisitRecord = vertical === "clinic" && completed
      ? {
          diagnosisAssessment: index % 2 ? "Mild sensitivity; no acute findings." : "Routine assessment completed.",
          clinicalSessionNotes: "Procedure was well tolerated. Findings documented for the next visit.",
          planAndPrescription: index % 2 ? "Follow up in four weeks." : "Routine follow-up in six months.",
        }
      : vertical === "clinic" ? {} : null;
    return {
      id: `appointment-${index + 1}`,
      startsAt: appointmentServices[0]?.startsAt,
      status: statuses[index],
      invoice: completed && index % 3 !== 1 ? { status: "paid" } : undefined,
      customerId: customer.id,
      customer: { id: customer.id, name: customer.name, phone: customer.phone, visitCount: Math.max(0, index % 6), noShowCount: index === 7 ? 1 : 0 },
      discountCents: index === 5 ? 5000 : 0,
      notes: index % 4 === 0 ? "Customer requested a quiet appointment." : "",
      customItems: index === 4 ? [{ id: "custom-1", description: vertical === "clinic" ? "After-care kit" : "Hair treatment ampoule", quantity: 1, priceCents: 15000 }] : [],
      clinicVisitRecord,
      appointmentServices,
    };
  });
}

function createInvoice(state: DemoOperationsState, appointment: BackendAppointment, index: number): InvoiceDetail {
  const customer = state.customers.find((item) => item.id === appointment.customerId) ?? state.customers[0];
  const segments = appointment.appointmentServices ?? [];
  const lineItems = segments.map((segment, lineIndex) => {
    const service = state.services.find((item) => item.id === segment.serviceId);
    const member = state.staff.find((item) => item.id === segment.staffId);
    const amount = Math.round(Number(segment.priceEgpSnapshot ?? 0) * 100);
    return {
      id: `invoice-line-${index + 1}-${lineIndex + 1}`,
      description: service?.name ?? "Service",
      quantity: 1,
      unitPriceCents: amount,
      totalCents: amount,
      service: service ? { id: service.id, name: service.name } : null,
      staff: member ? { id: member.id, name: member.name } : null,
    };
  });
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0);
  const issuedAt = segments[0]?.startsAt ?? new Date().toISOString();
  const paymentMethod: PaymentMethod = index % 2 ? "CARD" : "CASH";
  return {
    id: `invoice-${index + 1}`,
    invoiceNumber: `SYS-${String(1040 + index).padStart(5, "0")}`,
    status: "paid",
    issuedAt,
    paidAt: issuedAt,
    voidedAt: null,
    paymentMethod,
    totalCents: Math.max(0, subtotalCents - (appointment.discountCents ?? 0)),
    currency: "EGP",
    customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email },
    appointment: { id: appointment.id, startsAt: segments[0]?.startsAt ?? issuedAt, endsAt: segments.at(-1)?.endsAt ?? issuedAt, status: appointment.status, bookingChannel: "FRONT_DESK" },
    services: lineItems.map((item) => item.description),
    subtotalCents,
    discountCents: appointment.discountCents ?? 0,
    taxCents: 0,
    notes: null,
    paymentReference: null,
    voidReason: null,
    business: { id: state.settings.id, name: state.settings.name, logoUrl: null, timezone: DEMO_TIMEZONE },
    paidBy: { id: "demo-owner", name: "Demo Owner" },
    voidedBy: null,
    lineItems,
  };
}

function cairoDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DEMO_TIMEZONE }).format(value);
}
function cairoIso(now: Date, dayOffset: number, time: string) {
  const midday = new Date(`${cairoDate(now)}T12:00:00Z`);
  midday.setUTCDate(midday.getUTCDate() + dayOffset);
  const date = midday.toISOString().slice(0, 10);
  const [hour, minute] = time.split(":").map(Number);
  let guess = new Date(`${date}T${time}:00Z`);
  for (let i = 0; i < 2; i += 1) {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: DEMO_TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(guess);
    const actual = Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    guess = new Date(guess.getTime() + (hour * 60 + minute - actual) * 60_000);
  }
  return guess.toISOString();
}
function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}
function offset(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000).toISOString();
}
