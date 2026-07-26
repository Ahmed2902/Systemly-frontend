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

export function LandingNav() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.055] bg-[#040706]/80 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-20 max-w-[1180px] items-center justify-between px-6">
        <Link href="/" className="text-2xl font-semibold tracking-[-.05em] text-[#eeeae2]">Hgezli<span className="text-emerald-400">.</span></Link>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm text-[#a0a7a0] transition-colors hover:text-white">{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-3">
          {user ? <button type="button" onClick={handleLogout} className="lp-button lp-button-secondary !min-h-10 !px-4">Log out</button> : <><Link href="/login" className="hidden text-sm text-[#9da49e] hover:text-white sm:block">Log in</Link><Link href="/signup" className="lp-button lp-button-primary !min-h-11">Start with Hgezli <ArrowRight size={15}/></Link></>}
        </div>
      </nav>
    </header>
  );
}
