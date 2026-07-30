"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardCheck,
  Globe2,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";

const showcaseSlides = [
  { id: "calendar", label: "Calendar", context: "systemly / operations" },
  { id: "dashboard", label: "Dashboard", context: "systemly / owner analytics" },
  { id: "website", label: "Website", context: "systemly / public website" },
  { id: "booking", label: "Booking", context: "systemly / online booking" },
] as const;

type ShowcaseSlide = (typeof showcaseSlides)[number]["id"];

export function LandingHero() {
  return (
    <section className="lp-hero">
      <div className="lp-shell lp-hero-grid">
        <div className="lp-hero-copy-block">
          <p className="lp-kicker">The operating system for service businesses</p>
          <h1 className="lp-hero-title">
            The system behind your service business.
          </h1>
          <p className="lp-hero-copy">
            Build the customer experience, take bookings, run the working day,
            and understand the business from one connected platform.
          </p>
          <div className="lp-hero-actions">
            <Link href="/signup" className="lp-button lp-button-primary">
              Start free <ArrowRight size={17} />
            </Link>
            <a href="#demo" className="lp-button lp-button-secondary">
              <Play size={16} fill="currentColor" /> Explore the product
            </a>
          </div>
          <div className="lp-hero-proof" aria-label="Product highlights">
            <span>Website + booking</span>
            <span>Daily operations</span>
            <span>Owner analytics</span>
            <span>Arabic + English</span>
          </div>
        </div>

        <HeroProductShowcase />
      </div>
    </section>
  );
}

function HeroProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeSlide = showcaseSlides[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setActiveIndex((current) => (current + 1) % showcaseSlides.length);
    }, 5600);

    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  function selectSlide(index: number) {
    setActiveIndex(index);
  }

  return (
    <div
      className={`lp-hero-product lp-hero-product-showcase ${paused ? "is-paused" : ""}`}
      aria-label="Systemly product showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="lp-hero-product-bar">
        <span className="lp-product-dot" />
        <span>{activeSlide.context}</span>
        <span>{activeSlide.label}</span>
      </div>

      <div className="lp-hero-product-body lp-showcase-stage" aria-live="polite">
        <ShowcaseSlidePanel id="calendar" active={activeSlide.id === "calendar"}>
          <CalendarPreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel id="dashboard" active={activeSlide.id === "dashboard"}>
          <DashboardPreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel id="website" active={activeSlide.id === "website"}>
          <WebsitePreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel id="booking" active={activeSlide.id === "booking"}>
          <BookingPreview />
        </ShowcaseSlidePanel>
      </div>

      <div className="lp-showcase-tabs" role="tablist" aria-label="Product preview">
        {showcaseSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={activeIndex === index ? "is-active" : ""}
            onClick={() => selectSlide(index)}
          >
            <span>{slide.label}</span>
            {activeIndex === index ? (
              <i key={`${slide.id}-${activeIndex}`} aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShowcaseSlidePanel({
  id,
  active,
  children,
}: {
  id: ShowcaseSlide;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`lp-showcase-slide lp-showcase-${id} ${active ? "is-active" : ""}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function ProductSidebar({ active }: { active: string }) {
  return (
    <aside className="lp-showcase-sidebar">
      <strong>Systemly</strong>
      {["Dashboard", "Calendar", "Appointments", "Customers", "Invoices"].map(
        (item) => (
          <span key={item} className={item === active ? "is-active" : ""}>
            {item}
          </span>
        ),
      )}
    </aside>
  );
}

function CalendarPreview() {
  return (
    <div className="lp-showcase-app-shell">
      <ProductSidebar active="Calendar" />
      <div className="lp-showcase-app-main">
        <div className="lp-showcase-app-heading">
          <div>
            <small>Monday</small>
            <strong>July 27, 2026</strong>
          </div>
          <button type="button">+ New appointment</button>
        </div>
        <div className="lp-showcase-calendar">
          <span>Staff</span><span>9:00</span><span>10:00</span><span>11:00</span>
          <b>Nour Khalil</b><i /><i className="is-visit">Mariam · Haircut</i><i />
          <b>Mona Adel</b><i className="is-break">Break</i><i /><i className="is-visit is-silver">Yasmine · Nails</i>
          <b>Dr. Lina</b><i /><i className="is-visit is-dark">Consultation</i><i />
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="lp-showcase-app-shell">
      <ProductSidebar active="Dashboard" />
      <div className="lp-showcase-app-main lp-showcase-dashboard-main">
        <div className="lp-showcase-app-heading">
          <div>
            <small>Owner analytics</small>
            <strong>Business overview</strong>
          </div>
          <span className="lp-showcase-owner-pill">Owner only</span>
        </div>
        <div className="lp-showcase-metrics">
          <article><span>Revenue</span><strong>EGP 38,620</strong><small>+12.4%</small></article>
          <article><span>Appointments</span><strong>568</strong><small>This month</small></article>
          <article><span>Returning</span><strong>68%</strong><small>Customers</small></article>
        </div>
        <div className="lp-showcase-dashboard-grid">
          <article className="lp-showcase-revenue-card">
            <div><strong>Revenue this month</strong><BarChart3 size={18} /></div>
            <div className="lp-showcase-bars">
              {[42, 55, 48, 72, 64, 88, 76].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </article>
          <article className="lp-showcase-service-card">
            <strong>Top services</strong>
            {["Haircut & blow-dry", "Skin consultation", "Gel manicure"].map(
              (service, index) => (
                <div key={service}>
                  <span>{service}</span>
                  <i><b style={{ width: `${90 - index * 18}%` }} /></i>
                </div>
              ),
            )}
          </article>
        </div>
      </div>
    </div>
  );
}

function WebsitePreview() {
  return (
    <div className="lp-showcase-website-shell">
      <div className="lp-showcase-site-nav">
        <strong>NOIR STUDIO</strong>
        <span>Services&nbsp;&nbsp; About&nbsp;&nbsp; Book</span>
      </div>
      <div className="lp-showcase-site-copy">
        <small>CAIRO · BY APPOINTMENT</small>
        <h3>Care, designed around you.</h3>
        <p>Personal appointments, considered services, and a calm way to book.</p>
        <button type="button">Book an appointment</button>
      </div>
      <div className="lp-showcase-site-card">
        <Globe2 size={17} />
        <span>Live website</span>
        <strong>Arabic + English</strong>
        <small>Built from the same services and availability your team manages.</small>
      </div>
    </div>
  );
}

function BookingPreview() {
  return (
    <div className="lp-showcase-booking-shell">
      <div className="lp-showcase-booking-brand">
        <strong>NOIR STUDIO</strong>
        <span>Book your visit</span>
      </div>
      <div className="lp-showcase-booking-content">
        <div className="lp-showcase-service-list">
          <small>Choose a service</small>
          {[
            ["Hair consultation", "45 min", "EGP 450"],
            ["Skin treatment", "60 min", "EGP 700"],
            ["Gel manicure", "45 min", "EGP 320"],
          ].map(([name, duration, price], index) => (
            <button key={name} type="button" className={index === 0 ? "is-selected" : ""}>
              <span><strong>{name}</strong><small>{duration}</small></span>
              <b>{price}</b>
            </button>
          ))}
        </div>
        <div className="lp-showcase-booking-summary">
          <ClipboardCheck size={20} />
          <small>Your booking</small>
          <strong>Hair consultation</strong>
          <span>Monday, July 27 · 10:00 AM</span>
          <div><Check size={14} /> Real staff availability</div>
          <button type="button">Continue</button>
        </div>
      </div>
    </div>
  );
}
