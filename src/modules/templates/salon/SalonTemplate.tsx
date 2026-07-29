import type { CSSProperties } from "react";
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
import { completePublicSectionOrder } from "../section-order";
import hero from "../../../../images/salonHero.jpg";

const defaultHero = hero.src;

export function SalonTemplate(data: SalonTemplateData) {
  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <Hero
        tagline={data.tagline}
        heroPhotoUrl={data.heroPhotoUrl || defaultHero}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
      />
    ),
    services: <Services services={data.services} />,
    team: data.showTeam ? <Team staff={data.staff} /> : null,
    gallery: <Gallery photos={data.galleryPhotoUrls} />,
    why: (
      <CenteredBenefits
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
    faq: data.showFaq ? <Faq faqs={data.faqs} /> : null,
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

  const style = {
    "--accent": data.primaryColor || "#8C5A3C",
    "--background": "#F7F3EE",
    "--surface": "#FFFFFF",
    "--soft": "#FBF8F4",
    "--text": "#2B2420",
    "--muted": "#75695E",
    "--border": "#E8DFD3",
  } as CSSProperties;

  return (
    <div
      className="min-h-screen bg-[var(--background)] pb-20 text-center text-[var(--text)] md:pb-0"
      dir={data.language === "ar" ? "rtl" : "ltr"}
      style={style}
    >
      <Nav
        businessName={data.businessName}
        logoUrl={data.logoUrl}
        bookingHref={data.bookingHref}
        previewMode={data.previewMode}
        showTeam={data.showTeam && data.staff.length > 0}
        showGallery={data.galleryPhotoUrls.length > 0}
        showFaq={Boolean(data.showFaq && data.faqs?.length)}
        showContact={Boolean(data.phone || data.address || data.city || data.instagram || data.whatsapp)}
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
      />
      <MobileBookingBar bookingHref={data.bookingHref} previewMode={data.previewMode} />
    </div>
  );
}
