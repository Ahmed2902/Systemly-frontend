"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { getPlatformLiteralMap } from "./platform-copy";

const PLATFORM_ROOTS = new Set([
  "",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "verify-email",
  "resend-verification",
  "oauth-callback",
  "onboarding",
  "operations",
  "invite",
  "contact",
  "privacy",
  "terms",
]);

const ATTRIBUTE_NAMES = [
  "aria-label",
  "title",
  "placeholder",
  "alt",
] as const;

const ENGLISH_DATE_PARTS: ReadonlyArray<readonly [string, string]> = [
  ["Sunday", "الأحد"],
  ["Monday", "الاثنين"],
  ["Tuesday", "الثلاثاء"],
  ["Wednesday", "الأربعاء"],
  ["Thursday", "الخميس"],
  ["Friday", "الجمعة"],
  ["Saturday", "السبت"],
  ["Sun", "الأحد"],
  ["Mon", "الاثنين"],
  ["Tue", "الثلاثاء"],
  ["Wed", "الأربعاء"],
  ["Thu", "الخميس"],
  ["Fri", "الجمعة"],
  ["Sat", "السبت"],
  ["January", "يناير"],
  ["February", "فبراير"],
  ["March", "مارس"],
  ["April", "أبريل"],
  ["May", "مايو"],
  ["June", "يونيو"],
  ["July", "يوليو"],
  ["August", "أغسطس"],
  ["September", "سبتمبر"],
  ["October", "أكتوبر"],
  ["November", "نوفمبر"],
  ["December", "ديسمبر"],
  ["Jan", "يناير"],
  ["Feb", "فبراير"],
  ["Mar", "مارس"],
  ["Apr", "أبريل"],
  ["Jun", "يونيو"],
  ["Jul", "يوليو"],
  ["Aug", "أغسطس"],
  ["Sep", "سبتمبر"],
  ["Oct", "أكتوبر"],
  ["Nov", "نوفمبر"],
  ["Dec", "ديسمبر"],
];

function isPlatformPath(pathname: string): boolean {
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  return PLATFORM_ROOTS.has(firstSegment);
}

function replaceLiteral(value: string, map: Map<string, string>, arabic: boolean) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const exact = map.get(trimmed);
  if (exact) return value.replace(trimmed, exact);

  let translated = value;
  const entries = [...map.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) {
    if (source.length < 3 || !translated.includes(source)) continue;
    translated = translated.split(source).join(target);
  }

  if (arabic) {
    translated = translated
      .replace(/\b(\d+) appointments shown\b/g, "$1 مواعيد معروضة")
      .replace(/\b1 appointment shown\b/g, "موعد واحد معروض")
      .replace(/\b(\d+) customers?\b/g, "$1 عميل")
      .replace(/\b(\d+) services?\b/g, "$1 خدمة")
      .replace(/\b(\d+) staff\b/g, "$1 موظف")
      .replace(/\bStep (\d+) of (\d+)\b/g, "الخطوة $1 من $2")
      .replace(/\bEGP\s*/g, "ج.م. ")
      .replace(/\b(\d+) min\b/g, "$1 دقيقة")
      .replace(/\b(\d+) minutes\b/g, "$1 دقيقة")
      .replace(/\b(\d+) hours?\b/g, "$1 ساعة");

    for (const [english, ar] of ENGLISH_DATE_PARTS) {
      translated = translated.replace(new RegExp(`\\b${english}\\b`, "g"), ar);
    }
  }

  return translated;
}

function shouldSkipElement(element: Element | null) {
  if (!element) return false;
  return Boolean(
    element.closest(
      "script, style, code, pre, [data-no-platform-translate], [contenteditable='true']",
    ),
  );
}

function translateTextNode(node: Text, map: Map<string, string>, arabic: boolean) {
  if (shouldSkipElement(node.parentElement)) return;
  const next = replaceLiteral(node.data, map, arabic);
  if (next !== node.data) node.data = next;
}

function translateElement(element: Element, map: Map<string, string>, arabic: boolean) {
  if (shouldSkipElement(element)) return;

  for (const attribute of ATTRIBUTE_NAMES) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const next = replaceLiteral(value, map, arabic);
    if (next !== value) element.setAttribute(attribute, next);
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const type = element instanceof HTMLInputElement ? element.type : "";
    if (["email", "tel", "url", "number"].includes(type)) {
      element.dir = "ltr";
    } else if (!element.dir) {
      element.dir = "auto";
    }
  }
}

function translateTree(root: Node, map: Map<string, string>, arabic: boolean) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, map, arabic);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
    return;
  }

  if (root instanceof Element) translateElement(root, map, arabic);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current as Text, map, arabic);
    } else if (current instanceof Element) {
      translateElement(current, map, arabic);
    }
    current = walker.nextNode();
  }
}

export function PlatformAutoTranslator() {
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    if (!isPlatformPath(pathname)) return;

    const map = getPlatformLiteralMap(locale);
    const arabic = locale === "ar";
    const root = document.body;

    translateTree(root, map, arabic);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTree(mutation.target, map, arabic);
          continue;
        }
        mutation.addedNodes.forEach((node) => translateTree(node, map, arabic));
      }
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [locale, pathname]);

  return null;
}
