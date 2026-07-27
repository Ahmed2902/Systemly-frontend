"use client";

import Link from "next/link";

export function Nav({
  businessName,
  logoUrl,
  bookingHref,
  previewMode = false,
  showTeam,
  showGallery,
  showFaq,
  showContact,
}: {
  businessName: string;
  logoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
  showTeam: boolean;
  showGallery: boolean;
  showFaq: boolean;
  showContact: boolean;
}) {
  const links = [
    { label: "Services", href: "#services", show: true },
    { label: "Artists", href: "#team", show: showTeam },
    { label: "Our space", href: "#gallery", show: showGallery },
    { label: "About", href: "#about", show: true },
    { label: "FAQ", href: "#faq", show: showFaq },
    { label: "Contact", href: "#contact", show: showContact },
  ].filter((link) => link.show);

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/92 px-6 py-4 backdrop-blur md:px-12 lg:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <a href="#" className="justify-self-start">
          <span className="font-display flex items-center gap-2 text-lg font-semibold tracking-wide text-[var(--text)]">
            {logoUrl ? <img src={logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : null}
            <span className="hidden sm:inline">{businessName}</span>
          </span>
        </a>

        <div className="hidden items-center justify-center gap-7 text-xs font-medium uppercase tracking-wider text-[var(--text)] lg:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-opacity hover:opacity-55">
              {link.label}
            </a>
          ))}
        </div>

        <Link
          href={bookingHref}
          aria-disabled={previewMode}
          onClick={previewMode ? (event) => event.preventDefault() : undefined}
          className="justify-self-end rounded-xl px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--accent)" }}
          scroll={false}
        >
          Book
        </Link>
      </div>
    </nav>
  );
}
