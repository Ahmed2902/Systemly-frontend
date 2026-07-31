"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { SalonTemplateData } from "../salon.types";

export function Services({
  services,
  bookingHref,
  previewMode,
}: {
  services: SalonTemplateData["services"];
  bookingHref: string;
  previewMode?: boolean;
}) {
  if (services.length === 0) return null;

  const categories = new Set(services.map((service) => service.category?.trim()).filter(Boolean)).size;

  return (
    <section id="services" className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="text-start lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">Services</p>
          <h2 className="font-display mt-4 max-w-lg text-4xl font-normal leading-[1.04] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
            Considered care, clearly presented.
          </h2>
          <p className="mt-6 max-w-md text-base leading-8 text-[var(--muted)]">
            Find the service that suits the moment, with the time and price visible before you book.
          </p>

          <div className="mt-9 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2">
              {services.length} {services.length === 1 ? "service" : "services"}
            </span>
            {categories ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2">
                {categories} {categories === 1 ? "category" : "categories"}
              </span>
            ) : null}
          </div>

          <Link
            href={bookingHref}
            onClick={previewMode ? (event) => event.preventDefault() : undefined}
            scroll={false}
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--text)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111312]"
          >
            Reserve your visit <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--background)]">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="group grid gap-5 border-b border-[var(--border)] p-6 text-start transition last:border-b-0 hover:bg-[var(--surface)] md:grid-cols-[54px_minmax(0,1fr)_auto] md:items-start md:p-8"
            >
              <span className="text-xs font-semibold text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  {service.category?.trim() || "Signature service"}
                </p>
                <h3 className="font-display mt-2 text-2xl font-normal leading-tight text-[var(--text)] md:text-3xl">
                  {service.name}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                  {service.description || "A thoughtful service delivered with care, attention, and time for the details."}
                </p>
              </div>

              <div className="flex items-center justify-between gap-5 md:flex-col md:items-end">
                <strong className="whitespace-nowrap text-base font-semibold text-[var(--text)]">EGP {service.priceEgp}</strong>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-[var(--muted)]">
                  <Clock3 size={14} /> {service.durationMin} min
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
