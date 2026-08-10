"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

const iconSet = [HeartHandshake, UserRoundCheck, ShieldCheck, Sparkles];

export type PublicFeature = {
  title: string;
  description: string;
};

type TemplateVariant = "salon" | "clinic";

export function CenteredBenefits({
  eyebrow,
  title,
  description,
  items,
  variant = "clinic",
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: PublicFeature[];
  variant?: TemplateVariant;
}) {
  const isSalon = variant === "salon";

  return (
    <section id="why" className={`px-6 py-24 md:px-12 lg:px-16 lg:py-32 ${isSalon ? "bg-[var(--surface)]" : "bg-[var(--surface)]"}`}>
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-20">
        <div className="text-start lg:sticky lg:top-32">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h2 className={`${isSalon ? "font-display font-normal" : "font-semibold"} mt-4 max-w-xl text-4xl leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl`}>
            {title}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {items.map((item, index) => {
            const Icon = iconSet[index % iconSet.length];
            return (
              <article key={item.title} className="min-h-64 bg-[var(--background)] p-7 text-start md:p-9">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  0{index + 1}
                </p>
                <h3 className={`${isSalon ? "font-display text-2xl font-normal" : "text-xl font-semibold"} mt-2 text-[var(--text)]`}>
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CenteredBookingProcess({
  eyebrow,
  title,
  steps,
  variant = "clinic",
}: {
  eyebrow: string;
  title: string;
  steps: PublicFeature[];
  variant?: TemplateVariant;
}) {
  const isSalon = variant === "salon";
  const stepIcons = [Sparkles, UserRoundCheck, Clock3, CalendarCheck2];

  return (
    <section
      id="process"
      className={`px-6 py-24 md:px-12 lg:px-16 lg:py-32 ${isSalon ? "bg-[var(--secondary-ink)] text-white" : "bg-[var(--secondary-soft)] text-[var(--text)]"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-7 text-start md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isSalon ? "text-white/48" : "text-[var(--accent-strong)]"}`}>
              {eyebrow}
            </p>
            <h2 className={`${isSalon ? "font-display font-normal" : "font-semibold"} mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.045em] md:text-5xl lg:text-6xl`}>
              {title}
            </h2>
          </div>
          <p className={`max-w-sm text-sm leading-7 ${isSalon ? "text-white/58" : "text-[var(--muted)]"}`}>
            Live availability keeps every step simple, from the first choice to the confirmed appointment.
          </p>
        </div>

        <div className={`mt-14 grid overflow-hidden rounded-[2rem] border md:grid-cols-2 xl:grid-cols-4 ${isSalon ? "border-white/10 bg-white/10" : "border-[var(--border)] bg-[var(--border)]"}`}>
          {steps.map((step, index) => {
            const Icon = stepIcons[index % stepIcons.length];
            return (
              <article
                key={step.title}
                className={`relative min-h-72 p-7 text-start md:p-8 ${
                  isSalon ? "border-white/10 bg-[var(--secondary-deep)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                } ${index > 0 ? "border-t md:border-t-0 md:border-s" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-full ${isSalon ? "bg-white text-[#171513]" : "bg-[var(--accent-soft)] text-[var(--accent-strong)]"}`}>
                    <Icon size={18} />
                  </span>
                  <span className={`text-xs font-semibold ${isSalon ? "text-white/34" : "text-[var(--muted)]"}`}>
                    0{index + 1}
                  </span>
                </div>
                <h3 className={`${isSalon ? "font-display text-2xl font-normal" : "text-xl font-semibold"} mt-16`}>
                  {step.title}
                </h3>
                <p className={`mt-3 text-sm leading-7 ${isSalon ? "text-white/58" : "text-[var(--muted)]"}`}>
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function MobileBookingBar({
  bookingHref,
  previewMode,
  label = "Book appointment",
  variant = "clinic",
}: {
  bookingHref: string;
  previewMode?: boolean;
  label?: string;
  variant?: TemplateVariant;
}) {
  const isSalon = variant === "salon";

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 border-t p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden ${isSalon ? "border-white/10 bg-[#171513]/95" : "border-[var(--border)] bg-white/95"}`}>
      <Link
        href={bookingHref}
        onClick={previewMode ? (event) => event.preventDefault() : undefined}
        className={`mx-auto flex max-w-md items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold shadow-lg ${
          isSalon ? "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]" : "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]"
        }`}
      >
        <CheckCircle2 size={17} /> {label} <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
