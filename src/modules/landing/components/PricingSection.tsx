"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  LockKeyhole,
  MessageCircleMore,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const copy = {
  en: {
    kicker: "Simple pricing",
    title: "One plan. Everything you need to run the business.",
    intro:
      "Start with the complete Systemly workflow today. WhatsApp automation is the next layer, not a requirement to get started.",
    trial: "14-day free trial",
    noBilling: "No card or billing details required",
    start: "Start free",
    demo: "Explore the live demo",
    core: "Systemly Core",
    available: "Available now",
    price: "799",
    currency: "EGP",
    perMonth: "/ month",
    coreDescription:
      "The complete operating system for an appointment-based business. Includes your first branch; each additional active branch is +300 EGP/month.",
    included: "Everything in Core",
    features: [
      "Business website & online booking",
      "Appointments & operations calendar",
      "Staff, services & availability",
      "Customer records",
      "Invoices & payment tracking",
      "Owner analytics",
      "Arabic & English experience",
    ],
    comingSoon: "Coming soon",
    futureTitle: "WhatsApp automation",
    futureCopy:
      "Confirmations and reminders first, followed by a WhatsApp booking assistant that can handle reservations.",
    connect: "Connect",
    connectCopy: "Automated WhatsApp reminders",
    ai: "AI Receptionist",
    aiCopy: "WhatsApp reservation handling",
    futureNote: "No need to wait — Core is ready now.",
    privacyLead: "Your trial starts without payment information.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  ar: {
    kicker: "سعر واضح وبسيط",
    title: "خطة واحدة تضم كل ما تحتاجه لإدارة نشاطك.",
    intro:
      "ابدأ الآن بنظام Systemly الكامل. أتمتة واتساب هي الخطوة القادمة، وليست شرطاً للاستفادة من النظام اليوم.",
    trial: "تجربة مجانية لمدة 14 يوماً",
    noBilling: "من دون بطاقة أو بيانات دفع",
    start: "ابدأ مجاناً",
    demo: "جرّب العرض المباشر",
    core: "Systemly Core",
    available: "متاحة الآن",
    price: "799",
    currency: "جنيه",
    perMonth: "/ شهرياً",
    coreDescription:
      "النظام المتكامل للأنشطة التي تعتمد على المواعيد. يشمل الفرع الأول، وكل فرع نشط إضافي مقابل 300 جنيه شهرياً.",
    included: "كل ما تحتاجه في Core",
    features: [
      "موقع للنشاط وحجز إلكتروني",
      "المواعيد وتقويم إدارة العمل",
      "الفريق والخدمات ومواعيد التوفر",
      "سجلات العملاء",
      "الفواتير ومتابعة المدفوعات",
      "تحليلات خاصة بالمالك",
      "تجربة بالعربية والإنجليزية",
    ],
    comingSoon: "قريباً",
    futureTitle: "أتمتة واتساب",
    futureCopy:
      "تأكيدات وتذكيرات تلقائية أولاً، ثم مساعد حجز عبر واتساب يمكنه التعامل مع الحجوزات.",
    connect: "Connect",
    connectCopy: "تذكيرات واتساب تلقائية",
    ai: "AI Receptionist",
    aiCopy: "إدارة الحجوزات عبر واتساب",
    futureNote: "لا تحتاج إلى الانتظار — Core جاهزة الآن.",
    privacyLead: "تبدأ تجربتك من دون إدخال بيانات دفع.",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
  },
} as const;

export function PricingSection() {
  const { locale } = useLocale();
  const text = copy[locale];

  return (
    <section id="pricing" className="lp-green-cta lp-pricing-v2">
      <div className="lp-shell lp-pricing-v2-shell">
        <div className="lp-pricing-v2-copy">
          <p className="lp-green-kicker">{text.kicker}</p>
          <h2>{text.title}</h2>
          <p>{text.intro}</p>

          <div className="lp-pricing-trust-row" aria-label={text.trial}>
            <span>
              <ShieldCheck size={16} />
              {text.trial}
            </span>
            <span>
              <CreditCard size={16} />
              {text.noBilling}
            </span>
          </div>

          <div className="lp-green-actions lp-pricing-actions">
            <Link href="/signup" className="lp-green-primary">
              {text.start} <ArrowRight size={17} />
            </Link>
            <a href="#demo" className="lp-green-secondary">
              {text.demo}
            </a>
          </div>

          <div className="lp-pricing-privacy-note">
            <LockKeyhole size={15} />
            <span>{text.privacyLead}</span>
          </div>

          <div className="lp-pricing-legal-actions">
            <Link href="/privacy" className="lp-pricing-legal-button">
              <ShieldCheck size={15} />
              {text.privacy}
            </Link>
            <Link href="/terms" className="lp-pricing-legal-button">
              <ScrollText size={15} />
              {text.terms}
            </Link>
          </div>
        </div>

        <div className="lp-pricing-stage">
          <article className="lp-core-plan-card">
            <header className="lp-core-plan-head">
              <div>
                <span className="lp-plan-eyebrow">{text.core}</span>
                <h3>{text.core}</h3>
              </div>
              <span className="lp-plan-available">
                <span aria-hidden="true" />
                {text.available}
              </span>
            </header>

            <div
              className="lp-core-price"
              aria-label={`${text.price} ${text.currency} ${text.perMonth}`}
            >
              <strong>{text.price}</strong>
              <div>
                <span>{text.currency}</span>
                <small>{text.perMonth}</small>
              </div>
            </div>

            <p className="lp-core-description">{text.coreDescription}</p>

            <div className="lp-core-divider" />
            <p className="lp-core-included">{text.included}</p>

            <ul className="lp-core-feature-list">
              {text.features.map((feature) => (
                <li key={feature}>
                  <span className="lp-core-check" aria-hidden="true">
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="lp-core-card-cta">
              {text.start} <ArrowRight size={16} />
            </Link>

            <div className="lp-core-card-foot">
              <ShieldCheck size={14} />
              <span>{text.trial}</span>
              <i aria-hidden="true" />
              <span>{text.noBilling}</span>
            </div>
          </article>

          <aside
            className="lp-coming-plan-card"
            aria-label={`${text.futureTitle} — ${text.comingSoon}`}
          >
            <div className="lp-coming-plan-glow" aria-hidden="true" />
            <div className="lp-coming-plan-top">
              <span className="lp-coming-icon">
                <MessageCircleMore size={20} />
              </span>
              <span className="lp-coming-badge">{text.comingSoon}</span>
            </div>

            <div className="lp-coming-content">
              <p className="lp-plan-eyebrow">Systemly</p>
              <h3>{text.futureTitle}</h3>
              <p>{text.futureCopy}</p>

              <div className="lp-coming-preview-list">
                <div>
                  <Sparkles size={15} />
                  <span>
                    <strong>{text.connect}</strong>
                    <small>{text.connectCopy}</small>
                  </span>
                </div>
                <div>
                  <Sparkles size={15} />
                  <span>
                    <strong>{text.ai}</strong>
                    <small>{text.aiCopy}</small>
                  </span>
                </div>
              </div>

              <p className="lp-coming-note">{text.futureNote}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}