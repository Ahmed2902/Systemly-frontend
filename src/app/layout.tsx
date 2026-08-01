// src/app/layout.tsx
import "./globals.css";
import "./systemly-shared.css";
import { cookies } from "next/headers";
import { AuthProvider } from "@/modules/auth/useAuth";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import {
  getLocaleDirection,
  LOCALE_COOKIE,
  normalizeLocale,
} from "@/i18n/config";
import { Cairo, Inter, Playfair_Display } from "next/font/google";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
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
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
