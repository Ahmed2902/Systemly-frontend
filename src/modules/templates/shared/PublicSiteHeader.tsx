"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export type PublicSiteNavLink = {
  label: string;
  href: string;
  show?: boolean;
};

export function PublicSiteHeader({
  variant,
  businessName,
  logoUrl,
  bookingHref,
  previewMode = false,
  links,
}: {
  variant: "salon" | "clinic";
  businessName: string;
  logoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
  links: PublicSiteNavLink[];
}) {
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter((link) => link.show !== false);
  const isSalon = variant === "salon";

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const bookingClick = previewMode
    ? (event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault()
    : undefined;

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={`relative mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border px-4 py-2.5 shadow-[0_14px_38px_rgba(18,22,20,0.10)] backdrop-blur-xl md:px-5 ${
          isSalon
            ? "border-white/10 bg-[var(--secondary-ink)] text-white"
            : "border-[var(--border)] bg-white/92 text-[var(--text)]"
        }`}
      >
        <a href="#top" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className={`h-9 w-9 flex-none object-cover ${isSalon ? "rounded-full" : "rounded-xl"}`}
            />
          ) : (
            <span
              className={`grid h-9 w-9 flex-none place-items-center text-sm font-semibold ${
                isSalon ? "rounded-full bg-white/10 text-white" : "rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              }`}
            >
              {businessName.trim().charAt(0).toUpperCase() || "?"}
            </span>
          )}
          <span className={`${isSalon ? "font-display" : ""} truncate text-base font-semibold tracking-[-0.02em] md:text-lg`}>
            {businessName}
          </span>
        </a>

        <nav className={`hidden items-center gap-6 text-xs font-semibold lg:flex ${isSalon ? "text-white/68" : "text-[var(--muted)]"}`}>
          {visibleLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition-colors ${isSalon ? "hover:text-white" : "hover:text-[var(--text)]"}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={bookingHref}
            aria-disabled={previewMode}
            onClick={bookingClick}
            scroll={false}
            className={`hidden min-h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold sm:inline-flex ${
              isSalon
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]"
                : "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]"
            }`}
          >
            Book appointment <ArrowUpRight size={14} />
          </Link>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={`grid h-10 w-10 place-items-center rounded-full border lg:hidden ${
              isSalon ? "border-white/12 bg-white/6 text-white" : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {open ? (
          <div
            className={`absolute inset-x-0 top-[calc(100%+.65rem)] overflow-hidden rounded-[1.5rem] border p-3 shadow-[0_24px_60px_rgba(18,22,20,0.18)] lg:hidden ${
              isSalon
                ? "border-white/10 bg-[var(--secondary-ink)] text-white"
                : "border-[var(--border)] bg-white text-[var(--text)]"
            }`}
          >
            <nav className="grid gap-1">
              {visibleLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    isSalon ? "text-white/72 hover:bg-white/8 hover:text-white" : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={bookingHref}
                aria-disabled={previewMode}
                onClick={(event) => {
                  setOpen(false);
                  bookingClick?.(event);
                }}
                scroll={false}
                className={`mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold ${
                  isSalon ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--accent)] text-[var(--accent-contrast)]"
                }`}
              >
                Book appointment <ArrowUpRight size={15} />
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
