import type { CSSProperties } from "react";

type PaletteInput = {
  accent?: string | null;
  fallbackAccent: string;
  secondary?: string | null;
  fallbackSecondary: string;
  background: string;
  surface: string;
  soft: string;
  text: string;
  muted: string;
  border: string;
  dark: string;
};

type Rgb = { r: number; g: number; b: number };

function parseHex(value: string): Rgb | null {
  const clean = value.trim().replace(/^#/, "");
  const expanded = clean.length === 3
    ? clean.split("").map((character) => `${character}${character}`).join("")
    : clean;

  if (!/^[\da-fA-F]{6}$/.test(expanded)) return null;

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb) {
  const channel = (value: number) => Math.round(value).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function mix(source: Rgb, target: Rgb, amount: number) {
  return toHex({
    r: source.r + (target.r - source.r) * amount,
    g: source.g + (target.g - source.g) * amount,
    b: source.b + (target.b - source.b) * amount,
  });
}

function luminance({ r, g, b }: Rgb) {
  const transform = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function createTemplatePalette(input: PaletteInput) {
  const fallback = parseHex(input.fallbackAccent) ?? { r: 0, g: 128, b: 96 };
  const parsedAccent = parseHex(input.accent || "");
  const accentRgb = parsedAccent ?? fallback;
  const accent = parsedAccent ? toHex(parsedAccent) : input.fallbackAccent;
  const fallbackSecondary = parseHex(input.fallbackSecondary) ?? { r: 226, g: 230, b: 228 };
  const parsedSecondary = parseHex(input.secondary || "");
  const secondaryRgb = parsedSecondary ?? fallbackSecondary;
  const secondary = parsedSecondary ? toHex(parsedSecondary) : input.fallbackSecondary;
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };

  return {
    "--accent": accent,
    "--accent-strong": mix(accentRgb, black, 0.32),
    "--accent-deep": mix(accentRgb, black, 0.5),
    "--accent-ink": mix(accentRgb, black, 0.68),
    "--accent-soft": mix(accentRgb, white, 0.88),
    "--accent-wash": mix(accentRgb, white, 0.95),
    "--accent-contrast": luminance(accentRgb) > 0.46 ? "#171918" : "#FFFFFF",
    "--secondary": secondary,
    "--secondary-strong": mix(secondaryRgb, black, 0.24),
    "--secondary-deep": mix(secondaryRgb, black, 0.5),
    "--secondary-ink": mix(secondaryRgb, black, 0.68),
    "--secondary-soft": mix(secondaryRgb, white, 0.82),
    "--secondary-wash": mix(secondaryRgb, white, 0.93),
    "--background": input.background,
    "--surface": input.surface,
    "--soft": input.soft,
    "--text": input.text,
    "--muted": input.muted,
    "--border": input.border,
    "--dark": input.dark,
  } as CSSProperties;
}
