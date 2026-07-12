import { notFound } from "next/navigation";
import { apiUrl } from "@/shared/lib/api-url";
import { BookingProvider } from "@/modules/booking/booking.context";
import { BookingShell } from "@/modules/booking/components/BookingShell";
import { getTemplateById } from "@/modules/templates/template-registry";

async function getBusiness(slug: string) {
  const res = await fetch(apiUrl(`/businesses/public/${slug}`), {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load business: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();

  const template = getTemplateById(
    business.websiteContent?.template ?? "aura-wellness",
  );
  const theme = template?.theme;
  const accent = business.websiteContent?.primaryColor ?? "#2B2420";

  return (
    <div
      style={
        {
          "--booking-bg": theme?.background ?? "#FFFFFF",
          "--booking-surface": theme?.surface ?? "#FFFFFF",
          "--booking-text": theme?.text ?? "#111111",
          "--booking-muted": theme?.muted ?? "#666666",
          "--booking-border": theme?.border ?? "#E5E5E5",
          "--accent": accent,
          "--accent-text": theme?.accentTextOn ?? "#FFFFFF",
        } as React.CSSProperties
      }
    >
      <BookingProvider
        businessId={business.id}
        services={business.services}
        staff={business.staff}
      >
        <BookingShell
          businessName={business.name}
          logoUrl={business.logoUrl}
          slug={slug}
        />
      </BookingProvider>
    </div>
  );
}
