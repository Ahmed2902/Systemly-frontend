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
  X,
} from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import { useOperations } from "../operations.context";
import { useOperationsTheme } from "../operations-theme";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/operations/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        ownerOnly: true,
      },
      { href: "/operations/calendar", label: "Calendar", icon: CalendarDays },
      {
        href: "/operations/appointments",
        label: "Appointments",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/operations/customers", label: "Customers", icon: Users },
      { href: "/operations/invoices", label: "Invoices", icon: Receipt },
      {
        href: "/operations/staff",
        label: "Staff",
        icon: UserRound,
        exact: true,
      },
      {
        href: "/operations/staff/invite",
        label: "Invite team",
        icon: UserPlus,
        ownerOnly: true,
      },
      { href: "/operations/services", label: "Services", icon: Sparkles },
    ],
  },
  {
    label: "Business",
    items: [
      {
        href: "/operations/settings",
        label: "Settings",
        icon: Settings,
        ownerOnly: true,
      },
    ],
  },
];

function initials(name?: string | null) {
  return (name || "Systemly User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openNewAppointment } = useOperations();
  const { theme, toggleTheme } = useOperationsTheme();
  const ownerView =
    user?.role === "BusinessAdmin" || user?.role === "SuperAdmin";

  return (
    <aside className={`op-sidebar ${open ? "is-open" : ""}`} aria-label="Operations navigation">
      <div className="op-sidebar-header">
        <div className="op-wordmark">
          <div className="min-w-0">
            <div className="op-wordmark-name">Systemly</div>
            <p className="op-wordmark-meta">Business operations</p>
          </div>
          <button
            type="button"
            className="op-icon-button lg:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            openNewAppointment();
            onClose?.();
          }}
          className="op-new-appointment"
        >
          <Plus size={16} /> New appointment
        </button>
      </div>

      <nav className="op-nav">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.ownerOnly || ownerView);
          if (!items.length) return null;
          return (
            <div className="op-nav-group" key={group.label}>
              <p className="op-nav-label">{group.label}</p>
              <div className="space-y-1">
                {items.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact
                    ? pathname === href
                    : pathname === href || pathname?.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`op-nav-link ${active ? "is-active" : ""}`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="op-sidebar-footer">
        <button
          type="button"
          onClick={toggleTheme}
          className="op-theme-switch"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            {theme === "dark" ? "Dark appearance" : "Light appearance"}
          </span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--op-text-faint)]">
            Change
          </span>
        </button>

        <div className="op-account">
          <span className="op-avatar">{initials(user?.name)}</span>
          <div className="op-account-copy">
            <strong>{user?.name || "Systemly user"}</strong>
            <span>{user?.email || user?.role || "Workspace member"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
