"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Plus,
  Receipt,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { CalendarGrid } from "@/modules/operations/components/CalendarGrid";
import { StatusLegend } from "@/modules/operations/components/StatusLegend";
import {
  AppointmentsToolbar,
  type SortMode,
} from "@/modules/operations/components/appointments-list/AppointmentsToolbar";
import { InvoiceListPanel } from "@/modules/invoices/components/InvoiceListPanel";
import { InvoiceDetailPanel } from "@/modules/invoices/components/InvoiceDetailPanel";
import { CustomerListPanel } from "@/modules/customers/components/CustomerListPanel";
import { CustomerProfilePanel } from "@/modules/customers/components/CustomerProfilePanel";
import type {
  CalendarDayData,
  AppointmentSummary,
} from "@/modules/operations/appointment.types";
import type {
  InvoiceDetail,
  InvoiceListItem,
} from "@/modules/invoices/invoices.types";
import type {
  CustomerFilter,
  CustomerListItem,
  CustomerWorkspaceResponse,
} from "@/modules/customers/customers.types";

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
      startsAt: "2026-07-27T11:00:00.000Z",
      endsAt: "2026-07-27T11:30:00.000Z",
      label: "Break",
    },
  ],
};

const invoiceDetails: InvoiceDetail[] = [
  makeInvoice(
    "invoice-1",
    "INV-2026-1047",
    "customer-1",
    "Mariam Adel",
    "+20 100 555 0101",
    "2026-07-27T08:12:00.000Z",
    45000,
    "CASH",
    "Haircut & blow-dry",
    "Nour Khalil",
  ),
  makeInvoice(
    "invoice-2",
    "INV-2026-1046",
    "customer-2",
    "Yasmine Ali",
    "+20 111 222 0303",
    "2026-07-27T10:55:00.000Z",
    45000,
    "CARD",
    "Gel manicure · Nail art",
    "Mona Adel",
    5000,
  ),
  makeInvoice(
    "invoice-3",
    "INV-2026-1045",
    "customer-3",
    "Salma Tarek",
    "+20 122 777 0404",
    "2026-07-27T12:50:00.000Z",
    70000,
    "MOBILE_WALLET",
    "Skin consultation",
    "Dr. Lina Hassan",
  ),
];

const customerItems: CustomerListItem[] = [
  makeCustomer(
    "customer-1",
    "Mariam Adel",
    "+20 100 555 0101",
    "mariam@example.com",
    7,
    0,
    "Instagram",
  ),
  makeCustomer(
    "customer-2",
    "Yasmine Ali",
    "+20 111 222 0303",
    "yasmine@example.com",
    11,
    1,
    "Referral",
  ),
  makeCustomer(
    "customer-3",
    "Salma Tarek",
    "+20 122 777 0404",
    "salma@example.com",
    3,
    0,
    "Website",
  ),
];

const customerWorkspaces: Record<string, CustomerWorkspaceResponse> =
  Object.fromEntries(
    customerItems.map((customer) => [
      customer.id,
      {
        customer: {
          ...customer,
          notes:
            customer.id === "customer-2"
              ? "Prefers afternoon appointments and neutral nail colours."
              : "",
        },
        stats: {
          visits: customer.visits,
          noShows: customer.noShows,
          lastVisitAt: "2026-06-18T12:00:00.000Z",
          nextAppointmentAt: customer.nextAppointment?.startsAt ?? null,
        },
        upcoming: [],
        history: [],
      },
    ]),
  );

type DemoPage = "calendar" | "appointments" | "customers" | "invoices";

