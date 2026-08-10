import { CheckCircle2 } from "lucide-react";

export function About({
  businessName,
  aboutText,
}: {
  businessName: string;
  aboutText: string;
}) {
  if (!aboutText.trim()) return null;

  return (
    <section id="about" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2.25rem] bg-[var(--secondary-ink)] p-8 text-start text-white md:p-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:rounded-[3rem] lg:p-16 xl:p-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
            About the clinic
          </p>
          <p className="mt-5 text-sm text-white/58">{businessName}</p>
        </div>
        <div>
          <p className="max-w-4xl text-3xl font-medium leading-[1.2] tracking-[-0.035em] md:text-4xl lg:text-5xl">
            {aboutText}
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/55">
            <CheckCircle2 size={17} className="text-[var(--accent)]" /> Care
            explained with clarity and respect.
          </div>
        </div>
      </div>
    </section>
  );
}
