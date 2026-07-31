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
import { LandingCalendarBoard } from "./LandingCalendarBoard";

const TIMEZONE = "Africa/Cairo";

type DemoPage = "calendar" | "appointments" | "customers" | "invoices";
type DemoStatus = "confirmed" | "in_progress" | "completed";

type DemoSegment = {
  id: string;
  serviceName: string;
  staffName: string;
  startsAt: string;
  endsAt: string;
  price: number;
};

type DemoAppointment = {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    visits: number;
    noShows: number;
  };
  status: DemoStatus;
  isPaid: boolean;
  segments: DemoSegment[];
};

const appointments: DemoAppointment[] = [
  {
    id: "appt-1",
    customer: {
      id: "customer-1",
      name: "Mariam Adel",
      phone: "+20 100 555 0101",
      visits: 7,
      noShows: 0,
    },
    status: "confirmed",
    isPaid: false,
    segments: [
      {
        id: "segment-1",
        serviceName: "Haircut & blow-dry",
        staffName: "Nour Khalil",
        startsAt: "2026-07-27T06:15:00.000Z",
        endsAt: "2026-07-27T07:00:00.000Z",
        price: 45000,
      },
    ],
  },
  {
    id: "appt-2",
    customer: {
      id: "customer-2",
      name: "Yasmine Ali",
      phone: "+20 111 222 0303",
      visits: 11,
      noShows: 1,
    },
    status: "in_progress",
    isPaid: false,
    segments: [
      {
        id: "segment-2a",
        serviceName: "Gel manicure",
        staffName: "Mona Adel",
        startsAt: "2026-07-27T07:00:00.000Z",
        endsAt: "2026-07-27T07:45:00.000Z",
        price: 32000,
      },
      {
        id: "segment-2b",
        serviceName: "Skin consultation",
        staffName: "Dr. Lina Hassan",
        startsAt: "2026-07-27T08:00:00.000Z",
        endsAt: "2026-07-27T08:45:00.000Z",
        price: 70000,
      },
    ],
  },
  {
    id: "appt-3",
    customer: {
      id: "customer-3",
      name: "Salma Tarek",
      phone: "+20 122 777 0404",
      visits: 3,
      noShows: 0,
    },
    status: "completed",
    isPaid: true,
    segments: [
      {
        id: "segment-3",
        serviceName: "Skin follow-up",
        staffName: "Dr. Lina Hassan",
        startsAt: "2026-07-27T09:00:00.000Z",
        endsAt: "2026-07-27T09:30:00.000Z",
        price: 45000,
      },
    ],
  },
];

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

function appointmentTime(appointment: DemoAppointment) {
  const first = appointment.segments[0];
  const last = appointment.segments[appointment.segments.length - 1];
  const formatter = new Intl.DateTimeFormat("en-EG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
  return `${formatter.format(new Date(first.startsAt))} – ${formatter.format(
    new Date(last.endsAt),
  )}`;
}

export function LiveOperationsDemo() {
  const [page, setPage] = useState<DemoPage>("calendar");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >("appt-2");
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
          <h2 className="lp-title">
            A focused view of the workspace your team actually uses.
          </h2>
          <p className="lp-copy">
            Switch between the core operational screens using realistic
            appointment data from a compact light-mode preview.
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
                  <span>
                    <Icon size={16} />
                  </span>
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

                <div
                  className={`systemly-demo-calendar-layout ${
                    selectedAppointment ? "has-detail" : "is-full"
                  }`}
                >
                  <div className="systemly-demo-calendar-card">
                    <div className="systemly-demo-calendar-key">
                      <div aria-label="Appointment statuses">
                        <span>
                          <i /> Confirmed
                        </span>
                        <span>
                          <i /> In progress
                        </span>
                        <span>
                          <i /> Completed
                        </span>
                      </div>
                      <strong>3 staff · 3 appointments</strong>
                    </div>
                    <LandingCalendarBoard
                      variant="workspace"
                      selectedAppointmentId={selectedAppointmentId}
                      onSelectAppointment={setSelectedAppointmentId}
                    />
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
                        className={
                          selectedAppointmentId === appointment.id
                            ? "is-selected"
                            : ""
                        }
                      >
                        <span>
                          <strong>{appointment.customer.name}</strong>
                          <small>
                            {appointment.segments
                              .map((segment) => segment.serviceName)
                              .join(" · ")}
                          </small>
                        </span>
                        <span>
                          <small>{appointmentTime(appointment)}</small>
                          <StatusPill
                            status={appointment.status.replaceAll("_", " ")}
                          />
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
                    <span>Customer</span>
                    <span>Phone</span>
                    <span>Visits</span>
                    <span>No-shows</span>
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
                    <span>Invoice</span>
                    <span>Customer</span>
                    <span>Services</span>
                    <span>Total</span>
                    <span>Status</span>
                  </div>
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="systemly-demo-table-row systemly-demo-invoice-grid"
                    >
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
  appointment: DemoAppointment;
  onClose: () => void;
}) {
  const total = appointment.segments.reduce(
    (sum, segment) => sum + segment.price,
    0,
  );

  return (
    <aside className="systemly-demo-detail">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close appointment details"
      >
        <X size={16} />
      </button>
      <p className="systemly-demo-eyebrow">Appointment details</p>
      <h4>{appointment.customer.name}</h4>
      <span>{appointment.customer.phone}</span>
      <StatusPill status={appointment.status.replaceAll("_", " ")} />
      <div className="systemly-demo-detail-services">
        {appointment.segments.map((segment) => (
          <div key={segment.id}>
            <strong>{segment.serviceName}</strong>
            <span>
              {segment.staffName} · {money(segment.price)}
            </span>
          </div>
        ))}
      </div>
      <dl>
        <div>
          <dt>Time</dt>
          <dd>{appointmentTime(appointment)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>{appointment.isPaid ? "Paid in cash" : "Not collected"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return (
    <span
      className={`systemly-demo-status status-${normalized.replaceAll(
        " ",
        "-",
      )}`}
    >
      {status}
    </span>
  );
}
