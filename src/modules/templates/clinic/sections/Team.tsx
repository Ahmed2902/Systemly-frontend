import type { ClinicTemplateData } from "../clinic.types";

function firstLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function Team({ staff }: { staff: ClinicTemplateData["staff"] }) {
  if (!staff.length) return null;

  return (
    <section
      id="team"
      className="bg-[var(--secondary-soft)] px-6 py-24 md:px-12 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 text-start md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
              Our doctors
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[var(--text)] md:text-5xl lg:text-6xl">
              Meet the people caring for you.
            </h2>
          </div>
          <p className="max-w-md text-base leading-8 text-[var(--muted)]">
            Review each practitioner’s role, experience, and background before
            choosing your visit.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <article
              key={member.id}
              className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] text-start shadow-[0_14px_40px_rgba(20,39,35,0.055)]"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[var(--background)]">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-[var(--secondary-wash)] to-[var(--secondary-soft)]">
                    <span className="text-7xl font-semibold text-[var(--accent-strong)]">
                      {firstLetter(member.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  {member.jobTitle || member.role || "Clinician"}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--text)]">
                  {member.name}
                </h3>
                {member.yearsExperience ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {member.yearsExperience} years of experience
                  </p>
                ) : null}
                {member.bio ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                    {member.bio}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
