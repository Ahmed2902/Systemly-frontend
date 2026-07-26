import type { SalonTemplateData } from "../salon.types";

function firstLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function Team({ staff }: { staff: SalonTemplateData["staff"] }) {
  if (staff.length === 0) return null;

  return (
    <section id="team" className="bg-[#FAF9F6] px-6 py-24 md:px-12 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Meet our artists
          </p>
          <h2 className="font-display mt-3 text-4xl text-[#2B2420] md:text-5xl">
            The people behind your experience
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <article
              key={member.id}
              className="overflow-hidden rounded-[1.75rem] border border-[#E8DFD3] bg-white shadow-[0_12px_35px_rgba(43,36,32,0.04)]"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#EEE7DE]">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-[#F0E9DF] to-[#DED2C4]">
                    <span className="font-display text-7xl text-[#77685B]">
                      {firstLetter(member.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 text-center">
                <h3 className="font-display text-xl text-[#2B2420]">{member.name}</h3>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#95877A]">
                  {member.jobTitle || member.role || "Artist"}
                </p>
                {member.yearsExperience ? (
                  <p className="mt-3 text-xs text-[#8A7F73]">
                    {member.yearsExperience} years of experience
                  </p>
                ) : null}
                {member.bio ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#6F6358]">{member.bio}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
