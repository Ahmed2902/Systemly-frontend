import Link from "next/link";
import { MapPin } from "lucide-react";
import { Image } from "@/shared/components/Image";

export type BookingBranchOption = {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
};

const copy = {
  en: {
    booking: "Booking",
    steps: ["Branch", "Services", "Staff", "Time", "Confirm"],
    eyebrow: "Choose location",
    title: "Which branch would you like to visit?",
    description:
      "Choose the location first. Services, team members, and available times are specific to each branch.",
    choose: "Choose branch",
    online: "Online booking",
    sideTitle: "Start with the right location.",
    sideCopy:
      "Once you choose a branch, Systemly will show only the services, team, and live availability for that location.",
    powered: "Powered by Systemly",
  },
  ar: {
    booking: "الحجز",
    steps: ["الفرع", "الخدمات", "الفريق", "الوقت", "التأكيد"],
    eyebrow: "اختر الفرع",
    title: "أي فرع تريد زيارته؟",
    description:
      "اختر الفرع أولاً، وبعدها ستظهر لك الخدمات وفريق العمل والمواعيد المتاحة الخاصة بهذا الفرع فقط.",
    choose: "اختيار الفرع",
    online: "الحجز الإلكتروني",
    sideTitle: "ابدأ باختيار الفرع المناسب.",
    sideCopy:
      "بعد اختيار الفرع، سيعرض Systemly الخدمات وفريق العمل والمواعيد المتاحة في هذا الموقع فقط.",
    powered: "مدعوم بواسطة Systemly",
  },
} as const;

export function BookingBranchPicker({
  businessName,
  logoUrl,
  tagline,
  slug,
  language,
  branches,
}: {
  businessName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  slug: string;
  language: "en" | "ar";
  branches: BookingBranchOption[];
}) {
  const text = copy[language];

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--booking-bg)] antialiased"
    >
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(340px,3fr)] xl:grid-cols-[minmax(0,7fr)_minmax(380px,3fr)]">
        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-[var(--booking-border)]/70 bg-[var(--booking-bg)]/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8 lg:py-5">
            <div className="mx-auto max-w-[600px]">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <Link
                  href={`/${slug}`}
                  className="flex min-w-0 items-center gap-2.5 text-sm font-bold tracking-[0.1em] text-[var(--booking-text)] transition-opacity hover:opacity-80 sm:text-base sm:tracking-[0.12em]"
                >
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-md border border-[var(--booking-border)] object-cover"
                    />
                  ) : null}
                  <span className="truncate">{businessName.toUpperCase()}</span>
                </Link>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--booking-text)] opacity-45 sm:text-[11px]">
                  {text.booking}
                </span>
              </div>

              {tagline?.trim() ? (
                <p className="mt-1.5 truncate text-xs leading-5 text-[var(--booking-muted)] lg:hidden">
                  {tagline}
                </p>
              ) : null}

              <div className="relative mt-5 sm:mt-6 lg:mt-8">
                <div className="grid grid-cols-5 gap-1">
                  {text.steps.map((label, index) => (
                    <div
                      key={label}
                      className="z-10 flex min-w-0 flex-col items-center text-center"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold sm:h-9 sm:w-9 sm:text-xs"
                        style={{
                          backgroundColor: "var(--booking-surface)",
                          color:
                            index === 0
                              ? "var(--accent)"
                              : "var(--booking-muted)",
                          border:
                            index === 0
                              ? "2px solid var(--accent)"
                              : "1px solid var(--booking-border)",
                        }}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`mt-1.5 max-w-full truncate px-1 text-[10px] leading-4 sm:mt-2 sm:text-[11px] ${
                          index === 0
                            ? "font-semibold text-[var(--booking-text)]"
                            : "font-medium text-[var(--booking-muted)]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-[10%] top-4 -z-0 h-px bg-[var(--booking-border)] sm:top-[18px]" />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[600px] px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">
            <div className="rounded-xl border border-[var(--booking-border)] bg-[var(--booking-surface)] p-4 shadow-sm sm:p-6 lg:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--booking-muted)]">
                {text.eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--booking-text)] sm:text-3xl">
                {text.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--booking-muted)]">
                {text.description}
              </p>

              <div className="mt-6 grid gap-3">
                {branches.map((branch) => (
                  <Link
                    key={branch.id}
                    href={`/${slug}/book?branch=${encodeURIComponent(branch.slug)}`}
                    className="group flex items-center gap-4 rounded-xl border border-[var(--booking-border)] p-4 transition hover:border-[var(--accent)] hover:shadow-sm"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--booking-bg)] text-[var(--accent)]">
                      <MapPin size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-[var(--booking-text)] sm:text-base">
                        {branch.name}
                      </strong>
                      <small className="mt-1 block truncate text-xs text-[var(--booking-muted)]">
                        {branch.address || branch.city || text.choose}
                      </small>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-[var(--accent)]">
                      {text.choose}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          <footer className="px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-center lg:hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--booking-muted)]/70">
              {text.powered}
            </p>
          </footer>
        </div>

        <aside
          className="relative hidden min-h-screen overflow-hidden bg-[var(--booking-brand)] lg:block"
          style={{ color: "var(--booking-brand-text)" }}
        >
          <div className="absolute -right-24 top-20 h-64 w-64 rounded-full border border-current opacity-10" />
          <div className="absolute -right-12 top-32 h-64 w-64 rounded-full border border-current opacity-[0.06]" />
          <div className="absolute inset-y-0 left-0 w-px bg-current opacity-10" />

          <div className="relative flex min-h-screen flex-col justify-between p-8 xl:p-10">
            <div className="flex min-w-0 items-center gap-3 text-sm font-semibold">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg border object-cover"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--booking-brand-text) 25%, transparent)",
                  }}
                />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-current text-base opacity-80">
                  {businessName.trim().charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate">{businessName}</span>
            </div>

            <div className="max-w-sm py-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">
                {text.online}
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] xl:text-5xl">
                {text.sideTitle}
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-7 opacity-75 xl:text-base">
                {text.sideCopy}
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">
              {text.powered}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
