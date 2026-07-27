"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer({
  businessName,
  phone,
  address,
  city,
  instagram,
  bookingHref,
  previewMode,
}: {
  businessName: string;
  phone?: string;
  address?: string;
  city?: string;
  instagram?: string;
  bookingHref: string;
  previewMode?: boolean;
}) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center md:px-12 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <p className="font-display text-2xl text-[var(--text)]">{businessName}</p>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
          Thoughtful services, a calm space, and simple online booking.
        </p>

        <nav className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          <a href="#services">Services</a>
          <a href="#team">Artists</a>
          <a href="#gallery">Our space</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text)]">
          {phone ? <a href={`tel:${phone}`}>{phone}</a> : null}
          {address || city ? <span>{[address, city].filter(Boolean).join(", ")}</span> : null}
          {instagram ? (
            <a
              href={instagram.startsWith("http") ? instagram : `https://${instagram}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          ) : null}
        </div>

        <Link
          href={bookingHref}
          onClick={previewMode ? (event) => event.preventDefault() : undefined}
          className="mt-8 rounded-xl px-5 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Book appointment
        </Link>

        <p className="mt-10 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
