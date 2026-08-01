"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
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
import { usePlatformCopy } from "@/i18n/usePlatformCopy";
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
  const text = usePlatformText();
  const pathname = usePathname();
  const { user } = useAuth();
  const copy = usePlatformCopy().operations.shell;
  const { openNewAppointment } = useOperations();
  const { theme, toggleTheme } = useOperationsTheme();
  const ownerView =
    user?.role === text("BusinessAdmin") || user?.role === text("SuperAdmin");

  const navGroups: NavGroup[] = [
    {
      label: copy.workspace,
      items: [
        {
          href: "/operations/dashboard",
          label: copy.dashboard,
          icon: LayoutDashboard,
          ownerOnly: true,
        },
        { href: "/operations/calendar", label: copy.calendar, icon: CalendarDays },
        {
          href: "/operations/appointments",
          label: copy.appointments,
          icon: ClipboardList,
        },
      ],
    },
    {
      label: copy.management,
      items: [
        { href: "/operations/customers", label: copy.customers, icon: Users },
        { href: "/operations/invoices", label: copy.invoices, icon: Receipt },
        {
          href: "/operations/staff",
          label: copy.staff,
          icon: UserRound,
          exact: true,
        },
        {
          href: "/operations/staff/invite",
          label: copy.inviteTeam,
          icon: UserPlus,
          ownerOnly: true,
        },
        { href: "/operations/services", label: copy.services, icon: Sparkles },
      ],
    },
    {
      label: copy.business,
      items: [
        {
          href: "/operations/settings",
          label: copy.settings,
          icon: Settings,
          ownerOnly: true,
        },
      ],
    },
  ];

  return (
    <aside className={`op-sidebar ${open ? "is-open" : ""}`} aria-label={copy.navigation}>
      <div className="op-sidebar-header">
        <div className="op-wordmark">
          <div className="min-w-0">
            <div className="op-wordmark-name">Systemly</div>
            <p className="op-wordmark-meta">{copy.businessOperations}</p>
          </div>
          <button
            type="button"
            className="op-icon-button lg:hidden"
            aria-label={copy.closeNavigation}
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
          <Plus size={16} /> {copy.newAppointment}
        </button>
      </div>

      <nav className="op-nav">
        {navGroups.map((group) => {
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
          aria-label={theme === "dark" ? copy.switchLight : copy.switchDark}
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            {theme === "dark" ? copy.darkAppearance : copy.lightAppearance}
          </span>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--op-text-faint)]">
            {copy.change}
          </span>
        </button>

        <div className="op-account">
          <span className="op-avatar">{initials(user?.name)}</span>
          <div className="op-account-copy">
            <strong dir="auto">{user?.name || copy.user}</strong>
            <span dir="auto">{user?.email || user?.role || copy.member}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
