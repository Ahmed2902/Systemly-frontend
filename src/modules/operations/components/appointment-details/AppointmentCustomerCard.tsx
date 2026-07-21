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
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserRound size={17} className="text-blue-600" />
          <h2 className="font-semibold text-slate-950">Customer</h2>
        </div>
        <Link
          href={`/operations/customers/${customer.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
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
          <p className="truncate text-base font-semibold text-slate-950">{customer.name}</p>
          {customer.phone ? (
            <a
              href={`tel:${customer.phone}`}
              className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-blue-700"
            >
              <Phone size={13} />
              {customer.phone}
            </a>
          ) : (
            <p className="mt-1 text-sm text-slate-400">No phone number</p>
          )}
        </div>
      </div>

      <div className={`mt-5 grid gap-2 ${hasLastVisit ? "grid-cols-3" : "grid-cols-2"}`}>
        <Metric value={customer.visits} label="Visits" />
        <Metric value={customer.noShows} label="No-shows" warning={customer.noShows > 0} />
        {customer.lastVisitAt ? (
          <div className="rounded-xl bg-blue-50 px-2 py-3 text-center">
            <CalendarDays size={15} className="mx-auto text-blue-600" />
            <p className="mt-1 truncate text-xs font-semibold text-blue-800">
              {lastVisitLabel(customer.lastVisitAt)}
            </p>
            <p className="mt-0.5 text-[11px] text-blue-600">Last visit</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({
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
      <b className={`block text-lg leading-none ${warning ? "text-amber-700" : "text-slate-950"}`}>
        {value}
      </b>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
