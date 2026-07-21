import {
  ArrowRight,
  Droplets,
  HeartPulse,
  Scissors,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { getOperationsAccent } from "@/modules/operations/operations-theme";
import type { ServiceCategorySummary } from "../services.types";

const ICONS = [Stethoscope, Droplets, Sparkles, Scissors, HeartPulse];

function formatPrice(value?: number) {
  return value === undefined
    ? null
    : new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 2,
      }).format(value);
}

export function ServiceCategoryCards({
  categories,
  canManageMoney,
  onSelect,
}: {
  categories: ServiceCategorySummary[];
  canManageMoney: boolean;
  onSelect: (category: string) => void;
}) {
  if (categories.length === 0) return null;

  const visible = categories.slice(0, 3);

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {visible.map((category, index) => {
        const accent = getOperationsAccent(category.name, index);
        const Icon = ICONS[index % ICONS.length];

        return (
          <article
            key={category.name}
            className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accent.card}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.icon}`}
                >
                  <Icon size={21} />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">{category.name}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {category.active} active of {category.total}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accent.badge}`}
              >
                {category.total} {category.total === 1 ? "service" : "services"}
              </span>
            </div>

            <div className="mt-5 divide-y divide-slate-200/60 border-y border-slate-200/60">
              {category.services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {service.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {service.durationMin} min
                      {canManageMoney && service.priceEgp !== undefined
                        ? ` · ${formatPrice(service.priceEgp)}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      service.isActive ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    aria-label={service.isActive ? "Active" : "Inactive"}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSelect(category.name)}
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${accent.link}`}
            >
              View all {category.name.toLowerCase()}
              <ArrowRight size={15} />
            </button>
          </article>
        );
      })}
    </section>
  );
}
