import { DEFAULT_PUBLIC_SECTION_ORDER } from "@/modules/templates/section-order";
import type {
  TemplateData,
  TemplateVertical,
} from "@/modules/templates/template.types";

export const DEMO_WEBSITE_VERTICALS = ["salon", "clinic"] as const;

export function isDemoWebsiteVertical(
  value: string,
): value is TemplateVertical {
  return DEMO_WEBSITE_VERTICALS.some((vertical) => vertical === value);
}

export function getDemoWebsiteData(vertical: TemplateVertical): TemplateData {
  return vertical === "salon" ? createSalonDemo() : createClinicDemo();
}

function createSalonDemo(): TemplateData {
  return {
    vertical: "salon",
    businessName: "Maison Noura Beauty Lounge",
    tagline: "Beauty rituals, made beautifully simple.",
    template: "aura-wellness",
    heroDescription:
      "A calm New Cairo beauty lounge for thoughtful hair, nail, skin, and bridal appointments delivered by a team that remembers the details.",
    heroCardText: "Your next beauty appointment, already organised.",
    aboutText:
      "Maison Noura is a fictional beauty lounge created to demonstrate how a Systemly public website can present services, introduce the team, and guide customers toward online booking. The experience is designed around clear choices, considered care, and a relaxed visit from arrival to finish.",
    heroPhotoUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=85",
    logoUrl: null,
    galleryPhotoUrls: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
    ],
    primaryColor: "#6A3048",
    sectionOrder: [...DEFAULT_PUBLIC_SECTION_ORDER],
    showTeam: true,
    showFaq: true,
    showServicePrices: true,
    services: [
      {
        id: "salon-service-cut",
        name: "Signature Cut & Styling",
        category: "Hair",
        description:
          "A consultation-led cut, finish, and styling plan tailored to your hair and routine.",
        priceEgp: 650,
        durationMin: 60,
      },
      {
        id: "salon-service-manicure",
        name: "Gel Manicure",
        category: "Nails",
        description:
          "Detailed nail preparation, shaping, cuticle care, and a long-wear gel finish.",
        priceEgp: 450,
        durationMin: 50,
      },
      {
        id: "salon-service-facial",
        name: "Hydrating Facial",
        category: "Skin",
        description:
          "A restorative facial focused on hydration, comfort, and a healthy natural glow.",
        priceEgp: 900,
        durationMin: 75,
      },
      {
        id: "salon-service-lashes",
        name: "Lash Lift & Tint",
        category: "Lashes",
        description:
          "A low-maintenance lift and tint that enhances the shape of your natural lashes.",
        priceEgp: 700,
        durationMin: 60,
      },
      {
        id: "salon-service-bridal",
        name: "Bridal Hair & Makeup",
        category: "Bridal",
        description:
          "A complete bridal look planned through a consultation and delivered with dedicated time.",
        priceEgp: 3500,
        durationMin: 180,
      },
    ],
    staff: [
      {
        id: "salon-staff-nour",
        name: "Nour Khalil",
        role: "Staff",
        jobTitle: "Senior Hair Artist",
        bio: "Known for polished, wearable cuts and styling that works beyond the appointment.",
        yearsExperience: 9,
        photoUrl: null,
      },
      {
        id: "salon-staff-mona",
        name: "Mona Adel",
        role: "Staff",
        jobTitle: "Nail Artist",
        bio: "Focused on careful preparation, clean finishes, and modern understated colour.",
        yearsExperience: 6,
        photoUrl: null,
      },
      {
        id: "salon-staff-salma",
        name: "Salma Tarek",
        role: "Staff",
        jobTitle: "Skin Specialist",
        bio: "Creates calm, practical facial plans shaped around comfort and consistency.",
        yearsExperience: 8,
        photoUrl: null,
      },
      {
        id: "salon-staff-yasmine",
        name: "Yasmine Ali",
        role: "Staff",
        jobTitle: "Bridal Artist",
        bio: "Builds refined bridal looks that photograph beautifully and still feel personal.",
        yearsExperience: 10,
        photoUrl: null,
      },
    ],
    faqs: [
      {
        question: "How early should I arrive?",
        answer:
          "Arriving five to ten minutes early gives us enough time to confirm your preferences before the service begins.",
      },
      {
        question: "Can I book more than one service?",
        answer:
          "Yes. Systemly can organise multiple services in one appointment and assign each service to the right team member.",
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "Please contact the lounge at least 24 hours before your appointment when you need to reschedule or cancel.",
      },
      {
        question: "Do bridal bookings need a consultation?",
        answer:
          "A consultation is recommended so the team can confirm timing, style, and any preparation before the event.",
      },
    ],
    phone: "+20 10 0000 1001",
    address: "The Waterway, First New Cairo",
    city: "New Cairo",
    timezone: "Africa/Cairo",
    language: "en",
    bookingHref: "#",
    previewMode: true,
  };
}

