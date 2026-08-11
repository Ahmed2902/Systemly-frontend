"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { resolveOperationsHref, useOperationsRuntime } from "../runtime/operations-runtime";
import styles from "./OperationsGuide.module.css";

type Marker = { number: number; x: number; y: number };
type Callout = { number: number; title: string; body: string };

type GuideSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  screenshots: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
    markers: Marker[];
  }>;
  callouts: Callout[];
};

const COPY = {
  en: {
    eyebrow: "HELP & GUIDE / OPERATIONS",
    title: "Run the business from one workspace.",
    intro:
      "Use this visual guide whenever you need a reminder of where something lives or what a screen is for. The examples use realistic demo data; your own workspace follows the same structure.",
    note: "The screenshots are shown in dark appearance. The controls and workflow are the same in light appearance.",
    jump: "Jump to a section",
    ownerOnly: "Owner only",
    openPage: "Open this page",
    backToTop: "Back to guide navigation",
    quickFlowTitle: "The everyday flow",
    quickFlowBody:
      "Most teams spend their day in Calendar and Appointments. Customers, Staff, Services and Invoices support that workflow; Dashboard and Settings are mainly owner tools.",
    sections: {
      dashboard: {
        title: "Dashboard",
        eyebrow: "Owner overview",
        description:
          "Use the Dashboard to understand revenue, bookings, customers, staff performance and trends over a selected period.",
        alt: "Systemly Dashboard showing KPI cards, revenue trend, customer signals and service mix",
        callouts: [
          [1, "Reporting period", "Switch between rolling periods, completed periods or a custom date range."],
          [2, "Analytics tabs", "Move between Overview, Revenue, Customers, Staff, Bookings & Services and Growth without leaving the dashboard."],
          [3, "Headline KPIs", "Revenue, paid invoices, average paid invoice, bookings and active customers give you a quick health check."],
          [4, "Trend charts", "Use charts to see when revenue or demand changed instead of relying only on totals."],
          [5, "Latest signals", "Systemly surfaces useful warnings and business signals such as low staff utilisation."],
        ],
      },
      calendar: {
        title: "Calendar",
        eyebrow: "Daily operations",
        description:
          "The Calendar is the main reception workspace: see every staff member, appointment, break and status across the day, then open an appointment directly from the timeline.",
        alt: "Systemly daily calendar with staff rows and appointment cards",
        altTop: "Systemly appointment editing drawer opened beside the calendar",
        altActions: "Systemly appointment drawer showing totals, payment method and appointment actions",
        callouts: [
          [1, "Date navigation", "Move one day at a time or return to Today. The selected date is always shown on the right."],
          [2, "Status legend", "Appointment colours show Pending, Confirmed, In progress, Completed, No-show, Cancelled and Paid/locked states."],
          [3, "Staff rows", "Each row belongs to one staff member. Search when the team is large."],
          [4, "Appointment cards", "Position and width represent the staff assignment and appointment time. Click a card to manage it."],
          [5, "Create appointments", "Use New appointment for phone, WhatsApp or walk-in bookings made by reception."],
          [6, "Status and specialist", "The drawer shows the current appointment state and the assigned specialist at a glance."],
          [7, "Service lines", "Multi-service appointments can assign a different eligible staff member and time to each service."],
          [8, "Conflict protection", "Systemly warns when a chosen staff member would be double-booked."],
          [9, "Totals and payment", "Review the subtotal, discount, payment method and final total before collecting payment."],
          [10, "Appointment actions", "Save changes, cancel, collect payment, mark no-show or complete without payment from the same drawer."],
        ],
      },
      appointments: {
        title: "Appointments",
        eyebrow: "Queue and history",
        description:
          "Use the list when you want to search, filter or review appointments without navigating the timeline. Cancelled appointments remain visible here for history.",
        alt: "Systemly Appointments list with search and filters",
        callouts: [
          [1, "Search and filters", "Find a customer, phone number or service, then narrow by date, staff, status and sort order."],
          [2, "Appointment summary", "Each row shows time, duration, customer, services, assigned staff, status and amount."],
          [3, "Statuses stay visible", "Completed and cancelled records stay in the list so the operational history is not lost."],
          [4, "Open details", "Select a row to open the full appointment workspace and available actions."],
        ],
      },
      customers: {
        title: "Customers",
        eyebrow: "Customer workspace",
        description:
          "Keep contact details, notes, visit history and future appointments together so reception does not need to reconstruct a customer from chat history.",
        alt: "Systemly Customers page showing customer directory and selected customer profile",
        callouts: [
          [1, "Customer directory", "Search customers and filter by whether they have an upcoming appointment."],
          [2, "Profile actions", "Message the customer, edit the profile or create a new appointment from the selected customer."],
          [3, "Customer metrics", "See completed visits, no-shows, last visit and the next appointment immediately."],
          [4, "Contact and source", "Phone, email, acquisition source and customer-since date stay in one profile."],
          [5, "Internal notes", "Save operational notes that are visible to the team but not to the customer."],
          [6, "Upcoming and history", "Review future bookings and the complete appointment history from the same workspace."],
        ],
      },
      staff: {
        title: "Staff",
        eyebrow: "Team management",
        description:
          "Manage who works in the business, what they can perform, when they are available and how service commissions are configured.",
        alt: "Systemly Staff directory with service tags, availability and commission settings",
        callouts: [
          [1, "Team summary", "See total staff, active staff, who is available today and who is on time off."],
          [2, "Search and filters", "Filter by status, role, service or availability when the directory grows."],
          [3, "Service eligibility", "Service tags show what each staff member is allowed to perform. This controls booking choices."],
          [4, "Weekly availability", "The day chips make regular working days visible without opening the profile."],
          [5, "Commission settings", "Track whether service commissions have been configured for the staff member."],
          [6, "Profile actions", "Open the full profile, edit the staff member or deactivate them without deleting history."],
        ],
      },
      services: {
        title: "Services",
        eyebrow: "Catalog and booking rules",
        description:
          "Services define what customers can book: category, duration, price, active status and which staff members are eligible.",
        alt: "Systemly Service catalog with category cards and service table",
        callouts: [
          [1, "Catalog filters", "Search services or narrow the catalog by category and active status."],
          [2, "Catalog summary", "See total services, bookable services and category count at a glance."],
          [3, "Categories", "Group related services so the catalog and customer website are easier to browse."],
          [4, "Duration and price", "These values drive availability calculations and the amount charged for the service."],
          [5, "Eligible staff", "Only eligible staff can be assigned or offered for that service during booking."],
          [6, "Active status and actions", "Deactivate, edit or remove a service while keeping the rest of the catalog organised."],
        ],
      },
      invoices: {
        title: "Invoices",
        eyebrow: "Payments and receipts",
        description:
          "Review completed payments, download receipts and safely void a payment when an appointment needs to be reopened.",
        alt: "Systemly Invoices page showing invoice list and selected invoice details",
        callouts: [
          [1, "Invoice filters", "Search by invoice, customer or phone, then filter by status, payment method or date."],
          [2, "Invoice history", "Paid and voided invoices remain visible with their customer, date, method and amount."],
          [3, "Invoice details", "Selecting an invoice opens its customer, services, totals and payment information."],
          [4, "Receipt", "Download the receipt for a paid invoice directly from the details panel."],
          [5, "Open appointment", "Jump back to the appointment that produced the invoice when you need more context."],
          [6, "Void and reopen", "Voiding safely reverses the invoice state and reopens the appointment for editing/payment instead of creating a disconnected correction."],
        ],
      },
      settings: {
        title: "Settings",
        eyebrow: "Business configuration",
        description:
          "Owners use Settings for the business identity, contact details, timezone, language, branding and public website connection.",
        alt: "Systemly Settings page showing business profile and branding controls",
        callouts: [
          [1, "Business profile", "Keep the business name, phone, address and city accurate because they are reused across Systemly."],
          [2, "Timezone and language", "Timezone controls scheduling logic; default language controls the business-facing experience."],
          [3, "Branding", "Upload the logo and cover used on receipts and the public website."],
          [4, "Public website", "Open the published customer website from Settings to verify the live experience."],
        ],
      },
    },
  },
  ar: {
    eyebrow: "المساعدة والدليل / إدارة النشاط",
    title: "كل شغل النشاط من مكان واحد.",
    intro:
      "استخدم الدليل البصري ده في أي وقت تحتاج تفتكر مكان حاجة أو وظيفة شاشة معينة. الصور ببيانات تجريبية، لكن نفس الترتيب وطريقة الشغل موجودين في حسابك.",
    note: "الصور متصورة بالـ Dark appearance. نفس الأدوات وطريقة الشغل موجودة في الـ Light appearance.",
    jump: "روح لجزء معين",
    ownerOnly: "للمالك فقط",
    openPage: "افتح الصفحة",
    backToTop: "الرجوع لقائمة الدليل",
    quickFlowTitle: "الشغل اليومي ببساطة",
    quickFlowBody:
      "معظم وقت الـ reception والفريق هيكون في Calendar وAppointments. صفحات Customers وStaff وServices وInvoices بتكمل نفس الـ workflow، بينما Dashboard وSettings بيستخدمهم المالك أكتر.",
    sections: {
      dashboard: {
        title: "Dashboard",
        eyebrow: "نظرة المالك",
        description: "تابع الإيرادات والحجوزات والعملاء وأداء الفريق والاتجاهات خلال الفترة اللي تختارها.",
        alt: "لوحة Systemly تعرض مؤشرات الأداء والإيرادات والعملاء والخدمات",
        callouts: [
          [1, "الفترة", "اختار فترة متحركة أو فترات مكتملة أو تاريخ مخصص."],
          [2, "أقسام التحليلات", "تنقل بين Overview وRevenue وCustomers وStaff وBookings & Services وGrowth من نفس الصفحة."],
          [3, "الأرقام الأساسية", "الإيراد والفواتير المدفوعة ومتوسط الفاتورة والحجوزات والعملاء النشطين بيدوك صورة سريعة عن النشاط."],
          [4, "الرسوم والاتجاهات", "اعرف إمتى الإيراد أو الطلب اتغير بدل ما تعتمد على الإجمالي بس."],
          [5, "الإشارات المهمة", "Systemly بيظهر تنبيهات مفيدة زي انخفاض استغلال وقت بعض الموظفين."],
        ],
      },
      calendar: {
        title: "Calendar",
        eyebrow: "التشغيل اليومي",
        description: "دي شاشة الـ reception الأساسية: كل الموظفين والمواعيد والـ breaks والحالات في Timeline واحدة، ومن هنا تفتح أي موعد وتديره.",
        alt: "تقويم Systemly اليومي بصفوف الموظفين وكروت المواعيد",
        altTop: "تفاصيل تعديل موعد مفتوحة بجانب تقويم Systemly",
        altActions: "تفاصيل الموعد في Systemly مع الإجمالي والدفع وإجراءات الموعد",
        callouts: [
          [1, "التاريخ", "اتحرك يوم بيوم أو ارجع لـ Today، والتاريخ الحالي ظاهر دايمًا."],
          [2, "حالات المواعيد", "الألوان بتوضح Pending وConfirmed وIn progress وCompleted وNo-show وCancelled وPaid/locked."],
          [3, "صفوف الموظفين", "كل صف لموظف واحد، وتقدر تبحث بالاسم لو الفريق كبير."],
          [4, "كارت الموعد", "مكان وحجم الكارت بيوضحوا الموظف والوقت. اضغط عليه علشان تفتح التفاصيل."],
          [5, "موعد جديد", "استخدم New appointment للحجوزات اللي جاية من التليفون أو WhatsApp أو walk-in."],
          [6, "الحالة والموظف", "شوف حالة الموعد والـ specialist المسؤول بسرعة."],
          [7, "الخدمات", "الموعد اللي فيه أكتر من خدمة يقدر يحدد موظف مؤهل ووقت مختلف لكل خدمة."],
          [8, "منع التعارض", "Systemly بينبهك لو الموظف هيبقى عنده حجزين في نفس الوقت."],
          [9, "الإجمالي والدفع", "راجع الـ subtotal والخصم وطريقة الدفع والإجمالي قبل التحصيل."],
          [10, "إجراءات الموعد", "احفظ التعديلات أو الغِ الموعد أو حصّل الدفع أو سجله No-show أو Complete من نفس المكان."],
        ],
      },
      appointments: {
        title: "Appointments",
        eyebrow: "قائمة المواعيد والسجل",
        description: "استخدم القائمة لما تحتاج تبحث أو تعمل Filter أو تراجع المواعيد بعيدًا عن الـ Timeline. المواعيد الملغية بتفضل ظاهرة كسجل.",
        alt: "قائمة مواعيد Systemly مع البحث والفلاتر",
        callouts: [
          [1, "البحث والفلاتر", "ابحث باسم العميل أو التليفون أو الخدمة، وحدد التاريخ والموظف والحالة والترتيب."],
          [2, "ملخص الموعد", "كل صف بيعرض الوقت والمدة والعميل والخدمات والموظف والحالة والمبلغ."],
          [3, "السجل محفوظ", "Completed وCancelled بيفضلوا موجودين علشان تاريخ الشغل ما يضيعش."],
          [4, "افتح التفاصيل", "اختار الموعد علشان تفتح الـ workspace الكامل والإجراءات المتاحة."],
        ],
      },
      customers: {
        title: "Customers",
        eyebrow: "ملف العميل",
        description: "خلي بيانات التواصل والملاحظات والزيارات القديمة والمواعيد الجاية في ملف واحد بدل ما الـ reception يدور في الشات كل مرة.",
        alt: "صفحة عملاء Systemly وفيها قائمة العملاء وملف العميل المختار",
        callouts: [
          [1, "قائمة العملاء", "ابحث عن أي عميل وفلتر حسب وجود موعد قادم."],
          [2, "إجراءات العميل", "ابعت رسالة أو عدل الملف أو اعمل Appointment جديدة للعميل مباشرة."],
          [3, "مؤشرات العميل", "شوف الزيارات المكتملة والـ no-shows وآخر زيارة والموعد الجاي."],
          [4, "بيانات التواصل والمصدر", "التليفون والإيميل ومصدر العميل وتاريخ دخوله عندك في نفس الملف."],
          [5, "ملاحظات داخلية", "سجل ملاحظات للفريق لا تظهر للعميل."],
          [6, "القادم والسجل", "راجع الحجوزات الجاية وتاريخ المواعيد من نفس الصفحة."],
        ],
      },
      staff: {
        title: "Staff",
        eyebrow: "إدارة الفريق",
        description: "حدد مين بيشتغل عندك، الخدمات اللي يقدر يعملها، أيام وساعات التوفر، وإعدادات العمولة لكل خدمة.",
        alt: "دليل فريق Systemly مع الخدمات والتوفر والعمولات",
        callouts: [
          [1, "ملخص الفريق", "شوف إجمالي الفريق والنشطين والمتاحين النهارده والـ time off."],
          [2, "البحث والفلاتر", "فلتر بالحالة أو الدور أو الخدمة أو التوفر."],
          [3, "الخدمات المسموحة", "الـ service tags بتحدد الخدمات اللي الموظف مؤهل يعملها وبتتحكم في اختيارات الحجز."],
          [4, "التوفر الأسبوعي", "الأيام الملونة بتوضح جدول العمل المعتاد بدون فتح الملف."],
          [5, "العمولات", "اعرف بسرعة إذا كانت عمولات الخدمات متظبطة للموظف ولا لأ."],
          [6, "إدارة الموظف", "افتح الملف الكامل أو عدل البيانات أو اعمل Deactivate بدون حذف التاريخ."],
        ],
      },
      services: {
        title: "Services",
        eyebrow: "الخدمات وقواعد الحجز",
        description: "الخدمة بتحدد اللي العميل يقدر يحجزه: التصنيف والمدة والسعر والحالة والموظفين المؤهلين.",
        alt: "كتالوج خدمات Systemly مع التصنيفات وجدول الخدمات",
        callouts: [
          [1, "البحث والفلاتر", "ابحث في الخدمات أو فلتر بالتصنيف والحالة."],
          [2, "ملخص الكتالوج", "شوف إجمالي الخدمات والخدمات المتاحة للحجز وعدد التصنيفات."],
          [3, "التصنيفات", "اجمع الخدمات المشابهة علشان الكتالوج والموقع يبقوا أسهل للعميل."],
          [4, "المدة والسعر", "القيم دي بتدخل في حساب المواعيد المتاحة والسعر اللي هيتحصّل."],
          [5, "الموظفون المؤهلون", "بس الموظفين المؤهلين للخدمة يقدروا يتحددوا في الحجز."],
          [6, "الحالة والإجراءات", "عدل أو عطّل أو احذف الخدمة مع الحفاظ على تنظيم الكتالوج."],
        ],
      },
      invoices: {
        title: "Invoices",
        eyebrow: "الدفع والإيصالات",
        description: "راجع المدفوعات، نزّل الإيصالات، واعمل Void بشكل آمن لو محتاج تعيد فتح الموعد.",
        alt: "صفحة فواتير Systemly مع قائمة الفواتير وتفاصيل الفاتورة المختارة",
        callouts: [
          [1, "فلاتر الفواتير", "ابحث برقم الفاتورة أو العميل أو التليفون وفلتر بالحالة وطريقة الدفع والتاريخ."],
          [2, "سجل الفواتير", "الفواتير Paid وVoided بتفضل ظاهرة مع العميل والتاريخ وطريقة الدفع والمبلغ."],
          [3, "تفاصيل الفاتورة", "اختار فاتورة علشان تشوف العميل والخدمات والإجماليات ومعلومات الدفع."],
          [4, "الإيصال", "نزّل Receipt للفاتورة المدفوعة مباشرة."],
          [5, "افتح الموعد", "ارجع للموعد اللي عمل الفاتورة لو محتاج تفاصيل أكتر."],
          [6, "Void وإعادة الفتح", "الـ Void بيرجع حالة الفاتورة ويفتح الموعد للتعديل والتحصيل بدل ما تعمل تصحيح منفصل."],
        ],
      },
      settings: {
        title: "Settings",
        eyebrow: "إعدادات النشاط",
        description: "المالك بيستخدم Settings لبيانات النشاط والتواصل والـ timezone واللغة والـ branding وربط الموقع العام.",
        alt: "إعدادات Systemly تعرض بيانات النشاط والهوية البصرية",
        callouts: [
          [1, "بيانات النشاط", "خلي الاسم والتليفون والعنوان والمدينة محدثين لأن Systemly بيستخدمهم في أكتر من مكان."],
          [2, "الوقت واللغة", "الـ timezone مهم لحساب المواعيد، واللغة الافتراضية بتحدد تجربة النشاط."],
          [3, "الهوية", "ارفع الـ logo والـ cover اللي بيظهروا في الإيصالات والموقع العام."],
          [4, "الموقع العام", "افتح الموقع المنشور من Settings وراجع تجربة العميل الحقيقية."],
        ],
      },
    },
  },
} as const;

