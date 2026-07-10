import { ScrollReveal } from "@/shared/components/ScrollReveal";

export function Hours({
  hours,
}: {
  hours: {
    dayLabel: string;
    isClosed?: boolean;
    startTime?: string;
    endTime?: string;
    note?: string;
  }[];
}) {
  if (hours.length === 0) return null;

  return (
    <section id="hours" className="px-8 py-20 md:px-16">
      <ScrollReveal className="max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7D6A5B]">
          Opening Hours
        </p>
        <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
          When We Welcome You
        </h2>
        <div className="mt-8 rounded-3xl border border-[#E8DFD3] bg-[#FBF8F4] p-6">
          {hours.map((item, index) => (
            <div
              key={`${item.dayLabel}-${index}`}
              className={`flex items-center justify-between py-3 text-sm text-[#2B2420] ${
                index > 0 ? "border-t border-[#E8DFD3]" : ""
              }`}
            >
              <span>{item.dayLabel}</span>
              <span>
                {item.isClosed
                  ? "Closed"
                  : item.note || `${item.startTime} - ${item.endTime}`}
              </span>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
