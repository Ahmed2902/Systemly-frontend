export function About({
  businessName,
  aboutText,
}: {
  businessName: string;
  aboutText: string;
}) {
  return (
    <section id="about" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-[var(--secondary-soft)] md:rounded-[3rem]">
        <div className="grid gap-10 p-8 text-start md:p-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:p-16 xl:p-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">About the studio</p>
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{businessName}</p>
          </div>

          <div>
            <span className="font-display text-5xl leading-none text-[var(--accent-strong)]/30">“</span>
            <p className="font-display -mt-2 max-w-4xl text-3xl font-normal leading-[1.18] tracking-[-0.035em] text-[var(--text)] md:text-4xl lg:text-5xl">
              {aboutText || "A space dedicated to thoughtful service, quiet confidence, and care that feels personal."}
            </p>
            <div className="mt-10 h-px w-20 bg-[var(--accent-strong)]/35" />
          </div>
        </div>
      </div>
    </section>
  );
}
