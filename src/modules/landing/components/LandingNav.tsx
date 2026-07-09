// src/modules/landing/components/LandingNav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import { Button } from "../../../shared/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it works", href: "#how-it-works" },
];

export function LandingNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surfaceBorder bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Hgezli
        </Link>

        <div className="hidden gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button
              type="button"
              onClick={handleLogout}
              variant="outline"
              className="border-surfaceBorder bg-surface text-foreground hover:bg-surface/70"
            >
              Log out
            </Button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Button
                asChild
                className="bg-accent text-black hover:bg-accent/90"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
