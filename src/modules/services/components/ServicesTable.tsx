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
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">All Services</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {services.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage availability, duration, staff eligibility, and categories.
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <MoreHorizontal size={24} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">No services found</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try another search or filter, or create the first service in this category.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                {canManageMoney ? (
                  <th className="px-4 py-3 font-semibold">Price</th>
                ) : null}
                <th className="px-4 py-3 font-semibold">Eligible staff</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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

                return (
                  <tr
                    key={service.id}
                    className={`transition hover:bg-slate-50/80 ${
                      service.isActive ? "" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold ${accent.icon}`}
                        >
                          {service.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`truncate font-semibold ${
                              service.isActive
                                ? "text-slate-900"
                                : "text-slate-500"
                            }`}
                          >
                            {service.name}
                          </p>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                            {service.description || "No description added"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${accent.pill}`}
                      >
                        {service.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={14} className="text-slate-400" />
                        {service.durationMin} min
                      </span>
                    </td>
                    {canManageMoney ? (
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {formatPrice(service.priceEgp)}
                      </td>
                    ) : null}
                    <td className="px-4 py-4">
                      {service.eligibleStaff.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          <UserRoundX size={13} />
                          No active staff
                        </span>
                      ) : (
                        <div className="flex items-center">
                          {visibleStaff.map((staff, staffIndex) => (
                            <span
                              key={staff.id}
                              title={staff.name}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-600 ${
                                staffIndex > 0 ? "-ml-2" : ""
                              }`}
                            >
                              {initials(staff.name)}
                            </span>
                          ))}
                          {remaining > 0 ? (
                            <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-50 text-[10px] font-semibold text-violet-700">
                              +{remaining}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            service.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(service)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
                          aria-label={`Edit ${service.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={actionId === service.id}
                          onClick={() => onToggleActive(service)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 disabled:cursor-wait disabled:opacity-50 ${
                            service.isActive
                              ? "border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:ring-rose-100"
                              : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:ring-emerald-100"
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
