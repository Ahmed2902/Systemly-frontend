"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { SystemlyWordmark } from "@/shared/components/SystemlyWordmark";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import "@/modules/landing/landing-premium.css";
import "@/modules/landing/systemly-polish.css";
import "@/modules/landing/legal-page.css";

const policy = {
  en: {
    back: "Back to Systemly",
    eyebrow: "Legal / Privacy",
    title: "Privacy Policy",
    updated: "Last updated: August 10, 2026",
    intro:
      "This Privacy Policy explains how Systemly handles personal information when businesses and their customers use our website, booking experiences, operations tools, and related services.",
    note:
      "Systemly is built for businesses that manage appointments. A business using Systemly may also have its own privacy obligations and customer-facing privacy notice.",
    sections: [
      {
        title: "1. Information we process",
        paragraphs: [
          "We may process business and account information such as names, email addresses, phone numbers, business details, staff profiles, authentication information, and account preferences.",
          "When a business uses Systemly to serve its customers, the platform may process customer information entered or collected through the service, including contact details, appointments, selected services, staff assignments, notes, invoices, payment status, and related service history.",
          "We may also process technical and security information such as IP address, browser and device information, timestamps, error reports, and activity needed to keep the service secure and reliable.",
        ],
      },
      {
        title: "2. How we use information",
        paragraphs: [
          "We use information to provide and operate Systemly, authenticate users, manage bookings and business workflows, deliver transactional communications, provide support, prevent abuse, maintain security, diagnose errors, and improve the product.",
          "We may also process information where necessary to meet legal, regulatory, accounting, or security obligations.",
        ],
      },
      {
        title: "3. Businesses and customer data",
        paragraphs: [
          "Businesses using Systemly decide what customer information is appropriate to collect for their services. Systemly processes that information to provide the platform and the functionality requested by the business.",
          "Businesses are responsible for ensuring that they have the notices, permissions, consents, or other legal basis required for the customer information they collect and enter into Systemly, particularly where information may be sensitive.",
        ],
      },
      {
        title: "4. Service providers and international processing",
        paragraphs: [
          "Systemly relies on service providers for functions such as cloud hosting, databases and storage, email delivery, authentication, error monitoring, infrastructure, and payment processing when enabled. These providers process information only as needed to provide their services to Systemly.",
          "Some infrastructure or service providers may process or store information outside Egypt. Where applicable, Systemly will handle cross-border processing and transfers in line with applicable legal requirements and safeguards.",
        ],
      },
      {
        title: "5. Payments and billing",
        paragraphs: [
          "The free trial does not require a credit card or billing information. If paid online billing is enabled, payment details may be collected and processed by the selected payment provider. Systemly does not store raw payment-card details.",
        ],
      },
      {
        title: "6. Data retention",
        paragraphs: [
          "We retain information for as long as reasonably necessary to provide the service, maintain the account, meet contractual or legal obligations, resolve disputes, prevent abuse, and protect the platform. When information is no longer required, we may delete or anonymize it, subject to backup and legal-retention requirements.",
        ],
      },
      {
        title: "7. Security",
        paragraphs: [
          "We use technical and organizational measures designed to protect personal information, including access controls, secure authentication, encrypted network connections, role-based permissions, infrastructure monitoring, and restricted production access. No online service can guarantee absolute security.",
        ],
      },
      {
        title: "8. Your choices and rights",
        paragraphs: [
          "Depending on the circumstances and applicable law, individuals may have rights relating to access, correction, deletion, withdrawal of consent, objection or restriction of processing, and complaints to the competent authority.",
          "If your information was provided to Systemly by a business you visited or booked with, that business may be the appropriate first point of contact for a request concerning its customer records. We will support valid requests as required by applicable law and our relationship with that business.",
        ],
      },
      {
        title: "9. Cookies and session technologies",
        paragraphs: [
          "Systemly uses cookies and similar technologies where needed for authentication, security, session management, language preferences, and essential product functionality. Additional analytics or similar technologies may be used where enabled and appropriate.",
        ],
      },
      {
        title: "10. Data sales",
        paragraphs: [
          "Systemly does not sell personal information to advertisers or data brokers.",
        ],
      },
      {
        title: "11. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy as Systemly, our service providers, or legal requirements change. The date at the top of this page shows the latest revision.",
        ],
      },
      {
        title: "12. Contact",
        paragraphs: [
          "For privacy questions or requests, contact the Systemly team through the support or contact details provided on the Systemly website or through your account communication channel.",
        ],
      },
    ],
  },
  ar: {
    back: "العودة إلى Systemly",
    eyebrow: "قانوني / الخصوصية",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 10 أغسطس 2026",
    intro:
      "توضح هذه السياسة كيفية تعامل Systemly مع البيانات الشخصية عند استخدام الأنشطة التجارية وعملائها للموقع وتجربة الحجز وأدوات إدارة العمل والخدمات المرتبطة بها.",
    note:
      "Systemly مصمم للأنشطة التي تعتمد على المواعيد. وقد يكون على النشاط الذي يستخدم Systemly التزامات خصوصية خاصة به وسياسة يوضحها لعملائه.",
    sections: [
      {
        title: "1. البيانات التي نعالجها",
        paragraphs: [
          "قد نعالج بيانات النشاط والحساب مثل الاسم والبريد الإلكتروني ورقم الهاتف وبيانات النشاط وملفات فريق العمل وبيانات تسجيل الدخول وتفضيلات الحساب.",
          "عندما يستخدم النشاط Systemly لخدمة عملائه، قد يعالج النظام بيانات العملاء التي يتم إدخالها أو جمعها من خلال الخدمة، مثل بيانات التواصل والمواعيد والخدمات المختارة والموظفين المرتبطين بالموعد والملاحظات والفواتير وحالة الدفع وسجل الخدمة.",
          "وقد نعالج أيضاً بيانات تقنية وأمنية مثل عنوان IP ونوع المتصفح والجهاز والتوقيتات وتقارير الأخطاء والنشاط اللازم للحفاظ على أمان الخدمة واستقرارها.",
        ],
      },
      {
        title: "2. كيف نستخدم البيانات",
        paragraphs: [
          "نستخدم البيانات لتقديم Systemly وتشغيله، وتسجيل الدخول، وإدارة الحجوزات وعمليات النشاط، وإرسال الرسائل المرتبطة بالخدمة، وتقديم الدعم، ومنع إساءة الاستخدام، والحفاظ على الأمان، وتشخيص الأعطال، وتحسين المنتج.",
          "وقد نعالج البيانات أيضاً عند الحاجة للوفاء بمتطلبات قانونية أو تنظيمية أو محاسبية أو أمنية.",
        ],
      },
      {
        title: "3. الأنشطة وبيانات عملائها",
        paragraphs: [
          "يحدد النشاط الذي يستخدم Systemly بيانات العملاء المناسبة لخدماته، ويقوم Systemly بمعالجة هذه البيانات لتقديم المنصة والوظائف التي يطلبها النشاط.",
          "يتحمل النشاط مسؤولية التأكد من وجود الإشعارات أو التصاريح أو الموافقات أو الأساس القانوني المطلوب للبيانات التي يجمعها ويدخلها إلى Systemly، وبالأخص عندما تكون البيانات ذات طبيعة حساسة.",
        ],
      },
      {
        title: "4. مزودو الخدمة والمعالجة خارج مصر",
        paragraphs: [
          "يعتمد Systemly على مزودي خدمات لتشغيل الاستضافة السحابية وقواعد البيانات والتخزين وإرسال البريد الإلكتروني وتسجيل الدخول ومراقبة الأخطاء والبنية التحتية ومعالجة المدفوعات عند تفعيلها. ويعالج هؤلاء المزودون البيانات بالقدر اللازم لتقديم خدماتهم إلى Systemly.",
          "قد يقوم بعض مزودي البنية التحتية أو الخدمات بمعالجة البيانات أو تخزينها خارج مصر. وعند انطباق ذلك، يتعامل Systemly مع المعالجة أو النقل عبر الحدود وفق المتطلبات والضمانات القانونية المطبقة.",
        ],
      },
      {
        title: "5. الدفع والفوترة",
        paragraphs: [
          "لا تتطلب التجربة المجانية بطاقة بنكية أو بيانات دفع. وعند تفعيل الدفع الإلكتروني للاشتراك، قد يقوم مزود الدفع المختار بجمع بيانات الدفع ومعالجتها. لا يخزن Systemly بيانات البطاقات البنكية الخام.",
        ],
      },
      {
        title: "6. مدة الاحتفاظ بالبيانات",
        paragraphs: [
          "نحتفظ بالبيانات للمدة اللازمة بصورة معقولة لتقديم الخدمة والحفاظ على الحساب والوفاء بالالتزامات التعاقدية أو القانونية وحل النزاعات ومنع إساءة الاستخدام وحماية المنصة. وعندما لا تعود البيانات مطلوبة، قد نقوم بحذفها أو جعلها غير مرتبطة بشخص محدد، مع مراعاة النسخ الاحتياطية ومتطلبات الاحتفاظ القانونية.",
        ],
      },
      {
        title: "7. الأمان",
        paragraphs: [
          "نستخدم إجراءات تقنية وتنظيمية مصممة لحماية البيانات، ومنها التحكم في الوصول وتسجيل الدخول الآمن والاتصالات المشفرة والصلاحيات حسب الدور ومراقبة البنية التحتية وتقييد الوصول إلى بيئة الإنتاج. ولا توجد خدمة على الإنترنت يمكنها ضمان أمان مطلق.",
        ],
      },
      {
        title: "8. اختياراتك وحقوقك",
        paragraphs: [
          "بحسب الظروف والقانون المطبق، قد تكون للأفراد حقوق تتعلق بالاطلاع على البيانات وتصحيحها وحذفها وسحب الموافقة والاعتراض على المعالجة أو تقييدها وتقديم شكوى إلى الجهة المختصة.",
          "إذا وصلت بياناتك إلى Systemly من خلال نشاط قمت بالحجز أو التعامل معه، فقد يكون هذا النشاط هو جهة التواصل الأولى المناسبة لطلب يتعلق بسجل العميل لديه. وسندعم الطلبات الصحيحة وفق ما يقتضيه القانون المطبق وعلاقتنا بذلك النشاط.",
        ],
      },
      {
        title: "9. ملفات الارتباط وتقنيات الجلسة",
        paragraphs: [
          "يستخدم Systemly ملفات الارتباط وتقنيات مشابهة عند الحاجة لتسجيل الدخول والأمان وإدارة الجلسة وتفضيلات اللغة والوظائف الأساسية للمنتج. وقد تستخدم تقنيات تحليل إضافية عندما تكون مفعلة ومناسبة.",
        ],
      },
      {
        title: "10. بيع البيانات",
        paragraphs: [
          "لا يبيع Systemly البيانات الشخصية للمعلنين أو وسطاء البيانات.",
        ],
      },
      {
        title: "11. تعديلات هذه السياسة",
        paragraphs: [
          "قد نقوم بتحديث سياسة الخصوصية مع تطور Systemly أو تغير مزودي الخدمات أو المتطلبات القانونية. ويوضح التاريخ أعلى الصفحة آخر تحديث للسياسة.",
        ],
      },
      {
        title: "12. التواصل",
        paragraphs: [
          "للاستفسارات أو الطلبات المتعلقة بالخصوصية، تواصل مع فريق Systemly من خلال وسائل الدعم أو التواصل المنشورة على موقع Systemly أو من خلال قناة التواصل الخاصة بحسابك.",
        ],
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const { locale } = useLocale();
  const text = policy[locale];
  const BackIcon = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <main className="landing-premium lp-legal-page">
      <header className="lp-legal-nav">
        <div className="lp-shell lp-legal-nav-inner">
          <Link href="/" aria-label="Systemly home">
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
            <ShieldCheck size={18} />
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
