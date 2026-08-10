"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";

export function Hero({
  businessName,
  tagline,
  description,
  highlight,
  city,
  location,
  heroPhotoUrl,
  hasServices,
  bookingHref,
  previewMode,
}: {
  businessName: string;
  tagline: string;
  description?: string;
  highlight?: string;
  city?: string;
  location: string;
  heroPhotoUrl: string;
  hasServices: boolean;
  bookingHref: string;
  previewMode?: boolean;
}) {
  const heroDescription =
    description?.trim() ||
    `Professional care at ${businessName}, with clear treatment choices and convenient online booking.`;
  const heroHighlight =
    highlight?.trim() ||
    "Thoughtful care, from your first question to your next visit.";

  return (
    <section
      id="top"
      className="px-3 pb-24 pt-5 md:px-6 md:pb-32 md:pt-7 lg:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(20,39,35,0.10)] lg:min-h-[700px] lg:grid-cols-[0.94fr_1.06fr] lg:rounded-[2.75rem]">
        <div className="flex flex-col justify-between gap-14 bg-[var(--secondary-ink)] p-7 text-start text-white md:p-12 lg:p-16 xl:p-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              <ShieldCheck size={14} /> Trusted care, clearly explained
            </p>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.01] tracking-[-0.055em] text-white md:text-6xl lg:text-7xl xl:text-[5.2rem]">
              {tagline.trim() || "Care that puts you first."}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/68 md:text-lg">
              {heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={bookingHref}
                onClick={
                  previewMode ? (event) => event.preventDefault() : undefined
                }
                scroll={false}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
              >
                Book appointment <ArrowUpRight size={16} />
              </Link>
              {hasServices ? (
                <a
                  href="#services"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  View treatments
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { Icon: FileText, label: "Clear treatment details" },
              { Icon: UserRoundCheck, label: "Meet the care team" },
              { Icon: CalendarDays, label: "Book from live availability" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 text-start"
              >
                <Icon size={17} className="text-[var(--accent-soft)]" />
                <p className="mt-4 text-xs font-semibold leading-5 text-white">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden bg-[var(--secondary-soft)] lg:min-h-full">
          <img
            src={heroPhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/35 via-transparent to-transparent" />

          <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:inset-x-8 sm:bottom-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="max-w-sm rounded-[1.5rem] border border-white/45 bg-white/88 p-5 text-start text-[var(--text)] shadow-xl backdrop-blur-xl">
              <Stethoscope size={20} className="text-[var(--accent-strong)]" />
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Patient experience
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                {heroHighlight}
              </p>
            </div>
            {location ? (
              <div className="inline-flex items-center gap-2 justify-self-start rounded-full border border-white/45 bg-white/88 px-4 py-2.5 text-xs font-semibold text-[var(--text)] shadow-lg backdrop-blur-xl sm:justify-self-end">
                <MapPin size={14} className="text-[var(--accent-strong)]" />{" "}
                {city || location}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
