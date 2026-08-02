import fs from "node:fs";

const file = "src/app/(marketing)/layout.tsx";
const content = `import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  normalizeLocale,
  type AppLocale,
} from "@/i18n/config";

function browserLocale(value: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  return value
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase())
    .some((tag) => tag === "ar" || tag?.startsWith("ar-"))
    ? "ar"
    : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = stored
    ? normalizeLocale(stored)
    : browserLocale((await headers()).get("accept-language"));

  return locale === "ar"
    ? {
        title: "Systemly | أدر نشاطك من مكان واحد",
        description:
          "أنشئ موقع نشاطك، واستقبل الحجوزات، ونظّم فريق العمل، وتابع الأداء من نظام واحد.",
      }
    : {
        title: "Systemly | Run your business from one place",
        description:
          "Build your website, take bookings, coordinate your team, and understand performance from one connected platform.",
      };
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
`;
fs.writeFileSync(file, content);
console.log(`updated ${file}`);
