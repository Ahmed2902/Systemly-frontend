// src/modules/templates/salon/sections/Team.tsx
import { AvatarPlaceholder } from "@/shared/components/AvatarPlaceholder";
import { SalonTemplateData } from "../salon.types";

export function Team({ staff }: { staff: SalonTemplateData["staff"] }) {
  if (staff.length === 0) return null;

  return (
    <section id="team" className="px-8 py-24 md:px-16 bg-[#FAF9F6]">
      {/* Centered or Left-aligned Header */}
      <div className="max-w-2xl mb-16">
        <p
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--accent)" }}
        >
          Meet the Team
        </p>
        <h2 className="font-display mt-2 text-4xl text-[#2B2420] md:text-5xl">
          Your Artists
        </h2>
      </div>

      {/* Balanced Grid for Team Members */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="group flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-[0_10px_30px_rgba(43,36,32,0.05)]"
          >
            {/* Image Container with Luxury Soft Frame */}
            <div className="relative mb-5 h-32 w-32 md:h-36 md:w-36 rounded-full overflow-hidden ring-4 ring-transparent transition-all duration-500 group-hover:ring-[#2B2420]/5 group-hover:scale-105 shadow-inner">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name || "Team member"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAE6DF] to-[#DFD9CE]">
                  <AvatarPlaceholder name={member.name || "?"} size={128} />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h3 className="font-display text-lg text-[#2B2420] transition-colors duration-300 group-hover:text-black">
              {member.name || "Anonymous Artist"}
            </h3>

            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#8A7F73]">
              {member.role || "Stylist"}
            </p>

            {/* Subtle premium divider line that appears on hover */}
            <div className="mt-4 w-0 h-[1px] bg-[#2B2420]/20 transition-all duration-300 group-hover:w-12" />
          </div>
        ))}
      </div>
    </section>
  );
}
