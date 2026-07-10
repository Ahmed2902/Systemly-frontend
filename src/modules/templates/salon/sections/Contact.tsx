import { Phone } from "lucide-react";

export function Contact({
  phone,
  instagram,
  whatsapp,
}: {
  phone?: string;
  instagram?: string;
  whatsapp?: string;
}) {
  const hasContact = phone || instagram || whatsapp;
  if (!hasContact) return null;

  // Helper function to force absolute URLs so they don't prepend 'localhost:3000'
  const formatExternalLink = (url: string) => {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  const absoluteInstagramUrl = instagram ? formatExternalLink(instagram) : "";

  // Format the WhatsApp API link safely by stripping out non-digits
  const absoluteWhatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : "";

  return (
    <section id="contact" className="px-8 py-16 md:px-16">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#7D6A5B]">
        Contact Us
      </p>
      <h2 className="font-display mt-2 text-2xl text-[#2B2420] md:text-3xl">
        Get in Touch
      </h2>

      {/* --- Main Contact Box --- */}
      <div className="mt-6 max-w-xl rounded-3xl border border-[#E8DFD3] bg-[#FBF8F4] p-5">
        <div className="grid gap-4 text-sm text-[#2B2420]">
          {/* Phone row */}
          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#8A7F73]" />
              <span>{phone}</span>
            </div>
          )}

          {/* WhatsApp row: Cleared the duplicates, now one clean link line */}
          {whatsapp && (
            <div className="flex items-center gap-3">
              <svg
                className="h-4 w-4 text-[#8A7F73]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <a
                href={absoluteWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#7D6A5B]"
              >
                WhatsApp ({whatsapp})
              </a>
            </div>
          )}

          {/* Instagram row: Brought inside the card block with its name */}
          {instagram && (
            <div className="flex items-center gap-3">
              <svg
                className="h-4 w-4 text-[#8A7F73]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <a
                href={absoluteInstagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#7D6A5B]"
              >
                Instagram
              </a>
            </div>
          )}
        </div>
      </div>

      {/* The empty/duplicate icon section at the bottom has been entirely removed */}
    </section>
  );
}
