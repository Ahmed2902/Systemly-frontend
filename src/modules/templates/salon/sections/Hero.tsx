"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck2,
  MapPin,
} from "lucide-react";
import { Image } from "@/shared/components/Image";

export function Hero({
  businessName,
  tagline,
  description,
  highlight,
  city,
  heroPhotoUrl,
  bookingHref,
  previewMode = false,
}: {
  businessName: string;
  tagline: string;
  description?: string;
  highlight?: string;
  city?: string;
  heroPhotoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
}) {
  const headline = tagline.trim() || "Care, designed around you.";
  const heroDescription =
    description?.trim() ||
    "Explore considered services, meet the people behind the work, and book a time that fits your day.";
  const heroHighlight =
    highlight?.trim() || "Your next visit, already organised.";

  return (
    <section
      id="top"
      className="px-3 pb-24 pt-5 md:px-6 md:pb-32 md:pt-7 lg:px-8"
    >
      <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] bg-[var(--secondary-ink)] text-white shadow-[0_28px_80px_rgba(30,24,20,0.16)] lg:min-h-[720px] lg:grid-cols-[0.88fr_1.12fr] lg:rounded-[2.75rem]">
        <div className="flex flex-col justify-between gap-16 p-7 text-start md:p-12 lg:p-16 xl:p-20">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/48">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              {city
                ? `${city} · by appointment`
                : "Personal care · by appointment"}
            </div>

            <h1 className="font-display mt-8 max-w-3xl text-5xl font-normal leading-[0.98] tracking-[-0.055em] text-white md:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {headline}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/60 md:text-lg">
              {heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={bookingHref}
                aria-disabled={previewMode}
                onClick={
                  previewMode ? (event) => event.preventDefault() : undefined
                }
                scroll={false}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
              >
                Book an appointment <ArrowUpRight size={16} />
              </Link>
              <a
                href="#services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore services <ArrowDownRight size={16} />
              </a>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/36">
                The studio
              </p>
              <p className="font-display mt-2 text-xl text-white">
                {businessName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/36">
                Booking
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Live availability, clear services, one simple flow.
              </p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden bg-[var(--secondary-deep)] lg:min-h-full">
          {heroPhotoUrl ? (
            <Image
              src={heroPhotoUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary-wash)] to-[var(--secondary-soft)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/5" />

          <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:inset-x-8 sm:bottom-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="max-w-sm rounded-[1.5rem] border border-white/15 bg-black/30 p-5 text-start text-white backdrop-blur-xl">
              <CalendarCheck2 size={20} className="text-white/90" />
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Book online
              </p>
              <p className="font-display mt-2 text-2xl">{heroHighlight}</p>
            </div>
            {city ? (
              <div className="inline-flex items-center gap-2 justify-self-start rounded-full border border-white/15 bg-black/30 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xl sm:justify-self-end">
                <MapPin size={14} /> {city}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
