"use client";

import Link from "next/link";
import { useParams } from "next/navigation"; // 1. Import useParams

export function Hero({
  tagline,
  heroPhotoUrl,
}: {
  tagline: string;
  heroPhotoUrl: string | null;
}) {
  const words = tagline.trim().split(" ");
  const lastWord = words.pop() ?? "";
  const leadWords = words.join(" ");

  // 2. Grab the business slug safely from the router state
  const params = useParams();
  const slug = params?.slug || "";

  return (
    <section className="relative">
      <div className="absolute inset-0">
        {heroPhotoUrl ? (
          <img
            src={heroPhotoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#E8DFD3]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EE] via-[#F7F3EE]/60 to-transparent" />
      </div>

      <div className="relative px-8 py-28 md:px-16 md:py-40">
        <p
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          A sanctuary of style
        </p>
        <h1 className="font-display mt-4 max-w-xl text-5xl leading-[1.1] text-[#2B2420] md:text-6xl">
          {leadWords}{" "}
          <span
            className="italic font-medium"
            style={{ color: "var(--accent)" }}
          >
            {lastWord}
          </span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#5C5349]">
          Bespoke beauty and wellness services, tailored to your unique essence.
        </p>
        <div className="mt-8 flex gap-3">
          {/* 3. Uses the dynamically determined URL parameter */}
          <Link
            href={`/${slug}/book`}
            className="rounded-sm px-6 py-3 text-xs font-medium uppercase tracking-wider text-white text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
              scroll={false}

          >
            Reserve Your Moment
          </Link>

          <a
            href="#services"
            className="rounded-sm border border-[#2B2420]/20 px-6 py-3 text-xs font-medium uppercase tracking-wider text-[#2B2420] text-center transition-colors hover:bg-[#2B2420]/5"
          >
            Explore Services
          </a>
        </div>
      </div>
    </section>
  );
}
