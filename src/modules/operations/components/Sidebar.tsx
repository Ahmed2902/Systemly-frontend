"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Moon,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Sun,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { useOperations } from "../operations.context";
import { useOperationsTheme } from "../operations-theme";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  ownerOnly?: boolean;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/operations/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "bg-violet-100 text-violet-700", ownerOnly: true },
  { href: "/operations/calendar", label: "Calendar", icon: CalendarDays, accent: "bg-sky-100 text-sky-700" },
  { href: "/operations/appointments", label: "Appointments", icon: ClipboardList, accent: "bg-indigo-100 text-indigo-700" },
  { href: "/operations/customers", label: "Customers", icon: Users, accent: "bg-emerald-100 text-emerald-700" },
  { href: "/operations/invoices", label: "Invoices", icon: Receipt, accent: "bg-amber-100 text-amber-700" },
  { href: "/operations/staff", label: "Staff", icon: UserRound, accent: "bg-rose-100 text-rose-700", exact: true },
  { href: "/operations/staff/invite", label: "Invite team", icon: UserPlus, accent: "bg-fuchsia-100 text-fuchsia-700", ownerOnly: true },
  { href: "/operations/services", label: "Services", icon: Sparkles, accent: "bg-orange-100 text-orange-700" },
  { href: "/operations/settings", label: "Settings", icon: Settings, accent: "bg-slate-200 text-slate-700", ownerOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openNewAppointment } = useOperations();
  const { theme, toggleTheme } = useOperationsTheme();
  const ownerView = user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || ownerView);

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white/95 shadow-sm backdrop-blur transition-colors duration-200">
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-violet-200">H</span>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-950">Hgezli</div>
            <p className="text-[11px] font-medium text-slate-400">Business operations</p>
          </div>
        </div>
        <button type="button" onClick={() => openNewAppointment()} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200/70 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700">
          <Plus size={16} /> New Appointment
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2.5 py-2">
        {items.map(({ href, label, icon: Icon, accent, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link key={href} href={href} className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all ${active ? "bg-violet-50 text-violet-800 shadow-sm ring-1 ring-violet-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${accent} ${active ? "shadow-sm" : "opacity-75 group-hover:opacity-100"}`}>
                <Icon size={16} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-3">
        <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          <span className="flex items-center gap-2">{theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          <span className="text-xs font-medium text-slate-400">On</span>
        </button>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-3">
          <p className="text-xs font-semibold text-violet-800">Need a hand?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-violet-600">Help and setup guides will live here as the workspace grows.</p>
        </div>
      </div>
    </aside>
  );
}
