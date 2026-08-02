"use client";

import { useLocale } from "@/i18n/LocaleProvider";

const copy = {
  en: {
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
      "Review the current Systemly plan and subscription access.",
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
  },
  ar: {
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
    billingDescription: "راجع خطة Systemly الحالية وحالة الوصول للاشتراك.",
    currentPlan: "الخطة الحالية",
    systemlyCore: "Systemly Core",
    noPlan: "لا توجد خطة",
    status: "الحالة",
    relevantEndDate: "تاريخ الانتهاء المرتبط بالحالة",
    daysRemaining: (days: number) => `متبقي ${days} يوم`,
    onlinePaymentSetup: "إعداد الدفع الإلكتروني",
    easyKashPlaceholder:
      "لم يتم إعداد الدفع عبر EasyKash بعد. لا تحتاج إلى بطاقة أو بيانات فوترة أثناء التجربة المجانية، ولن يخزن Systemly بيانات البطاقة الخام.",
  },
} as const;

export function useSubscriptionCopy() {
  const { locale } = useLocale();
  return copy[locale];
}
