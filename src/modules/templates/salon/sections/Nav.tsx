// src/modules/templates/salon/sections/Nav.tsx

export function Nav({ businessName }: { businessName: string }) {
  const links = ["Services", "Gallery", "Team", "About", "Contact"];

  return (
    <nav className="flex items-center justify-between px-8 py-5 md:px-16">
      <span className="font-display text-lg font-semibold tracking-wide text-[#2B2420]">
        {businessName.toUpperCase()}
      </span>
      <div className="hidden gap-8 text-xs font-medium uppercase tracking-wider text-[#2B2420] md:flex">
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="hover:opacity-60">
            {l}
          </a>
        ))}
      </div>
      <button
        className="rounded-sm px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Book Appointment
      </button>
    </nav>
  );
}
