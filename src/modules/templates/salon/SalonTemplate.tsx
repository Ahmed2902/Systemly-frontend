import type { ReactNode } from "react";
import type { SalonTemplateData } from "./salon.types";
import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Services } from "./sections/Services";
import { Gallery } from "./sections/Gallery";
import { Team } from "./sections/Team";
import { Contact } from "./sections/Contact";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import {
  CenteredBenefits,
  CenteredBookingProcess,
  MobileBookingBar,
} from "../shared/CenteredPublicSections";
import { createTemplatePalette } from "../shared/template-palette";
import { completePublicSectionOrder } from "../section-order";
import hero from "../../../../images/salonHero.jpg";

const defaultHero = hero.src;

export function SalonTemplate(data: SalonTemplateData) {
  const hasTeam = data.showTeam && data.staff.length > 0;
  const hasGallery = data.galleryPhotoUrls.length > 0;
  const hasFaq = Boolean(data.showFaq && data.faqs?.length);
  const hasContact = Boolean(data.phone || data.address || data.city || data.instagram || data.whatsapp);

  const sectionMap: Record<string, ReactNode> = {
    hero: (
      <Hero
        businessName={data.businessName}
        tagline={data.tagline}
        city={data.city}
        heroPhotoUrl={data.heroPhotoUrl || defaultHero}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
    services: (
      <Services
        services={data.services}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
    team: hasTeam ? <Team staff={data.staff} /> : null,
    gallery: <Gallery photos={data.galleryPhotoUrls} />,
    why: (
      <CenteredBenefits
        variant="salon"
        eyebrow="Why choose us"
        title="Personal care, thoughtfully delivered"
        description="A calm experience built around your preferences, comfort, and time."
        items={[
          { title: "Personalised service", description: "Every appointment is shaped around your style and goals." },
          { title: "Experienced artists", description: "Meet professionals selected for the services you choose." },
          { title: "Premium care", description: "A considered experience from booking through to the final result." },
          { title: "A calm atmosphere", description: "An inviting space designed to help you slow down and feel at ease." },
        ]}
      />
    ),
    process: (
      <CenteredBookingProcess
        variant="salon"
        eyebrow="How it works"
        title="Your next appointment in four simple steps"
        steps={[
          { title: "Choose a service", description: "Explore the treatments that match what you need." },
          { title: "Select your artist", description: "Pick an available team member or let us match you." },
          { title: "Choose a time", description: "Find a convenient appointment from the live schedule." },
          { title: "Enjoy your visit", description: "Arrive knowing every detail is already organised." },
        ]}
      />
    ),
    about: <About businessName={data.businessName} aboutText={data.aboutText} />,
    faq: hasFaq ? <Faq faqs={data.faqs} /> : null,
    contact: (
      <Contact
        phone={data.phone}
        address={data.address}
        city={data.city}
        instagram={data.instagram}
        whatsapp={data.whatsapp}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
  };

  const style = createTemplatePalette({
    accent: data.primaryColor,
    fallbackAccent: "#6A3048",
    background: "#F4F0EA",
    surface: "#FFFDFA",
    soft: "#ECE4DB",
    text: "#231F1C",
    muted: "#746B63",
    border: "#DED5CB",
    dark: "#171513",
  });

  return (
    <div
      className="min-h-screen scroll-smooth bg-[var(--background)] pb-20 text-[var(--text)] motion-reduce:scroll-auto md:pb-0"
      dir={data.language === "ar" ? "rtl" : "ltr"}
      style={style}
    >
      <Nav
        businessName={data.businessName}
        logoUrl={data.logoUrl}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        showTeam={hasTeam}
        showGallery={hasGallery}
        showFaq={hasFaq}
        showContact={hasContact}
      />

      {completePublicSectionOrder(data.sectionOrder).map((key) => (
        <div key={key}>{sectionMap[key] ?? null}</div>
      ))}

      <Footer
        businessName={data.businessName}
        phone={data.phone}
        address={data.address}
        city={data.city}
        instagram={data.instagram}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        showTeam={hasTeam}
        showGallery={hasGallery}
        showFaq={hasFaq}
        showContact={hasContact}
      />
      <MobileBookingBar
        variant="salon"
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    </div>
  );
}
