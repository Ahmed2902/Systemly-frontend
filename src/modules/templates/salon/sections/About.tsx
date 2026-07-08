// src/modules/templates/salon/sections/About.tsx

export function About({
  businessName,
  aboutText,
}: {
  businessName: string;
  aboutText: string;
}) {
  return (
    <section id="about" className="px-8 py-20 md:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          About {businessName}
        </p>
        <p className="font-display mt-5 text-2xl leading-snug text-[#2B2420] md:text-3xl">
          {aboutText ||
            "A space dedicated to quiet luxury and considered care."}
        </p>
      </div>
    </section>
  );
}
