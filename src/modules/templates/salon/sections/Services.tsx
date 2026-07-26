import {
  Brush,
  Clock3,
  Flower2,
  Scissors,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { SalonTemplateData } from "../salon.types";

const serviceIcons = [Scissors, Sparkles, WandSparkles, Flower2, Brush];

function iconForService(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = id.charCodeAt(index) + ((hash << 5) - hash);
  }
  return serviceIcons[Math.abs(hash) % serviceIcons.length];
}

export function Services({ services }: { services: SalonTemplateData["services"] }) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>
            Our services
          </p>
          <h2 className="font-display mt-3 text-4xl leading-tight text-[#2B2420] md:text-5xl">
            Thoughtful care, without the clutter
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#75695E]">
            Explore the treatments available and choose the appointment that feels right for you.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = iconForService(service.id);

            return (
              <article
                key={service.id}
                className="group flex min-h-64 flex-col rounded-[1.75rem] border border-[#E8DFD3] bg-[#FBF8F4] p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(43,36,32,0.07)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#E6DCCF] bg-white text-[#2B2420]">
                  <Icon size={19} strokeWidth={1.7} />
                </span>

                <div className="mt-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9B8D80]">
                    {service.category?.trim() || "Service"}
                  </p>
                  <h3 className="font-display mt-2 text-2xl leading-snug text-[#2B2420]">
                    {service.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6F6358]">
                    {service.description || "A considered treatment delivered with care and attention to detail."}
                  </p>
                </div>

                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#8A7F73]">
                    <Clock3 size={14} />
                    {service.durationMin} min
                  </span>
                  <strong className="text-sm font-semibold text-[#4E463F]">
                    {service.priceEgp} EGP
                  </strong>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
