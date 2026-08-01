
import { usePlatformText } from "@/i18n/usePlatformText";
// src/modules/auth/components/AuthLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Globe2, ShieldCheck } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import "../auth-systemly.css";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const text = usePlatformText();
  const { t } = useLocale();

  return (
    <main className="systemly-auth">
      <section className="systemly-auth-visual" aria-label="Systemly product overview">
        <Link href="/" className="systemly-auth-brand sys-focusable">
          <SystemlyWordmark showDot dotClassName="systemly-auth-brand-dot" />
        </Link>

        <div className="systemly-auth-story">
          <p className="systemly-auth-eyebrow">{t("auth.layout.eyebrow")}</p>
          <h2>{t("auth.layout.title")}</h2>
          <p className="systemly-auth-story-copy">{t("auth.layout.copy")}</p>

          <div className="systemly-auth-product" aria-hidden="true">
            <div className="systemly-auth-product-bar">
              <span className="systemly-auth-product-status">systemly / operations</span>
              <span>{text("Today")}</span>
            </div>
            <div className="systemly-auth-product-body">
              <div className="systemly-auth-product-nav">
                <div className="systemly-auth-product-wordmark">Systemly</div>
                <span>{text("Dashboard")}</span>
                <span className="is-active">{text("Calendar")}</span>
                <span>{text("Appointments")}</span>
                <span>{text("Customers")}</span>
              </div>
              <div className="systemly-auth-product-main">
                <div className="systemly-auth-product-heading">
                  <div>
                    <small>Monday</small>
                    <strong>July 27, 2026</strong>
                  </div>
                  <em>{text("Live workspace")}</em>
                </div>
                <div className="systemly-auth-product-grid">
                  <div className="systemly-auth-product-metric">
                    <small>{text("Bookings")}</small>
                    <strong>18 today</strong>
                  </div>
                  <div className="systemly-auth-product-metric">
                    <small>{text("Available staff")}</small>
                    <strong>4 of 5</strong>
                  </div>
                  <div className="systemly-auth-product-metric">
                    <small>{text("Collected")}</small>
                    <strong>EGP 6,820</strong>
                  </div>
                </div>
                <div className="systemly-auth-product-schedule">
                  <div className="systemly-auth-product-times">
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                  </div>
                  <div className="systemly-auth-product-bookings">
                    <div className="systemly-auth-booking">
                      <strong>Yasmine Ali</strong>
                      <small>Hair consultation · Mona</small>
                    </div>
                    <div className="systemly-auth-booking">
                      <strong>Salma Tarek</strong>
                      <small>Skin treatment · Lina</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="systemly-auth-trust">
          <span><ShieldCheck size={14} /> {t("auth.layout.secureAccess")}</span>
          <span><Globe2 size={14} /> {t("auth.layout.languagesReady")}</span>
        </div>
      </section>

      <section className="systemly-auth-form-panel">
        <Link href="/" className="systemly-auth-mobile-brand sys-focusable">
          <SystemlyWordmark showDot dotClassName="systemly-auth-brand-dot" />
        </Link>

        <div className="systemly-auth-form-wrap">
          <header className="systemly-auth-form-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          <div className="systemly-auth-form-content">{children}</div>
        </div>

        <footer className="systemly-auth-form-footer">
          <span>{t("auth.layout.secureByDesign")}</span>
          <span aria-hidden="true">·</span>
          <span>{t("auth.layout.privateData")}</span>
        </footer>
      </section>
    </main>
  );
}
