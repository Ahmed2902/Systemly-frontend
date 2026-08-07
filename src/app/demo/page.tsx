import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Scissors,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export const metadata = {
  title: "Explore Systemly demos",
  description:
    "Choose a fictional salon or clinic, then explore its operations workspace or public website.",
  robots: { index: false, follow: false },
};

const verticals = [
  {
    id: "salon",
    eyebrow: "Beauty businesses",
    title: "Salon & beauty",
    description:
      "See how a salon manages appointments, staff, services, customers, invoices, commissions, and its public booking website.",
    icon: Scissors,
  },
  {
    id: "clinic",
    eyebrow: "Medical businesses",
    title: "Clinic",
    description:
      "See the same Systemly workflow adapted for clinicians, treatments, customer records, and documented clinical history.",
    icon: Stethoscope,
  },
] as const;

export default function DemoHubPage() {
  return (
    <main className="min-h-screen bg-[#0b0f19] px-5 py-10 text-white sm:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white"
          >
            <Building2 size={16} /> Systemly
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/55">
            No sign-up required
          </span>
        </div>

        <section className="mt-14 max-w-4xl sm:mt-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#63c9aa]">
            Systemly demo hub
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Choose the kind of business you want to explore.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">
            First choose a salon or clinic. On the next screen, you can open
            either the internal operations workspace or the customer-facing
            public website.
          </p>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          {verticals.map(({ id, eyebrow, title, description, icon: Icon }) => (
            <Link
              key={id}
              href={`/demo/${id}`}
              className="group flex min-h-[330px] flex-col justify-between rounded-[30px] border border-white/10 bg-white/[0.055] p-7 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-[#008060]/45 hover:bg-white/[0.075] hover:shadow-[0_24px_70px_-40px_rgba(0,128,96,0.22)] sm:p-9"
            >
              <div>
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#008060]/15 text-[#63c9aa]">
                  <Icon size={24} />
                </div>
                <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/38">
                  {eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-white/55">
                  {description}
                </p>
              </div>

              <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-[#63c9aa]">
                Choose {title.toLowerCase()}
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/52">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#63c9aa]" />
          <p>
            Every person, appointment, invoice, and clinical record is
            fictional. Some integrations and actions are simplified for the
            demo and may not behave exactly like the live product.
          </p>
        </div>
      </div>
    </main>
  );
}
