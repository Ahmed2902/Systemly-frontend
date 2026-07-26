import Link from "next/link";
import type { ClinicTemplateData } from "./clinic.types";

export function ClinicTemplate(data: ClinicTemplateData) {
  return (
    <main
      className="min-h-screen bg-[#f7fafc] text-slate-900"
      style={{ "--accent": data.primaryColor || "#0f766e" } as React.CSSProperties}
    >
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          {data.logoUrl ? (
            <img src={data.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : null}
          <div>
            <p className="text-lg font-semibold">{data.businessName}</p>
            <p className="text-xs text-slate-500">Clinic website preview</p>
          </div>
        </div>
        <Link
          href={data.bookingHref}
          aria-disabled={data.previewMode}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Book appointment
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.05fr_.95fr] md:px-12 md:py-28">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em]" style={{ color: "var(--accent)" }}>
            Trusted care, clearly explained
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
            {data.tagline || `Modern care at ${data.businessName}`}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {data.aboutText || "A calm, professional clinic experience with clear services, qualified practitioners, and easy online booking."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={data.bookingHref}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Book appointment
            </Link>
            <a href="#services" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              View treatments
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {data.heroPhotoUrl ? (
            <img src={data.heroPhotoUrl} alt="" className="h-full min-h-[420px] w-full object-cover" />
          ) : (
            <div className="grid min-h-[420px] place-items-center bg-gradient-to-br from-cyan-50 to-slate-100 text-slate-400">
              Clinic image
            </div>
          )}
        </div>
      </section>

      <section id="services" className="border-y border-slate-200 bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em]" style={{ color: "var(--accent)" }}>Treatments</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Services designed around your needs</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{service.category || "Treatment"}</p>
                <h3 className="mt-2 text-lg font-semibold">{service.name}</h3>
                {service.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p> : null}
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{service.durationMin} min</span>
                  <strong>{service.priceEgp} EGP</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
