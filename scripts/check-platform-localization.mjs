import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const TARGETS = [
  "src/app/(marketing)",
  "src/app/(auth)",
  "src/app/(onboarding)",
  "src/app/invite",
  "src/app/operations",
  "src/modules/landing",
  "src/modules/auth",
  "src/modules/onboarding",
  "src/modules/wizard",
  "src/modules/operations",
  "src/modules/analytics",
  "src/modules/customers",
  "src/modules/invoices",
  "src/modules/staff",
  "src/modules/services",
  "src/modules/settings",
  "src/shared/components/AuthGuard.tsx",
];

const USER_FACING_ATTRIBUTES = new Set([
  "aria-label",
  "title",
  "placeholder",
  "alt",
  "label",
  "description",
  "emptyTitle",
  "emptyDescription",
]);

const ALLOWED_EXACT = new Set([
  "Systemly",
  "Google",
  "Africa/Cairo",
  "EGP",
  "PDF",
  "CSV",
  "URL",
  "ID",
  "AM",
  "PM",
  "Inter",
  "Playfair Display",
  "NOIR STUDIO",
  "Mariam Adel",
  "Yasmine Ali",
  "Salma Tarek",
  "Salma",
  "Ahmed Hassan",
  "Dr. Sarah Jenkins",
  "Aura Wellness — Salon",
  "Clinic Clarity — Clinic",
]);

