import { Star } from "lucide-react";
import { ScrollReveal } from "@/shared/components/ScrollReveal";

export function Testimonials({
  testimonials,
}: {
  testimonials: { name: string; review: string; rating?: number }[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="px-8 py-20 md:px-16">
      <ScrollReveal>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7D6A5B]">
          Testimonials
        </p>
        <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
          Loved by Clients
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-[#E8DFD3] bg-[#FBF8F4] p-6"
            >
              <div className="flex gap-1 text-[#8C5A3C]">
                {Array.from({ length: item.rating || 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#5C5349]">
                {item.review}
              </p>
              <p className="mt-5 font-display text-lg text-[#2B2420]">
                {item.name}
              </p>
            </article>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