function createClinicDemo(): TemplateData {
  return {
    vertical: "clinic",
    businessName: "Clarity Dental & Skin Clinic",
    tagline: "Clear answers. Thoughtful care.",
    template: "clinic-clarity",
    heroDescription:
      "A fictional Heliopolis clinic bringing dental and dermatology care into one organised, reassuring patient experience.",
    heroCardText: "Choose your treatment, doctor, and appointment time online.",
    aboutText:
      "Clarity Dental & Skin Clinic is a fictional practice created to demonstrate the Systemly clinic template. It shows how a medical business can explain treatments, introduce practitioners, answer common questions, and make the first step toward an appointment feel clear and professional.",
    heroPhotoUrl:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1800&q=85",
    logoUrl: null,
    galleryPhotoUrls: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=80",
    ],
    primaryColor: "#0B6B68",
    sectionOrder: [...DEFAULT_PUBLIC_SECTION_ORDER],
    showTeam: true,
    showFaq: true,
    showServicePrices: true,
    services: [
      {
        id: "clinic-service-dental-consultation",
        name: "Dental Consultation",
        category: "Dentistry",
        description:
          "A complete assessment, discussion of symptoms, and a clear recommended next step.",
        priceEgp: 500,
        durationMin: 30,
      },
      {
        id: "clinic-service-cleaning",
        name: "Cleaning & Polishing",
        category: "Dentistry",
        description:
          "Professional cleaning and polishing with practical guidance for ongoing oral care.",
        priceEgp: 900,
        durationMin: 45,
      },
      {
        id: "clinic-service-whitening",
        name: "In-clinic Teeth Whitening",
        category: "Cosmetic Dentistry",
        description:
          "A supervised whitening session following an eligibility and sensitivity assessment.",
        priceEgp: 3000,
        durationMin: 90,
      },
      {
        id: "clinic-service-dermatology",
        name: "Dermatology Consultation",
        category: "Dermatology",
        description:
          "A focused consultation for skin concerns, diagnosis, and a documented care plan.",
        priceEgp: 700,
        durationMin: 30,
      },
      {
        id: "clinic-service-laser",
        name: "Laser Session",
        category: "Aesthetic Dermatology",
        description:
          "A scheduled laser session delivered after consultation and treatment-area assessment.",
        priceEgp: 1200,
        durationMin: 45,
      },
    ],
    staff: [
      {
        id: "clinic-staff-mariam",
        name: "Dr. Mariam Hassan",
        role: "Staff",
        jobTitle: "Consultant Dentist",
        bio: "Provides restorative and preventive dental care with a clear, patient-first approach.",
        yearsExperience: 12,
        photoUrl: null,
      },
      {
        id: "clinic-staff-omar",
        name: "Dr. Omar Fathy",
        role: "Staff",
        jobTitle: "Cosmetic Dentist",
        bio: "Focuses on conservative cosmetic treatment planning and natural-looking outcomes.",
        yearsExperience: 9,
        photoUrl: null,
      },
      {
        id: "clinic-staff-lina",
        name: "Dr. Lina Hassan",
        role: "Staff",
        jobTitle: "Dermatologist",
        bio: "Treats common skin concerns and builds practical, evidence-led care plans.",
        yearsExperience: 11,
        photoUrl: null,
      },
      {
        id: "clinic-staff-farah",
        name: "Dr. Farah Nabil",
        role: "Staff",
        jobTitle: "Aesthetic Dermatologist",
        bio: "Combines careful assessment with measured aesthetic treatment recommendations.",
        yearsExperience: 8,
        photoUrl: null,
      },
    ],
    faqs: [
      {
        question: "What should I bring to my first appointment?",
        answer:
          "Bring any relevant prescriptions, previous reports, imaging, and a list of current medications when applicable.",
      },
      {
        question: "Can I choose my doctor online?",
        answer:
          "Yes. The booking flow can display eligible doctors and their available times for the selected treatment.",
      },
      {
        question: "Are treatment prices final?",
        answer:
          "Consultation and standard service prices are shown clearly. Any treatment plan requiring additional work is discussed before proceeding.",
      },
      {
        question: "How do follow-up appointments work?",
        answer:
          "The reception team can schedule a follow-up directly, while the clinic keeps the relevant appointment and clinical history together.",
      },
    ],
    phone: "+20 10 0000 1002",
    address: "Korba Square, Heliopolis",
    city: "Cairo",
    timezone: "Africa/Cairo",
    language: "en",
    bookingHref: "#",
    previewMode: true,
  };
}