export function LiveOperationsDemo() {
  const [page, setPage] = useState<DemoPage>("calendar");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [query, setQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("soonest");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    invoiceDetails[0].id,
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customerItems[0].id,
  );
  const [notice, setNotice] = useState("");

  const visibleAppointments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...appointments]
      .filter((appointment) => {
        const text =
          `${appointment.customer.name} ${appointment.customer.phone} ${appointment.segments.map((segment) => segment.serviceName).join(" ")}`.toLowerCase();
        const matchesStaff =
          staffFilter === "all" ||
          appointment.segments.some(
            (segment) => segment.staffId === staffFilter,
          );
        const matchesStatus =
          statusFilter === "all" || appointment.status === statusFilter;
        return (
          (!needle || text.includes(needle)) && matchesStaff && matchesStatus
        );
      })
      .sort((a, b) => {
        if (sort === "customer")
          return a.customer.name.localeCompare(b.customer.name);
        if (sort === "status") return a.status.localeCompare(b.status);
        const aTime = new Date(a.segments[0].startsAt).getTime();
        const bTime = new Date(b.segments[0].startsAt).getTime();
        return sort === "latest" ? bTime - aTime : aTime - bTime;
      });
  }, [query, sort, staffFilter, statusFilter]);

  const visibleCustomers = useMemo(() => {
    const needle = customerSearch.trim().toLowerCase();
    return customerItems.filter((customer) => {
      const matchesText =
        !needle ||
        `${customer.name} ${customer.phone} ${customer.email}`
          .toLowerCase()
          .includes(needle);
      const matchesFilter =
        customerFilter === "all" ||
        (customerFilter === "no_shows" ? customer.noShows > 0 : true);
      return matchesText && matchesFilter;
    });
  }, [customerFilter, customerSearch]);

  const selectedInvoice =
    invoiceDetails.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  const selectedWorkspace = customerWorkspaces[selectedCustomerId] ?? null;

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
            The same workspace your team will{" "}
            <span className="lp-accent-text">actually use.</span>
          </h2>
          <p className="lp-copy mx-auto max-w-3xl">
            This is a functional light-mode demo built from the same calendar,
            appointment, invoice, and customer interfaces used inside Hgezli
            Operations. Everything below runs on local dummy data.
          </p>
        </div>

        <div className="lp-operations-frame  ">
          <aside className="lp-operations-sidebar">
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                  H
                </span>
                <div>
                  <div className="text-lg font-bold tracking-tight text-slate-950">
                    Hgezli
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Business operations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  showNotice(
                    "New appointment modal opened in the real workspace.",
                  )
                }
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                <Plus size={16} /> New Appointment
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2.5 py-2">
              <DemoNavButton
                icon={LayoutDashboard}
                label="Dashboard"
                active={false}
                onClick={() =>
                  showNotice("Owner dashboard is restricted to owners.")
                }
              />
              <DemoNavButton
                icon={CalendarDays}
                label="Calendar"
                active={page === "calendar"}
                onClick={() => setPage("calendar")}
              />
              <DemoNavButton
                icon={ClipboardList}
                label="Appointments"
                active={page === "appointments"}
                onClick={() => setPage("appointments")}
              />
              <DemoNavButton
                icon={Users}
                label="Customers"
                active={page === "customers"}
                onClick={() => setPage("customers")}
              />
              <DemoNavButton
                icon={Receipt}
                label="Invoices"
                active={page === "invoices"}
                onClick={() => setPage("invoices")}
              />
              <DemoNavButton
                icon={UserRound}
                label="Staff"
                active={false}
                onClick={() =>
                  showNotice(
                    "Staff page is available in the full operations workspace.",
                  )
                }
              />
              <DemoNavButton
                icon={Sparkles}
                label="Services"
                active={false}
                onClick={() =>
                  showNotice(
                    "Services page is available in the full operations workspace.",
                  )
                }
              />
              <DemoNavButton
                icon={Settings}
                label="Settings"
                active={false}
                onClick={() =>
                  showNotice("Settings are owner-only in the full workspace.")
                }
              />
            </nav>
          </aside>

          <main className="lp-operations-main">
            {page === "calendar" ? (
              <div className="flex h-full flex-col bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <button className="rounded-md border bg-white px-2 py-1">
                    ‹
                  </button>
                  <button className="rounded-md border bg-white px-3 py-1 text-sm font-medium">
                    Today
                  </button>
                  <button className="rounded-md border bg-white px-2 py-1">
                    ›
                  </button>
                  <h3 className="ml-2 text-xl font-bold text-slate-900">
                    July 27, 2026
                  </h3>
                </div>
                <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <StatusLegend />
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <CalendarGrid
                        data={calendarData}
                        onSelectAppointment={setSelectedAppointmentId}
                      />
                    </div>
                  </div>
                  {selectedAppointmentId ? (
                    <DemoAppointmentPanel
                      appointment={
                        appointments.find(
                          (item) => item.id === selectedAppointmentId,
                        )!
                      }
                      onClose={() => setSelectedAppointmentId(null)}
                      onAction={showNotice}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {page === "appointments" ? (
              <div className="h-full overflow-y-auto bg-slate-50 p-5">
                <div className="mx-auto max-w-6xl">
                  <p className="text-sm font-medium text-blue-600">
                    Operations
                  </p>
                  <h3 className="mt-1 text-3xl font-bold text-slate-900">
                    Appointments
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review the queue, filter the day, and open any appointment
                    for its full workspace.
                  </p>
                  <div className="mt-6">
                    <AppointmentsToolbar
                      query={query}
                      date={DEMO_DATE}
                      staffFilter={staffFilter}
                      statusFilter={statusFilter}
                      sort={sort}
                      staff={staff}
                      onQueryChange={setQuery}
                      onDateChange={() => {}}
                      onStaffFilterChange={setStaffFilter}
                      onStatusFilterChange={setStatusFilter}
                      onSortChange={setSort}
                    />
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">
                      Monday, July 27
                    </h4>
                    <span className="text-sm text-slate-500">
                      {visibleAppointments.length} appointments
                    </span>
                  </div>
                  <div className="space-y-3">
                    {visibleAppointments.map((appointment) => (
                      <DemoAppointmentListItem
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => setSelectedAppointmentId(appointment.id)}
                      />
                    ))}
                  </div>
                  {selectedAppointmentId ? (
                    <div className="mt-4">
                      <DemoAppointmentPanel
                        appointment={
                          appointments.find(
                            (item) => item.id === selectedAppointmentId,
                          )!
                        }
                        onClose={() => setSelectedAppointmentId(null)}
                        onAction={showNotice}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {page === "invoices" ? (
              <div className="h-full overflow-y-auto bg-gradient-to-br from-violet-50/60 via-slate-50 to-emerald-50/30 p-5">
                <div className="mx-auto max-w-[1400px] space-y-5">
                  <header>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Receipt size={13} /> Payments and receipts
                    </div>
                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                      Invoices
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-500">
                      Review completed payments, download receipts, and manage
                      voided invoices.
                    </p>
                  </header>
                  <section className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[1fr_11rem_13rem_auto]">
                      <label className="relative block">
                        <Search
                          className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
                          size={17}
                        />
                        <input
                          placeholder="Search invoice, customer, or phone..."
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
                        />
                      </label>
                      <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                        <option>All statuses</option>
                        <option>Paid</option>
                      </select>
                      <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                        <option>All payment methods</option>
                        <option>Cash</option>
                        <option>Card</option>
                      </select>
                      <button className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600">
                        Clear
                      </button>
                    </div>
                  </section>
                  <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
                    <InvoiceListPanel
                      invoices={invoiceDetails as InvoiceListItem[]}
                      selectedId={selectedInvoiceId}
                      onSelect={setSelectedInvoiceId}
                    />
                    <InvoiceDetailPanel
                      invoice={selectedInvoice}
                      loading={false}
                      actionRunning={false}
                      onDownload={() =>
                        showNotice("Receipt download simulated.")
                      }
                      onVoid={() =>
                        showNotice(
                          "Void action simulated; demo data was not changed.",
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {page === "customers" ? (
              <div className="h-full overflow-y-auto bg-slate-50 p-5">
                <div className="mx-auto flex min-h-full max-w-[1400px] flex-col">
                  <header className="mb-6 flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">
                        Operations
                      </p>
                      <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                        Customers
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Manage customer profiles, notes, and appointment
                        history.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        showNotice(
                          "New customer form opened in the real workspace.",
                        )
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      New customer
                    </button>
                  </header>
                  <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
                    <CustomerListPanel
                      customers={visibleCustomers}
                      selectedId={selectedCustomerId}
                      total={visibleCustomers.length}
                      search={customerSearch}
                      filter={customerFilter}
                      loading={false}
                      onSearchChange={setCustomerSearch}
                      onFilterChange={setCustomerFilter}
                      onSelect={setSelectedCustomerId}
                      onNewCustomer={() =>
                        showNotice(
                          "New customer form opened in the real workspace.",
                        )
                      }
                    />
                    {selectedWorkspace ? (
                      <CustomerProfilePanel
                        workspace={selectedWorkspace}
                        timezone={TIMEZONE}
                        savingNotes={false}
                        onEdit={() => showNotice("Customer edit form opened.")}
                        onSaveNotes={async () =>
                          showNotice("Notes saved locally for the demo.")
                        }
                        onNewAppointment={() =>
                          showNotice(
                            "New appointment opened with this customer preselected.",
                          )
                        }
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
        <div
          aria-live="polite"
          className={`lp-demo-notice ${notice ? "is-visible" : ""}`}
        >
          {notice}
        </div>
      </div>
    </section>
  );
}

function DemoNavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof CalendarDays;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all ${active ? "bg-violet-50 text-violet-800 shadow-sm ring-1 ring-violet-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={16} />
      </span>
      {label}
    </button>
  );
}

function DemoAppointmentListItem({
  appointment,
  onClick,
}: {
  appointment: AppointmentSummary;
  onClick: () => void;
}) {
  const first = appointment.segments[0];
  const total =
    appointment.segments.reduce((sum, segment) => sum + segment.price, 0) -
    appointment.discount;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-wrap items-center gap-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="w-24 shrink-0 border-r border-slate-100 pr-4">
        <div className="text-lg font-bold text-slate-900">
          {new Date(first.startsAt).toLocaleTimeString("en-US", {
            timeZone: TIMEZONE,
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {Math.round(
            (new Date(appointment.segments.at(-1)!.endsAt).getTime() -
              new Date(first.startsAt).getTime()) /
              60000,
          )}{" "}
          min
        </div>
      </div>
      <div className="min-w-56 flex-1">
        <div className="font-semibold text-slate-900">
          {appointment.customer.name}
        </div>
        <div className="text-sm text-slate-500">
          {appointment.segments
            .map((segment) => segment.serviceName)
            .join(" · ")}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {appointment.customer.phone} ·{" "}
          {appointment.isPaid ? "Paid" : "Payment due"}
        </div>
      </div>
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
        {appointment.status.replace("_", " ")}
      </span>
      <span className="text-sm font-semibold text-slate-700">
        EGP {(total / 100).toFixed(0)}
      </span>
      <span className="text-slate-400">›</span>
    </button>
  );
}

function DemoAppointmentPanel({
  appointment,
  onClose,
  onAction,
}: {
  appointment: AppointmentSummary;
  onClose: () => void;
  onAction: (message: string) => void;
}) {
  return (
    <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl lg:w-80">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Appointment
          </p>
          <h4 className="mt-1 text-xl font-bold text-slate-950">
            {appointment.customer.name}
          </h4>
          <p className="text-sm text-slate-500">{appointment.customer.phone}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border px-2 py-1 text-slate-500"
        >
          ×
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {appointment.segments.map((segment) => (
          <div
            key={segment.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="font-semibold text-slate-900">
              {segment.serviceName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {staff.find((member) => member.id === segment.staffId)?.name} ·
              EGP {(segment.price / 100).toFixed(0)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        <button
          onClick={() =>
            onAction("Appointment marked in progress in the demo.")
          }
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Start appointment
        </button>
        <button
          onClick={() => onAction("Payment collection opened in the demo.")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Collect payment
        </button>
      </div>
    </aside>
  );
}

function makeInvoice(
  id: string,
  invoiceNumber: string,
  customerId: string,
  customerName: string,
  phone: string,
  issuedAt: string,
  totalCents: number,
  paymentMethod: InvoiceDetail["paymentMethod"],
  serviceName: string,
  staffName: string,
  discountCents = 0,
): InvoiceDetail {
  return {
    id,
    invoiceNumber,
    status: "paid",
    issuedAt,
    paidAt: issuedAt,
    voidedAt: null,
    paymentMethod,
    totalCents,
    currency: "EGP",
    customer: {
      id: customerId,
      name: customerName,
      phone,
      email: `${customerName.toLowerCase().replaceAll(" ", ".")}@example.com`,
    },
    appointment: {
      id: `appt-${id}`,
      startsAt: issuedAt,
      endsAt: issuedAt,
      status: "completed",
      bookingChannel: "FRONT_DESK",
    },
    services: [serviceName],
    subtotalCents: totalCents + discountCents,
    discountCents,
    taxCents: 0,
    notes: null,
    paymentReference: paymentMethod === "CASH" ? null : "DEMO-REF-1001",
    voidReason: null,
    business: {
      id: "business-demo",
      name: "Hgezli Demo Business",
      logoUrl: null,
      timezone: TIMEZONE,
    },
    paidBy: { id: "admin-demo", name: "Demo Admin" },
    voidedBy: null,
    lineItems: [
      {
        id: `${id}-line`,
        description: serviceName,
        quantity: 1,
        unitPriceCents: totalCents + discountCents,
        totalCents: totalCents + discountCents,
        service: { id: `${id}-service`, name: serviceName },
        staff: { id: `${id}-staff`, name: staffName },
      },
    ],
  };
}

function makeCustomer(
  id: string,
  name: string,
  phone: string,
  email: string,
  visits: number,
  noShows: number,
  source: string,
): CustomerListItem {
  return {
    id,
    businessId: "business-demo",
    name,
    phone,
    email,
    acquisitionSource: source,
    notes: "",
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    visits,
    noShows,
    lastVisitAt: "2026-06-18T12:00:00.000Z",
    nextAppointment: appointments.find(
      (appointment) => appointment.customer.id === id,
    )
      ? {
          id: appointments.find(
            (appointment) => appointment.customer.id === id,
          )!.id,
          startsAt: appointments.find(
            (appointment) => appointment.customer.id === id,
          )!.segments[0].startsAt,
          status: appointments.find(
            (appointment) => appointment.customer.id === id,
          )!.status,
        }
      : null,
  };
}
