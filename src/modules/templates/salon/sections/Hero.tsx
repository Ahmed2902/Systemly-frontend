"use client";

import Link from "next/link";

export function Hero({
  tagline,
  heroPhotoUrl,
  bookingHref,
  previewMode = false,
}: {
  tagline: string;
  heroPhotoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
}) {
  const words = tagline.trim().split(" ").filter(Boolean);
  const lastWord = words.pop() ?? "you";
  const leadWords = words.join(" ") || "Beauty that feels like";

  return (
    <section className="relative isolate overflow-hidden px-6 py-28 md:px-12 md:py-40 lg:px-16 lg:py-48">
      <div className="absolute inset-0 -z-20">
        {heroPhotoUrl ? (
          <img src={heroPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[var(--soft)]" />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-[var(--background)]/82 backdrop-blur-[1px]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--background)]/20 via-transparent to-[var(--background)]/65" />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>
          Personal care, beautifully organised
        </p>
        <h1 className="font-display mt-5 text-5xl leading-[1.05] text-[var(--text)] md:text-6xl lg:text-7xl">
          {leadWords}{" "}
          <span className="font-medium italic" style={{ color: "var(--accent)" }}>
            {lastWord}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
          Explore services, meet the team, and reserve an appointment from one calm, simple website.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={bookingHref}
            aria-disabled={previewMode}
            onClick={previewMode ? (event) => event.preventDefault() : undefined}
            className="rounded-xl px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
            scroll={false}
          >
            Reserve your moment
          </Link>
          <a
            href="#services"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text)] backdrop-blur transition hover:bg-[var(--surface)]"
          >
            Explore services
          </a>
        </div>
      </div>
    </section>
  );
}
