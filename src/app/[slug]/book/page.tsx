import { notFound } from "next/navigation";
import { apiUrl } from "@/shared/lib/api-url";
import { BookingProvider } from "@/modules/booking/booking.context";
import { BookingShell } from "@/modules/booking/components/BookingShell";
import { BookingBranchPicker } from "@/modules/booking/components/BookingBranchPicker";
import { getTemplateById } from "@/modules/templates/template-registry";

function contrastText(colour: string) {
  const hex = colour.replace(/^#/, "");
  if (!/^[\da-fA-F]{6}$/.test(hex)) return "#171918";
  const channels = [0, 2, 4].map(
    (start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 0.46
    ? "#171918"
    : "#FFFFFF";
}

async function getBusiness(slug: string, branchSlug?: string) {
  const query = branchSlug ? `?branch=${encodeURIComponent(branchSlug)}` : "";
  const res = await fetch(apiUrl(`/businesses/public/${slug}${query}`), {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load business: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { slug } = await params;
  const { branch: branchSlug } = await searchParams;
  const business = await getBusiness(slug, branchSlug);
  if (!business?.selectedBranch?.id) notFound();

  const template = getTemplateById(
    business.websiteContent?.template ?? "aura-wellness",
  );
  const theme = template?.theme;
  const primary =
    business.websiteContent?.primaryColor ??
    theme?.primary ??
    (template?.vertical === "clinic" ? "#0B6B68" : "#6A3048");
  const accent =
    business.websiteContent?.secondaryColor ??
    (template?.vertical === "clinic" ? "#074947" : "#482131");
  const language: "en" | "ar" = business.language === "ar" ? "ar" : "en";
  const hasMultipleBranches = business.branches.length > 1;
  const needsBranchSelection = hasMultipleBranches && !branchSlug;

  return (
    <div
      style={
        {
          "--booking-bg": theme?.background ?? "#FFFFFF",
          "--booking-surface": theme?.surface ?? "#FFFFFF",
          "--booking-text": theme?.text ?? "#111111",
          "--booking-muted": theme?.muted ?? "#666666",
          "--booking-border": theme?.border ?? "#E5E5E5",
          "--booking-brand": primary,
          "--booking-brand-text": contrastText(primary),
          "--accent": accent,
          "--accent-text": contrastText(accent),
        } as React.CSSProperties
      }
    >
      {needsBranchSelection ? (
        <BookingBranchPicker
          businessName={business.name}
          logoUrl={business.logoUrl}
          tagline={business.websiteContent?.tagline ?? null}
          slug={slug}
          language={language}
          branches={business.branches}
        />
      ) : (
        <BookingProvider
          businessId={business.id}
          branchId={business.selectedBranch.id}
          services={business.services}
          staff={business.staff}
        >
          <BookingShell
            businessName={business.name}
            logoUrl={business.logoUrl}
            tagline={business.websiteContent?.tagline ?? null}
            language={language}
            slug={slug}
            showBranchStep={hasMultipleBranches}
          />
        </BookingProvider>
      )}
    </div>
  );
}
