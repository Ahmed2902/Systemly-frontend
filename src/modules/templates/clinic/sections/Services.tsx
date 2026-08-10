"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  HeartPulse,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { ClinicTemplateData } from "../clinic.types";

const treatmentIcons = [Stethoscope, HeartPulse, Sparkles];

function iconForService(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = id.charCodeAt(index) + ((hash << 5) - hash);
  }
  return treatmentIcons[Math.abs(hash) % treatmentIcons.length];
}

export function Services({
  services,
  showServicePrices,
  bookingHref,
  previewMode,
}: {
  services: ClinicTemplateData["services"];
  showServicePrices: boolean;
  bookingHref: string;
  previewMode?: boolean;
}) {
  if (!services.length) return null;

  return (
    <section
      id="services"
      className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="text-start lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Treatments
          </p>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
            Care options made easier to understand.
          </h2>
          <p className="mt-6 max-w-md text-base leading-8 text-[var(--muted)]">
            {showServicePrices
              ? "Review the purpose, duration, and price of each treatment before choosing an appointment."
              : "Review the purpose and duration of each treatment before choosing an appointment."}
          </p>
          <Link
            href={bookingHref}
            onClick={
              previewMode ? (event) => event.preventDefault() : undefined
            }
            scroll={false}
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
          >
            Book a visit <ArrowUpRight size={16} />
          </Link>
        </div>

        <div dir="ltr" className="grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = iconForService(service.id);
            return (
              <article
                key={service.id}
                className="flex min-h-72 flex-col rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-7 text-left transition duration-300 hover:-translate-y-1 hover:bg-[var(--surface)] hover:shadow-[0_18px_45px_rgba(20,39,35,0.07)]"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  {showServicePrices ? (
                    <strong className="text-sm text-[var(--text)]">
                      EGP {service.priceEgp}
                    </strong>
                  ) : null}
                </div>
                <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  {service.category?.trim() || "Treatment"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[var(--text)]">
                  {service.name}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                  {service.description ||
                    "Professional treatment delivered with clear guidance and attentive care."}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-8 text-xs text-[var(--muted)]">
                  <Clock3 size={14} /> {service.durationMin} minutes
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
