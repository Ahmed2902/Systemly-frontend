"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

function externalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
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
    phone
      ? { label: "Phone", value: phone, href: `tel:${phone}`, Icon: Phone }
      : null,
    whatsapp
      ? {
          label: "WhatsApp",
          value: whatsapp,
          href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          Icon: MessageCircle,
        }
      : null,
    instagram
      ? {
          label: "Instagram",
          value: "View our clinic updates",
          href: externalUrl(instagram),
          Icon: Camera,
        }
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

  return (
    <section id="contact" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_22px_65px_rgba(20,39,35,0.08)] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[3rem]">
        <div className="bg-[var(--accent-strong)] p-8 text-start text-white md:p-12 lg:p-16 xl:p-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
            Contact and booking
          </p>
          <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] md:text-5xl lg:text-6xl">
            The next step should feel straightforward.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
            Contact the clinic directly or choose a convenient appointment from
            the live schedule.
          </p>
          <Link
            href={bookingHref}
            onClick={
              previewMode ? (event) => event.preventDefault() : undefined
            }
            scroll={false}
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[var(--accent-deep)] transition hover:-translate-y-0.5 hover:bg-[#f3f7f5]"
          >
            <CalendarDays size={17} /> Book appointment{" "}
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
          {items.map(({ label, value, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="group min-h-64 bg-[var(--background)] p-8 text-start transition hover:bg-[var(--surface)] md:p-10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Icon size={19} />
              </span>
              <p className="mt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {label}
              </p>
              <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-[var(--text)]">
                {value}
              </p>
              <ArrowUpRight
                size={16}
                className="mt-5 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
