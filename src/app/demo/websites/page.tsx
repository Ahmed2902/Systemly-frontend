import Link from "next/link";
import { ArrowUpRight, Sparkles, Stethoscope } from "lucide-react";

const demos = [
  {
    href: "/demo/websites/salon",
    eyebrow: "Beauty business",
    title: "Maison Noura Beauty Lounge",
    description:
      "Explore the Aura Wellness template with realistic salon services, artists, pricing, gallery content, and FAQs.",
    icon: Sparkles,
  },
  {
    href: "/demo/websites/clinic",
    eyebrow: "Medical business",
    title: "Clarity Dental & Skin Clinic",
    description:
      "Explore the Clinic Clarity template with treatments, doctors, pricing, clinic imagery, and patient FAQs.",
    icon: Stethoscope,
  },
] as const;

export default function DemoWebsitesPage() {
  return (
    <main className="min-h-screen bg-[#11110f] px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45 transition hover:text-white"
          >
            Systemly
          </Link>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-[#d7b4c3]">
            Public website demos
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            See the customer-facing side of Systemly.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">
            Both websites are fictional and use the same production templates available to Systemly businesses. No authentication or backend data is required.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {demos.map(({ href, eyebrow, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[330px] flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.045] p-7 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] sm:p-9"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#11110f]">
                  <Icon size={21} />
                </div>
                <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                  {eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                  {description}
                </p>
              </div>

              <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Open website demo
                <ArrowUpRight
                  size={17}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/demo/operations/salon/calendar"
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
          >
            Salon operations demo
          </Link>
          <Link
            href="/demo/operations/clinic/calendar"
            className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/25 hover:text-white"
          >
            Clinic operations demo
          </Link>
        </div>
      </div>
    </main>
  );
}
