"use client";

import { useLocale } from "@/i18n/LocaleProvider";

const copy = {
  en: {
    dateLocale: "en-EG",
    billing: "Billing",
    openBilling: "Open Billing",
    resolvePayment: "Resolve payment",
    viewPlan: "View plan",
    subscriptionInactive: "Subscription inactive",
    ownerReadOnly:
      "Your subscription is inactive. Existing data remains available, but changes are disabled.",
    staffBlocked:
      "This workspace is unavailable. Contact the business owner to renew the Systemly subscription.",
    paymentOverdue: (days: number | null) =>
      days === null
        ? "Payment is overdue. Full access remains available during the grace period."
        : `Payment is overdue. Full access remains available for ${days} more day${days === 1 ? "" : "s"}.`,
    trialEndsToday: "Your free trial ends today.",
    trialDaysLeft: (days: number) =>
      `${days} day${days === 1 ? "" : "s"} left in your Systemly Core trial.`,
    loadingBilling: "Loading Billing",
    ownerRequired: "Owner access required",
    ownerRequiredDescription:
      "Only the business owner can manage the Systemly subscription.",
    billingEyebrow: "Settings / Billing",
    billingDescription:
      "Manage the Systemly plan, renewal and subscription payments.",
    currentPlan: "Current plan",
    systemlyCore: "Systemly Core",
    noPlan: "No plan",
    status: "Status",
    relevantEndDate: "Relevant end date",
    daysRemaining: (days: number) =>
      `${days} day${days === 1 ? "" : "s"} remaining`,
    onlinePaymentSetup: "Online payment setup",
    easyKashPlaceholder:
      "EasyKash checkout is not configured yet. No card or billing data is required during the free trial, and Systemly will never store raw card details.",
    refresh: "Refresh",
    paymentHistory: "Payment history",
    paymentHistoryDescription:
      "Subscription checkout attempts and confirmed payments.",
    noPayments: "No subscription payments yet.",
    continueCheckout: "Continue checkout",
    unableToLoad: "Unable to load Billing.",
    billingActionFailed: "Billing action failed.",
    providerUnavailable:
      "EasyKash checkout is not configured yet. Your trial and existing data are unaffected; Systemly did not create or activate a payment.",
    price: "Price",
    freeTrial: "Free trial",
    perMonth: "month",
    endDate: "End date",
    renewal: "Renewal",
    automatic: "Automatic",
    manual: "Manual",
    cancellationScheduled:
      "Cancellation is scheduled for the current period end.",
    resumeSubscription: "Resume subscription",
    cancelAtPeriodEnd: "Cancel at period end",
    availablePlan: "Available plan",
    subscribeNow: "Subscribe now",
    renewPlan: "Renew plan",
    preparingCheckout: "Preparing checkout…",
    resuming: "Resuming…",
    schedulingCancellation: "Scheduling cancellation…",
    paymentStatus: (status: string) => status.replaceAll("_", " "),
    subscriptionStatus: (status: string) => status.replaceAll("_", " "),
    paymentReferenceMissing: "Payment reference missing",
    paymentReferenceMissingDescription:
      "Return to Billing and start checkout again.",
    confirmingPayment: "Confirming payment",
    paymentConfirmed: "Payment confirmed",
    paymentNotCompleted: "Payment not completed",
    unableToConfirmPayment: "Unable to confirm payment",
    paymentStillPending: "Payment still pending",
    paymentConfirmedDescription:
      "Your subscription has been activated by the verified provider event.",
    paymentFailedDescription:
      "Return to Billing to try another checkout.",
    paymentPendingLong:
      "Confirmation is taking longer than expected. Billing will show the final result when it arrives.",
    paymentConfirmingDescription:
      "Systemly is waiting for server-to-server confirmation. This page never activates a subscription from the browser redirect.",
    returnToBilling: "Return to Billing",
    openOperations: "Open Operations",
  },
  ar: {
    dateLocale: "ar-EG",
    billing: "الفوترة",
    openBilling: "فتح الفوترة",
    resolvePayment: "حل مشكلة الدفع",
    viewPlan: "عرض الخطة",
    subscriptionInactive: "الاشتراك غير نشط",
    ownerReadOnly:
      "اشتراكك غير نشط. يمكنك الاطلاع على بياناتك الحالية، لكن التعديلات متوقفة.",
    staffBlocked:
      "مساحة العمل غير متاحة حالياً. تواصل مع مالك النشاط لتجديد اشتراك Systemly.",
    paymentOverdue: (days: number | null) =>
      days === null
        ? "تأخر الدفع. يظل الوصول الكامل متاحاً خلال فترة السماح."
        : `تأخر الدفع. يظل الوصول الكامل متاحاً لمدة ${days} يوم إضافي.`,
    trialEndsToday: "تنتهي تجربتك المجانية اليوم.",
    trialDaysLeft: (days: number) =>
      `متبقي ${days} يوم في تجربة Systemly Core المجانية.`,
    loadingBilling: "جارٍ تحميل الفوترة",
    ownerRequired: "يتطلب صلاحية المالك",
    ownerRequiredDescription: "يمكن لمالك النشاط فقط إدارة اشتراك Systemly.",
    billingEyebrow: "الإعدادات / الفوترة",
    billingDescription: "أدر خطة Systemly والتجديد ومدفوعات الاشتراك.",
    currentPlan: "الخطة الحالية",
    systemlyCore: "Systemly Core",
    noPlan: "لا توجد خطة",
    status: "الحالة",
    relevantEndDate: "تاريخ الانتهاء المرتبط بالحالة",
    daysRemaining: (days: number) => `متبقي ${days} يوم`,
    onlinePaymentSetup: "إعداد الدفع الإلكتروني",
    easyKashPlaceholder:
      "لم يتم إعداد الدفع عبر EasyKash بعد. لا تحتاج إلى بطاقة أو بيانات فوترة أثناء التجربة المجانية، ولن يخزن Systemly بيانات البطاقة الخام.",
    refresh: "تحديث",
    paymentHistory: "سجل المدفوعات",
    paymentHistoryDescription:
      "محاولات دفع الاشتراك والمدفوعات التي تم تأكيدها.",
    noPayments: "لا توجد مدفوعات اشتراك بعد.",
    continueCheckout: "متابعة الدفع",
    unableToLoad: "تعذر تحميل الفوترة.",
    billingActionFailed: "تعذر تنفيذ إجراء الفوترة.",
    providerUnavailable:
      "لم يتم إعداد الدفع عبر EasyKash بعد. تجربتك وبياناتك الحالية لم تتأثر، ولم ينشئ Systemly دفعة أو يفعّل اشتراكاً.",
    price: "السعر",
    freeTrial: "تجربة مجانية",
    perMonth: "شهرياً",
    endDate: "تاريخ الانتهاء",
    renewal: "التجديد",
    automatic: "تلقائي",
    manual: "يدوي",
    cancellationScheduled: "تمت جدولة الإلغاء عند نهاية الفترة الحالية.",
    resumeSubscription: "إلغاء طلب الإنهاء",
    cancelAtPeriodEnd: "إلغاء عند نهاية الفترة",
    availablePlan: "الخطة المتاحة",
    subscribeNow: "اشترك الآن",
    renewPlan: "جدد الخطة",
    preparingCheckout: "جارٍ تجهيز الدفع…",
    resuming: "جارٍ استعادة الاشتراك…",
    schedulingCancellation: "جارٍ جدولة الإلغاء…",
    paymentStatus: (status: string) => status.replaceAll("_", " "),
    subscriptionStatus: (status: string) => status.replaceAll("_", " "),
    paymentReferenceMissing: "مرجع الدفع غير موجود",
    paymentReferenceMissingDescription:
      "ارجع إلى الفوترة وابدأ عملية الدفع مرة أخرى.",
    confirmingPayment: "جارٍ تأكيد الدفع",
    paymentConfirmed: "تم تأكيد الدفع",
    paymentNotCompleted: "لم تكتمل عملية الدفع",
    unableToConfirmPayment: "تعذر تأكيد الدفع",
    paymentStillPending: "الدفع ما زال قيد الانتظار",
    paymentConfirmedDescription:
      "تم تفعيل اشتراكك بواسطة إشعار موثّق من مزود الدفع.",
    paymentFailedDescription: "ارجع إلى الفوترة لمحاولة الدفع مرة أخرى.",
    paymentPendingLong:
      "يستغرق التأكيد وقتاً أطول من المتوقع. ستعرض صفحة الفوترة النتيجة النهائية عند وصولها.",
    paymentConfirmingDescription:
      "ينتظر Systemly تأكيداً مباشراً بين الخوادم. لا تقوم صفحة الرجوع من المتصفح بتفعيل الاشتراك.",
    returnToBilling: "العودة إلى الفوترة",
    openOperations: "فتح إدارة العمل",
  },
} as const;

export function useSubscriptionCopy() {
  const { locale } = useLocale();
  return copy[locale];
}
