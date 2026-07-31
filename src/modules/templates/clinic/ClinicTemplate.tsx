import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";
import type { ClinicTemplateData } from "./clinic.types";
import { ClinicFaq } from "./ClinicFaq";
import { ClinicGallery } from "./ClinicGallery";
import {
  CenteredBenefits,
  CenteredBookingProcess,
  MobileBookingBar,
} from "../shared/CenteredPublicSections";
import { PublicSiteHeader } from "../shared/PublicSiteHeader";
import { createTemplatePalette } from "../shared/template-palette";
import { completePublicSectionOrder } from "../section-order";
import clinicHero from "../../../../images/clinicHero.jpg";

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
    ? {
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) =>
          event.preventDefault(),
      }
    : {};
  const location = [data.address, data.city].filter(Boolean).join(", ");
  const heroPhoto = data.heroPhotoUrl || clinicHero.src;
  const hasTeam = data.showTeam && data.staff.length > 0;
  const hasGallery = data.galleryPhotoUrls.length > 0;
  const hasFaq = Boolean(data.showFaq && data.faqs?.length);
  const hasContact = Boolean(data.phone || location);
  const sections: Record<string, ReactNode> = {
    hero: (
      <section
        id="top"
        className="px-3 pb-24 pt-5 md:px-6 md:pb-32 md:pt-7 lg:px-8"
      >
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_rgba(20,39,35,0.10)] lg:min-h-[700px] lg:grid-cols-[0.94fr_1.06fr] lg:rounded-[2.75rem]">
          <div className="flex flex-col justify-between gap-14 p-7 text-start md:p-12 lg:p-16 xl:p-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                <ShieldCheck size={14} /> Trusted care, clearly explained
              </p>
              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.01] tracking-[-0.055em] text-[var(--text)] md:text-6xl lg:text-7xl xl:text-[5.2rem]">
                {data.tagline || "Care that puts you first."}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted)] md:text-lg">
                {data.aboutText ||
                  `Professional care at ${data.businessName}, with clear treatment choices and convenient online booking.`}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={data.bookingHref}
                  {...bookingProps}
                  scroll={false}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent-deep)]"
                >
                  Book appointment <ArrowUpRight size={16} />
                </Link>
                {data.services.length ? (
                  <a
                    href="#services"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] px-6 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--soft)]"
                  >
                    View treatments
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { Icon: FileText, label: "Clear treatment details" },
                { Icon: UserRoundCheck, label: "Meet the care team" },
                { Icon: CalendarDays, label: "Book from live availability" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-start"
                >
                  <Icon size={17} className="text-[var(--accent-strong)]" />
                  <p className="mt-4 text-xs font-semibold leading-5 text-[var(--text)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[var(--soft)] lg:min-h-full">
            <img
              src={heroPhoto}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10231f]/35 via-transparent to-transparent" />

            <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:inset-x-8 sm:bottom-8 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="max-w-sm rounded-[1.5rem] border border-white/45 bg-white/88 p-5 text-start text-[var(--text)] shadow-xl backdrop-blur-xl">
                <Stethoscope
                  size={20}
                  className="text-[var(--accent-strong)]"
                />
                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Patient experience
                </p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                  Useful information before you arrive.
                </p>
              </div>
              {location ? (
                <div className="inline-flex items-center gap-2 justify-self-start rounded-full border border-white/45 bg-white/88 px-4 py-2.5 text-xs font-semibold text-[var(--text)] shadow-lg backdrop-blur-xl sm:justify-self-end">
                  <MapPin size={14} className="text-[var(--accent-strong)]" />{" "}
                  {data.city || location}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    ),

    services: data.services.length ? (
      <section
        id="services"
        className="border-y border-[var(--border)] bg-[var(--surface)] px-6 py-24 md:px-12 lg:px-16 lg:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="text-start lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              Treatments
            </p>
            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
              Care options made easier to understand.
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-[var(--muted)]">
              Review the purpose, duration, and price of each treatment before
              choosing an appointment.
            </p>
            <Link
              href={data.bookingHref}
              {...bookingProps}
              scroll={false}
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent-strong)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent-deep)]"
            >
              Book a visit <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {data.services.map((service) => {
              const Icon = iconForService(service.id);
              return (
                <article
                  key={service.id}
                  className="flex min-h-72 flex-col rounded-[1.75rem] border border-[var(--border)] bg-[var(--background)] p-7 text-start transition duration-300 hover:-translate-y-1 hover:bg-[var(--surface)] hover:shadow-[0_18px_45px_rgba(20,39,35,0.07)]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <strong className="text-sm text-[var(--text)]">
                      EGP {service.priceEgp}
                    </strong>
                  </div>
                  <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {service.category?.trim() || "Treatment"}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[var(--text)]">
                    {service.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                    {service.description ||
                      "Professional treatment delivered with clear guidance and attentive care."}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-8 text-xs text-[var(--muted)]">
                    <Clock3 size={14} /> {service.durationMin} minutes
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    ) : null,

    team: hasTeam ? (
      <section
        id="team"
        className="bg-[var(--soft)] px-6 py-24 md:px-12 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 text-start md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                Our doctors
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
                Meet the people caring for you.
              </h2>
            </div>
            <p className="max-w-md text-base leading-8 text-[var(--muted)]">
              Review each practitioner’s role, experience, and background before
              choosing your visit.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.staff.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] text-start shadow-[0_14px_40px_rgba(20,39,35,0.055)]"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[var(--background)]">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-[var(--accent-wash)] to-[var(--accent-soft)]">
                      <span className="text-7xl font-semibold text-[var(--accent-strong)]">
                        {firstLetter(member.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {member.jobTitle || member.role || "Clinician"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--text)]">
                    {member.name}
                  </h3>
                  {member.yearsExperience ? (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {member.yearsExperience} years of experience
                    </p>
                  ) : null}
                  {member.bio ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                      {member.bio}
                    </p>
                  ) : null}
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
        variant="clinic"
        eyebrow="Why choose us"
        title="Clear information and reassuring care"
        description="A professional clinic experience designed to make every step easier to understand."
        items={[
          {
            title: "Experienced specialists",
            description:
              "Qualified practitioners with clearly presented public profiles.",
          },
          {
            title: "Modern care",
            description:
              "Thoughtful treatment supported by an organised patient experience.",
          },
          {
            title: "Clear information",
            description:
              "Understand the treatment, duration, and price before booking.",
          },
          {
            title: "Comfort first",
            description:
              "A calm environment where questions and individual needs come first.",
          },
        ]}
      />
    ),

    process: (
      <CenteredBookingProcess
        variant="clinic"
        eyebrow="How it works"
        title="From treatment choice to confirmed visit"
        steps={[
          {
            title: "Choose a treatment",
            description:
              "Review the available care options and useful details.",
          },
          {
            title: "Select a doctor",
            description: "Choose the practitioner who suits your needs.",
          },
          {
            title: "Pick a time",
            description: "Reserve an available appointment directly online.",
          },
          {
            title: "Visit the clinic",
            description: "Arrive with your appointment already confirmed.",
          },
        ]}
      />
    ),

    about: data.aboutText ? (
      <section id="about" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2.25rem] bg-[var(--dark)] p-8 text-start text-white md:p-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:rounded-[3rem] lg:p-16 xl:p-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
              About the clinic
            </p>
            <p className="mt-5 text-sm text-white/58">{data.businessName}</p>
          </div>
          <div>
            <p className="max-w-4xl text-3xl font-medium leading-[1.2] tracking-[-0.035em] md:text-4xl lg:text-5xl">
              {data.aboutText}
            </p>
            <div className="mt-10 flex items-center gap-3 text-sm text-white/55">
              <CheckCircle2 size={17} className="text-[var(--accent)]" /> Care
              explained with clarity and respect.
            </div>
          </div>
        </div>
      </section>
    ) : null,

    faq: hasFaq ? <ClinicFaq faqs={data.faqs} /> : null,

    contact: hasContact ? (
      <section id="contact" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_22px_65px_rgba(20,39,35,0.08)] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[3rem]">
          <div className="bg-[var(--accent-strong)] p-8 text-start text-white md:p-12 lg:p-16 xl:p-20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
              Contact and booking
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] md:text-5xl lg:text-6xl">
              The next step should feel straightforward.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
              Contact the clinic directly or choose a convenient appointment
              from the live schedule.
            </p>
            <Link
              href={data.bookingHref}
              {...bookingProps}
              scroll={false}
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[var(--accent-deep)] transition hover:-translate-y-0.5 hover:bg-[#f3f7f5]"
            >
              <CalendarDays size={17} /> Book appointment{" "}
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
            {data.phone ? (
              <a
                href={`tel:${data.phone}`}
                className="group min-h-64 bg-[var(--background)] p-8 text-start transition hover:bg-[var(--surface)] md:p-10"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Phone size={19} />
                </span>
                <p className="mt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Phone
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--text)]">
                  {data.phone}
                </p>
                <ArrowUpRight
                  size={16}
                  className="mt-5 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ) : null}
            {location ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noreferrer"
                className="group min-h-64 bg-[var(--background)] p-8 text-start transition hover:bg-[var(--surface)] md:p-10"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <MapPin size={19} />
                </span>
                <p className="mt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Location
                </p>
                <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-[var(--text)]">
                  {location}
                </p>
                <ArrowUpRight
                  size={16}
                  className="mt-5 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ) : null,
  };

  const style = createTemplatePalette({
    accent: data.primaryColor,
    fallbackAccent: "#0B6B68",
    background: "#F4F7F5",
    surface: "#FFFFFF",
    soft: "#EAF1EE",
    text: "#172723",
    muted: "#64736E",
    border: "#DCE5E1",
    dark: "#10231F",
  }) as CSSProperties;

  return (
    <main
      dir={data.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen scroll-smooth bg-[var(--background)] pb-20 text-[var(--text)] motion-reduce:scroll-auto md:pb-0"
      style={style}
    >
      <PublicSiteHeader
        variant="clinic"
        businessName={data.businessName}
        logoUrl={data.logoUrl}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        links={[
          {
            label: "Treatments",
            href: "#services",
            show: data.services.length > 0,
          },
          { label: "Doctors", href: "#team", show: hasTeam },
          { label: "Our clinic", href: "#gallery", show: hasGallery },
          { label: "About", href: "#about", show: Boolean(data.aboutText) },
          { label: "FAQ", href: "#faq", show: hasFaq },
          { label: "Contact", href: "#contact", show: hasContact },
        ]}
      />

      {completePublicSectionOrder(data.sectionOrder).map((section) => (
        <div key={section}>{sections[section] ?? null}</div>
      ))}

      <footer className="bg-[var(--dark)] px-6 py-16 text-white md:px-12 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="text-start">
              <p className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                {data.businessName}
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/52">
                Professional care, clear information, and convenient online
                booking.
              </p>
            </div>
            <Link
              href={data.bookingHref}
              {...bookingProps}
              scroll={false}
              className="inline-flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-white px-6 text-sm font-semibold text-[var(--dark)] lg:justify-self-end"
            >
              Book appointment <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-10 py-12 md:grid-cols-3">
            <div className="text-start">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">
                Clinic
              </p>
              {location ? (
                <p className="mt-4 max-w-xs text-sm leading-7 text-white/66">
                  {location}
                </p>
              ) : (
                <p className="mt-4 text-sm text-white/40">
                  Location available when booking.
                </p>
              )}
            </div>
            <div className="text-start">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">
                Contact
              </p>
              {data.phone ? (
                <a
                  href={`tel:${data.phone}`}
                  className="mt-4 inline-block text-sm text-white/66 hover:text-white"
                >
                  {data.phone}
                </a>
              ) : (
                <p className="mt-4 text-sm text-white/40">
                  Contact details available through the booking flow.
                </p>
              )}
            </div>
            <nav className="flex flex-wrap content-start gap-x-5 gap-y-3 text-start text-xs font-semibold text-white/52 md:justify-end">
              {data.services.length ? (
                <a href="#services" className="hover:text-white">
                  Treatments
                </a>
              ) : null}
              {hasTeam ? (
                <a href="#team" className="hover:text-white">
                  Doctors
                </a>
              ) : null}
              {hasGallery ? (
                <a href="#gallery" className="hover:text-white">
                  Our clinic
                </a>
              ) : null}
              {data.aboutText ? (
                <a href="#about" className="hover:text-white">
                  About
                </a>
              ) : null}
              {hasFaq ? (
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              ) : null}
              {hasContact ? (
                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
              ) : null}
            </nav>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/34 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {data.businessName}. All rights
              reserved.
            </p>
            <p>
              Powered by{" "}
              <span className="font-semibold text-white/62">Systemly</span>
            </p>
          </div>
        </div>
      </footer>

      <MobileBookingBar
        variant="clinic"
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    </main>
  );
}
