// src/app/layout.tsx
import "./globals.css";
import "./systemly-shared.css";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { AuthProvider } from "@/modules/auth/useAuth";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import {
  DEFAULT_LOCALE,
  getLocaleDirection,
  LOCALE_COOKIE,
  normalizeLocale,
  type AppLocale,
} from "@/i18n/config";
import { PlatformLanguageControl } from "@/shared/components/PlatformLanguageControl";
import { Cairo, Inter, Playfair_Display } from "next/font/google";

export const metadata: Metadata = {
  verification: {
    google: "eJTHVDziI132sDuQ2QnwYjJ05dbnwFWHRrVmfUokKkM",
  },
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

function localeFromAcceptLanguage(value: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;

  const languages = value
    .split(",")
    .map((entry) => {
      const [tag, quality = "q=1"] = entry.trim().split(";");
      const score = Number(quality.replace(/^q=/, "")) || 0;
      return { tag: tag.toLowerCase(), score };
    })
    .sort((a, b) => b.score - a.score);

  return languages.some(({ tag }) => tag === "ar" || tag.startsWith("ar-"))
    ? "ar"
    : DEFAULT_LOCALE;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = storedLocale
    ? normalizeLocale(storedLocale)
    : localeFromAcceptLanguage((await headers()).get("accept-language"));
  const direction = getLocaleDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      data-locale={locale}
      className={`${playfair.variable} ${inter.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LocaleProvider initialLocale={locale}>
          <AuthProvider>
            <PlatformLanguageControl />
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
