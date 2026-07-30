import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Globe2,
  ReceiptText,
  Tags,
} from "lucide-react";

const compactModules = [
  {
    icon: CalendarDays,
    title: "Online booking",
    copy: "Customers choose services, staff, and available times from your website in Arabic or English.",
  },
  {
    icon: Tags,
    title: "Services & pricing",
    copy: "Keep durations, prices, categories, and eligible staff organised in one catalogue.",
  },
  {
    icon: ReceiptText,
    title: "Invoices & payments",
    copy: "Collect payment from an appointment, issue a receipt, and void it safely when required.",
  },
  {
    icon: BarChart3,
    title: "Owner dashboard",
    copy: "Revenue and performance stay owner-only while reception works from operational pages.",
  },
];

export function FeatureGrid() {
  return (
    <section className="lp-section">
      <div className="lp-shell">
        <div className="max-w-3xl">
          <p className="lp-kicker">Website + operations</p>
          <h2 className="lp-title">
            Built around how appointment businesses{" "}
            <span className="lp-accent-text">actually work.</span>
          </h2>
          <p className="lp-copy max-w-2xl">
            Systemly connects the customer-facing website to the same services,
            staff, availability, appointments, customers, and invoices used by
            the front desk. No duplicate setup and no disconnected tools.
          </p>
        </div>

        <div className="lp-feature-layout">
          <article className="lp-card lp-feature-primary">
            <span className="lp-icon-box"><CalendarClock size={25} /></span>
            <h3 className="mt-6 text-2xl font-semibold">Calendar & daily operations</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#a9a5a2]">
              Staff stay in rows, time stays in columns, and every service segment
              appears with the correct person. Multi-service appointments remain
              one customer journey without hiding who performs each part.
            </p>
            <div className="lp-feature-primary-preview" aria-label="Small preview of the Systemly operations calendar">
              <div className="mini-toolbar">
                <span className="mini-chip">Monday, 27 July</span>
                <span className="mini-chip">All staff</span>
                <span className="mini-chip">All services</span>
              </div>
              <div className="mini-calendar">
                <div className="font-semibold text-slate-500">Staff</div>
                <div className="font-semibold text-slate-500">10:00</div>
                <div className="font-semibold text-slate-500">11:00</div>
                <div className="font-semibold text-slate-500">12:00</div>
                <div className="font-semibold text-slate-700">Nour Khalil</div>
                <div className="col-span-2"><div className="mini-appointment"><strong>Mariam Adel</strong><br/>Haircut & blow-dry</div></div>
                <div />
                <div className="font-semibold text-slate-700">Mona Adel</div>
                <div />
                <div className="col-span-2"><div className="mini-appointment"><strong>Yasmine Ali</strong><br/>Gel manicure · Nail art</div></div>
              </div>
            </div>
          </article>

          <div className="lp-feature-stack">
            <article className="lp-card lp-feature-compact">
              <span className="lp-icon-box"><Globe2 size={22}/></span>
              <h3>Website builder</h3>
              <p>Your site reads directly from the business content, services, team, and booking setup you manage in Systemly.</p>
            </article>
            {compactModules.map(({ icon: Icon, title, copy }) => (
              <article className="lp-card lp-feature-compact" key={title}>
                <span className="lp-icon-box"><Icon size={22}/></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
