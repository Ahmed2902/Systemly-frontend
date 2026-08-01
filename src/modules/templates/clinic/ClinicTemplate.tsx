import type { CSSProperties, ReactNode } from "react";
import type { ClinicTemplateData } from "./clinic.types";
import { ClinicFaq } from "./ClinicFaq";
import { ClinicGallery } from "./ClinicGallery";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { Services } from "./sections/Services";
import { Team } from "./sections/Team";
import {
  CenteredBenefits,
  CenteredBookingProcess,
  MobileBookingBar,
} from "../shared/CenteredPublicSections";
import { PublicSiteHeader } from "../shared/PublicSiteHeader";
import { createTemplatePalette } from "../shared/template-palette";
import { completePublicSectionOrder } from "../section-order";
import clinicHero from "../../../../images/clinicHero.jpg";

export function ClinicTemplate(data: ClinicTemplateData) {
  const location = [data.address, data.city].filter(Boolean).join(", ");
  const heroPhoto = data.heroPhotoUrl || clinicHero.src;
  const hasServices = data.services.length > 0;
  const hasTeam = data.showTeam && data.staff.length > 0;
  const hasGallery = data.galleryPhotoUrls.length > 0;
  const hasFaq = Boolean(data.showFaq && data.faqs?.length);
  const hasAbout = Boolean(data.aboutText.trim());
  const hasContact = Boolean(
    data.phone || location || data.instagram || data.whatsapp,
  );

  const sections: Record<string, ReactNode> = {
    hero: (
      <Hero
        businessName={data.businessName}
        tagline={data.tagline}
        description={data.heroDescription}
        highlight={data.heroCardText}
        city={data.city}
        location={location}
        heroPhotoUrl={heroPhoto}
        hasServices={hasServices}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
    services: (
      <Services
        services={data.services}
        showServicePrices={data.showServicePrices}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
    team: hasTeam ? <Team staff={data.staff} /> : null,
    gallery: <ClinicGallery photos={data.galleryPhotoUrls} />,
    why: (
      <CenteredBenefits
        variant="clinic"
        eyebrow="Why choose us"
        title="Clear information and reassuring care"
        description="A professional clinic experience designed to make every step easier to understand."
        items={[
          {
            title: "Experienced specialists",
            description:
              "Qualified practitioners with clearly presented public profiles.",
          },
          {
            title: "Modern care",
            description:
              "Thoughtful treatment supported by an organised patient experience.",
          },
          {
            title: "Clear information",
            description: data.showServicePrices
              ? "Understand the treatment, duration, and price before booking."
              : "Understand the treatment and duration before booking.",
          },
          {
            title: "Comfort first",
            description:
              "A calm environment where questions and individual needs come first.",
          },
        ]}
      />
    ),
    process: (
      <CenteredBookingProcess
        variant="clinic"
        eyebrow="How it works"
        title="From treatment choice to confirmed visit"
        steps={[
          {
            title: "Choose a treatment",
            description:
              "Review the available care options and useful details.",
          },
          {
            title: "Select a doctor",
            description: "Choose the practitioner who suits your needs.",
          },
          {
            title: "Pick a time",
            description: "Reserve an available appointment directly online.",
          },
          {
            title: "Visit the clinic",
            description: "Arrive with your appointment already confirmed.",
          },
        ]}
      />
    ),
    about: (
      <About businessName={data.businessName} aboutText={data.aboutText} />
    ),
    faq: hasFaq ? <ClinicFaq faqs={data.faqs} /> : null,
    contact: hasContact ? (
      <Contact
        phone={data.phone}
        address={data.address}
        city={data.city}
        instagram={data.instagram}
        whatsapp={data.whatsapp}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ) : null,
  };

  const style = createTemplatePalette({
    accent: data.primaryColor,
    fallbackAccent: "#0B6B68",
    background: "#F4F7F5",
    surface: "#FFFFFF",
    soft: "#EAF1EE",
    text: "#172723",
    muted: "#64736E",
    border: "#DCE5E1",
    dark: "#10231F",
  }) as CSSProperties;

  return (
    <main
      dir="ltr"
      className="min-h-screen scroll-smooth bg-[var(--background)] pb-20 text-[var(--text)] motion-reduce:scroll-auto md:pb-0"
      style={style}
    >
      <PublicSiteHeader
        variant="clinic"
        businessName={data.businessName}
        logoUrl={data.logoUrl}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        links={[
          { label: "Treatments", href: "#services", show: hasServices },
          { label: "Doctors", href: "#team", show: hasTeam },
          { label: "Our clinic", href: "#gallery", show: hasGallery },
          { label: "About", href: "#about", show: hasAbout },
          { label: "FAQ", href: "#faq", show: hasFaq },
          { label: "Contact", href: "#contact", show: hasContact },
        ]}
      />

      {completePublicSectionOrder(data.sectionOrder).map((section) => (
        <div key={section}>{sections[section] ?? null}</div>
      ))}

      <Footer
        businessName={data.businessName}
        phone={data.phone}
        address={data.address}
        city={data.city}
        instagram={data.instagram}
        whatsapp={data.whatsapp}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        showServices={hasServices}
        showTeam={hasTeam}
        showGallery={hasGallery}
        showAbout={hasAbout}
        showFaq={hasFaq}
        showContact={hasContact}
      />

      <MobileBookingBar
        variant="clinic"
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    </main>
  );
}
