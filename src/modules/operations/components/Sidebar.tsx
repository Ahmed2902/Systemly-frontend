"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  Receipt,
  UserRound,
  Sparkles,
  Settings,
  Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/operations/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operations/calendar", label: "Calendar", icon: CalendarDays },
  {
    href: "/operations/appointments",
    label: "Appointments",
    icon: ClipboardList,
  },
  { href: "/operations/customers", label: "Customers", icon: Users },
  { href: "/operations/invoices", label: "Invoices", icon: Receipt },
  { href: "/operations/staff", label: "Staff", icon: UserRound },
  { href: "/operations/services", label: "Services", icon: Sparkles },
  { href: "/operations/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="p-4">
        <div className="text-lg font-bold text-slate-900">Hgezli</div>
        <Link
          href="/operations/appointments/new"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New Appointment
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
