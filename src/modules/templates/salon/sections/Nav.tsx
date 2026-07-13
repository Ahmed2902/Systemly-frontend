"use client";

import Link from "next/link";
import { useParams } from "next/navigation"; // 1. Import useParams

export function Nav({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string | null;
}) {
  const links = ["Services", "Gallery", "Team", "About", "Contact"];

  // 2. Automatically grab the active slug from the current URL structure
  const params = useParams();
  const slug = params?.slug || "";

  return (
    <nav className="flex items-center justify-between px-8 py-5 md:px-16">
      <span className="font-display text-lg font-semibold tracking-wide text-[#2B2420] flex items-center">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="inline-block h-6 w-6 mr-2 rounded-full object-cover"
          />
        )}
        {businessName.toUpperCase()}
      </span>
      <div className="hidden gap-8 text-xs font-medium uppercase tracking-wider text-[#2B2420] md:flex">
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="hover:opacity-60">
            {l}
          </a>
        ))}
      </div>

      {/* 3. Safe dynamic pathing that appends to your real URL */}
      <Link
        href={`/${slug}/book`}
        className="rounded-sm px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white inline-block text-center transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--accent)" }}
        scroll={false}
      >
        Book Appointment
      </Link>
    </nav>
  );
}
