"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import { ArrowLeft, ArrowRight, ScrollText } from "lucide-react";
import Link from "next/link";
import "@/modules/landing/landing-premium.css";
import "@/modules/landing/systemly-polish.css";
import "@/modules/landing/legal-page.css";

const terms = {
  en: {
    back: "Back to Systemly",
    eyebrow: "Legal / Terms",
    title: "Terms of Service",
    updated: "Last updated: August 10, 2026",
    intro:
      "These Terms of Service govern access to and use of Systemly's website, booking tools, operations workspace, and related services.",
    note:
      "By creating an account or using Systemly, you agree to these terms on behalf of yourself or the business you are authorized to represent.",
    sections: [
      {
        title: "1. The service",
        paragraphs: [
          "Systemly provides software for appointment-based businesses, including business websites, online booking, appointment operations, staff and service management, customer records, invoices, reporting, and related features.",
          "Features may be added, changed, limited, or removed as the product develops. We will try to avoid materially disrupting active customers without reasonable notice where practical.",
        ],
      },
      {
        title: "2. Accounts and authority",
        paragraphs: [
          "You must provide accurate account information and protect your login credentials. You are responsible for activity carried out through your account unless caused by a failure within Systemly that is outside your reasonable control.",
          "If you create or manage a business account, you confirm that you are authorized to act for that business and to manage its staff, customer, booking, and billing information in Systemly.",
        ],
      },
      {
        title: "3. Free trial and billing",
        paragraphs: [
          "Systemly Core currently includes a 14-day free trial. No credit card or billing details are required to start the trial.",
          "If you continue on a paid plan after the trial, the applicable price, billing interval, renewal terms, and payment method will be shown before payment is requested. Systemly does not store raw payment-card details when a third-party payment provider is used.",
        ],
      },
      {
        title: "4. Business and customer data",
        paragraphs: [
          "Businesses control the customer and operational information they enter into Systemly and are responsible for ensuring that they have an appropriate legal basis to collect and use that information.",
          "You must not use Systemly to collect information that is unnecessary for your services or to process information in a way that violates applicable law, professional obligations, or the rights of another person.",
        ],
      },
      {
        title: "5. Acceptable use",
        paragraphs: [
          "You may not use Systemly to break the law, interfere with the service, probe or bypass security controls, distribute malware, access another customer's data without authorization, impersonate another person or business, or use the platform to send abusive or unlawful communications.",
          "We may restrict activity that creates a security, reliability, abuse, or legal risk to Systemly, its users, or third parties.",
        ],
      },
      {
        title: "6. Availability and changes",
        paragraphs: [
          "We aim to keep Systemly reliable, but uninterrupted or error-free availability cannot be guaranteed. Maintenance, third-party outages, infrastructure failures, security events, or product changes may occasionally affect access.",
          "Preview, beta, or coming-soon features may change before general release and should not be relied on as guaranteed future functionality until they are made generally available.",
        ],
      },
      {
        title: "7. Intellectual property",
        paragraphs: [
          "Systemly and its software, design, branding, documentation, and platform content remain the property of Systemly or its licensors. These terms give you a limited right to use the service while your account is permitted to access it; they do not transfer ownership of the platform to you.",
          "You retain ownership of business content and data that you or your authorized users provide to Systemly, subject to the limited rights needed for us and our service providers to host, process, display, back up, and transmit that content in order to operate the service.",
        ],
      },
      {
        title: "8. Suspension and termination",
        paragraphs: [
          "You may stop using Systemly at any time. Paid subscription cancellation and end-of-period access are handled according to the billing terms shown for the active plan.",
          "We may suspend or terminate access where reasonably necessary because of non-payment, security risk, unlawful use, serious abuse, repeated violation of these terms, or a legal requirement. Where appropriate, we will try to provide notice and an opportunity to resolve the issue.",
        ],
      },
      {
        title: "9. Disclaimers and responsibility",
        paragraphs: [
          "Systemly is a software platform and does not provide medical, legal, accounting, tax, or other professional advice. Businesses remain responsible for their own professional decisions, customer relationships, records, services, pricing, taxes, regulatory duties, and operational procedures.",
          "To the extent permitted by applicable law, Systemly is provided without guarantees that every feature will meet every business requirement or that third-party services will always remain available.",
        ],
      },
      {
        title: "10. Limitation of liability",
        paragraphs: [
          "To the extent permitted by applicable law, Systemly will not be responsible for indirect, incidental, special, or consequential losses arising from use of the service, third-party outages, customer misuse, or events outside our reasonable control.",
          "Nothing in these terms limits liability that cannot legally be limited or excluded under applicable law.",
        ],
      },
      {
        title: "11. Changes to these terms",
        paragraphs: [
          "We may update these terms as Systemly changes. If an update materially affects active customers, we will use reasonable means to provide notice. Continued use after the effective date of updated terms means the service will be governed by the updated version, subject to applicable law.",
        ],
      },
      {
        title: "12. Contact",
        paragraphs: [
          "For questions about these terms, contact the Systemly team through the support or contact details provided on the Systemly website or through your account communication channel.",
        ],
      },
    ],
  },
  ar: {
    back: "العودة إلى Systemly",
    eyebrow: "قانوني / الشروط",
    title: "شروط الاستخدام",
    updated: "آخر تحديث: 10 أغسطس 2026",
    intro:
      "تنظم هذه الشروط استخدام موقع Systemly وأدوات الحجز ونظام إدارة العمل والخدمات المرتبطة بها.",
    note:
      "عند إنشاء حساب أو استخدام Systemly، فإنك توافق على هذه الشروط لنفسك أو بالنيابة عن النشاط الذي تملك صلاحية تمثيله.",
    sections: [
      {
        title: "1. الخدمة",
        paragraphs: [
          "يوفر Systemly برمجيات للأنشطة التي تعتمد على المواعيد، بما في ذلك موقع النشاط والحجز الإلكتروني وإدارة المواعيد والفريق والخدمات وسجلات العملاء والفواتير والتقارير والخصائص المرتبطة بها.",
          "قد تتم إضافة خصائص أو تعديلها أو تقييدها أو إزالتها مع تطور المنتج. وسنحاول قدر الإمكان تجنب التغييرات التي تعطل العملاء الحاليين بصورة جوهرية من دون إشعار مناسب.",
        ],
      },
      {
        title: "2. الحسابات والصلاحيات",
        paragraphs: [
          "يجب تقديم بيانات حساب صحيحة والحفاظ على سرية بيانات تسجيل الدخول. وتتحمل مسؤولية النشاط الذي يتم من خلال حسابك ما لم يكن سببه خللاً داخل Systemly خارجاً عن نطاق سيطرتك المعقولة.",
          "إذا أنشأت أو أدرت حساب نشاط، فأنت تؤكد أن لديك صلاحية تمثيل هذا النشاط وإدارة بيانات فريقه وعملائه وحجوزاته وفوترته داخل Systemly.",
        ],
      },
      {
        title: "3. التجربة المجانية والفوترة",
        paragraphs: [
          "تتضمن خطة Systemly Core حالياً تجربة مجانية لمدة 14 يوماً، ولا تتطلب بطاقة بنكية أو بيانات دفع لبدء التجربة.",
          "إذا استمريت في خطة مدفوعة بعد انتهاء التجربة، فسيتم عرض السعر ومدة الفوترة وشروط التجديد وطريقة الدفع قبل طلب أي دفعة. ولا يخزن Systemly بيانات البطاقات البنكية الخام عند استخدام مزود دفع خارجي.",
        ],
      },
      {
        title: "4. بيانات النشاط والعملاء",
        paragraphs: [
          "يتحكم النشاط في بيانات العملاء والعمل التي يدخلها إلى Systemly، ويتحمل مسؤولية التأكد من وجود أساس قانوني مناسب لجمع هذه البيانات واستخدامها.",
          "لا يجوز استخدام Systemly لجمع بيانات غير لازمة للخدمة أو لمعالجة البيانات بطريقة تخالف القانون المطبق أو الالتزامات المهنية أو حقوق أي شخص آخر.",
        ],
      },
      {
        title: "5. الاستخدام المقبول",
        paragraphs: [
          "لا يجوز استخدام Systemly لمخالفة القانون أو تعطيل الخدمة أو تجاوز ضوابط الأمان أو نشر برمجيات ضارة أو الوصول إلى بيانات عميل آخر دون تصريح أو انتحال شخص أو نشاط آخر أو إرسال رسائل مسيئة أو غير قانونية.",
          "قد نقيد أي نشاط يسبب مخاطر أمنية أو تشغيلية أو قانونية أو مخاطر إساءة استخدام على Systemly أو مستخدميه أو أطراف أخرى.",
        ],
      },
      {
        title: "6. التوفر والتغييرات",
        paragraphs: [
          "نسعى للحفاظ على استقرار Systemly، لكن لا يمكن ضمان توفر الخدمة دون انقطاع أو أخطاء في جميع الأوقات. فقد تؤثر الصيانة أو أعطال خدمات خارجية أو مشكلات البنية التحتية أو الأحداث الأمنية أو تغييرات المنتج على الوصول من وقت لآخر.",
          "الخصائص التجريبية أو التي تحمل وصف قريباً قد تتغير قبل الإطلاق العام، ولا يجب الاعتماد عليها كميزة مستقبلية مضمونة حتى تصبح متاحة رسمياً.",
        ],
      },
      {
        title: "7. الملكية الفكرية",
        paragraphs: [
          "يبقى Systemly وبرمجياته وتصميمه وعلامته التجارية ووثائقه ومحتوى المنصة ملكاً لـ Systemly أو الجهات المرخصة له. تمنحك هذه الشروط حقاً محدوداً لاستخدام الخدمة أثناء السماح لحسابك بالوصول إليها، ولا تنقل إليك ملكية المنصة.",
          "تظل مالكاً لمحتوى النشاط والبيانات التي تقدمها أنت أو المستخدمون المصرح لهم، مع منح Systemly ومزودي خدماته الحقوق المحدودة اللازمة للاستضافة والمعالجة والعرض والنسخ الاحتياطي والنقل بهدف تشغيل الخدمة.",
        ],
      },
      {
        title: "8. الإيقاف وإنهاء الاستخدام",
        paragraphs: [
          "يمكنك التوقف عن استخدام Systemly في أي وقت. ويتم التعامل مع إلغاء الاشتراك المدفوع والوصول حتى نهاية الفترة وفق شروط الفوترة الموضحة للخطة النشطة.",
          "قد نقوم بتعليق أو إنهاء الوصول عند الحاجة بسبب عدم الدفع أو مخاطر أمنية أو استخدام غير قانوني أو إساءة استخدام جسيمة أو مخالفة متكررة لهذه الشروط أو متطلب قانوني. وعندما يكون ذلك مناسباً، سنحاول تقديم إشعار وفرصة لمعالجة المشكلة.",
        ],
      },
      {
        title: "9. حدود الخدمة ومسؤولية النشاط",
        paragraphs: [
          "Systemly منصة برمجية ولا يقدم استشارات طبية أو قانونية أو محاسبية أو ضريبية أو مهنية. ويظل النشاط مسؤولاً عن قراراته المهنية وعلاقته بعملائه وسجلاته وخدماته وأسعاره وضرائبه والتزاماته التنظيمية وإجراءاته التشغيلية.",
          "في الحدود التي يسمح بها القانون المطبق، لا يقدم Systemly ضماناً بأن كل خاصية ستناسب كل متطلبات الأنشطة أو أن خدمات الأطراف الخارجية ستظل متاحة دائماً.",
        ],
      },
      {
        title: "10. حدود المسؤولية",
        paragraphs: [
          "في الحدود التي يسمح بها القانون المطبق، لا يتحمل Systemly المسؤولية عن الخسائر غير المباشرة أو العرضية أو الخاصة أو التبعية الناتجة عن استخدام الخدمة أو أعطال الأطراف الخارجية أو إساءة استخدام العملاء أو الأحداث الخارجة عن نطاق سيطرتنا المعقولة.",
          "لا تقيد هذه الشروط أي مسؤولية لا يسمح القانون بتقييدها أو استبعادها.",
        ],
      },
      {
        title: "11. تعديل الشروط",
        paragraphs: [
          "قد نقوم بتحديث هذه الشروط مع تطور Systemly. وإذا كان التعديل يؤثر بصورة جوهرية على العملاء الحاليين، سنستخدم وسائل معقولة للإشعار. ويخضع استمرار استخدام الخدمة بعد تاريخ سريان الشروط الجديدة للنسخة المحدثة، مع مراعاة القانون المطبق.",
        ],
      },
      {
        title: "12. التواصل",
        paragraphs: [
          "للاستفسار عن هذه الشروط، تواصل مع فريق Systemly من خلال وسائل الدعم أو التواصل المنشورة على موقع Systemly أو من خلال قناة التواصل الخاصة بحسابك.",
        ],
      },
    ],
  },
} as const;

export default function TermsPage() {
  const { locale } = useLocale();
  const text = terms[locale];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <main className="landing-premium lp-legal-page">
      <header className="lp-legal-nav">
        <div className="lp-shell lp-legal-nav-inner">
          <Link href="/">
            <SystemlyWordmark className="systemly-brand text-[1.35rem]" />
          </Link>
          <Link href="/" className="lp-legal-back">
            <BackIcon size={15} /> {text.back}
          </Link>
        </div>
      </header>

      <div className="lp-shell lp-legal-shell">
        <section className="lp-legal-hero">
          <p className="lp-legal-kicker">{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className="lp-legal-updated">{text.updated}</p>
          <p className="lp-legal-intro">{text.intro}</p>
          <div className="lp-legal-notice">
            <ScrollText size={18} />
            <p>{text.note}</p>
          </div>
        </section>

        <article className="lp-legal-card">
          {text.sections.map((section) => (
            <section key={section.title} className="lp-legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        <footer className="lp-legal-footer">
          <SystemlyWordmark className="systemly-brand text-lg" />
          <span>© {new Date().getFullYear()} Systemly</span>
        </footer>
      </div>
    </main>
  );
}
