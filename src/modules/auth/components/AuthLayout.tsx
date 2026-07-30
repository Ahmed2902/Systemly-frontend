// src/modules/auth/components/AuthLayout.tsx
import Link from "next/link";
import { ReactNode } from "react";
import { Globe2, ShieldCheck } from "lucide-react";
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
  return (
    <main className="systemly-auth">
      <section className="systemly-auth-visual" aria-label="Systemly product overview">
        <Link href="/" className="systemly-auth-brand">
          <span className="systemly-auth-brand-dot" aria-hidden="true" />
          Systemly
        </Link>

        <div className="systemly-auth-story">
          <p className="systemly-auth-eyebrow">Business operations</p>
          <h2>Run the day from one connected workspace.</h2>
          <p className="systemly-auth-story-copy">
            Publish your website, accept bookings, coordinate staff, and understand
            the business without switching between disconnected tools.
          </p>

          <div className="systemly-auth-product" aria-hidden="true">
            <div className="systemly-auth-product-bar">
              <span className="systemly-auth-product-status">systemly / operations</span>
              <span>Today</span>
            </div>
            <div className="systemly-auth-product-body">
              <div className="systemly-auth-product-nav">
                <div className="systemly-auth-product-wordmark">Systemly</div>
                <span>Dashboard</span>
                <span className="is-active">Calendar</span>
                <span>Appointments</span>
                <span>Customers</span>
              </div>
              <div className="systemly-auth-product-main">
                <div className="systemly-auth-product-heading">
                  <div>
                    <small>Monday</small>
                    <strong>July 27, 2026</strong>
                  </div>
                  <em>Live workspace</em>
                </div>
                <div className="systemly-auth-product-grid">
                  <div className="systemly-auth-product-metric">
                    <small>Bookings</small>
                    <strong>18 today</strong>
                  </div>
                  <div className="systemly-auth-product-metric">
                    <small>Available staff</small>
                    <strong>4 of 5</strong>
                  </div>
                  <div className="systemly-auth-product-metric">
                    <small>Collected</small>
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
          <span><ShieldCheck size={14} /> Secure account access</span>
          <span><Globe2 size={14} /> Arabic + English ready</span>
        </div>
      </section>

      <section className="systemly-auth-form-panel">
        <Link href="/" className="systemly-auth-mobile-brand">
          <span className="systemly-auth-brand-dot" aria-hidden="true" />
          Systemly
        </Link>

        <div className="systemly-auth-form-wrap">
          <header className="systemly-auth-form-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          <div className="systemly-auth-form-content">{children}</div>
        </div>

        <footer className="systemly-auth-form-footer">
          <span>Secure by design</span>
          <span aria-hidden="true">·</span>
          <span>Your data stays private</span>
        </footer>
      </section>
    </main>
  );
}
