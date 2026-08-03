import Link from "next/link";
import { ArrowRight, CalendarDays, Scissors, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Interactive operations demo | Systemly",
  description: "Explore fictional salon and clinic workspaces powered by Systemly.",
  robots: { index: false, follow: false },
};

const demos = [
  {
    vertical: "salon",
    title: "Salon & beauty demo",
    description: "Explore appointments, staff schedules, commissions, customers, invoices, services, and owner analytics.",
    icon: Scissors,
  },
  {
    vertical: "clinic",
    title: "Clinic demo",
    description: "Explore the same operational workspace with clinicians, treatment services, and customer clinical history.",
    icon: Stethoscope,
  },
] as const;

export default function OperationsDemoChooser() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] px-5 py-12 text-slate-950 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
          ← Back to Systemly
        </Link>
        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6d1d3f]">Interactive product demo</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Run a fictional business inside Systemly.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            No account is required. Every action stays in your browser and the original fictional data returns when you reset the demo.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {demos.map(({ vertical, title, description, icon: Icon }) => (
            <Link
              key={vertical}
              href={`/demo/operations/${vertical}/calendar`}
              className="group rounded-[28px] border border-black/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6d1d3f]/10 text-[#6d1d3f]">
                <Icon size={23} />
              </div>
              <h2 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#6d1d3f]">
                Open workspace <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          <CalendarDays size={16} /> All names, phone numbers, appointments, and financial records are fictional.
        </div>
      </div>
    </main>
  );
}
