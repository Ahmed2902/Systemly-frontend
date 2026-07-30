"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Plus,
  Receipt,
  Search,
  Users,
  X,
} from "lucide-react";
import { CalendarGrid } from "@/modules/operations/components/CalendarGrid";
import { StatusLegend } from "@/modules/operations/components/StatusLegend";
import type {
  AppointmentSummary,
  CalendarDayData,
} from "@/modules/operations/appointment.types";

const DEMO_DATE = "2026-07-27";
const TIMEZONE = "Africa/Cairo";

const staff = [
  { id: "staff-nour", name: "Nour Khalil", role: "Senior stylist" },
  { id: "staff-mona", name: "Mona Adel", role: "Nail technician" },
  { id: "staff-lina", name: "Dr. Lina Hassan", role: "Dermatologist" },
];

const appointments: AppointmentSummary[] = [
  {
    id: "appt-1",
    date: DEMO_DATE,
    customer: {
      id: "customer-1",
      name: "Mariam Adel",
      phone: "+20 100 555 0101",
      visits: 7,
      noShows: 0,
    },
    status: "confirmed",
    isLocked: false,
    isPaid: false,
    discount: 0,
    customItems: [],
    segments: [
      {
        id: "segment-1",
        appointmentId: "appt-1",
        serviceId: "service-1",
        serviceName: "Haircut & blow-dry",
        staffId: "staff-nour",
        startsAt: "2026-07-27T09:00:00.000Z",
        endsAt: "2026-07-27T10:00:00.000Z",
        price: 45000,
        segmentIndex: 1,
        segmentCount: 1,
      },
    ],
  },
  {
    id: "appt-2",
    date: DEMO_DATE,
    customer: {
      id: "customer-2",
      name: "Yasmine Ali",
      phone: "+20 111 222 0303",
      visits: 11,
      noShows: 1,
    },
    status: "in_progress",
    isLocked: false,
    isPaid: false,
    discount: 0,
    customItems: [],
    segments: [
      {
        id: "segment-2a",
        appointmentId: "appt-2",
        serviceId: "service-2",
        serviceName: "Gel manicure",
        staffId: "staff-mona",
        startsAt: "2026-07-27T09:30:00.000Z",
        endsAt: "2026-07-27T10:15:00.000Z",
        price: 32000,
        segmentIndex: 1,
        segmentCount: 2,
      },
      {
        id: "segment-2b",
        appointmentId: "appt-2",
        serviceId: "service-3",
        serviceName: "Skin consultation",
        staffId: "staff-lina",
        startsAt: "2026-07-27T10:30:00.000Z",
        endsAt: "2026-07-27T11:15:00.000Z",
        price: 70000,
        segmentIndex: 2,
        segmentCount: 2,
      },
    ],
  },
  {
    id: "appt-3",
    date: DEMO_DATE,
    customer: {
      id: "customer-3",
      name: "Salma Tarek",
      phone: "+20 122 777 0404",
      visits: 3,
      noShows: 0,
    },
    status: "completed",
    isLocked: true,
    isPaid: true,
    discount: 0,
    customItems: [],
    segments: [
      {
        id: "segment-3",
        appointmentId: "appt-3",
        serviceId: "service-4",
        serviceName: "Skin follow-up",
        staffId: "staff-lina",
        startsAt: "2026-07-27T11:30:00.000Z",
        endsAt: "2026-07-27T12:00:00.000Z",
        price: 45000,
        segmentIndex: 1,
        segmentCount: 1,
      },
    ],
  },
];

const calendarData: CalendarDayData = {
  date: DEMO_DATE,
  timezone: TIMEZONE,
  staff,
  appointments,
  breaks: [
    {
      id: "break-1",
      staffId: "staff-nour",
      startsAt: "2026-07-27T10:30:00.000Z",
      endsAt: "2026-07-27T11:00:00.000Z",
      label: "Break",
    },
  ],
};

const customers = appointments.map((appointment) => appointment.customer);
const invoices = [
  {
    id: "invoice-1",
    number: "INV-1047",
    customer: "Salma Tarek",
    services: "Skin follow-up",
    amount: 45000,
    status: "Paid",
  },
  {
    id: "invoice-2",
    number: "INV-1046",
    customer: "Mariam Adel",
    services: "Haircut & blow-dry",
    amount: 45000,
    status: "Draft",
  },
  {
    id: "invoice-3",
    number: "INV-1045",
    customer: "Yasmine Ali",
    services: "Gel manicure · Skin consultation",
    amount: 102000,
    status: "Draft",
  },
];

type DemoPage = "calendar" | "appointments" | "customers" | "invoices";

const navItems = [
  ["calendar", "Calendar", CalendarDays],
  ["appointments", "Appointments", ClipboardList],
  ["customers", "Customers", Users],
  ["invoices", "Invoices", Receipt],
] as const;

