export const DEFAULT_PUBLIC_SECTION_ORDER = [
  "hero",
  "services",
  "team",
  "gallery",
  "why",
  "process",
  "about",
  "faq",
  "contact",
] as const;

const allowedSections = new Set<string>(DEFAULT_PUBLIC_SECTION_ORDER);

export function completePublicSectionOrder(sectionOrder: string[]) {
  const result = sectionOrder.filter(
    (section, index) => allowedSections.has(section) && sectionOrder.indexOf(section) === index,
  );

  for (const section of DEFAULT_PUBLIC_SECTION_ORDER) {
    if (result.includes(section)) continue;

    const canonicalIndex = DEFAULT_PUBLIC_SECTION_ORDER.indexOf(section);
    const nextSection = DEFAULT_PUBLIC_SECTION_ORDER.slice(canonicalIndex + 1).find((candidate) =>
      result.includes(candidate),
    );

    if (nextSection) {
      result.splice(result.indexOf(nextSection), 0, section);
    } else {
      result.push(section);
    }
  }

  return result;
}
