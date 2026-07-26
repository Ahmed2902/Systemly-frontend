import { AvatarPlaceholder } from "@/shared/components/AvatarPlaceholder";
import type { SalonTemplateData } from "../salon.types";

export function Team({ staff }: { staff: SalonTemplateData["staff"] }) {
  if (staff.length === 0) return null;

  return (
    <section id="team" className="bg-[#FAF9F6] px-8 py-24 md:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
            Meet the team
          </p>
          <h2 className="font-display mt-2 text-4xl text-[#2B2420] md:text-5xl">
            The people behind your experience
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <article key={member.id} className="rounded-3xl border border-[#E8DFD3] bg-white p-5 shadow-[0_10px_30px_rgba(43,36,32,0.04)]">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#EAE6DF] to-[#DFD9CE]">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <AvatarPlaceholder name={member.name || "?"} size={128} />
                  </div>
                )}
              </div>
              <h3 className="font-display mt-5 text-xl text-[#2B2420]">{member.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#8A7F73]">
                {member.jobTitle || member.role || "Team member"}
              </p>
              {member.yearsExperience ? (
                <p className="mt-3 text-xs text-[#8A7F73]">{member.yearsExperience} years of experience</p>
              ) : null}
              {member.bio ? <p className="mt-3 text-sm leading-6 text-[#6F6358]">{member.bio}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
