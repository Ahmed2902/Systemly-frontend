"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ClipboardCheck,
  Globe2,
  Play,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const showcaseSlides = [
  { id: "calendar", label: "Calendar", context: "systemly / operations" },
  {
    id: "dashboard",
    label: "Dashboard",
    context: "systemly / owner analytics",
  },
  { id: "website", label: "Website", context: "systemly / public website" },
  { id: "booking", label: "Booking", context: "systemly / online booking" },
] as const;

type ShowcaseSlide = (typeof showcaseSlides)[number]["id"];

export function LandingHero() {
  const text = usePlatformText();
  return (
    <section className="lp-hero">
      <div className="lp-shell lp-hero-grid">
        <div className="lp-hero-copy-block">
          <p className="lp-kicker">
            {text("The operating system for service businesses")}
          </p>
          <h1 className="lp-hero-title">{text("The system behind your business.")}</h1>
          <p className="lp-hero-copy">
            {text("Build the customer experience, take bookings, run the working day, and understand the business from one connected platform.")}
          </p>
          <div className="lp-hero-actions">
            <Link href="/signup" className="lp-button lp-button-primary">
              {text("Start free")} <ArrowRight size={17} />
            </Link>
            <a href="#demo" className="lp-button lp-button-secondary">
              <Play size={16} fill="currentColor" /> {text("Explore the product")}
            </a>
          </div>
          <div className="lp-hero-proof" aria-label={text("Product highlights")}>
            <span>{text("Website + booking")}</span>
            <span>{text("Daily operations")}</span>
            <span>{text("Owner analytics")}</span>
            <span>{text("Arabic + English")}</span>
          </div>
        </div>

        <HeroProductShowcase />
      </div>
    </section>
  );
}

