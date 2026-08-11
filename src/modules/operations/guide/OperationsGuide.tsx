"use client";

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
import {
  resolveOperationsHref,
  useOperationsRuntime,
} from "../runtime/operations-runtime";
import styles from "./OperationsGuideV2.module.css";
import live from "./OperationsGuideLive.module.css";

type Marker = { number: number; x: number; y: number };
type Callout = { number: number; title: string; body: string };

type GuideSection = {
  id: string;
  route: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  markers: Marker[];
  callouts: Callout[];
};

const COPY = {
  en: {
    eyebrow: "HELP & GUIDE / OPERATIONS",
    title: "Run the business from one workspace.",
    intro:
      "Use this visual guide whenever you need a reminder of where something lives or what a screen is for. The previews use realistic Systemly demo data, while your own workspace follows the same structure.",
    note:
      "The previews use the real Systemly demo workspace and follow your current Operations appearance. They are view-only inside this guide.",
    jump: "Jump to a section",
    ownerOnly: "Owner only",
    openPage: "Open this page",
    backToTop: "Back to guide navigation",
    livePreview: "Live read-only preview",
    quickFlowTitle: "The everyday flow",
    quickFlowBody:
      "Most teams spend their day in Calendar and Appointments. Customers, Staff, Services and Invoices support that workflow; Dashboard and Settings are mainly owner tools.",
    flow: ["Calendar", "Appointment", "Customer", "Invoice"],
    drawer: {
      eyebrow: "#APPOINTMENT-2",
      title: "Edit Appointment",
      status: "Confirmed",
      statusLabel: "Appointment status",
      specialistLabel: "Assigned specialist",
      specialist: "Mona Adel",
      dateLabel: "Date",
      date: "11/08/2026",
      timeLabel: "Start / end time",
      time: "09:30 – 11:15",
      services: "Booked Services",
      service: "Gel manicure",
      serviceStaff: "Mona Adel",
      warning: "Staff double-booked at this time",
      subtotal: "Subtotal",
      payment: "Payment method",
      cash: "Cash",
      total: "Total",
      save: "Save changes",
      cancel: "Cancel appointment",
      collect: "Collect payment",
      noShow: "Mark no-show",
      complete: "Mark complete",
    },
    sections: {
      dashboard: {
        title: "Dashboard",
        eyebrow: "Owner overview",
        description:
          "Use the Dashboard to understand revenue, bookings, customers, staff performance and trends over a selected period.",
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
        callouts: [
          [1, "Date navigation", "Move one day at a time or return to Today. The selected date is always visible."],
          [2, "Status legend", "Appointment colours show Pending, Confirmed, In progress, Completed, No-show, Cancelled and Paid/locked states."],
          [3, "Staff rows", "Each row belongs to one staff member. Search when the team is large."],
          [4, "Appointment cards", "Position and width represent the staff assignment and appointment time. Click a card to manage it."],
          [5, "Create appointments", "Use New appointment for phone, WhatsApp or walk-in bookings made by reception."],
          [6, "Status and specialist", "The appointment panel shows the current state and assigned specialist at a glance."],
          [7, "Service lines", "Multi-service appointments can assign a different eligible staff member and time to each service."],
          [8, "Conflict protection", "Systemly warns when a chosen staff member would be double-booked."],
          [9, "Totals and payment", "Review subtotal, discount, payment method and final total before collecting payment."],
          [10, "Appointment actions", "Save, cancel, collect payment, mark no-show or complete the appointment from the same panel."],
        ],
      },
      appointments: {
        title: "Appointments",
        eyebrow: "Queue and history",
        description:
          "Use the list when you want to search, filter or review appointments without navigating the timeline. Cancelled appointments remain visible here for history.",
        callouts: [
          [1, "Search and filters", "Find a customer, phone number or service, then narrow by date, staff, status and sort order."],
          [2, "Appointment summary", "Each row shows time, duration, customer, services, assigned staff, status and amount."],
          [3, "Statuses stay visible", "Completed and cancelled records stay in the list so operational history is not lost."],
          [4, "Open details", "Select a row to open the full appointment workspace and its available actions."],
        ],
      },
      customers: {
        title: "Customers",
        eyebrow: "Customer workspace",
        description:
          "Keep contact details, notes, visit history and future appointments together so reception does not need to reconstruct a customer from chat history.",
        callouts: [
          [1, "Customer directory", "Search customers and filter by whether they have an upcoming appointment."],
          [2, "Profile actions", "Message the customer, edit the profile or create a new appointment from the selected customer."],
          [3, "Customer metrics", "See completed visits, no-shows, last visit and the next appointment immediately."],
          [4, "Contact and source", "Phone, email, acquisition source and customer-since date stay in one profile."],
          [5, "Internal notes", "Save operational notes that are visible to the team but not to the customer."],
          [6, "Upcoming and history", "Review future bookings and complete appointment history from the same workspace."],
        ],
      },
      staff: {
        title: "Staff",
        eyebrow: "Team management",
        description:
          "Manage who works in the business, what they can perform, when they are available and how service commissions are configured.",
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
        callouts: [
          [1, "Catalog filters", "Search services or narrow the catalog by category and active status."],
          [2, "Catalog summary", "See total services, bookable services and category count at a glance."],
          [3, "Categories", "Group related services so the catalog and customer website are easier to browse."],
          [4, "Duration and price", "These values drive availability calculations and the amount charged for the service."],
          [5, "Eligible staff", "Only eligible staff can be assigned or offered for that service during booking."],
          [6, "Active status and actions", "Deactivate, edit or remove a service while keeping the catalog organised."],
        ],
      },
      invoices: {
        title: "Invoices",
        eyebrow: "Payments and receipts",
        description:
          "Review completed payments, download receipts and safely void a payment when an appointment needs to be reopened.",
        callouts: [
          [1, "Invoice filters", "Search by invoice, customer or phone, then filter by status, payment method or date."],
          [2, "Invoice history", "Paid and voided invoices remain visible with customer, date, method and amount."],
          [3, "Invoice details", "Selecting an invoice opens its customer, services, totals and payment information."],
          [4, "Receipt", "Download the receipt for a paid invoice directly from the details panel."],
          [5, "Open appointment", "Jump back to the appointment that produced the invoice when you need more context."],
          [6, "Void and reopen", "Voiding safely reverses the invoice state and reopens the appointment for editing or payment."],
        ],
      },
      settings: {
        title: "Settings",
        eyebrow: "Business configuration",
        description:
          "Owners use Settings for business identity, contact details, timezone, language, branding and the public website connection.",
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
      "استخدم الدليل البصري ده في أي وقت تحتاج تفتكر مكان حاجة أو وظيفة شاشة معينة. المعاينات فيها بيانات Systemly demo، لكن نفس الترتيب وطريقة الشغل موجودين في حسابك.",
    note:
      "المعاينات من Systemly demo الحقيقي وبتتبع الـ appearance الحالي عندك. هي للشرح فقط داخل الدليل.",
    jump: "روح لجزء معين",
    ownerOnly: "للمالك فقط",
    openPage: "افتح الصفحة",
    backToTop: "الرجوع لقائمة الدليل",
    livePreview: "معاينة مباشرة للشرح فقط",
    quickFlowTitle: "الشغل اليومي ببساطة",
    quickFlowBody:
      "معظم وقت الـ reception والفريق هيكون في Calendar وAppointments. صفحات Customers وStaff وServices وInvoices بتكمل نفس الـ workflow، بينما Dashboard وSettings بيستخدمهم المالك أكتر.",
    flow: ["Calendar", "Appointment", "Customer", "Invoice"],
    drawer: {
      eyebrow: "#APPOINTMENT-2",
      title: "Edit Appointment",
      status: "Confirmed",
      statusLabel: "حالة الموعد",
      specialistLabel: "الموظف المسؤول",
      specialist: "Mona Adel",
      dateLabel: "التاريخ",
      date: "11/08/2026",
      timeLabel: "وقت البداية والنهاية",
      time: "09:30 – 11:15",
      services: "الخدمات المحجوزة",
      service: "Gel manicure",
      serviceStaff: "Mona Adel",
      warning: "الموظف محجوز بالفعل في الوقت ده",
      subtotal: "Subtotal",
      payment: "طريقة الدفع",
      cash: "Cash",
      total: "الإجمالي",
      save: "Save changes",
      cancel: "Cancel appointment",
      collect: "Collect payment",
      noShow: "Mark no-show",
      complete: "Mark complete",
    },
    sections: {
      dashboard: {
        title: "Dashboard",
        eyebrow: "نظرة المالك",
        description: "تابع الإيرادات والحجوزات والعملاء وأداء الفريق والاتجاهات خلال الفترة اللي تختارها.",
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
        callouts: [
          [1, "التاريخ", "اتحرك يوم بيوم أو ارجع لـ Today، والتاريخ الحالي ظاهر دايمًا."],
          [2, "حالات المواعيد", "الألوان بتوضح Pending وConfirmed وIn progress وCompleted وNo-show وCancelled وPaid/locked."],
          [3, "صفوف الموظفين", "كل صف لموظف واحد، وتقدر تبحث بالاسم لو الفريق كبير."],
          [4, "كارت الموعد", "مكان وحجم الكارت بيوضحوا الموظف والوقت. اضغط عليه علشان تفتح التفاصيل."],
          [5, "موعد جديد", "استخدم New appointment للحجوزات اللي جاية من التليفون أو WhatsApp أو walk-in."],
          [6, "الحالة والموظف", "شوف حالة الموعد والـ specialist المسؤول بسرعة."],
          [7, "الخدمات", "الموعد اللي فيه أكتر من خدمة ممكن توزع كل خدمة على موظف مؤهل ووقت مختلف."],
          [8, "منع التعارض", "Systemly بينبهك لو الموظف اللي اخترته محجوز في نفس الوقت."],
          [9, "الإجمالي والدفع", "راجع subtotal والخصم وطريقة الدفع والإجمالي قبل التحصيل."],
          [10, "إجراءات الموعد", "احفظ التعديلات أو الغي الموعد أو حصل الدفع أو سجله no-show أو completed من نفس المكان."],
        ],
      },
      appointments: {
        title: "Appointments",
        eyebrow: "القائمة والسجل",
        description: "استخدم القائمة للبحث والفلترة ومراجعة المواعيد من غير ما تتحرك على الـ timeline. المواعيد الملغية بتفضل ظاهرة للسجل.",
        callouts: [
          [1, "البحث والفلاتر", "ابحث بالعميل أو الرقم أو الخدمة، وبعدها فلتر بالتاريخ والموظف والحالة والترتيب."],
          [2, "ملخص الموعد", "كل صف بيوضح الوقت والمدة والعميل والخدمات والموظف والحالة والمبلغ."],
          [3, "السجل محفوظ", "Completed وCancelled بيفضلوا ظاهرين علشان تاريخ التشغيل ما يضيعش."],
          [4, "فتح التفاصيل", "اضغط على الموعد علشان تفتح تفاصيله والإجراءات المتاحة."],
        ],
      },
      customers: {
        title: "Customers",
        eyebrow: "ملف العميل",
        description: "خلي بيانات التواصل والملاحظات والزيارات السابقة والمواعيد الجاية في مكان واحد بدل الرجوع لكل شات قديم.",
        callouts: [
          [1, "قائمة العملاء", "ابحث عن عميل وفلتر حسب وجود موعد قادم."],
          [2, "إجراءات العميل", "ابعت رسالة أو عدل الملف أو اعمل Appointment جديدة للعميل مباشرة."],
          [3, "مؤشرات العميل", "شوف الزيارات المكتملة والـ no-shows وآخر زيارة والموعد الجاي."],
          [4, "التواصل والمصدر", "الرقم والإيميل ومصدر العميل وتاريخ بدايته موجودين في ملف واحد."],
          [5, "ملاحظات داخلية", "سجل ملاحظات للفريق فقط من غير ما تظهر للعميل."],
          [6, "المواعيد والسجل", "راجع الحجوزات القادمة وكل تاريخ المواعيد من نفس الملف."],
        ],
      },
      staff: {
        title: "Staff",
        eyebrow: "إدارة الفريق",
        description: "حدد مين بيشتغل في النشاط، الخدمات اللي يقدر يعملها، مواعيد توفره وعمولاته على الخدمات.",
        callouts: [
          [1, "ملخص الفريق", "شوف عدد الفريق والنشطين والمتاحين النهارده ومين في time off."],
          [2, "البحث والفلاتر", "فلتر بالحالة أو الدور أو الخدمة أو التوفر لما الفريق يكبر."],
          [3, "الخدمات المسموحة", "Service tags بتحدد الخدمات اللي الموظف يقدر يعملها، وده بيحدد اختيارات الحجز."],
          [4, "التوفر الأسبوعي", "أيام الأسبوع بتوضح جدول الموظف المعتاد بسرعة."],
          [5, "العمولات", "اعرف هل عمولة كل خدمة اتظبطت للموظف ولا لسه."],
          [6, "إجراءات الموظف", "افتح الملف أو عدله أو اعمل deactivate من غير ما تمسح تاريخه."],
        ],
      },
      services: {
        title: "Services",
        eyebrow: "الخدمات وقواعد الحجز",
        description: "الخدمة بتحدد العميل يقدر يحجز إيه: التصنيف والمدة والسعر والحالة والموظفين المؤهلين ليها.",
        callouts: [
          [1, "بحث وفلاتر", "ابحث عن خدمة أو فلتر بالتصنيف والحالة."],
          [2, "ملخص الكتالوج", "شوف عدد الخدمات والخدمات القابلة للحجز وعدد التصنيفات."],
          [3, "التصنيفات", "جمع الخدمات المرتبطة مع بعض علشان الكتالوج والموقع يبقوا أوضح."],
          [4, "المدة والسعر", "المدة بتدخل في حساب الـ availability والسعر هو اللي بيتحاسب على الخدمة."],
          [5, "الموظفين المؤهلين", "بس الموظفين المؤهلين للخدمة يقدروا يتحددوا لها أثناء الحجز."],
          [6, "الحالة والإجراءات", "عدل أو عطّل أو احذف خدمة مع الحفاظ على تنظيم الكتالوج."],
        ],
      },
      invoices: {
        title: "Invoices",
        eyebrow: "الدفع والفواتير",
        description: "راجع المدفوعات المكتملة ونزّل الإيصالات واعمل void بأمان لو محتاج ترجع الموعد للتعديل أو الدفع.",
        callouts: [
          [1, "فلاتر الفواتير", "ابحث برقم الفاتورة أو العميل أو التليفون وفلتر بالحالة وطريقة الدفع والتاريخ."],
          [2, "سجل الفواتير", "Paid وVoided بيفضلوا ظاهرين مع العميل والتاريخ وطريقة الدفع والمبلغ."],
          [3, "تفاصيل الفاتورة", "اختيار الفاتورة بيفتح العميل والخدمات والإجمالي وبيانات الدفع."],
          [4, "الإيصال", "نزّل receipt الفاتورة المدفوعة من التفاصيل."],
          [5, "الرجوع للموعد", "افتح الموعد اللي عمل الفاتورة لو محتاج تفاصيل أكتر."],
          [6, "Void وإعادة الفتح", "الـ void بيرجع حالة الفاتورة ويفتح الموعد للتعديل أو الدفع بدل ما تعمل تصحيح منفصل."],
        ],
      },
      settings: {
        title: "Settings",
        eyebrow: "إعدادات النشاط",
        description: "المالك بيستخدم Settings لبيانات النشاط والتواصل والـ timezone واللغة والـ branding وربط الموقع العام.",
        callouts: [
          [1, "بيانات النشاط", "خلي الاسم والرقم والعنوان والمدينة صح لأن Systemly بيستخدمهم في أكتر من مكان."],
          [2, "الـ timezone واللغة", "الـ timezone مهم لحسابات المواعيد واللغة الافتراضية بتحدد تجربة النشاط."],
          [3, "الـ branding", "ارفع الـ logo والـ cover المستخدمين في الإيصالات والموقع."],
          [4, "الموقع العام", "افتح الموقع المنشور من Settings علشان تتأكد من تجربة العميل."],
        ],
      },
    },
  },
} as const;

function markerSet(id: string): Marker[] {
  const markers: Record<string, Marker[]> = {
    dashboard: [
      { number: 1, x: 83, y: 8 },
      { number: 2, x: 42, y: 16 },
      { number: 3, x: 55, y: 26 },
      { number: 4, x: 48, y: 50 },
      { number: 5, x: 84, y: 42 },
    ],
    calendar: [
      { number: 1, x: 18, y: 20 },
      { number: 2, x: 43, y: 29 },
      { number: 3, x: 23, y: 44 },
      { number: 4, x: 53, y: 58 },
      { number: 5, x: 93, y: 11 },
    ],
    appointments: [
      { number: 1, x: 65, y: 17 },
      { number: 2, x: 54, y: 39 },
      { number: 3, x: 84, y: 54 },
      { number: 4, x: 94, y: 40 },
    ],
    customers: [
      { number: 1, x: 24, y: 30 },
      { number: 2, x: 88, y: 19 },
      { number: 3, x: 68, y: 35 },
      { number: 4, x: 53, y: 56 },
      { number: 5, x: 81, y: 56 },
      { number: 6, x: 76, y: 86 },
    ],
    staff: [
      { number: 1, x: 56, y: 18 },
      { number: 2, x: 64, y: 27 },
      { number: 3, x: 50, y: 44 },
      { number: 4, x: 50, y: 57 },
      { number: 5, x: 50, y: 63 },
      { number: 6, x: 54, y: 71 },
    ],
    services: [
      { number: 1, x: 68, y: 17 },
      { number: 2, x: 58, y: 26 },
      { number: 3, x: 58, y: 49 },
      { number: 4, x: 64, y: 85 },
      { number: 5, x: 78, y: 85 },
      { number: 6, x: 91, y: 85 },
    ],
    invoices: [
      { number: 1, x: 67, y: 17 },
      { number: 2, x: 55, y: 44 },
      { number: 3, x: 86, y: 46 },
      { number: 4, x: 87, y: 34 },
      { number: 5, x: 87, y: 54 },
      { number: 6, x: 87, y: 84 },
    ],
    settings: [
      { number: 1, x: 56, y: 29 },
      { number: 2, x: 58, y: 46 },
      { number: 3, x: 57, y: 73 },
      { number: 4, x: 91, y: 7 },
    ],
  };
  return markers[id] ?? [];
}

function toCallouts(values: readonly (readonly [number, string, string])[]): Callout[] {
  return values.map(([number, title, body]) => ({ number, title, body }));
}

function MarkerBubble({ marker }: { marker: Marker }) {
  return (
    <span
      className={live.marker}
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      aria-hidden="true"
    >
      {marker.number}
    </span>
  );
}

function LivePreview({
  route,
  vertical,
  title,
  badge,
  markers,
}: {
  route: string;
  vertical: string;
  title: string;
  badge: string;
  markers: Marker[];
}) {
  return (
    <div className={live.liveShell}>
      <div className={live.liveStage}>
        <span className={live.liveBadge}>{badge}</span>
        <iframe
          className={live.liveFrame}
          src={`/demo/operations/${vertical}/${route}`}
          title={title}
          loading="lazy"
          tabIndex={-1}
        />
        {markers.map((marker) => (
          <MarkerBubble key={marker.number} marker={marker} />
        ))}
      </div>
    </div>
  );
}

function AppointmentPanelPreview({ copy }: { copy: (typeof COPY)["en"]["drawer"] | (typeof COPY)["ar"]["drawer"] }) {
  const markers: Marker[] = [
    { number: 6, x: 50, y: 18 },
    { number: 7, x: 42, y: 48 },
    { number: 8, x: 79, y: 58 },
    { number: 9, x: 51, y: 74 },
    { number: 10, x: 50, y: 94 },
  ];

  return (
    <div className={`${live.drawerShell} ${live.drawerStage}`}>
      <div className={live.drawerHeader}>
        <div>
          <p className={live.drawerEyebrow}>{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
        </div>
        <span className={live.statusPill}>{copy.status}</span>
      </div>

      <div className={live.drawerBody}>
        <div className={live.drawerGrid}>
          <div className={live.drawerCard}>
            <span className={live.drawerLabel}>{copy.statusLabel}</span>
            <strong className={live.drawerValue}>{copy.status}</strong>
          </div>
          <div className={live.drawerCard}>
            <span className={live.drawerLabel}>{copy.specialistLabel}</span>
            <strong className={live.drawerValue}>{copy.specialist}</strong>
          </div>
          <div className={live.drawerCard}>
            <span className={live.drawerLabel}>{copy.dateLabel}</span>
            <strong className={live.drawerValue}>{copy.date}</strong>
          </div>
          <div className={live.drawerCard}>
            <span className={live.drawerLabel}>{copy.timeLabel}</span>
            <strong className={live.drawerValue}>{copy.time}</strong>
          </div>
        </div>

        <div className={live.serviceCard}>
          <div className={live.serviceHeader}>
            <strong>{copy.services}</strong>
            <span>2 services</span>
          </div>
          <div className={live.serviceControls}>
            <div className={live.fakeInput}>{copy.service}</div>
            <div className={live.fakeInput}>{copy.serviceStaff}</div>
            <div className={live.fakeInput}>9:30 → 10:15</div>
          </div>
          <p className={live.warning}>{copy.warning}</p>
        </div>

        <div className={live.totalCard}>
          <div className={live.totalRow}><span>{copy.subtotal}</span><strong>EGP 1,020</strong></div>
          <div className={live.totalRow}><span>{copy.payment}</span><strong>{copy.cash}</strong></div>
          <div className={live.totalRow}><span>{copy.total}</span><strong>EGP 1,020</strong></div>
        </div>

        <div className={live.drawerActions}>
          <button className={`${live.actionButton} ${live.primary}`} type="button">{copy.save}</button>
          <button className={`${live.actionButton} ${live.danger}`} type="button">{copy.cancel}</button>
          <button className={live.actionButton} type="button">{copy.collect}</button>
          <button className={live.actionButton} type="button">{copy.noShow}</button>
          <button className={live.actionButton} type="button">{copy.complete}</button>
        </div>
      </div>

      {markers.map((marker) => (
        <MarkerBubble key={marker.number} marker={marker} />
      ))}
    </div>
  );
}

function CalloutGrid({ callouts }: { callouts: Callout[] }) {
  return (
    <div className={styles.calloutGrid}>
      {callouts.map((callout) => (
        <article className={styles.callout} key={callout.number}>
          <span className={styles.calloutNumber}>{callout.number}</span>
          <div>
            <strong>{callout.title}</strong>
            <p>{callout.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function OperationsGuide() {
  const { locale } = useLocale();
  const runtime = useOperationsRuntime();
  const copy = locale === "ar" ? COPY.ar : COPY.en;

  const sectionDefinitions = [
    ["dashboard", "/operations/dashboard", LayoutDashboard, true],
    ["calendar", "/operations/calendar", CalendarDays, false],
    ["appointments", "/operations/appointments", ClipboardList, false],
    ["customers", "/operations/customers", Users, false],
    ["staff", "/operations/staff", UserRound, false],
    ["services", "/operations/services", Sparkles, false],
    ["invoices", "/operations/invoices", Receipt, false],
    ["settings", "/operations/settings", Settings, true],
  ] as const;

  const sections: GuideSection[] = sectionDefinitions.map(([id, route, icon, ownerOnly]) => {
    const sectionCopy = copy.sections[id];
    return {
      id,
      route,
      icon,
      ownerOnly,
      title: sectionCopy.title,
      eyebrow: sectionCopy.eyebrow,
      description: sectionCopy.description,
      markers: markerSet(id),
      callouts: toCallouts(sectionCopy.callouts),
    };
  });

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
          {copy.flow.map((item, index) => (
            <span key={item}>
              {item}
              {index < copy.flow.length - 1 ? " →" : ""}
            </span>
          ))}
        </div>
      </section>

      <nav className={styles.localNav} aria-label={copy.jump}>
        <span className={styles.localNavLabel}>{copy.jump}</span>
        <div>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <a href={`#${section.id}`} key={section.id}>
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
          const href = resolveOperationsHref(runtime, section.route);
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
                  <Link className={styles.openLink} href={href}>
                    {copy.openPage} <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              <div className={styles.visualStack}>
                <LivePreview
                  route={section.id}
                  vertical={runtime.vertical}
                  title={`${section.title} ${copy.livePreview}`}
                  badge={copy.livePreview}
                  markers={section.markers}
                />
                {section.id === "calendar" ? <AppointmentPanelPreview copy={copy.drawer} /> : null}
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
