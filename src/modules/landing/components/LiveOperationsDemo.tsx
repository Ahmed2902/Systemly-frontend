"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { formatPlatformCurrency, formatPlatformTime } from "@/i18n/format";
import { usePlatformText } from "@/i18n/usePlatformText";
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
] as const;

const navItems = [
  ["calendar", "Calendar", CalendarDays],
  ["appointments", "Appointments", ClipboardList],
  ["customers", "Customers", Users],
  ["invoices", "Invoices", Receipt],
] as const;

function appointmentTime(appointment: DemoAppointment, locale: "en" | "ar") {
  const first = appointment.segments[0];
  const last = appointment.segments[appointment.segments.length - 1];
  return `${formatPlatformTime(first.startsAt, locale, TIMEZONE)} – ${formatPlatformTime(
    last.endsAt,
    locale,
    TIMEZONE,
  )}`;
}

export function LiveOperationsDemo() {
  const text = usePlatformText();
  const { locale } = useLocale();
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
          <p className="lp-kicker">{text("Operations preview")}</p>
          <h2 className="lp-title">
            {text("A focused view of the workspace your team actually uses.")}
          </h2>
          <p className="lp-copy">
            {text("Switch between the core operational screens using realistic appointment data from a compact light-mode preview.")}
          </p>
        </div>

        <div className="systemly-demo" data-operations-theme="light">
          <aside className="systemly-demo-sidebar">
            <div className="systemly-demo-brand-block">
              <div className="systemly-demo-wordmark">Systemly</div>
              <p>{text("Business operations")}</p>
              <button type="button" className="systemly-demo-new-button">
                <Plus size={16} /> {text("New Appointment")}
              </button>
            </div>

            <nav aria-label={text("Demo navigation")} className="systemly-demo-nav">
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
                  {text(label)}
                </button>
              ))}
            </nav>
          </aside>

          <main className="systemly-demo-main">
            {page === "calendar" ? (
              <div className="systemly-demo-calendar-page">
                <header className="systemly-demo-page-header">
                  <div>
                    <p>{text("Monday")}</p>
                    <h3>{text("July 27, 2026")}</h3>
                  </div>
                  <span dir="ltr">Africa/Cairo</span>
                </header>

                <div className={`systemly-demo-calendar-layout ${selectedAppointment ? "has-detail" : "is-full"}`}>
                  <div className="systemly-demo-calendar-card">
                    <div className="systemly-demo-calendar-key">
                      <div aria-label={text("Appointment statuses")}>
                        <span><i /> {text("Confirmed")}</span>
                        <span><i /> {text("In progress")}</span>
                        <span><i /> {text("Completed")}</span>
                      </div>
                      <strong>{text("3 staff · 3 appointments")}</strong>
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
                    <p>{text("Operations")}</p>
                    <h3>{text("Appointments")}</h3>
                  </div>
                </header>
                <label className="systemly-demo-search">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={text("Search customer or service")}
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
                          <strong>{text(appointment.customer.name)}</strong>
                          <small>{appointment.segments.map((segment) => text(segment.serviceName)).join(" · ")}</small>
                        </span>
                        <span>
                          <small>{appointmentTime(appointment, locale)}</small>
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
                    <p>{text("Customer records")}</p>
                    <h3>{text("Customers")}</h3>
                  </div>
                </header>
                <div className="systemly-demo-table">
                  <div className="systemly-demo-table-head">
                    <span>{text("Customer")}</span>
                    <span>{text("Phone")}</span>
                    <span>{text("Visits")}</span>
                    <span>{text("No-shows")}</span>
                  </div>
                  {customers.map((customer) => (
                    <div key={customer.id} className="systemly-demo-table-row">
                      <strong>{text(customer.name)}</strong>
                      <span dir="ltr">{customer.phone}</span>
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
                    <p>{text("Cash invoices")}</p>
                    <h3>{text("Invoices")}</h3>
                  </div>
                </header>
                <div className="systemly-demo-table">
                  <div className="systemly-demo-table-head systemly-demo-invoice-grid">
                    <span>{text("Invoice")}</span>
                    <span>{text("Customer")}</span>
                    <span>{text("Services")}</span>
                    <span>{text("Total")}</span>
                    <span>{text("Status")}</span>
                  </div>
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="systemly-demo-table-row systemly-demo-invoice-grid">
                      <strong dir="ltr">{invoice.number}</strong>
                      <span>{text(invoice.customer)}</span>
                      <span>{text(invoice.services)}</span>
                      <span>{formatPlatformCurrency(invoice.amount / 100, locale)}</span>
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
  const text = usePlatformText();
  const { locale } = useLocale();
  const total = appointment.segments.reduce((sum, segment) => sum + segment.price, 0);

  return (
    <aside className="systemly-demo-detail">
      <button type="button" onClick={onClose} aria-label={text("Close appointment details")}>
        <X size={16} />
      </button>
      <p className="systemly-demo-eyebrow">{text("Appointment details")}</p>
      <h4>{text(appointment.customer.name)}</h4>
      <span dir="ltr">{appointment.customer.phone}</span>
      <StatusPill status={appointment.status.replaceAll("_", " ")} />
      <div className="systemly-demo-detail-services">
        {appointment.segments.map((segment) => (
          <div key={segment.id}>
            <strong>{text(segment.serviceName)}</strong>
            <span>
              {text(segment.staffName)} · {formatPlatformCurrency(segment.price / 100, locale)}
            </span>
          </div>
        ))}
      </div>
      <dl>
        <div>
          <dt>{text("Time")}</dt>
          <dd>{appointmentTime(appointment, locale)}</dd>
        </div>
        <div>
          <dt>{text("Total")}</dt>
          <dd>{formatPlatformCurrency(total / 100, locale)}</dd>
        </div>
        <div>
          <dt>{text("Payment")}</dt>
          <dd>{appointment.isPaid ? text("Paid in cash") : text("Not collected")}</dd>
        </div>
      </dl>
    </aside>
  );
}

function StatusPill({ status }: { status: string }) {
  const text = usePlatformText();
  const normalized = status.toLowerCase();
  return (
    <span className={`systemly-demo-status status-${normalized.replaceAll(" ", "-")}`}>
      {text(status)}
    </span>
  );
}
