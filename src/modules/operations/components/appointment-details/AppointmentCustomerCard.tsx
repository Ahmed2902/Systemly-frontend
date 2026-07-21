import Link from "next/link";
import { ArrowUpRight, CalendarDays, Phone, UserRound } from "lucide-react";

interface Props {
  customer: {
    id: string;
    name: string;
    phone?: string;
    visits: number;
    noShows: number;
    lastVisitAt?: string | null;
  };
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function lastVisitLabel(value: string) {
  return new Date(value).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AppointmentCustomerCard({ customer }: Props) {
  const hasLastVisit = Boolean(customer.lastVisitAt);

  return (
    <section className="self-start rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserRound size={17} className="shrink-0 text-blue-600" />

          <h2 className="font-semibold text-slate-900">Customer information</h2>
        </div>

        <Link
          href={`/operations/customers/${customer.id}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700"
          aria-label="Open customer details"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
          {initials(customer.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {customer.name}
          </p>

          {customer.phone ? (
            <a
              href={`tel:${customer.phone}`}
              className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-blue-700"
            >
              <Phone size={13} />

              <span>{customer.phone}</span>
            </a>
          ) : (
            <p className="mt-1 text-sm text-slate-400">No phone number</p>
          )}
        </div>
      </div>

      <div
        className={`mt-5 grid gap-2 ${
          hasLastVisit ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <CustomerMetric value={customer.visits} label="Visits" />

        <CustomerMetric
          value={customer.noShows}
          label="No-shows"
          warning={customer.noShows > 0}
        />

        {customer.lastVisitAt ? (
          <div className="rounded-xl bg-blue-50 px-2 py-3 text-center">
            <CalendarDays size={15} className="mx-auto text-blue-600" />

            <p
              className="mt-1 truncate text-xs font-semibold text-blue-800"
              title={lastVisitLabel(customer.lastVisitAt)}
            >
              {lastVisitLabel(customer.lastVisitAt)}
            </p>

            <p className="mt-0.5 text-[11px] text-blue-600">Last visit</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CustomerMetric({
  value,
  label,
  warning = false,
}: {
  value: number;
  label: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <b
        className={`block text-lg leading-none ${
          warning ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </b>

      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
