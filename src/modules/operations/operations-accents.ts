export const OPERATIONS_ACCENTS = [
  {
    card:
      "border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-white",
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    link: "text-violet-700 hover:text-violet-800",
    pill: "bg-violet-50 text-violet-700 ring-violet-200/70",
  },
  {
    card:
      "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-white",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    link: "text-emerald-700 hover:text-emerald-800",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  },
  {
    card:
      "border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-white",
    icon: "bg-orange-100 text-orange-700",
    badge: "bg-orange-100 text-orange-700",
    link: "text-orange-700 hover:text-orange-800",
    pill: "bg-orange-50 text-orange-700 ring-orange-200/70",
  },
  {
    card:
      "border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-white",
    icon: "bg-sky-100 text-sky-700",
    badge: "bg-sky-100 text-sky-700",
    link: "text-sky-700 hover:text-sky-800",
    pill: "bg-sky-50 text-sky-700 ring-sky-200/70",
  },
  {
    card:
      "border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-white",
    icon: "bg-rose-100 text-rose-700",
    badge: "bg-rose-100 text-rose-700",
    link: "text-rose-700 hover:text-rose-800",
    pill: "bg-rose-50 text-rose-700 ring-rose-200/70",
  },
] as const;

export function getOperationsAccent(value: string, index = 0) {
  const hash = [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return OPERATIONS_ACCENTS[(hash + index) % OPERATIONS_ACCENTS.length];
}
