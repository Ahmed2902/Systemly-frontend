"use client";

import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import { SystemlyBrand } from "./SystemlyBrand";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Live demo", href: "#demo" },
  { label: "Early access", href: "#pricing" },
];

export function LandingNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="lp-nav-wrap">
      <nav className="lp-nav-shell" aria-label="Primary navigation">
        <Link href="/" aria-label="Systemly home">
          <SystemlyBrand className="text-[1.35rem]" />
        </Link>

        <div className="lp-nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="lp-nav-actions">
          {user ? (
            <button type="button" onClick={handleLogout} className="lp-button lp-button-secondary lp-button-compact">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="lp-nav-login">Log in</Link>
              <Link href="/signup" className="lp-button lp-button-primary lp-button-compact">
                Start free <ArrowRight size={15} />
              </Link>
            </>
          )}
          <button type="button" className="lp-mobile-menu" aria-label="Open navigation">
            <Menu size={20} />
          </button>
        </div>
      </nav>
    </header>
  );
}
