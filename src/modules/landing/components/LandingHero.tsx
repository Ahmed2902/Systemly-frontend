import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

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

        <div className="lp-hero-product" aria-label="Systemly product preview">
          <div className="lp-hero-product-bar">
            <span className="lp-product-dot" />
            <span>systemly / operations</span>
            <span>Today</span>
          </div>
          <div className="lp-hero-product-body">
            <aside>
              <strong>S</strong>
              {["Home", "Calendar", "Appointments", "Customers", "Invoices", "Staff"].map((item, index) => (
                <span key={item} className={index === 1 ? "is-active" : ""}>{item}</span>
              ))}
            </aside>
            <div className="lp-hero-calendar">
              <div className="lp-calendar-heading">
                <div><small>Monday</small><strong>July 27</strong></div>
                <button type="button">+ New appointment</button>
              </div>
              <div className="lp-calendar-grid">
                <span>Staff</span><span>9:00</span><span>10:00</span><span>11:00</span>
                <strong>Nour Khalil</strong><i /><i className="booking booking-a">Mariam · Haircut</i><i />
                <strong>Mona Adel</strong><i /><i /><i className="booking booking-b">Yasmine · Nails</i>
                <strong>Dr. Lina</strong><i className="booking booking-c">Consultation</i><i /><i />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
