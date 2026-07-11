import { SalonTemplateData } from "./salon.types";
import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Services } from "./sections/Services";
import { Gallery } from "./sections/Gallery";
import { Team } from "./sections/Team";
import { Contact } from "./sections/Contact";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import hero from "../../../../images/hero.jpg";

const defaultHero = hero.src;

export function SalonTemplate(data: SalonTemplateData) {
  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <Hero
        tagline={data.tagline}
        heroPhotoUrl={data.heroPhotoUrl || defaultHero}
      />
    ),
    about: (
      <About businessName={data.businessName} aboutText={data.aboutText} />
    ),
    services: <Services services={data.services} />,
    gallery: <Gallery photos={data.galleryPhotoUrls} />,
    team: data.showTeam ? <Team staff={data.staff} /> : null,
    contact: (
      <Contact
        phone={data.phone}
        instagram={data.instagram}
        whatsapp={data.whatsapp}
      />
    ),
    faq: data.showFaq ? <Faq faqs={data.faqs} /> : null,
  };

  return (
    <div
      className="font-body bg-[#F7F3EE]"
      style={{ ["--accent" as any]: data.primaryColor || "#8C5A3C" }}
    >
      <Nav businessName={data.businessName} logoUrl={data.logoUrl} />
      {data.sectionOrder.map((key) => (
        <div key={key}>{sectionMap[key]}</div>
      ))}
      <Footer
        businessName={data.businessName}
        phone={data.phone}
        address={data.address}
      />
    </div>
  );
}
