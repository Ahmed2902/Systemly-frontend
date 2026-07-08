// src/modules/templates/salon/sections/Footer.tsx

export function Footer({
  businessName,
  phone,
  address,
}: {
  businessName: string;
  phone?: string;
  address?: string;
}) {
  return (
    <footer
      id="contact"
      className="border-t border-[#E8DFD3] px-8 py-12 md:px-16"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-[#2B2420]">{businessName}</p>
          <p className="mt-2 max-w-xs text-sm text-[#8A7F73]">
            A space dedicated to quiet luxury and considered care.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A7F73]">
            Contact
          </p>
          <p className="mt-2 text-sm text-[#2B2420]">{phone}</p>
          <p className="text-sm text-[#2B2420]">{address}</p>
        </div>
      </div>
      <p className="mt-10 text-xs text-[#8A7F73]">
        © {new Date().getFullYear()} {businessName}. All rights reserved.
      </p>
    </footer>
  );
}