function money(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function appointmentTime(appointment: AppointmentSummary) {
  const first = appointment.segments[0];
  const last = appointment.segments[appointment.segments.length - 1];
  const formatter = new Intl.DateTimeFormat("en-EG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
  return `${formatter.format(new Date(first.startsAt))} – ${formatter.format(new Date(last.endsAt))}`;
}

export function LiveOperationsDemo() {
  const [page, setPage] = useState<DemoPage>("calendar");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>("appt-2");
  const [query, setQuery] = useState("");

  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === selectedAppointmentId,
  );

  const filteredAppointments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return appointments;
    return appointments.filter((appointment) =>
      `${appointment.customer.name} ${appointment.customer.phone} ${appointment.segments
        .map((segment) => segment.serviceName)
        .join(" ")}`
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  return (
    <section id="demo" className="lp-section lp-demo-section systemly-demo-section">
      <div className="lp-demo-shell">
        <div className="systemly-demo-intro">
          <p className="lp-kicker">Operations preview</p>
          <h2 className="lp-title">A focused view of the workspace your team actually uses.</h2>
          <p className="lp-copy">
            Switch between the core operational screens using realistic appointment data from a compact light-mode preview.
          </p>
        </div>

        <div className="systemly-demo" data-operations-theme="light">
          <aside className="systemly-demo-sidebar">
            <div className="systemly-demo-brand-block">
              <div className="systemly-demo-wordmark">Systemly</div>
              <p>Business operations</p>
              <button type="button" className="systemly-demo-new-button">
                <Plus size={16} /> New Appointment
              </button>
            </div>

            <nav aria-label="Demo navigation" className="systemly-demo-nav">
              {navItems.map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPage(value);
                    if (value !== "calendar" && value !== "appointments") {
                      setSelectedAppointmentId(null);
                    }
                  }}
                  className={page === value ? "is-active" : ""}
                >
                  <span><Icon size={16} /></span>
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="systemly-demo-main">
            {page === "calendar" ? (
              <div className="systemly-demo-calendar-page">
                <header className="systemly-demo-page-header">
                  <div>
                    <p>Monday</p>
                    <h3>July 27, 2026</h3>
                  </div>
                  <span>Africa/Cairo</span>
                </header>
                <div className="systemly-demo-calendar-layout">
                  <div className="systemly-demo-calendar-card">
                    <StatusLegend />
                    <div className="systemly-demo-calendar-grid-wrap">
                      <CalendarGrid
                        data={calendarData}
                        onSelectAppointment={setSelectedAppointmentId}
                      />
                    </div>
                  </div>
                  {selectedAppointment ? (
                    <AppointmentPreview
                      appointment={selectedAppointment}
                      onClose={() => setSelectedAppointmentId(null)}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {page === "appointments" ? (
              <div className="systemly-demo-list-page">
                <header className="systemly-demo-page-header">
                  <div>
                    <p>Operations</p>
                    <h3>Appointments</h3>
                  </div>
                </header>
                <label className="systemly-demo-search">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search customer or service"
                  />
                </label>
                <div className="systemly-demo-split">
                  <div className="systemly-demo-rows">
                    {filteredAppointments.map((appointment) => (
                      <button
                        key={appointment.id}
                        type="button"
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                        className={selectedAppointmentId === appointment.id ? "is-selected" : ""}
                      >
                        <span>
                          <strong>{appointment.customer.name}</strong>
                          <small>{appointment.segments.map((segment) => segment.serviceName).join(" · ")}</small>
                        </span>
                        <span>
                          <small>{appointmentTime(appointment)}</small>
                          <StatusPill status={appointment.status.replaceAll("_", " ")} />
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedAppointment ? (
                    <AppointmentPreview
                      appointment={selectedAppointment}
                      onClose={() => setSelectedAppointmentId(null)}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {page === "customers" ? (
              <div className="systemly-demo-list-page">
                <header className="systemly-demo-page-header">
                  <div>
                    <p>Customer records</p>
                    <h3>Customers</h3>
                  </div>
                </header>
                <div className="systemly-demo-table">
                  <div className="systemly-demo-table-head">
                    <span>Customer</span><span>Phone</span><span>Visits</span><span>No-shows</span>
                  </div>
                  {customers.map((customer) => (
                    <div key={customer.id} className="systemly-demo-table-row">
                      <strong>{customer.name}</strong>
                      <span>{customer.phone}</span>
                      <span>{customer.visits}</span>
                      <span>{customer.noShows}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {page === "invoices" ? (
              <div className="systemly-demo-list-page">
                <header className="systemly-demo-page-header">
                  <div>
                    <p>Cash invoices</p>
                    <h3>Invoices</h3>
                  </div>
                </header>
                <div className="systemly-demo-table">
                  <div className="systemly-demo-table-head systemly-demo-invoice-grid">
                    <span>Invoice</span><span>Customer</span><span>Services</span><span>Total</span><span>Status</span>
                  </div>
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="systemly-demo-table-row systemly-demo-invoice-grid">
                      <strong>{invoice.number}</strong>
                      <span>{invoice.customer}</span>
                      <span>{invoice.services}</span>
                      <span>{money(invoice.amount)}</span>
                      <StatusPill status={invoice.status} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
}

function AppointmentPreview({
  appointment,
  onClose,
}: {
  appointment: AppointmentSummary;
  onClose: () => void;
}) {
  const total = appointment.segments.reduce((sum, segment) => sum + segment.price, 0);
  return (
    <aside className="systemly-demo-detail">
      <button type="button" onClick={onClose} aria-label="Close appointment details">
        <X size={16} />
      </button>
      <p className="systemly-demo-eyebrow">Appointment details</p>
      <h4>{appointment.customer.name}</h4>
      <span>{appointment.customer.phone}</span>
      <StatusPill status={appointment.status.replaceAll("_", " ")} />
      <div className="systemly-demo-detail-services">
        {appointment.segments.map((segment) => {
          const teamMember = staff.find((item) => item.id === segment.staffId);
          return (
            <div key={segment.id}>
              <strong>{segment.serviceName}</strong>
              <span>{teamMember?.name} · {money(segment.price)}</span>
            </div>
          );
        })}
      </div>
      <dl>
        <div><dt>Time</dt><dd>{appointmentTime(appointment)}</dd></div>
        <div><dt>Total</dt><dd>{money(total)}</dd></div>
        <div><dt>Payment</dt><dd>{appointment.isPaid ? "Paid in cash" : "Not collected"}</dd></div>
      </dl>
    </aside>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return <span className={`systemly-demo-status status-${normalized.replaceAll(" ", "-")}`}>{status}</span>;
}
