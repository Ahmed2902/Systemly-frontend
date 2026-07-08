// src/modules/auth/components/AuthLayout.tsx
import Link from "next/link";
import { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Left: form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:w-1/2 sm:px-16">
        <Link href="/" className="mb-10 text-xl font-semibold text-foreground">
          Hgezli
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Right: brand panel, hidden on mobile */}
      <div className="hidden w-1/2 items-center justify-center bg-surface sm:flex">
        <div className="max-w-sm px-10 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <span className="text-2xl font-semibold text-accent">H</span>
          </div>
          <h2 className="text-xl font-medium text-foreground">
            Your business, live in 10 minutes.
          </h2>
          <p className="mt-3 text-sm text-muted">
            Build your booking website, manage your team, and grow your business
            — all in one place.
          </p>
        </div>
      </div>
    </main>
  );
}
