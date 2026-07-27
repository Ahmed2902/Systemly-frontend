import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import type { ClinicTemplateData } from "./clinic.types";
import { ClinicFaq } from "./ClinicFaq";
import { ClinicGallery } from "./ClinicGallery";
import {
  CenteredBenefits,
  CenteredBookingProcess,
  MobileBookingBar,
} from "../shared/CenteredPublicSections";
import { completePublicSectionOrder } from "../section-order";

const treatmentIcons = [Stethoscope, HeartPulse, Sparkles];

function firstLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function iconForService(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = id.charCodeAt(index) + ((hash << 5) - hash);
  }
  return treatmentIcons[Math.abs(hash) % treatmentIcons.length];
}

export function ClinicTemplate(data: ClinicTemplateData) {
  const bookingProps = data.previewMode
    ? { onClick: (event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault() }
    : {};
  const location = [data.address, data.city].filter(Boolean).join(", ");
  const heroPhoto = data.heroPhotoUrl || "/images/clinic-default.svg";

  const sections: Record<string, ReactNode> = {
    hero: (
      <section className="px-6 py-24 md:px-12 lg:px-16 lg:py-36">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Trusted care, clearly explained
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--text)] md:text-6xl lg:text-7xl">
            {data.tagline || "Care that puts you first."}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
            {data.aboutText || `Professional care at ${data.businessName}, with clear treatment options and simple online booking.`}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={data.bookingHref}
              {...bookingProps}
              className="rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Book appointment
            </Link>
            <a href="#services" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--text)]">
              View treatments
            </a>
          </div>

          <div className="mt-14 w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--soft)] shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            <img src={heroPhoto} alt="" className="h-[360px] w-full object-cover md:h-[560px] lg:h-[640px]" />
          </div>
        </div>
      </section>
    ),
    services: data.services.length ? (
      <section id="services" className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Treatments
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">
            Care designed around your needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Clear treatment choices, practical information, and no unnecessary visual noise.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.services.map((service) => {
              const Icon = iconForService(service.id);
              return (
                <article
                  key={service.id}
                  className="flex min-h-64 flex-col items-center rounded-[1.75rem] border border-[var(--border)] bg-[var(--soft)] p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-[var(--surface)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]" style={{ color: "var(--accent)" }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <div className="mt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      {service.category?.trim() || "Treatment"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">{service.name}</h3>
                    <p className="mx-auto mt-3 line-clamp-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                      {service.description || "Professional treatment delivered with clear guidance and attentive care."}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-8">
                    <span className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      <Clock3 size={14} /> {service.durationMin} min
                    </span>
                    <strong className="text-sm text-[var(--text)]">{service.priceEgp} EGP</strong>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ) : null,
    team: data.showTeam && data.staff.length ? (
      <section id="team" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Our doctors
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">
            Meet the team caring for you
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.staff.map((member) => (
              <article key={member.id} className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] text-center shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="aspect-[4/5] overflow-hidden bg-[var(--soft)]">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-sky-50 to-blue-100">
                      <span className="text-7xl font-semibold" style={{ color: "var(--accent)" }}>{firstLetter(member.name)}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[var(--text)]">{member.name}</h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {member.jobTitle || member.role || "Clinician"}
                  </p>
                  {member.yearsExperience ? (
                    <p className="mt-3 text-xs text-[var(--muted)]">{member.yearsExperience} years of experience</p>
                  ) : null}
                  {member.bio ? <p className="mx-auto mt-4 line-clamp-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{member.bio}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gallery: <ClinicGallery photos={data.galleryPhotoUrls} />,
    why: (
      <CenteredBenefits
        eyebrow="Why choose us"
        title="Clear information and reassuring care"
        description="A professional clinic experience designed to make every step easier to understand."
        items={[
          { title: "Experienced specialists", description: "Qualified practitioners with clearly presented public profiles." },
          { title: "Modern care", description: "Thoughtful treatment supported by an organised patient experience." },
          { title: "Clear information", description: "Understand the treatment, duration, and price before booking." },
          { title: "Comfort first", description: "A calm environment where questions and individual needs come first." },
        ]}
      />
    ),
    process: (
      <CenteredBookingProcess
        eyebrow="How it works"
        title="From treatment choice to confirmed visit"
        steps={[
          { title: "Choose a treatment", description: "Review the available care options and useful details." },
          { title: "Select a doctor", description: "Choose the practitioner who suits your needs." },
          { title: "Pick a time", description: "Reserve an available appointment directly online." },
          { title: "Visit the clinic", description: "Arrive with your appointment already confirmed." },
        ]}
      />
    ),
    about: data.aboutText ? (
      <section id="about" className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 text-center md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            About {data.businessName}
          </p>
          <p className="mt-6 text-2xl leading-relaxed text-[var(--text)] md:text-3xl">{data.aboutText}</p>
        </div>
      </section>
    ) : null,
    faq: data.showFaq ? <ClinicFaq faqs={data.faqs} /> : null,
    contact: data.phone || location ? (
      <section id="contact" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Contact us
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text)]">We’re here to help</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Contact the clinic or reserve your appointment online when it suits you.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {data.phone ? (
              <a href={`tel:${data.phone}`} className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-6 text-center">
                <Phone className="mx-auto" size={20} style={{ color: "var(--accent)" }} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Phone</p>
                <p className="mt-2 text-sm font-medium text-[var(--text)]">{data.phone}</p>
              </a>
            ) : null}
            {location ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-6 text-center"
              >
                <MapPin className="mx-auto" size={20} style={{ color: "var(--accent)" }} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Location</p>
                <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-6 text-[var(--text)]">{location}</p>
              </a>
            ) : null}
          </div>

          <Link
            href={data.bookingHref}
            {...bookingProps}
            className="mt-10 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <CalendarDays size={17} /> Book appointment
          </Link>
        </div>
      </section>
    ) : null,
  };

  const style = {
    "--accent": data.primaryColor || "#1677B8",
    "--background": "#F6FAFD",
    "--surface": "#FFFFFF",
    "--soft": "#EEF6FB",
    "--text": "#102A43",
    "--muted": "#627D98",
    "--border": "#D9E7F1",
  } as CSSProperties;

  return (
    <main
      dir={data.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--background)] pb-20 text-center text-[var(--text)] md:pb-0"
      style={style}
    >
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/92 px-6 py-4 backdrop-blur md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
          <a href="#" className="flex min-w-0 items-center gap-3 justify-self-start">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--soft)]" style={{ color: "var(--accent)" }}>
                <Stethoscope size={20} />
              </span>
            )}
            <span className="hidden truncate text-lg font-semibold text-[var(--text)] sm:inline">{data.businessName}</span>
          </a>

          <nav className="hidden items-center justify-center gap-7 text-sm text-[var(--muted)] lg:flex">
            {data.services.length ? <a href="#services">Treatments</a> : null}
            {data.showTeam && data.staff.length ? <a href="#team">Doctors</a> : null}
            {data.galleryPhotoUrls.length ? <a href="#gallery">Our space</a> : null}
            {data.aboutText ? <a href="#about">About</a> : null}
            {data.showFaq && data.faqs?.length ? <a href="#faq">FAQ</a> : null}
            {data.phone || location ? <a href="#contact">Contact</a> : null}
          </nav>

          <Link
            href={data.bookingHref}
            {...bookingProps}
            className="justify-self-end rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Book
          </Link>
        </div>
      </header>

      {completePublicSectionOrder(data.sectionOrder).map((section) => (
        <div key={section}>{sections[section] ?? null}</div>
      ))}

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center md:px-12 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <p className="text-xl font-semibold text-[var(--text)]">{data.businessName}</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">
            Professional care, clear information, and convenient online booking.
          </p>
          <nav className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
            <a href="#services">Treatments</a>
            <a href="#team">Doctors</a>
            <a href="#contact">Contact</a>
            <span>Privacy policy</span>
            <span>Terms</span>
          </nav>
          {data.phone ? <p className="mt-6 text-sm text-[var(--text)]">{data.phone}</p> : null}
          {location ? <p className="mt-2 text-sm text-[var(--text)]">{location}</p> : null}
          <p className="mt-10 text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} {data.businessName}. All rights reserved.
          </p>
        </div>
      </footer>

      <MobileBookingBar bookingHref={data.bookingHref} previewMode={data.previewMode} />
    </main>
  );
}
