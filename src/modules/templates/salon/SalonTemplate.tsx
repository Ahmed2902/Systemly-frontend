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

const defaultHero = "/images/salon-default.svg";

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
    contact: (
      <Contact
        phone={data.phone}
        address={data.address}
        city={data.city}
        instagram={data.instagram}
        whatsapp={data.whatsapp}
      />
    ),
    faq: data.showFaq ? <Faq faqs={data.faqs} /> : null,
  };

  const orderedSections = completePublicSectionOrder(data.sectionOrder);

  return (
    <div
      className="min-h-screen bg-[var(--salon-bg)] text-[var(--salon-text)]"
      style={
        {
          "--salon-primary": data.primaryColor,
        } as CSSProperties
      }
    >
      <Nav
        businessName={data.businessName}
        logoUrl={data.logoUrl}
        bookingHref={data.bookingHref}
        showTeam={data.showTeam && data.staff.length > 0}
        showFaq={data.showFaq && data.faqs.length > 0}
        hasGallery={data.galleryPhotoUrls.length > 0}
      />

      <main>
        {orderedSections.map((section) => (
          <div key={section}>{sectionMap[section] ?? null}</div>
        ))}
      </main>

      <Footer businessName={data.businessName} phone={data.phone} />
      <MobileBookingBar bookingHref={data.bookingHref} />
    </div>
  );
}
