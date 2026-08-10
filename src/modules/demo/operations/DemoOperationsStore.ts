import type { BackendAppointment } from "@/shared/lib/Calendar/adapter";
import type { OperationsVertical } from "@/modules/operations/runtime/operations-runtime";
import {
  cloneDemoState,
  createDemoOperationsState,
  type DemoOperationsState,
} from "./demo-fixtures";

const PUBLIC_BOOKINGS_KEY = "systemly-demo-public-bookings-v1";

const PUBLIC_WEBSITE_STAFF_NAMES: Record<OperationsVertical, string[]> = {
  salon: [
    "Nour Khalil",
    "Mona Adel",
    "Salma Tarek",
    "Yasmine Ali",
    "Dina Magdy",
  ],
  clinic: [
    "Dr. Mariam Hassan",
    "Dr. Omar Fathy",
    "Dr. Lina Hassan",
    "Dr. Farah Nabil",
    "Youssef Adel",
  ],
};

type PublicDemoBooking = {
  id: string;
  vertical: OperationsVertical;
  customerName: string;
  customerPhone: string;
  serviceIndex: number;
  serviceName?: string;
  staffIndex: number;
  staffName?: string;
  startsAt: string;
};

function createAlignedDemoState(vertical: OperationsVertical) {
  const state = createDemoOperationsState(vertical);
  const names = PUBLIC_WEBSITE_STAFF_NAMES[vertical];
  state.staff.forEach((member, index) => {
    if (names[index]) member.name = names[index];
  });
  return state;
}

function readPublicBookings(): PublicDemoBooking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      window.sessionStorage.getItem(PUBLIC_BOOKINGS_KEY) || "[]",
    ) as PublicDemoBooking[];
  } catch {
    return [];
  }
}

function removePublicBookingsForVertical(vertical: OperationsVertical) {
  if (typeof window === "undefined") return;
  const remaining = readPublicBookings().filter(
    (booking) => booking.vertical !== vertical,
  );
  if (remaining.length > 0) {
    window.sessionStorage.setItem(PUBLIC_BOOKINGS_KEY, JSON.stringify(remaining));
  } else {
    window.sessionStorage.removeItem(PUBLIC_BOOKINGS_KEY);
  }
}

export class DemoOperationsStore {
  private readonly vertical: OperationsVertical;
  private initialState: DemoOperationsState;
  private state: DemoOperationsState;
  private counters = new Map<string, number>();

  constructor(vertical: OperationsVertical) {
    this.vertical = vertical;
    this.initialState = createAlignedDemoState(vertical);
    this.state = cloneDemoState(this.initialState);
  }

  read() {
    return this.state;
  }

  mutate(mutator: (state: DemoOperationsState) => void) {
    mutator(this.state);
  }

  syncPublicBookings() {
    const records = readPublicBookings();

    for (const record of records.filter((item) => item.vertical === this.vertical)) {
      if (this.state.appointments.some((item) => item.id === record.id)) continue;
      const service = this.state.services[record.serviceIndex] ?? this.state.services[0];
      const member = this.state.staff[record.staffIndex] ?? this.state.staff[0];
      if (!service || !member) continue;

      let customer = this.state.customers.find(
        (item) => item.phone.replace(/\D/g, "") === record.customerPhone.replace(/\D/g, ""),
      );
      if (!customer) {
        const now = new Date().toISOString();
        customer = {
          id: `public-customer-${record.id}`,
          businessId: "demo-business",
          name: record.customerName,
          phone: record.customerPhone,
          email: null,
          acquisitionSource: "Website demo",
          notes: null,
          createdAt: now,
          updatedAt: now,
        };
        this.state.customers.unshift(customer);
      }

      const start = new Date(record.startsAt);
      const end = new Date(start.getTime() + Number(service.durationMin) * 60_000);
      const appointment: BackendAppointment = {
        id: record.id,
        startsAt: start.toISOString(),
        status: "confirmed",
        customerId: customer.id,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          visitCount: 0,
          noShowCount: 0,
        },
        discountCents: 0,
        notes: "Booked through the interactive public website demo.",
        customItems: [],
        clinicVisitRecord: this.vertical === "clinic" ? {} : null,
        appointmentServices: [
          {
            id: `public-segment-${record.id}`,
            serviceId: service.id,
            staffId: member.id,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            priceEgpSnapshot: Number(service.priceEgp),
            service: { name: record.serviceName || service.name },
          },
        ],
      };
      this.state.appointments.push(appointment);
    }
  }

  reset() {
    removePublicBookingsForVertical(this.vertical);
    this.initialState = createAlignedDemoState(this.vertical);
    this.state = cloneDemoState(this.initialState);
    this.counters.clear();
  }

  nextId(prefix: string) {
    const next = (this.counters.get(prefix) ?? 100) + 1;
    this.counters.set(prefix, next);
    return `${prefix}-${next}`;
  }
}
