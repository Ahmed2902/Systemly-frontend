import { PublicSiteHeader } from "../../shared/PublicSiteHeader";

export function Nav({
  businessName,
  logoUrl,
  bookingHref,
  previewMode = false,
  showTeam,
  showGallery,
  showFaq,
  showContact,
}: {
  businessName: string;
  logoUrl: string | null;
  bookingHref: string;
  previewMode?: boolean;
  showTeam: boolean;
  showGallery: boolean;
  showFaq: boolean;
  showContact: boolean;
}) {
  return (
    <PublicSiteHeader
      variant="salon"
      businessName={businessName}
      logoUrl={logoUrl}
      bookingHref={bookingHref}
      previewMode={previewMode}
      links={[
        { label: "Services", href: "#services" },
        { label: "Artists", href: "#team", show: showTeam },
        { label: "Our space", href: "#gallery", show: showGallery },
        { label: "About", href: "#about" },
        { label: "FAQ", href: "#faq", show: showFaq },
        { label: "Contact", href: "#contact", show: showContact },
      ]}
    />
  );
}
