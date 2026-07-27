"use client";

import Link from "next/link";
import { CalendarDays, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

function externalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export function Contact({
  phone,
  address,
  city,
  instagram,
  whatsapp,
  bookingHref,
  previewMode,
}: {
  phone?: string;
  address?: string;
  city?: string;
  instagram?: string;
  whatsapp?: string;
  bookingHref: string;
  previewMode?: boolean;
}) {
  const location = [address, city].filter(Boolean).join(", ");
  const items = [
    phone ? { label: "Phone", value: phone, href: `tel:${phone}`, Icon: Phone } : null,
    whatsapp
      ? {
          label: "WhatsApp",
          value: whatsapp,
          href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          Icon: MessageCircle,
        }
      : null,
    instagram
      ? { label: "Instagram", value: "Visit our profile", href: externalUrl(instagram), Icon: Instagram }
      : null,
    location
      ? {
          label: "Location",
          value: location,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
          Icon: MapPin,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    Icon: typeof Phone;
  }>;

  if (items.length === 0) return null;

  return (
    <section id="contact" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_18px_55px_rgba(43,36,32,0.06)] md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
          Contact us
        </p>
        <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl text-[var(--text)] md:text-5xl">
          Ready when you are
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
          Book online or use any of the details below to get in touch.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ label, value, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-5 text-center transition hover:-translate-y-0.5 hover:bg-[var(--surface)]"
            >
              <Icon className="mx-auto h-5 w-5" style={{ color: "var(--accent)" }} />
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm font-medium leading-6 text-[var(--text)]">{value}</p>
            </a>
          ))}
        </div>

        <Link
          href={bookingHref}
          onClick={previewMode ? (event) => event.preventDefault() : undefined}
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <CalendarDays size={17} /> Book appointment
        </Link>
      </div>
    </section>
  );
}
