"use client";

import Link from "next/link";
import {
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

export function CenteredBenefits({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: PublicFeature[];
}) {
  return (
    <section id="why" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          {description}
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = iconSet[index % iconSet.length];
            return (
              <article key={item.title} className="text-center">
                <span
                  className="mx-auto grid h-14 w-14 place-items-center rounded-full border bg-[var(--surface)]"
                  style={{ borderColor: "var(--border)", color: "var(--accent)" }}
                >
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">{item.description}</p>
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
}: {
  eyebrow: string;
  title: string;
  steps: PublicFeature[];
}) {
  const stepIcons = [Sparkles, UserRoundCheck, Clock3, CalendarCheck2];

  return (
    <section id="process" className="border-y px-6 py-24 md:px-12 lg:px-16 lg:py-28" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">
          {title}
        </h2>

        <div className="relative mt-14 grid gap-10 md:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t border-dashed md:block" style={{ borderColor: "var(--border)" }} />
          {steps.map((step, index) => {
            const Icon = stepIcons[index % stepIcons.length];
            return (
              <article key={step.title} className="relative text-center">
                <span
                  className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border-4 border-[var(--surface)] text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Icon size={20} />
                </span>
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-[var(--muted)]">{step.description}</p>
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
}: {
  bookingHref: string;
  previewMode?: boolean;
  label?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-[var(--surface)]/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden" style={{ borderColor: "var(--border)" }}>
      <Link
        href={bookingHref}
        onClick={previewMode ? (event) => event.preventDefault() : undefined}
        className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg"
        style={{ backgroundColor: "var(--accent)" }}
      >
        <CheckCircle2 size={17} /> {label}
      </Link>
    </div>
  );
}
