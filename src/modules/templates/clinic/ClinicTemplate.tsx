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

  const sections: Record<string, ReactNode> = {
    hero: (
      <section className="px-6 pb-20 pt-12 md:px-12 lg:px-16 lg:pb-28 lg:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
              Trusted care, clearly explained
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.06] tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
              {data.tagline || `Care that puts you first.`}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
              {data.aboutText || `Professional care at ${data.businessName}, with clear treatment options and simple online booking.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={data.bookingHref}
                {...bookingProps}
                className="rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Book appointment
              </Link>
              <a href="#services" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800">
                View treatments
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
            {data.heroPhotoUrl ? (
              <img src={data.heroPhotoUrl} alt="" className="h-[440px] w-full object-cover md:h-[560px]" />
            ) : (
              <div className="grid h-[440px] place-items-center bg-gradient-to-br from-sky-50 via-white to-slate-100 md:h-[560px]">
                <Stethoscope size={54} strokeWidth={1.3} className="text-slate-300" />
              </div>
            )}
          </div>
        </div>
      </section>
    ),
    services: data.services.length ? (
      <section id="services" className="border-y border-slate-200 bg-white px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
              Treatments
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Care designed around your needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Clear treatment choices, practical information, and no unnecessary visual noise.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.services.map((service) => {
              const Icon = iconForService(service.id);
              return (
                <article
                  key={service.id}
                  className="flex min-h-64 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white" style={{ color: "var(--accent)" }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <div className="mt-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {service.category?.trim() || "Treatment"}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{service.name}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {service.description || "Professional treatment delivered with clear guidance and attentive care."}
                    </p>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                    <span className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                      <Clock3 size={14} /> {service.durationMin} min
                    </span>
                    <strong className="text-sm text-slate-800">{service.priceEgp} EGP</strong>
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
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
              Our doctors
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Meet the team caring for you
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.staff.map((member) => (
              <article key={member.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-sky-50 to-slate-200">
                      <span className="text-7xl font-semibold text-slate-400">{firstLetter(member.name)}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-slate-950">{member.name}</h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {member.jobTitle || member.role || "Clinician"}
                  </p>
                  {member.yearsExperience ? (
                    <p className="mt-3 text-xs text-slate-500">{member.yearsExperience} years of experience</p>
                  ) : null}
                  {member.bio ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{member.bio}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    ) : null,
    gallery: <ClinicGallery photos={data.galleryPhotoUrls} />,
    about: data.aboutText ? (
      <section id="about" className="border-y border-slate-200 bg-white px-6 py-24 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            About {data.businessName}
          </p>
          <p className="mt-6 text-2xl leading-relaxed text-slate-800 md:text-3xl">{data.aboutText}</p>
        </div>
      </section>
    ) : null,
    faq: data.showFaq ? <ClinicFaq faqs={data.faqs} /> : null,
    contact: data.phone || data.address || data.city ? (
      <section id="contact" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] md:p-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
              Contact us
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">We’re here to help</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Contact the clinic or reserve your appointment online when it suits you.
            </p>
            <Link
              href={data.bookingHref}
              {...bookingProps}
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <CalendarDays size={17} /> Book appointment
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.phone ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Phone size={19} style={{ color: "var(--accent)" }} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
                <p className="mt-2 text-sm font-medium text-slate-800">{data.phone}</p>
              </div>
            ) : null}
            {data.address || data.city ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <MapPin size={19} style={{ color: "var(--accent)" }} />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Location</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                  {[data.address, data.city].filter(Boolean).join(", ")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    ) : null,
  };

  return (
    <main
      dir={data.language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F7FAFC] text-slate-900"
      style={{ "--accent": data.primaryColor || "#0284c7" } as CSSProperties}
    >
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur md:px-12 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <a href="#" className="flex min-w-0 items-center gap-3">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100" style={{ color: "var(--accent)" }}>
                <Stethoscope size={20} />
              </span>
            )}
            <span className="truncate text-lg font-semibold text-slate-950">{data.businessName}</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-600 lg:flex">
            <a href="#services">Treatments</a>
            {data.showTeam ? <a href="#team">Our doctors</a> : null}
            {data.galleryPhotoUrls.length ? <a href="#gallery">Our space</a> : null}
            {data.showFaq ? <a href="#faq">FAQ</a> : null}
            <a href="#contact">Contact</a>
          </nav>

          <Link
            href={data.bookingHref}
            {...bookingProps}
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Book appointment
          </Link>
        </div>
      </header>

      {data.sectionOrder.map((section) => (
        <div key={section}>{sections[section] ?? null}</div>
      ))}

      <footer className="border-t border-slate-200 bg-white px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <p className="text-lg font-semibold text-slate-950">{data.businessName}</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Professional care, clear information, and convenient online booking.
            </p>
          </div>
          <div className="text-sm leading-7 text-slate-600">
            {data.phone ? <p>{data.phone}</p> : null}
            {data.address || data.city ? <p>{[data.address, data.city].filter(Boolean).join(", ")}</p> : null}
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl text-xs text-slate-400">
          © {new Date().getFullYear()} {data.businessName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