function HeroProductShowcase() {
  const text = usePlatformText();
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

  return (
    <div
      className={`lp-hero-product lp-hero-product-showcase ${paused ? "is-paused" : ""}`}
      aria-label={text("Systemly product showcase")}
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
        <span>{text(activeSlide.label)}</span>
      </div>

      <div
        className="lp-hero-product-body lp-showcase-stage"
        aria-live="polite"
      >
        <ShowcaseSlidePanel
          id="calendar"
          active={activeSlide.id === "calendar"}
        >
          <CalendarPreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel
          id="dashboard"
          active={activeSlide.id === "dashboard"}
        >
          <DashboardPreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel id="website" active={activeSlide.id === "website"}>
          <WebsitePreview />
        </ShowcaseSlidePanel>
        <ShowcaseSlidePanel id="booking" active={activeSlide.id === "booking"}>
          <BookingPreview />
        </ShowcaseSlidePanel>
      </div>

      <div
        className="lp-showcase-tabs"
        role="tablist"
        aria-label={text("Product preview")}
      >
        {showcaseSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            className={activeIndex === index ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
          >
            <span>{text(slide.label)}</span>
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
  children: ReactNode;
}) {
  return (
    <div
      className={`lp-showcase-slide lp-showcase-slide-${id} ${active ? "is-active" : ""}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function ProductSidebar({ active }: { active: string }) {
  const text = usePlatformText();
  return (
    <nav
      className="lp-showcase-sidebar"
      aria-label={text("Preview workspace navigation")}
    >
      <div className="lp-showcase-wordmark">Systemly</div>
      <div className="lp-showcase-sidebar-links">
        {[text("Dashboard"), text("Calendar"), text("Appointments"), text("Customers"), text("Invoices")].map(
          (item) => (
            <span key={item} className={item === active ? "is-active" : ""}>
              {item}
            </span>
          ),
        )}
      </div>
    </nav>
  );
}

function CalendarPreview() {
  const text = usePlatformText();
  return (
    <div className="lp-showcase-app-shell">
      <ProductSidebar active={text("Calendar")} />
      <div className="lp-showcase-app-main lp-showcase-calendar-main">
        <div className="lp-showcase-app-heading">
          <div>
            <small>{text("Monday")}</small>
            <strong>{text("July 27, 2026")}</strong>
          </div>
          <button type="button">{text("+ New appointment")}</button>
        </div>

        <div className="lp-showcase-calendar-toolbar">
          <div
            className="lp-showcase-status-key"
            aria-label={text("Appointment statuses")}
          >
            <span>
              <i className="is-confirmed" />
              {text("Confirmed")}
            </span>
            <span>
              <i className="is-progress" />
              {text("In progress")}
            </span>
            <span>
              <i className="is-completed" />
              {text("Completed")}
            </span>
          </div>
          <span>Africa/Cairo</span>
        </div>

        <div className="lp-showcase-calendar-board">
          <div className="lp-showcase-calendar-head">
            <span>{text("Staff")}</span>
            <div>
              {["9:00", "10:00", "11:00", "12:00"].map((time) => (
                <b key={time}>{time}</b>
              ))}
            </div>
          </div>

          <CalendarRow name="Nour Khalil" role="Senior stylist">
            <CalendarEvent
              left="8%"
              width="27%"
              tone="silver"
              title="Mariam Adel"
              detail="Haircut · 60 min"
            />
            <CalendarEvent
              left="69%"
              width="16%"
              tone="break"
              title={text("Break")}
              detail="30 min"
            />
          </CalendarRow>

          <CalendarRow name="Mona Adel" role="Nail technician">
            <CalendarEvent
              left="34%"
              width="25%"
              tone="dark"
              title="Yasmine Ali"
              detail="Gel manicure · 1/2"
            />
          </CalendarRow>

          <CalendarRow name="Dr. Lina Hassan" role="Dermatologist">
            <CalendarEvent
              left="59%"
              width="25%"
              tone="graphite"
              title="Yasmine Ali"
              detail="Consultation · 2/2"
            />
            <CalendarEvent
              left="85%"
              width="14%"
              tone="silver"
              title="Salma"
              detail="Follow-up"
            />
          </CalendarRow>
        </div>
      </div>
    </div>
  );
}

function CalendarRow({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <div className="lp-showcase-calendar-row">
      <div className="lp-showcase-calendar-staff">
        <strong>{name}</strong>
        <span>{role}</span>
      </div>
      <div className="lp-showcase-calendar-timeline">{children}</div>
    </div>
  );
}

function CalendarEvent({
  left,
  width,
  tone,
  title,
  detail,
}: {
  left: string;
  width: string;
  tone: "silver" | "dark" | "graphite" | "break";
  title: string;
  detail: string;
}) {
  return (
    <div
      className={`lp-showcase-calendar-event is-${tone}`}
      style={{ left, width }}
    >
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function DashboardPreview() {
  const text = usePlatformText();
  return (
    <div className="lp-showcase-app-shell">
      <ProductSidebar active={text("Dashboard")} />
      <div className="lp-showcase-app-main lp-showcase-dashboard-main">
        <div className="lp-showcase-app-heading">
          <div>
            <small>{text("Owner analytics")}</small>
            <strong>{text("Business overview")}</strong>
          </div>
          <span className="lp-showcase-owner-pill">{text("Owner only")}</span>
        </div>

        <div className="lp-showcase-metrics">
          <Metric label={text("Revenue")} value="EGP 38,620" note="+12.4%" />
          <Metric label={text("Appointments")} value="568" note={text("This month")} />
          <Metric label={text("Average ticket")} value="EGP 486" note="+5.8%" />
          <Metric label={text("Returning")} value="68%" note={text("Customers")} />
        </div>

        <div className="lp-showcase-dashboard-grid">
          <article className="lp-showcase-revenue-card">
            <div className="lp-showcase-card-heading">
              <div>
                <strong>{text("Revenue this month")}</strong>
                <span>{text("Paid invoices")}</span>
              </div>
              <div>
                <b>{text("EGP 38,620")}</b>
                <small>
                  <TrendingUp size={11} /> 12.4%
                </small>
              </div>
            </div>
            <div className="lp-showcase-bars">
              {[42, 55, 48, 72, 64, 88, 76, 94, 82].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="lp-showcase-chart-axis">
              <span>{text("Jul 1")}</span>
              <span>{text("Jul 10")}</span>
              <span>{text("Jul 20")}</span>
              <span>{text("Jul 30")}</span>
            </div>
          </article>

          <div className="lp-showcase-dashboard-side">
            <article className="lp-showcase-service-card">
              <div className="lp-showcase-card-title">
                <strong>{text("Top services")}</strong>
                <BarChart3 size={15} />
              </div>
              {[
                ["Haircut & blow-dry", "EGP 12,480", 91],
                ["Skin consultation", "EGP 9,800", 76],
                ["Gel manicure", "EGP 6,240", 54],
              ].map(([service, amount, value]) => (
                <div key={service as string}>
                  <span>
                    <b>{service}</b>
                    <small>{amount}</small>
                  </span>
                  <i>
                    <b style={{ width: `${value}%` }} />
                  </i>
                </div>
              ))}
            </article>

            <article className="lp-showcase-operations-card">
              <div className="lp-showcase-card-title">
                <strong>{text("Today")}</strong>
                <UsersRound size={15} />
              </div>
              <div className="lp-showcase-today-stats">
                <span>
                  <strong>18</strong>
                  <small>{text("Completed")}</small>
                </span>
                <span>
                  <strong>4</strong>
                  <small>{text("Upcoming")}</small>
                </span>
                <span>
                  <strong>2</strong>
                  <small>{text("No-shows")}</small>
                </span>
              </div>
              <div className="lp-showcase-utilization">
                <span>
                  <b>{text("Staff utilization")}</b>
                  <strong>76%</strong>
                </span>
                <i>
                  <b />
                </i>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function WebsitePreview() {
  const text = usePlatformText();
  return (
    <div className="lp-showcase-website-shell">
      <div className="lp-showcase-site-nav">
        <strong>NOIR STUDIO</strong>
        <span>{text("Services About Book")}</span>
      </div>
      <div className="lp-showcase-site-copy">
        <small>{text("CAIRO · BY APPOINTMENT")}</small>
        <h3>{text("Care, designed around you.")}</h3>
        <p>
          {text("Personal appointments, considered services, and a calm way to book.")}
        </p>
        <button type="button">{text("Book an appointment")}</button>
      </div>
      <div className="lp-showcase-site-card">
        <Globe2 size={18} />
        <span>{text("Live website")}</span>
        <strong>{text("Arabic + English")}</strong>
        <small>
          {text("Built from the same services and availability your team manages.")}
        </small>
      </div>
      <div className="lp-showcase-site-services" aria-hidden="true">
        <span>{text("Hair care")}</span>
        <span>{text("Skin treatments")}</span>
        <span>{text("Nail services")}</span>
      </div>
    </div>
  );
}

function BookingPreview() {
  const text = usePlatformText();
  return (
    <div className="lp-showcase-booking-shell">
      <div className="lp-showcase-booking-brand">
        <strong>NOIR STUDIO</strong>
        <span>{text("Book your visit")}</span>
      </div>
      <div className="lp-showcase-booking-steps" aria-label={text("Booking progress")}>
        <span className="is-active">{text("1 Service")}</span>
        <span>{text("2 Time")}</span>
        <span>{text("3 Details")}</span>
      </div>
      <div className="lp-showcase-booking-content">
        <div className="lp-showcase-service-list">
          <small>{text("Choose a service")}</small>
          {[
            [text("Hair consultation"), "45 min", "EGP 450"],
            [text("Skin treatment"), "60 min", "EGP 700"],
            ["Gel manicure", "45 min", "EGP 320"],
          ].map(([name, duration, price], index) => (
            <button
              key={name}
              type="button"
              className={index === 0 ? "is-selected" : ""}
            >
              <span>
                <strong>{name}</strong>
                <small>{duration}</small>
              </span>
              <b>{price}</b>
            </button>
          ))}
        </div>
        <div className="lp-showcase-booking-summary">
          <ClipboardCheck size={21} />
          <small>{text("Your booking")}</small>
          <strong>{text("Hair consultation")}</strong>
          <span>{text("Monday, July 27 · 10:00 AM")}</span>
          <div>
            <Check size={14} /> {text("Real staff availability")}
          </div>
          <button type="button">{text("Continue")}</button>
        </div>
      </div>
    </div>
  );
}
