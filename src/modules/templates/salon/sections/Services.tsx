// src/modules/templates/salon/sections/Services.tsx
import { SalonTemplateData } from "../salon.types";

// src/modules/templates/salon/sections/Services.tsx — drop the image box entirely
export function Services({
  services,
}: {
  services: SalonTemplateData["services"];
}) {
  return (
    <section id="services" className="px-8 py-20 md:px-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: "var(--accent)" }}
      >
        Curated Services
      </p>
      <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
        Our Rituals
      </h2>

      <div className="mt-10 divide-y divide-[#E8DFD3]">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between py-5"
          >
            <div>
              {service.category && (
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: "var(--accent)" }}
                >
                  {service.category}
                </span>
              )}
              <h3 className="font-display text-xl text-[#2B2420]">
                {service.name}, {service.durationMin} min
              </h3>
            </div>
            <span className="text-sm text-[#5C5349]">
              {service.priceEgp} EGP
            </span>
          </div>
        ))}
        {services.length === 0 && (
          <p className="py-4 text-sm text-[#8A7F73]">
            Services will appear here once added.
          </p>
        )}
      </div>
    </section>
  );
}
