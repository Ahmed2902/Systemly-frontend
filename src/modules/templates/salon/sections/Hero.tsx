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
    <section className="relative">
      <div className="absolute inset-0">
        {heroPhotoUrl ? (
          <img src={heroPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[#E8DFD3]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EE] via-[#F7F3EE]/60 to-transparent" />
      </div>

      <div className="relative px-8 py-28 md:px-16 md:py-40">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
          Personal care, beautifully organised
        </p>
        <h1 className="font-display mt-4 max-w-xl text-5xl leading-[1.1] text-[#2B2420] md:text-6xl">
          {leadWords}{" "}
          <span className="font-medium italic" style={{ color: "var(--accent)" }}>
            {lastWord}
          </span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#5C5349]">
          Explore services, meet the team, and reserve an appointment from one simple website.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={bookingHref}
            aria-disabled={previewMode}
            onClick={previewMode ? (event) => event.preventDefault() : undefined}
            className="rounded-sm px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
            scroll={false}
          >
            Reserve your moment
          </Link>
          <a
            href="#services"
            className="rounded-sm border border-[#2B2420]/20 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-[#2B2420] transition-colors hover:bg-[#2B2420]/5"
          >
            Explore services
          </a>
        </div>
      </div>
    </section>
  );
}
