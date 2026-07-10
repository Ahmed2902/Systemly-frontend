import { Scissors, Sparkles, Wand2, Flower2, Heart, Smile } from "lucide-react";
import { SalonTemplateData } from "../salon.types";

const iconMap = {
  scissors: Scissors,
  sparkles: Sparkles,
  wand: Wand2,
  flower: Flower2,
  heart: Heart,
  smile: Smile,
};

type ServiceCard = SalonTemplateData["services"][number] & {
  description?: string;
  icon?: keyof typeof iconMap;
};

// 1. Define your 3 structural alternatives
const designAlternatives = [
  {
    icon: "sparkles" as const,
    description: "Experience our signature high-end care ritual.",
    tag: "Premium touch",
  },
  {
    icon: "scissors" as const,
    description:
      "Expertly crafted styling tailored completely to your aesthetic.",
    tag: "Expert care",
  },
  {
    icon: "wand" as const,
    description:
      "A transformative session designed to elevate your natural look.",
    tag: "Luxury session",
  },
  {
    icon: "flower" as const,
    description:
      "A serene, refreshing experience using nourishing organic elements.",
    tag: "Pure wellness",
  },
  {
    icon: "heart" as const,
    description:
      "Meticulous attention to detail designed to make you feel completely renewed.",
    tag: "Signature care",
  },
  {
    icon: "smile" as const,
    description:
      "Indulge in a bespoke refreshing treatment that brings out your inner glow.",
    tag: "Radiant finish",
  },
];

export function Services({
  services,
}: {
  services: SalonTemplateData["services"];
}) {
  const items: ServiceCard[] = services;

  // Helper function to pick an alternative based on the item's unique ID
  // This acts like a stable "random" selector that won't change on click/scroll re-renders
  const getAlternativeIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % designAlternatives.length;
  };

  return (
    <section id="services" className="px-8 py-20 md:px-16">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7D6A5B]">
        Curated Services
      </p>
      <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
        Our Rituals
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((service) => {
          // Get the assigned configuration variant for this service item
          const altIndex = getAlternativeIndex(service.id);
          const alternative = designAlternatives[altIndex];

          // Use custom properties if provided by the backend, otherwise pick the alternative asset
          const chosenIconKey = alternative.icon;
          const Icon = iconMap[chosenIconKey] || Sparkles;
          const displayDescription =
            service.description || alternative.description;

          return (
            <article
              key={service.id}
              className="group flex flex-col justify-between rounded-3xl border border-[#E8DFD3] bg-[#FBF8F4] p-6 shadow-[0_8px_24px_rgba(43,36,32,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D9CAB8] hover:bg-white hover:shadow-[0_14px_36px_rgba(43,36,32,0.07)]"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E8DFD3] bg-white text-[#2B2420] transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      {service.category && (
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8A7F73] mb-0.5">
                          {service.category}
                        </p>
                      )}
                      <h3 className="font-display text-xl text-[#2B2420] leading-snug break-words">
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-[#5C5349] shrink-0 pt-1 whitespace-nowrap">
                    {service.priceEgp} EGP
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#6F6358]">
                  {displayDescription}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#8A7F73]">
                <span>
                  {service.durationMin
                    ? `${service.durationMin} min`
                    : "By appointment"}
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  {alternative.tag}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
