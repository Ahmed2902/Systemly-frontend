"use client";

import Link from "next/link";

export function Nav({
  businessName,
  logoUrl,
  bookingHref,
  previewMode = false,
}: {
  businessName: string;
  logoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
}) {
  const links = ["Services", "Gallery", "Team", "About", "Contact"];

  return (
    <nav className="flex items-center justify-between px-8 py-5 md:px-16">
      <span className="font-display flex items-center text-lg font-semibold tracking-wide text-[#2B2420]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="mr-2 inline-block h-6 w-6 rounded-full object-cover"
          />
        ) : null}
        {businessName.toUpperCase()}
      </span>
      <div className="hidden gap-8 text-xs font-medium uppercase tracking-wider text-[#2B2420] md:flex">
        {links.map((label) => (
          <a key={label} href={`#${label.toLowerCase()}`} className="hover:opacity-60">
            {label}
          </a>
        ))}
      </div>

      <Link
        href={bookingHref}
        aria-disabled={previewMode}
        onClick={previewMode ? (event) => event.preventDefault() : undefined}
        className="inline-block rounded-sm px-5 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
        scroll={false}
      >
        Book appointment
      </Link>
    </nav>
  );
}
