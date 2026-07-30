import { BarChart3, CalendarDays, Globe2, ReceiptText } from "lucide-react";

const chapters = [
  {
    eyebrow: "01 / Customer experience",
    title: "Create the experience customers see.",
    copy: "Publish a polished business website and booking flow from the same services, staff, content, and availability your team already manages.",
    visual: "website",
  },
  {
    eyebrow: "02 / Working day",
    title: "Run everything behind it.",
    copy: "Keep appointments, multi-staff services, customer context, staff schedules, invoices, and payment state connected in one operational workspace.",
    visual: "operations",
  },
  {
    eyebrow: "03 / Owner clarity",
    title: "Understand the business without slowing the team down.",
    copy: "Owners get private revenue and performance insight while reception and staff keep working from focused operational pages.",
    visual: "analytics",
  },
] as const;

export function FeatureGrid() {
  return (
    <section id="features" className="lp-product-story">
      <div className="lp-shell">
        <header className="lp-editorial-heading">
          <p className="lp-kicker">One connected product</p>
          <h2>From the first booking to the final receipt.</h2>
          <p>
            Systemly does not bolt a website onto a separate admin tool. The public
            experience and daily operation share one source of truth.
          </p>
        </header>

        <div className="lp-chapters">
          {chapters.map((chapter, index) => (
            <article className={`lp-chapter lp-chapter-${chapter.visual}`} key={chapter.title}>
              <div className="lp-chapter-copy">
                <span>{chapter.eyebrow}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
                <a href="#demo">Explore this workflow <span aria-hidden="true">↗</span></a>
              </div>

              {chapter.visual === "website" ? <WebsiteVisual /> : null}
              {chapter.visual === "operations" ? <OperationsVisual /> : null}
              {chapter.visual === "analytics" ? <AnalyticsVisual /> : null}

              <span className="lp-chapter-number" aria-hidden="true">0{index + 1}</span>
            </article>
          ))}
        </div>

        <div className="lp-capability-row" aria-label="Additional capabilities">
          <div><Globe2 size={20}/><strong>Arabic + English</strong><span>Customer experiences prepared for both directions.</span></div>
          <div><CalendarDays size={20}/><strong>Multi-staff appointments</strong><span>One visit can move between eligible staff without splitting the customer journey.</span></div>
          <div><ReceiptText size={20}/><strong>Payments + receipts</strong><span>Collect, issue, download, and safely void from the appointment context.</span></div>
          <div><BarChart3 size={20}/><strong>Owner-only insight</strong><span>Revenue and performance remain private without blocking daily work.</span></div>
        </div>
      </div>
    </section>
  );
}

function WebsiteVisual() {
  return (
    <div className="lp-story-visual lp-website-visual" aria-hidden="true">
      <div className="lp-site-nav"><b>NOIR STUDIO</b><span>Services&nbsp;&nbsp; About&nbsp;&nbsp; Book</span></div>
      <div className="lp-site-hero"><small>CAIRO · BY APPOINTMENT</small><h4>Care, designed around you.</h4><p>Personal appointments and a calm way to book.</p><button>Book an appointment</button></div>
      <div className="lp-booking-float"><span>Book online</span><strong>Choose a service</strong><i>Hair consultation · 45 min</i><i>Skin treatment · 60 min</i></div>
    </div>
  );
}

function OperationsVisual() {
  return (
    <div className="lp-story-visual lp-operations-visual" aria-hidden="true">
      <div className="lp-ops-toolbar"><b>Calendar</b><span>Monday, 27 July</span><button>New appointment</button></div>
      <div className="lp-ops-grid">
        <strong>Staff</strong><span>10:00</span><span>11:00</span><span>12:00</span>
        <b>Nour Khalil</b><i className="visit visit-one">Mariam · Hair</i><i/><i/>
        <b>Mona Adel</b><i/><i className="visit visit-two">Yasmine · Nails</i><i/>
        <b>Dr. Lina</b><i/><i/><i className="visit visit-three">Salma · Consult</i>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="lp-story-visual lp-analytics-visual" aria-hidden="true">
      <div className="lp-metrics">
        <span><small>Revenue</small><strong>EGP 38,620</strong><em>+12.4%</em></span>
        <span><small>Bookings</small><strong>568</strong><em>This month</em></span>
        <span><small>Returning</small><strong>68%</strong><em>Customers</em></span>
      </div>
      <div className="lp-chart">
        <div className="lp-chart-heading">
          <div><b>Revenue this month</b><small>Paid invoices only</small></div>
          <strong>EGP 38,620</strong>
        </div>
        <div className="lp-chart-canvas">
          <svg viewBox="0 0 500 180" preserveAspectRatio="none"><path d="M0 155 C45 150 55 110 100 118 S165 65 210 82 S270 125 315 69 S390 40 500 17" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>
          <div className="lp-chart-axis"><span>Jul 1</span><span>Jul 10</span><span>Jul 20</span><span>Jul 30</span></div>
        </div>
      </div>
    </div>
  );
}
