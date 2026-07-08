// src/modules/templates/salon/sections/Team.tsx
import { AvatarPlaceholder } from "@/shared/components/AvatarPlaceholder";
import { SalonTemplateData } from "../salon.types";

export function Team({ staff }: { staff: SalonTemplateData["staff"] }) {
  if (staff.length === 0) return null;

  return (
    <section id="team" className="px-8 py-20 md:px-16">
      <p
        className="text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: "var(--accent)" }}
      >
        Meet the Team
      </p>
      <h2 className="font-display mt-2 text-3xl text-[#2B2420] md:text-4xl">
        Your Artists
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="flex flex-col items-center text-center"
          >
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <AvatarPlaceholder name={member.name || "?"} size={80} />
            )}
            <p className="mt-3 font-display text-base text-[#2B2420]">
              {member.name}
            </p>
            <p className="text-xs text-[#8A7F73]">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
