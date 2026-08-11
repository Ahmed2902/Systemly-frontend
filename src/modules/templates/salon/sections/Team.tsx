import type { SalonTemplateData } from "../salon.types";
import { Image } from "@/shared/components/Image";

function firstLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function Team({ staff }: { staff: SalonTemplateData["staff"] }) {
  if (staff.length === 0) return null;

  return (
    <section id="team" className="bg-[var(--background)] px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 text-start md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">The artists</p>
            <h2 className="font-display mt-4 max-w-2xl text-4xl font-normal leading-[1.04] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
              The people behind the experience.
            </h2>
          </div>
          <p className="max-w-md text-base leading-8 text-[var(--muted)]">
            Meet the team, understand their focus, and choose the person who feels right for your visit.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <article
              key={member.id}
              className="group relative min-h-[470px] overflow-hidden rounded-[2rem] bg-[#d9cec2] shadow-[0_16px_48px_rgba(43,36,32,0.09)]"
            >
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025] motion-reduce:transition-none"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--secondary-wash)] via-[var(--secondary-soft)] to-[var(--secondary-strong)]">
                  <span className="font-display text-8xl text-[var(--accent-strong)]/70">{firstLetter(member.name)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/8 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-start text-white md:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/58">
                  {member.jobTitle || member.role || "Artist"}
                </p>
                <h3 className="font-display mt-2 text-3xl font-normal">{member.name}</h3>
                {member.yearsExperience ? (
                  <p className="mt-2 text-xs text-white/64">{member.yearsExperience} years of experience</p>
                ) : null}
                {member.bio ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/72">{member.bio}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
