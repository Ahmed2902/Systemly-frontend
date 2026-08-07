import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Globe2,
  LayoutDashboard,
  Scissors,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { notFound } from "next/navigation";

const verticals = {
  salon: {
    title: "Salon & beauty",
    businessName: "Aura Beauty Lounge",
    description:
      "Explore a fictional salon from both the team workspace and the customer-facing website.",
    icon: Scissors,
  },
  clinic: {
    title: "Clinic",
    businessName: "Clarity Dental & Skin Clinic",
    description:
      "Explore a fictional clinic with operational workflows, treatment services, and clinical customer history.",
    icon: Stethoscope,
  },
} as const;

type DemoVertical = keyof typeof verticals;

function isDemoVertical(value: string): value is DemoVertical {
  return value === "salon" || value === "clinic";
}

export function generateStaticParams() {
  return Object.keys(verticals).map((vertical) => ({ vertical }));
}

export default async function DemoExperiencePage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  if (!isDemoVertical(vertical)) notFound();

  const config = verticals[vertical];
  const VerticalIcon = config.icon;
  const experiences = [
    {
      title: "Operations workspace",
      description:
        "Manage the calendar, appointments, customers, staff, services, invoices, and owner analytics inside the real Systemly operations UI.",
      href: `/demo/operations/${vertical}/calendar`,
      action: "Open operations demo",
      icon: LayoutDashboard,
    },
    {
      title: "Public business website",
      description:
        "See the customer-facing website template with services, team members, pricing, gallery content, FAQs, and booking calls to action.",
      href: `/demo/websites/${vertical}`,
      action: "Open website demo",
      icon: Globe2,
    },
  ] as const;

  return (
    <main className="min-h-screen bg-[#0b0f19] px-5 py-10 text-white sm:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-white"
        >
          <ArrowLeft size={16} /> Back to business types
        </Link>

        <section className="mt-12 flex max-w-4xl items-start gap-4 sm:mt-16">
          <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#008060] text-white shadow-lg shadow-[#008060]/20">
            <VerticalIcon size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#63c9aa]">
              {config.businessName}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Choose what you want to explore.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">
              {config.description} Each experience opens in a new tab so you
              can return here and compare both sides of Systemly.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          {experiences.map(
            ({ title, description, href, action, icon: ExperienceIcon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[330px] flex-col justify-between rounded-[30px] border border-white/10 bg-white/[0.055] p-7 transition hover:-translate-y-1 hover:border-[#008060]/45 hover:bg-white/[0.075] sm:p-9"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#181318]">
                    <ExperienceIcon size={22} />
                  </div>
                  <h2 className="mt-9 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    {title}
                  </h2>
                  <p className="mt-5 max-w-xl leading-7 text-white/55">
                    {description}
                  </p>
                </div>

                <span className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-[#63c9aa]">
                  {action}
                  <ArrowUpRight
                    size={17}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            ),
          )}
        </section>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/52">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#63c9aa]" />
          <p>
            Demo data is fictional. Some functionality, integrations, uploads,
            and external actions are simplified or disabled and may not behave
            exactly like the production product.
          </p>
        </div>
      </div>
    </main>
  );
}