function CalloutGrid({ callouts }: { callouts: Callout[] }) {
  return (
    <div className={styles.calloutGrid}>
      {callouts.map((item) => (
        <article className={styles.callout} key={item.number}>
          <span className={styles.calloutNumber}>{item.number}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function GuideScreenshot({
  src,
  alt,
  width,
  height,
  markers,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  markers: Marker[];
}) {
  return (
    <div className={styles.screenshotShell}>
      <div className={styles.screenshotStage}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={100}
          sizes="(max-width: 900px) 100vw, 1200px"
          className={styles.screenshot}
        />
        {markers.map((marker) => (
          <span
            key={marker.number}
            className={styles.marker}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            aria-label={`${marker.number}`}
          >
            {marker.number}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OperationsGuide() {
  const { locale } = useLocale();
  const runtime = useOperationsRuntime();
  const copy = locale === "ar" ? COPY.ar : COPY.en;

  const sections: GuideSection[] = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      ownerOnly: true,
      ...copy.sections.dashboard,
      screenshots: [
        {
          src: "/operations-guide/dashboard.webp",
          alt: copy.sections.dashboard.alt,
          width: 1280,
          height: 658,
          markers: [
            { number: 1, x: 82, y: 7 },
            { number: 2, x: 40, y: 15 },
            { number: 3, x: 52, y: 25 },
            { number: 4, x: 47, y: 49 },
            { number: 5, x: 84, y: 42 },
          ],
        },
      ],
      callouts: copy.sections.dashboard.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "calendar",
      icon: CalendarDays,
      ...copy.sections.calendar,
      screenshots: [
        {
          src: "/operations-guide/calendar.webp",
          alt: copy.sections.calendar.alt,
          width: 1280,
          height: 645,
          markers: [
            { number: 1, x: 18, y: 19 },
            { number: 2, x: 41, y: 28 },
            { number: 3, x: 23, y: 34 },
            { number: 4, x: 55, y: 57 },
            { number: 5, x: 93, y: 10 },
          ],
        },
        {
          src: "/operations-guide/calendar-appointment-top.webp",
          alt: copy.sections.calendar.altTop,
          width: 1280,
          height: 705,
          markers: [
            { number: 6, x: 75, y: 37 },
            { number: 7, x: 79, y: 73 },
          ],
        },
        {
          src: "/operations-guide/calendar-appointment-actions.webp",
          alt: copy.sections.calendar.altActions,
          width: 1280,
          height: 705,
          markers: [
            { number: 8, x: 89, y: 29 },
            { number: 9, x: 77, y: 57 },
            { number: 10, x: 78, y: 88 },
          ],
        },
      ],
      callouts: copy.sections.calendar.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "appointments",
      icon: ClipboardList,
      ...copy.sections.appointments,
      screenshots: [
        {
          src: "/operations-guide/appointments.webp",
          alt: copy.sections.appointments.alt,
          width: 1280,
          height: 653,
          markers: [
            { number: 1, x: 61, y: 16 },
            { number: 2, x: 51, y: 37 },
            { number: 3, x: 84, y: 55 },
            { number: 4, x: 95, y: 39 },
          ],
        },
      ],
      callouts: copy.sections.appointments.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "customers",
      icon: Users,
      ...copy.sections.customers,
      screenshots: [
        {
          src: "/operations-guide/customers.webp",
          alt: copy.sections.customers.alt,
          width: 1280,
          height: 615,
          markers: [
            { number: 1, x: 24, y: 28 },
            { number: 2, x: 88, y: 18 },
            { number: 3, x: 67, y: 34 },
            { number: 4, x: 52, y: 55 },
            { number: 5, x: 80, y: 55 },
            { number: 6, x: 76, y: 87 },
          ],
        },
      ],
      callouts: copy.sections.customers.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "staff",
      icon: UserRound,
      ...copy.sections.staff,
      screenshots: [
        {
          src: "/operations-guide/staff.webp",
          alt: copy.sections.staff.alt,
          width: 1280,
          height: 658,
          markers: [
            { number: 1, x: 56, y: 17 },
            { number: 2, x: 64, y: 26 },
            { number: 3, x: 49, y: 43 },
            { number: 4, x: 50, y: 56 },
            { number: 5, x: 49, y: 62 },
            { number: 6, x: 54, y: 70 },
          ],
        },
      ],
      callouts: copy.sections.staff.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "services",
      icon: Sparkles,
      ...copy.sections.services,
      screenshots: [
        {
          src: "/operations-guide/services.webp",
          alt: copy.sections.services.alt,
          width: 1280,
          height: 657,
          markers: [
            { number: 1, x: 67, y: 16 },
            { number: 2, x: 58, y: 25 },
            { number: 3, x: 58, y: 48 },
            { number: 4, x: 64, y: 85 },
            { number: 5, x: 78, y: 85 },
            { number: 6, x: 91, y: 85 },
          ],
        },
      ],
      callouts: copy.sections.services.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "invoices",
      icon: Receipt,
      ...copy.sections.invoices,
      screenshots: [
        {
          src: "/operations-guide/invoices.webp",
          alt: copy.sections.invoices.alt,
          width: 1280,
          height: 662,
          markers: [
            { number: 1, x: 67, y: 16 },
            { number: 2, x: 55, y: 43 },
            { number: 3, x: 86, y: 45 },
            { number: 4, x: 87, y: 33 },
            { number: 5, x: 87, y: 53 },
            { number: 6, x: 87, y: 84 },
          ],
        },
      ],
      callouts: copy.sections.invoices.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
    {
      id: "settings",
      icon: Settings,
      ownerOnly: true,
      ...copy.sections.settings,
      screenshots: [
        {
          src: "/operations-guide/settings.webp",
          alt: copy.sections.settings.alt,
          width: 1280,
          height: 618,
          markers: [
            { number: 1, x: 55, y: 28 },
            { number: 2, x: 57, y: 45 },
            { number: 3, x: 56, y: 72 },
            { number: 4, x: 91, y: 6 },
          ],
        },
      ],
      callouts: copy.sections.settings.callouts.map(([number, title, body]) => ({ number, title, body })),
    },
  ];

  const pageHref: Record<string, string> = {
    dashboard: "/operations/dashboard",
    calendar: "/operations/calendar",
    appointments: "/operations/appointments",
    customers: "/operations/customers",
    staff: "/operations/staff",
    services: "/operations/services",
    invoices: "/operations/invoices",
    settings: "/operations/settings",
  };

  return (
    <div className={styles.page} id="operations-guide-top">
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className={styles.heroCopy}>{copy.intro}</p>
        <div className={styles.note}>{copy.note}</div>
      </header>

      <section className={styles.flowCard}>
        <div>
          <p className={styles.eyebrow}>{copy.quickFlowTitle}</p>
          <p>{copy.quickFlowBody}</p>
        </div>
        <div className={styles.flowPath} aria-hidden="true">
          <span>Calendar</span><b>→</b><span>Appointment</span><b>→</b><span>Customer</span><b>→</b><span>Invoice</span>
        </div>
      </section>

      <nav className={styles.localNav} aria-label={copy.jump}>
        <span className={styles.localNavLabel}>{copy.jump}</span>
        <div>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <a key={section.id} href={`#${section.id}`}>
                <Icon size={14} />
                {section.title}
              </a>
            );
          })}
        </div>
      </nav>

      <div className={styles.sections}>
        {sections.map((section) => {
          const Icon = section.icon;
          const href = resolveOperationsHref(runtime, pageHref[section.id]);
          return (
            <section className={styles.section} id={section.id} key={section.id}>
              <div className={styles.sectionHeading}>
                <div className={styles.sectionTitleRow}>
                  <span className={styles.sectionIcon}><Icon size={20} /></span>
                  <div>
                    <p className={styles.eyebrow}>{section.eyebrow}</p>
                    <h2>{section.title}</h2>
                  </div>
                  {section.ownerOnly ? <span className={styles.ownerBadge}>{copy.ownerOnly}</span> : null}
                </div>
                <div className={styles.sectionIntro}>
                  <p>{section.description}</p>
                  {runtime.mode === "live" ? (
                    <Link className={styles.openLink} href={href}>
                      {copy.openPage} <ArrowUpRight size={15} />
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className={styles.screenshotStack}>
                {section.screenshots.map((screenshot) => (
                  <GuideScreenshot key={screenshot.src} {...screenshot} />
                ))}
              </div>

              <CalloutGrid callouts={section.callouts} />
              <a className={styles.backLink} href="#operations-guide-top">{copy.backToTop}</a>
            </section>
          );
        })}
      </div>
    </div>
  );
}
