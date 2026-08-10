"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

function externalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export function Footer({
  businessName,
  phone,
  address,
  city,
  instagram,
  whatsapp,
  bookingHref,
  previewMode,
  showTeam,
  showGallery,
  showFaq,
  showContact,
  showAbout,
  showServices,
}: {
  businessName: string;
  phone?: string;
  address?: string;
  city?: string;
  instagram?: string;
  whatsapp?: string;
  bookingHref: string;
  previewMode?: boolean;
  showTeam: boolean;
  showGallery: boolean;
  showFaq: boolean;
  showContact: boolean;
  showAbout: boolean;
  showServices: boolean;
}) {
  const location = [address, city].filter(Boolean).join(", ");

  return (
    <footer className="bg-[var(--secondary-ink)] px-6 py-16 text-white md:px-12 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="text-start">
            <p className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
              {businessName}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/52">
              Professional care, clear information, and convenient online
              booking.
            </p>
          </div>
          <Link
            href={bookingHref}
            onClick={
              previewMode ? (event) => event.preventDefault() : undefined
            }
            scroll={false}
            className="inline-flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] lg:justify-self-end"
          >
            Book appointment <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div className="text-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">
              Clinic
            </p>
            {location ? (
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/66">
                {location}
              </p>
            ) : (
              <p className="mt-4 text-sm text-white/40">
                Location available when booking.
              </p>
            )}
          </div>

          <div className="text-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">
              Contact
            </p>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/66">
              {phone ? <a href={`tel:${phone}`}>{phone}</a> : null}
              {whatsapp ? (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              ) : null}
              {instagram ? (
                <a
                  href={externalUrl(instagram)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Instagram
                </a>
              ) : null}
              {!phone && !whatsapp && !instagram ? (
                <p className="text-white/40">
                  Contact details available through the booking flow.
                </p>
              ) : null}
            </div>
          </div>

          <nav className="flex flex-wrap content-start gap-x-5 gap-y-3 text-start text-xs font-semibold text-white/52 md:justify-end">
            {showServices ? (
              <a href="#services" className="hover:text-white">
                Treatments
              </a>
            ) : null}
            {showTeam ? (
              <a href="#team" className="hover:text-white">
                Doctors
              </a>
            ) : null}
            {showGallery ? (
              <a href="#gallery" className="hover:text-white">
                Our clinic
              </a>
            ) : null}
            {showAbout ? (
              <a href="#about" className="hover:text-white">
                About
              </a>
            ) : null}
            {showFaq ? (
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            ) : null}
            {showContact ? (
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            ) : null}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/34 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p>
            Powered by <span className="font-semibold text-white/62">Systemly</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