const ALLOWED_PATTERNS = [
  /^https?:\/\//,
  /^\//,
  /^#/,
  /^\.?\.?\//,
  /^\./,
  /^[a-z0-9_-]+$/,
  /^[A-Z0-9_]+$/,
  /^\d{1,2}:\d{2}$/,
  /^\d+(px|rem|em|%|ms|s)$/,
  /^[\w.-]+@[\w.-]+$/,
  /^image\//,
  /^var\(--/,
  /^min\(/,
  /^(GET|POST|PATCH|PUT|DELETE)$/,
  /^(light|dark|system)$/,
  /^(salon|clinic)$/,
  /^(pending|confirmed|in_progress|completed|no_show|cancelled_by_customer|cancelled_by_business|paid|draft|sent|voided)$/,
  /^(showTeam|showFaq|showReviews)$/,
  /^(systemly\.app|hgezli\.com)\/$/,
  /^(bg|text|border|hover|focus|shadow|opacity|translate|scale|rotate|cursor|pl|pr|pt|pb|px|py|h|w|flex|grid|invisible|visible|truncate)[-:[\]/]/,
  /\b(var\(--|bg-|text-|border-|hover:|focus:|shadow-|opacity-|translate-|scale-|rotate-|cursor-|object-|font-|items-|justify-|gap-|rounded-|ring-)/,
  /^(?:[a-z0-9:[\]/.-]+\s+)+[a-z0-9:[\]/.-]+$/,
];

function walkFiles(entry) {
  const absolute = path.join(ROOT, entry);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return absolute.endsWith(".tsx") ? [absolute] : [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((item) => {
    const child = path.join(absolute, item.name);
    if (item.isDirectory()) return walkFiles(path.relative(ROOT, child));
    return child.endsWith(".tsx") ? [child] : [];
  });
}

function normalize(value) {
  return value.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function isEnglishCopy(value) {
  const normalized = normalize(value);
  if (!normalized || !/[A-Za-z]/.test(normalized)) return false;
  if (ALLOWED_EXACT.has(normalized)) return false;
  if (ALLOWED_PATTERNS.some((pattern) => pattern.test(normalized))) return false;
  return normalized.length >= 2;
}

function readPairKeys(filename, variableNames) {
  const absolute = path.join(ROOT, filename);
  if (!fs.existsSync(absolute)) return new Set();
  const source = fs.readFileSync(absolute, "utf8");
  const sourceFile = ts.createSourceFile(
    absolute,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const keys = new Set();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      variableNames.has(node.name.text) &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const item of node.initializer.elements) {
        if (!ts.isArrayLiteralExpression(item) || item.elements.length < 2) continue;
        const sourceElement = item.elements[0];
        const targetElement = item.elements[1];
        if (
          ts.isStringLiteralLike(sourceElement) &&
          ts.isStringLiteralLike(targetElement) &&
          targetElement.text.trim()
        ) {
          keys.add(normalize(sourceElement.text));
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return keys;
}

const translationKeys = new Set([
  ...readPairKeys("src/i18n/platform-copy.ts", new Set(["platformLiteralPairs"])),
  ...readPairKeys("src/i18n/natural-arabic.ts", new Set(["naturalArabicPairs"])),
  ...readPairKeys("src/i18n/natural-arabic-more.ts", new Set(["naturalArabicMorePairs"])),
]);

function translationCallName(node) {
  if (!ts.isCallExpression(node)) return null;
  return node.expression.getText();
}

function isTranslationCall(node) {
  const expression = translationCallName(node);
  return Boolean(
    expression === "text" ||
      expression === "t" ||
      expression?.endsWith(".t") ||
      expression === "translatePlatformText",
  );
}

function requiresPlatformCatalogue(node) {
  const expression = translationCallName(node);
  return expression === "text" || expression === "translatePlatformText";
}

function isTranslated(node) {
  let current = node.parent;
  while (current) {
    if (isTranslationCall(current)) return true;
    if (ts.isStatement(current) || ts.isJsxElement(current)) break;
    current = current.parent;
  }
  return false;
}

function lineAndColumn(sourceFile, position) {
  const location = sourceFile.getLineAndCharacterOfPosition(position);
  return `${location.line + 1}:${location.character + 1}`;
}

const findings = [];
const files = [...new Set(TARGETS.flatMap(walkFiles))];

for (const filename of files) {
  const source = fs.readFileSync(filename, "utf8");
  const sourceFile = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  function report(node, value, kind) {
    findings.push({
      file: path.relative(ROOT, filename),
      location: lineAndColumn(sourceFile, node.getStart(sourceFile)),
      kind,
      value: normalize(value),
    });
  }

  function visit(node) {
    if (ts.isJsxText(node)) {
      const value = normalize(node.getText(sourceFile));
      if (isEnglishCopy(value)) report(node, value, "JSX text");
    }

    if (
      ts.isJsxAttribute(node) &&
      USER_FACING_ATTRIBUTES.has(node.name.getText(sourceFile)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      isEnglishCopy(node.initializer.text)
    ) {
      report(node.initializer, node.initializer.text, `attribute ${node.name.getText(sourceFile)}`);
    }

    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      isEnglishCopy(node.text) &&
      !isTranslated(node)
    ) {
      const parent = node.parent;
      const directJsxValue = ts.isJsxExpression(parent);
      const conditionalValue =
        ts.isConditionalExpression(parent) ||
        (ts.isConditionalExpression(parent.parent) &&
          (parent.parent.whenTrue === parent || parent.parent.whenFalse === parent));
      if (directJsxValue || conditionalValue) {
        report(node, node.text, "string expression");
      }
    }

    if (requiresPlatformCatalogue(node) && node.arguments.length > 0) {
      const key = node.arguments[0];
      if (
        (ts.isStringLiteral(key) || ts.isNoSubstitutionTemplateLiteral(key)) &&
        isEnglishCopy(key.text) &&
        !translationKeys.has(normalize(key.text))
      ) {
        report(key, key.text, "missing Arabic catalogue entry");
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const unique = new Map();
for (const finding of findings) {
  unique.set(`${finding.file}:${finding.location}:${finding.value}`, finding);
}
const ordered = [...unique.values()].sort((a, b) =>
  `${a.file}:${a.location}`.localeCompare(`${b.file}:${b.location}`),
);

if (ordered.length) {
  console.error(`Found ${ordered.length} platform localization issues:\n`);
  for (const finding of ordered) {
    console.error(
      `${finding.file}:${finding.location} [${finding.kind}] ${JSON.stringify(finding.value)}`,
    );
  }
  process.exit(1);
}

console.log(
  `Localization audit passed across ${files.length} platform files with ${translationKeys.size} Arabic catalogue entries.`,
);
