"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Live demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
];

function SystemlyMark() {
  return (
    <span className="systemly-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M29.5 8.5H16.8c-4.7 0-8.3 3.1-8.3 7.1 0 3.5 2.7 5.8 6.7 6.4l9.4 1.3c3.8.5 6.4 2.7 6.4 6 0 4.2-3.7 7.2-8.7 7.2H10.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <circle cx="30.5" cy="8.5" r="2.5" fill="currentColor"/>
        <circle cx="9.5" cy="36.5" r="2.5" fill="currentColor"/>
      </svg>
    </span>
  );
}

export function LandingNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-[#0b0b0e]/82 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-20 max-w-[1180px] items-center justify-between px-6">
        <Link href="/" className="systemly-brand text-2xl">
          <SystemlyMark />
          <span>systemly</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm text-[#a9a5a2] transition-colors hover:text-white">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-3">
          {user ? <button type="button" onClick={handleLogout} className="lp-button lp-button-secondary !min-h-10 !px-4">Log out</button> : <><Link href="/login" className="hidden text-sm text-[#a9a5a2] hover:text-white sm:block">Log in</Link><Link href="/signup" className="lp-button lp-button-primary !min-h-11">Start with Systemly <ArrowRight size={15}/></Link></>}
        </div>
      </nav>
    </header>
  );
}
