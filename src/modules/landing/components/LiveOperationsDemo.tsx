"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Plus,
  Receipt,
  Scissors,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { CalendarGrid } from "@/modules/operations/components/CalendarGrid";
import { StatusLegend } from "@/modules/operations/components/StatusLegend";
import type {
  AppointmentStatus,
  AppointmentSummary,
  CalendarDayData,
} from "@/modules/operations/appointment.types";

const DEMO_DATE = "2026-07-27";
const TIMEZONE = "Africa/Cairo";

const staff = [
  { id: "staff-nour", name: "Nour Khalil", role: "Senior stylist" },
  { id: "staff-mona", name: "Mona Adel", role: "Nail technician" },
  { id: "staff-lina", name: "Dr. Lina Hassan", role: "Dermatologist" },
  { id: "staff-omar", name: "Omar Salem", role: "Receptionist" },
];

const services = [
  {
    id: "service-1",
    name: "Haircut & blow-dry",
    category: "Hair",
    duration: 60,
    price: 45000,
    staffNames: ["Nour Khalil"],
  },
  {
    id: "service-2",
    name: "Gel manicure",
    category: "Nails",
    duration: 45,
    price: 32000,
    staffNames: ["Mona Adel"],
  },
  {
    id: "service-3",
    name: "Nail art",
    category: "Nails",
    duration: 30,
    price: 18000,
    staffNames: ["Mona Adel"],
  },
  {
    id: "service-4",
    name: "Skin consultation",
    category: "Clinic",
    duration: 45,
    price: 70000,
    staffNames: ["Dr. Lina Hassan"],
  },
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
        startsAt: "2026-07-27T07:00:00.000Z",
        endsAt: "2026-07-27T08:00:00.000Z",
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
    discount: 5000,
    customItems: [{ id: "custom-1", description: "Nail repair", quantity: 1, price: 12000 }],
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
        serviceName: "Nail art",
        staffId: "staff-mona",
        startsAt: "2026-07-27T10:15:00.000Z",
        endsAt: "2026-07-27T10:45:00.000Z",
        price: 18000,
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
        serviceName: "Skin consultation",
        staffId: "staff-lina",
        startsAt: "2026-07-27T12:00:00.000Z",
        endsAt: "2026-07-27T12:45:00.000Z",
        price: 70000,
        segmentIndex: 1,
        segmentCount: 1,
      },
    ],
  },
  {
    id: "appt-4",
    date: DEMO_DATE,
    customer: {
      id: "customer-4",
      name: "Farah Nabil",
      phone: "+20 106 100 2200",
      visits: 2,
      noShows: 1,
    },
    status: "no_show",
    isLocked: false,
    isPaid: false,
    discount: 0,
    customItems: [],
    segments: [
      {
        id: "segment-4",
        appointmentId: "appt-4",
        serviceId: "service-1",
        serviceName: "Haircut & blow-dry",
        staffId: "staff-nour",
        startsAt: "2026-07-27T14:00:00.000Z",
        endsAt: "2026-07-27T15:00:00.000Z",
        price: 45000,
        segmentIndex: 1,
        segmentCount: 1,
      },
    ],
  },
  {
    id: "appt-5",
    date: DEMO_DATE,
    customer: {
      id: "customer-5",
      name: "Dina Samir",
      phone: "+20 115 440 5500",
      visits: 5,
      noShows: 0,
    },
    status: "cancelled_by_customer",
    isLocked: false,
    isPaid: false,
    discount: 0,
    customItems: [],
    segments: [
      {
        id: "segment-5",
        appointmentId: "appt-5",
        serviceId: "service-2",
        serviceName: "Gel manicure",
        staffId: "staff-mona",
        startsAt: "2026-07-27T15:00:00.000Z",
        endsAt: "2026-07-27T15:45:00.000Z",
        price: 32000,
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
  appointments: appointments.filter(
    (appointment) => !appointment.status.startsWith("cancelled_"),
  ),
  breaks: [
    {
      id: "break-1",
      staffId: "staff-nour",
      startsAt: "2026-07-27T11:00:00.000Z",
      endsAt: "2026-07-27T11:30:00.000Z",
      label: "Break",
    },
  ],
};

const customers = appointments.map((appointment) => appointment.customer);
const invoices = [
  { id: "invoice-1", number: "INV-2026-1047", customer: "Mariam Adel", amount: 45000, method: "Cash" },
  { id: "invoice-2", number: "INV-2026-1046", customer: "Yasmine Ali", amount: 57000, method: "Card" },
  { id: "invoice-3", number: "INV-2026-1045", customer: "Salma Tarek", amount: 70000, method: "Mobile wallet" },
];

type DemoPage =
  | "dashboard"
  | "calendar"
  | "appointments"
  | "customers"
  | "invoices"
  | "staff"
  | "services";

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["calendar", "Calendar", CalendarDays],
  ["appointments", "Appointments", ClipboardList],
  ["customers", "Customers", Users],
  ["invoices", "Invoices", Receipt],
  ["staff", "Staff", UserRound],
  ["services", "Services", Sparkles],
] as const;

export function LiveOperationsDemo() {
  const [page, setPage] = useState<DemoPage>("calendar");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0].id);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

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

  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === selectedAppointmentId,
  );
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId)!;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <section id="demo" className="lp-section lp-demo-section">
      <div className="lp-demo-shell">
        <div className="text-center">
          <p className="lp-kicker">Interactive operations demo</p>
          <h2 className="lp-title">
            The same workspace your team will <span className="lp-accent-text">actually use.</span>
          </h2>
          <p className="lp-copy mx-auto max-w-3xl">
            Explore the calendar, owner dashboard, appointments, customers, invoices,
            staff, and services using realistic local demo data.
          </p>
        </div>

        <div className="lp-operations-frame">
          <aside className="lp-operations-sidebar">
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                  H
                </span>
                <div>
                  <div className="text-lg font-bold tracking-tight text-slate-950">Hgezli</div>
                  <p className="text-[11px] font-medium text-slate-400">Business operations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showNotice("New appointment opened in the real workspace.")}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                <Plus size={16} /> New Appointment
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-2.5 py-2">
              {navItems.map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPage(value);
                    setSelectedAppointmentId(null);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition ${
                    page === value
                      ? "bg-violet-50 text-violet-800 ring-1 ring-violet-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Icon size={16} />
                  </span>
                  {label}
                  {value === "dashboard" ? (
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                      Owner
                    </span>
                  ) : null}
                </button>
              ))}
              <button
                type="button"
                onClick={() => showNotice("Settings are owner-only in the full workspace.")}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Settings size={16} />
                </span>
                Settings
              </button>
            </nav>
          </aside>

          <main className="lp-operations-main">
            {page === "dashboard" ? <DemoDashboard /> : null}
            {page === "calendar" ? (
              <div className="flex h-full flex-col bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Monday</p>
                    <h3 className="text-xl font-bold text-slate-900">July 27, 2026</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                    Africa/Cairo
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <StatusLegend />
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <CalendarGrid data={calendarData} onSelectAppointment={setSelectedAppointmentId} />
                    </div>
                  </div>
                  {selectedAppointment ? (
                    <AppointmentPanel
                      appointment={selectedAppointment}
                      onClose={() => setSelectedAppointmentId(null)}
                      onAction={showNotice}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
            {page === "appointments" ? (
              <DemoAppointments
                items={filteredAppointments}
                query={query}
                onQueryChange={setQuery}
                onSelect={setSelectedAppointmentId}
                selected={selectedAppointment}
                onClose={() => setSelectedAppointmentId(null)}
                onAction={showNotice}
              />
            ) : null}
            {page === "customers" ? <DemoCustomers /> : null}
            {page === "invoices" ? (
              <DemoInvoices
                selectedId={selectedInvoiceId}
                onSelect={setSelectedInvoiceId}
                selected={selectedInvoice}
                onAction={showNotice}
              />
            ) : null}
            {page === "staff" ? <DemoStaff /> : null}
            {page === "services" ? <DemoServices /> : null}
          </main>
        </div>

        <div aria-live="polite" className={`lp-demo-notice ${notice ? "is-visible" : ""}`}>
          {notice}
        </div>
      </div>
    </section>
  );
}

function DemoDashboard() {
  const metrics = [
    ["Revenue", "EGP 1,720", "+12.4%"],
    ["Appointments", "5", "Today"],
    ["Customers", "10", "2 new"],
    ["Utilisation", "71%", "Team average"],
  ];
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-violet-600">Owner analytics</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-950">Business overview</h3>
        <p className="mt-1 text-sm text-slate-500">Revenue and performance stay restricted to the owner.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600">{hint}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Revenue this week</p>
                <p className="text-xs text-slate-500">Paid invoices only</p>
              </div>
              <BarChart3 className="text-violet-600" size={20} />
            </div>
            <div className="mt-6 flex h-44 items-end gap-3">
              {[35, 52, 46, 78, 64, 92, 70].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-400" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-medium text-slate-400">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Top services</p>
            <div className="mt-4 space-y-4">
              {services.slice(0, 4).map((service, index) => (
                <div key={service.id}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{service.name}</span>
                    <span className="text-slate-400">{4 - index} bookings</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-violet-500" style={{ width: `${92 - index * 17}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoAppointments({
  items,
  query,
  onQueryChange,
  onSelect,
  selected,
  onClose,
  onAction,
}: {
  items: AppointmentSummary[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  selected?: AppointmentSummary;
  onClose: () => void;
  onAction: (message: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-blue-600">Operations</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-900">Appointments</h3>
        <label className="relative mt-5 block max-w-xl">
          <Search className="absolute left-3 top-3 text-slate-400" size={17} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search customer, phone, or service..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
          />
        </label>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            {items.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => onSelect(appointment.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300"
              >
                <div>
                  <p className="font-semibold text-slate-900">{appointment.customer.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{appointment.segments.map((segment) => segment.serviceName).join(" · ")}</p>
                </div>
                <StatusPill status={appointment.status} />
              </button>
            ))}
          </div>
          {selected ? (
            <AppointmentPanel appointment={selected} onClose={onClose} onAction={onAction} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
              Select an appointment to open its workspace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoCustomers() {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-emerald-600">Customer records</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-950">Customers</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  {customer.name.charAt(0)}
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900">{customer.name}</h4>
                  <p className="text-xs text-slate-500">{customer.phone}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-900">{customer.visits}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Visits</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-lg font-bold text-slate-900">{customer.noShows}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">No-shows</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoInvoices({
  selectedId,
  onSelect,
  selected,
  onAction,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  selected: (typeof invoices)[number];
  onAction: (message: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-amber-600">Payments and receipts</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-950">Invoices</h3>
        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {invoices.map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                onClick={() => onSelect(invoice.id)}
                className={`grid w-full grid-cols-[1fr_1fr_auto] items-center gap-3 border-b border-slate-100 px-4 py-4 text-left last:border-0 ${
                  selectedId === invoice.id ? "invoice-row-selected" : "hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">{invoice.number}</p>
                  <p className="text-xs text-slate-500">{invoice.customer}</p>
                </div>
                <p className="text-sm text-slate-600">{invoice.method}</p>
                <p className="font-semibold text-slate-900">{money(invoice.amount)}</p>
              </button>
            ))}
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected invoice</p>
            <h4 className="mt-2 text-xl font-bold text-slate-950">{selected.number}</h4>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Customer</dt><dd className="font-medium text-slate-900">{selected.customer}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Method</dt><dd className="font-medium text-slate-900">{selected.method}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3"><dt className="font-semibold text-slate-700">Total</dt><dd className="font-bold text-slate-950">{money(selected.amount)}</dd></div>
            </dl>
            <button
              type="button"
              onClick={() => onAction("Receipt download simulated.")}
              className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Download receipt
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DemoStaff() {
  const assignments: Record<string, string[]> = {
    "staff-nour": ["Haircut & blow-dry"],
    "staff-mona": ["Gel manicure", "Nail art"],
    "staff-lina": ["Skin consultation"],
    "staff-omar": [],
  };
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-rose-600">Team and availability</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-950">Staff Directory</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member, index) => (
            <article key={member.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-lg font-bold text-violet-700">
                  {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <h4 className="font-bold text-slate-950">{member.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${index === 3 ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {index === 3 ? "Front desk" : "Available today"}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex min-h-8 flex-wrap gap-2">
                {assignments[member.id].length ? assignments[member.id].map((name) => (
                  <span key={name} className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">{name}</span>
                )) : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">No service assignment</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoServices() {
  const categories = [...new Set(services.map((service) => service.category))];
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-orange-600">Catalogue and pricing</p>
        <h3 className="mt-1 text-3xl font-bold text-slate-950">Services</h3>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">{category}</span>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                {service.category === "Hair" ? <Scissors size={19} /> : <Sparkles size={19} />}
              </span>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-orange-600">{service.category}</p>
              <h4 className="mt-1 text-lg font-bold text-slate-950">{service.name}</h4>
              <p className="mt-2 text-sm text-slate-500">{service.duration} min · {service.staffNames.join(", ")}</p>
              <p className="mt-5 text-xl font-bold text-slate-950">{money(service.price)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentPanel({
  appointment,
  onClose,
  onAction,
}: {
  appointment: AppointmentSummary;
  onClose: () => void;
  onAction: (message: string) => void;
}) {
  return (
    <aside className="w-80 shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Appointment</p>
          <h4 className="mt-1 text-xl font-bold text-slate-950">{appointment.customer.name}</h4>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={17} /></button>
      </div>
      <StatusPill status={appointment.status} />
      <div className="mt-5 space-y-3">
        {appointment.segments.map((segment) => (
          <div key={segment.id} className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{segment.serviceName}</p>
            <p className="mt-1 text-xs text-slate-500">{staff.find((member) => member.id === segment.staffId)?.name}</p>
          </div>
        ))}
        {appointment.customItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800">Custom item · {item.description}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onAction("Appointment action simulated; demo data remains unchanged.")}
        className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Open full workspace
      </button>
    </aside>
  );
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  const copy: Record<AppointmentStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled_by_business: "Cancelled",
    cancelled_by_customer: "Cancelled",
    no_show: "No-show",
  };
  const tone: Record<AppointmentStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-teal-100 text-teal-700",
    in_progress: "bg-violet-100 text-violet-700",
    completed: "bg-green-100 text-green-700",
    cancelled_by_business: "bg-rose-100 text-rose-700",
    cancelled_by_customer: "bg-rose-100 text-rose-700",
    no_show: "bg-amber-100 text-amber-700",
  };
  return <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status]}`}>{copy[status]}</span>;
}

function money(cents: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
