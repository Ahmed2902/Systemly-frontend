import {
  Archive,
  Clock3,
  Edit3,
  MoreHorizontal,
  RotateCcw,
  UserRoundX,
} from "lucide-react";
import { getOperationsAccent } from "@/modules/operations/operations-theme";
import type { CatalogService } from "../services.types";

function formatPrice(value?: number) {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ServicesTable({
  services,
  canManageMoney,
  onEdit,
  onToggleActive,
  actionId,
}: {
  services: CatalogService[];
  canManageMoney: boolean;
  onEdit: (service: CatalogService) => void;
  onToggleActive: (service: CatalogService) => void;
  actionId: string | null;
}) {
  return (
    <section className="op-panel services-table overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--op-border)] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--op-text)]">
              All Services
            </h2>
            <span className="rounded-full bg-[var(--op-surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--op-text-secondary)]">
              {services.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--op-text-muted)]">
            Manage availability, duration, staff eligibility, and categories.
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--op-surface-soft)] text-[var(--op-text-muted)]">
            <MoreHorizontal size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-[var(--op-text)]">
            No services found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-[var(--op-text-muted)]">
            Try another search or filter, or create the first service in this
            category.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="relative z-10 bg-[var(--op-surface-soft)] text-xs uppercase tracking-wide text-[var(--op-text-muted)]">
              <tr>
                <th className="border-b border-[var(--op-border)] px-5 py-3 font-semibold">
                  Service
                </th>
                <th className="border-b border-[var(--op-border)] px-4 py-3 font-semibold">
                  Category
                </th>
                <th className="border-b border-[var(--op-border)] px-4 py-3 font-semibold">
                  Duration
                </th>
                {canManageMoney ? (
                  <th className="border-b border-[var(--op-border)] px-4 py-3 font-semibold">
                    Price
                  </th>
                ) : null}
                <th className="border-b border-[var(--op-border)] px-4 py-3 font-semibold">
                  Eligible staff
                </th>
                <th className="border-b border-[var(--op-border)] px-4 py-3 font-semibold">
                  Status
                </th>
                <th className="border-b border-[var(--op-border)] px-5 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => {
                const accent = getOperationsAccent(
                  service.category ?? "Uncategorized",
                  index,
                );
                const visibleStaff = service.eligibleStaff.slice(0, 3);
                const remaining = Math.max(
                  service.eligibleStaff.length - visibleStaff.length,
                  0,
                );
                const accentSoft = `color-mix(in srgb, ${accent.hex} 14%, var(--op-surface))`;
                const accentBorder = `color-mix(in srgb, ${accent.hex} 48%, var(--op-border))`;

                return (
                  <tr
                    key={service.id}
                    className={`group relative transition-colors hover:bg-[var(--op-hover)] ${
                      service.isActive
                        ? "bg-[var(--op-surface)]"
                        : "bg-[var(--op-surface-soft)]"
                    }`}
                  >
                    <td className="relative z-0 border-b border-[var(--op-border)] px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold"
                          style={{ background: accentSoft, color: accent.hex }}
                        >
                          {service.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`truncate font-semibold ${
                              service.isActive
                                ? "text-[var(--op-text)]"
                                : "text-[var(--op-text-muted)]"
                            }`}
                          >
                            {service.name}
                          </p>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-[var(--op-text-muted)]">
                            {service.description || "No description added"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="relative z-0 border-b border-[var(--op-border)] px-4 py-4 align-middle">
                      <span
                        className="relative z-10 inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold"
                        style={{
                          background: accentSoft,
                          borderColor: accentBorder,
                          color: accent.hex,
                        }}
                      >
                        {service.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="border-b border-[var(--op-border)] px-4 py-4 align-middle text-[var(--op-text-secondary)]">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Clock3
                          size={14}
                          className="text-[var(--op-text-muted)]"
                        />
                        {service.durationMin} min
                      </span>
                    </td>
                    {canManageMoney ? (
                      <td className="border-b border-[var(--op-border)] px-4 py-4 align-middle font-medium text-[var(--op-text)]">
                        {formatPrice(service.priceEgp)}
                      </td>
                    ) : null}
                    <td className="border-b border-[var(--op-border)] px-4 py-4 align-middle">
                      {service.eligibleStaff.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--op-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--op-text-muted)]">
                          <UserRoundX size={13} />
                          No active staff
                        </span>
                      ) : (
                        <div className="flex items-center">
                          {visibleStaff.map((staff, staffIndex) => (
                            <span
                              key={staff.id}
                              title={staff.name}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--op-surface)] bg-[var(--op-surface-soft)] text-[10px] font-semibold text-[var(--op-text-secondary)] ${
                                staffIndex > 0 ? "-ml-2" : ""
                              }`}
                            >
                              {initials(staff.name)}
                            </span>
                          ))}
                          {remaining > 0 ? (
                            <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--op-surface)] bg-[var(--op-info-soft)] text-[10px] font-semibold text-[var(--op-info)]">
                              +{remaining}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="border-b border-[var(--op-border)] px-4 py-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.isActive
                            ? "bg-[var(--op-success-soft)] text-[var(--op-success)]"
                            : "bg-[var(--op-surface-soft)] text-[var(--op-text-muted)]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            service.isActive
                              ? "bg-[var(--op-success)]"
                              : "bg-[var(--op-text-faint)]"
                          }`}
                        />
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-b border-[var(--op-border)] px-5 py-4 align-middle">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(service)}
                          className="op-icon-button h-9 w-9"
                          aria-label={`Edit ${service.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={actionId === service.id}
                          onClick={() => onToggleActive(service)}
                          className={`op-icon-button h-9 w-9 disabled:cursor-wait disabled:opacity-50 ${
                            service.isActive
                              ? "hover:!border-[var(--op-danger)] hover:!bg-[var(--op-danger-soft)] hover:!text-[var(--op-danger)]"
                              : "hover:!border-[var(--op-success)] hover:!bg-[var(--op-success-soft)] hover:!text-[var(--op-success)]"
                          }`}
                          aria-label={
                            service.isActive
                              ? `Archive ${service.name}`
                              : `Reactivate ${service.name}`
                          }
                        >
                          {service.isActive ? (
                            <Archive size={15} />
                          ) : (
                            <RotateCcw size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
