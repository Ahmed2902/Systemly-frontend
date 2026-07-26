import { Clock3, Scissors } from "lucide-react";
import type { SalonTemplateData } from "../salon.types";

export function Services({ services }: { services: SalonTemplateData["services"] }) {
  if (services.length === 0) return null;

  const groups = services.reduce<Record<string, typeof services>>((result, service) => {
    const category = service.category?.trim() || "Services";
    (result[category] ??= []).push(service);
    return result;
  }, {});

  return (
    <section id="services" className="px-8 py-20 md:px-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7D6A5B]">
          Services
        </p>
        <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
          Choose your next appointment
        </h2>

        <div className="mt-12 space-y-14">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-display text-2xl text-[#2B2420]">{category}</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((service) => (
                  <article
                    key={service.id}
                    className="group flex min-h-56 flex-col justify-between rounded-3xl border border-[#E8DFD3] bg-[#FBF8F4] p-6 shadow-[0_8px_24px_rgba(43,36,32,0.03)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_36px_rgba(43,36,32,0.07)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#E8DFD3] bg-white text-[#2B2420]">
                          <Scissors size={18} />
                        </span>
                        <strong className="shrink-0 text-sm text-[#5C5349]">
                          {service.priceEgp} EGP
                        </strong>
                      </div>
                      <h4 className="font-display mt-5 text-xl leading-snug text-[#2B2420]">
                        {service.name}
                      </h4>
                      {service.description ? (
                        <p className="mt-3 text-sm leading-6 text-[#6F6358]">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#8A7F73]">
                      <Clock3 size={14} />
                      {service.durationMin} min
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
