"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Camera, MapPin, MessageCircle, Phone } from "lucide-react";

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
    phone ? { label: "Call", value: phone, href: `tel:${phone}`, Icon: Phone } : null,
    whatsapp
      ? {
          label: "WhatsApp",
          value: whatsapp,
          href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          Icon: MessageCircle,
        }
      : null,
    instagram
      ? { label: "Instagram", value: "View our work", href: externalUrl(instagram), Icon: Camera }
      : null,
    location
      ? {
          label: "Visit",
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
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-[var(--accent-strong)] text-white shadow-[0_24px_70px_rgba(43,36,32,0.14)] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[3rem]">
        <div className="p-8 text-start md:p-12 lg:p-16 xl:p-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Your next visit</p>
          <h2 className="font-display mt-5 max-w-xl text-4xl font-normal leading-[1.03] tracking-[-0.045em] md:text-5xl lg:text-6xl">
            Make space for a little time that is yours.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
            Choose a service, see live availability, and arrive with every detail already organised.
          </p>

          <Link
            href={bookingHref}
            onClick={previewMode ? (event) => event.preventDefault() : undefined}
            scroll={false}
            className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[var(--accent-deep)] transition hover:-translate-y-0.5 hover:bg-[#f7f4ef]"
          >
            <CalendarDays size={17} /> Book appointment <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="grid gap-px bg-white/12 sm:grid-cols-2">
          {items.length ? (
            items.map(({ label, value, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group min-h-56 bg-black/8 p-7 text-start transition hover:bg-white/8 md:p-9"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8">
                  <Icon size={18} />
                </span>
                <p className="mt-14 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">{label}</p>
                <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-white">{value}</p>
                <ArrowUpRight size={16} className="mt-5 text-white/42 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </a>
            ))
          ) : (
            <div className="col-span-full flex min-h-80 items-center justify-center p-10 text-center text-white/60">
              Contact details can be added from the website settings.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
