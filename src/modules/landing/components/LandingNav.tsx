"use client";


import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/useAuth";
import { getSettings } from "@/modules/settings/settings.api";
import type { AuthUser } from "@/modules/auth/auth.types";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Live demo", href: "#demo" },
  { label: "Early access", href: "#pricing" },
];

export function LandingNav() {
  const text = usePlatformText();
  const router = useRouter();
  const { user, accessToken, loading, logout } = useAuth();
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user?.businessId || !accessToken) {
      setPublicSlug(null);
      setWorkspaceLoading(false);
      return;
    }

    let cancelled = false;
    setWorkspaceLoading(true);

    getSettings(accessToken)
      .then((workspace) => {
        if (!cancelled) setPublicSlug(workspace.slug);
      })
      .catch((error) => {
        console.error("Could not load the public-site destination:", error);
        if (!cancelled) setPublicSlug(null);
      })
      .finally(() => {
        if (!cancelled) setWorkspaceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, user?.businessId]);

  async function handleLogout() {
    setMobileOpen(false);
    await logout();
    router.push("/");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="lp-nav-wrap">
      <nav className="lp-nav-shell" aria-label={text("Primary navigation")}>
        <Link href="/" aria-label={text("Systemly home")} onClick={closeMobileMenu}>
          <SystemlyWordmark className="systemly-brand text-[1.35rem]" />
        </Link>

        <div className="lp-nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {text(link.label)}
            </Link>
          ))}
        </div>

        <div className="lp-nav-actions">
          <div className="lp-nav-session-actions">
            <SessionActions
              user={user}
              authLoading={loading}
              publicSlug={publicSlug}
              workspaceLoading={workspaceLoading}
              onLogout={handleLogout}
            />
          </div>
          <button
            type="button"
            className="lp-mobile-menu"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-navigation"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div
        id="landing-mobile-navigation"
        className={`lp-mobile-nav-panel ${mobileOpen ? "is-open" : ""}`}
      >
        <div className="lp-mobile-nav-links">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMobileMenu}>
              {text(link.label)}
            </Link>
          ))}
        </div>
        <div className="lp-mobile-session-actions">
          <SessionActions
            user={user}
            authLoading={loading}
            publicSlug={publicSlug}
            workspaceLoading={workspaceLoading}
            onLogout={handleLogout}
            mobile
          />
        </div>
      </div>
    </header>
  );
}

function SessionActions({
  user,
  authLoading,
  publicSlug,
  workspaceLoading,
  onLogout,
  mobile = false,
}: {
  user: AuthUser | null;
  authLoading: boolean;
  publicSlug: string | null;
  workspaceLoading: boolean;
  onLogout: () => Promise<void>;
  mobile?: boolean;
}) {
  const text = usePlatformText();
  if (authLoading) {
    return <span className="lp-nav-session-loading" aria-label={text("Loading account")} />;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="lp-nav-login">{text("Log in")}</Link>
        <Link href="/signup" className="lp-button lp-button-primary lp-button-compact">
          {text("Start free")} <ArrowRight size={15} />
        </Link>
      </>
    );
  }

  if (!user.businessId) {
    return (
      <>
        <Link href="/onboarding" className="lp-button lp-button-primary lp-button-compact">
          {text("Continue onboarding")} <ArrowRight size={15} />
        </Link>
        <button type="button" onClick={() => void onLogout()} className="lp-nav-account-action">
          {text("Log out")}
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/operations" className="lp-button lp-button-primary lp-button-compact">
        {text("Operations")} <ArrowRight size={15} />
      </Link>
      {publicSlug ? (
        <Link
          href={`/${encodeURIComponent(publicSlug)}`}
          className="lp-nav-public-site"
          target="_blank"
          rel="noreferrer"
        >
          {text("Public site")} <ExternalLink size={14} />
        </Link>
      ) : (
        <button
          type="button"
          className="lp-nav-public-site is-loading"
          disabled
          aria-label={workspaceLoading ? text("Loading public site link") : text("Public site link unavailable")}
        >
          {text("Public site")} {workspaceLoading ? <span aria-hidden="true" /> : null}
        </button>
      )}
      <button
        type="button"
        onClick={() => void onLogout()}
        className={`lp-nav-account-action ${mobile ? "is-mobile" : ""}`}
      >
        {text("Log out")}
      </button>
    </>
  );
}
