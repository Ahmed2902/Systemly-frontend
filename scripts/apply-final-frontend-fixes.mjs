import fs from "node:fs";
import path from "node:path";

function update(file, transform) {
  const source = fs.readFileSync(file, "utf8");
  const next = transform(source);
  if (next !== source) fs.writeFileSync(file, next);
  console.log(`${next !== source ? "updated" : "unchanged"} ${file}`);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(child) : child.endsWith(".tsx") ? [child] : [];
  });
}

for (const file of walk("src")) {
  update(file, (source) => {
    if (!source.includes('"use client";')) return source;
    const withoutDirective = source
      .replace(/(?:^|\n)\s*"use client";\s*\n?/, "\n")
      .replace(/^\s+/, "");
    return `"use client";\n\n${withoutDirective}`;
  });
}

update("src/modules/staff/components/StaffFormModal.tsx", (source) =>
  source.replace(
    '{!service.isActive ? " · Inactive" : ""}',
    '{!service.isActive ? ` · ${text("Inactive")}` : ""}',
  ),
);

update("src/modules/staff/components/StaffProfileScreen.tsx", (source) =>
  source
    .replace(
      /([>\s])← Back to staff(\s*<\/Link>)/,
      '$1{text("← Back to staff")}$2',
    )
    .replace(
      /(<h2[^>]*>)Upcoming appointments(<\/h2>)/,
      '$1{text("Upcoming appointments")}$2',
    ),
);

for (const [file, subtitle] of [
  ["src/app/(auth)/forgot-password/page.tsx", "Enter the email connected to your account and we will send a secure reset link."],
  ["src/app/(auth)/reset-password/page.tsx", "Use a strong password that you do not reuse on another service."],
  ["src/app/(auth)/verify-email/page.tsx", "We are validating your email verification link and preparing your workspace."],
  ["src/app/(auth)/resend-verification/page.tsx", "Activate your account through the secure link sent to your inbox."],
  ["src/app/(auth)/oauth-callback/page.tsx", "Systemly is completing your secure Google sign-in."],
  ["src/app/operations/dashboard/customers/page.tsx", "Acquisition, appointment behaviour, repeat booking retention, and lifetime value"],
  ["src/app/operations/dashboard/growth/page.tsx", "Monthly momentum, acquisition mix, invoice volume, and retention"],
  ["src/app/operations/dashboard/operations/page.tsx", "Booking demand, peak periods, service popularity, and lead times"],
  ["src/app/operations/dashboard/page.tsx", "Here are the latest financial, customer, and operational signals from your business."],
  ["src/app/operations/dashboard/revenue/page.tsx", "Revenue, invoice volume, category mix, custom items, and weekday performance"],
  ["src/app/operations/dashboard/staff/page.tsx", "Service revenue contribution, commission, booked time, and utilisation"],
]) {
  update(file, (source) =>
    source
      .replace(
        `subtitle=${JSON.stringify(subtitle)}`,
        `subtitle={text(${JSON.stringify(subtitle)})}`,
      )
      .replace(
        `description=${JSON.stringify(subtitle)}`,
        `description={text(${JSON.stringify(subtitle)})}`,
      ),
  );
}

const analyticsAttributes = new Map([
  ["src/app/operations/dashboard/customers/page.tsx", [
    "Loading customer analytics…",
    "First-time customers acquired",
    "Customers who booked again",
  ]],
  ["src/app/operations/dashboard/growth/page.tsx", [
    "Loading growth analytics…",
  ]],
  ["src/app/operations/dashboard/operations/page.tsx", [
    "Loading bookings and services analytics…",
    "One booking may contain several services",
  ]],
  ["src/app/operations/dashboard/page.tsx", [
    "Loading dashboard overview…",
    "Collected in the selected period",
    "Completed payments",
    "Collected per paid invoice",
    "Appointments in this period",
  ]],
  ["src/app/operations/dashboard/revenue/page.tsx", [
    "Loading revenue analytics…",
    "Collected in the selected period",
    "Successfully settled invoices",
    "Average value per successful payment",
    "No custom items were sold in this period.",
  ]],
  ["src/app/operations/dashboard/staff/page.tsx", [
    "Loading staff analytics…",
    "Custom items stay in business revenue unless they are explicitly assigned to staff",
    "Commission calculated from attributed service lines",
  ]],
]);

for (const [file, values] of analyticsAttributes) {
  update(file, (source) => {
    let next = source;
    for (const value of values) {
      next = next.replaceAll(
        `=${JSON.stringify(value)}`,
        `={text(${JSON.stringify(value)})}`,
      );
    }
    return next;
  });
}

update("src/modules/auth/components/SignupForm.tsx", (source) =>
  source
    .replace("const { t } = useLocale();", "const { t, locale } = useLocale();")
    .replace(
      "await registerUser(data);",
      "await registerUser({ ...data, preferredLanguage: locale });",
    ),
);

update("src/modules/invoices/components/InvoiceWorkspaceScreen.tsx", (source) => {
  let next = source;
  if (!next.includes('import { useLocale } from "@/i18n/LocaleProvider";')) {
    next = next.replace(
      'import { usePlatformText } from "@/i18n/usePlatformText";',
      'import { usePlatformText } from "@/i18n/usePlatformText";\nimport { useLocale } from "@/i18n/LocaleProvider";',
    );
  }
  next = next.replace(
    "  const text = usePlatformText();\n  const { accessToken, loading: authLoading } = useAuth();",
    "  const text = usePlatformText();\n  const { locale } = useLocale();\n  const { accessToken, loading: authLoading } = useAuth();",
  );
  next = next.replace(
    "await downloadInvoiceReceipt(selected.id, selected.invoiceNumber, accessToken);",
    "await downloadInvoiceReceipt(selected.id, selected.invoiceNumber, accessToken, locale);",
  );
  next = next.replace(
    '      "Why are you voiding this invoice? The appointment will return to In progress.",',
    '      text("Why are you voiding this invoice? The appointment will return to In progress."),',
  );
  next = next.replace(
    '      "Void this invoice and reopen the appointment for editing and payment?",',
    '      text("Void this invoice and reopen the appointment for editing and payment?"),',
  );
  next = next.replace(
    "              options={statusOptions}",
    "              options={statusOptions.map((option) => ({ ...option, label: text(option.label) }))}",
  );
  next = next.replace(
    "              options={paymentOptions}",
    "              options={paymentOptions.map((option) => ({ ...option, label: text(option.label) }))}",
  );
  next = next.replace(
    '<span>{visibleTotal} invoice{visibleTotal === 1 ? "" : "s"}</span>',
    '<span>{visibleTotal} {text(visibleTotal === 1 ? "invoice" : "invoices")}</span>',
  );
  return next;
});
