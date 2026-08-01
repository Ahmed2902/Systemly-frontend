import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const TARGETS = [
  "src/app/(marketing)", "src/app/(auth)", "src/app/(onboarding)",
  "src/app/invite", "src/app/operations", "src/modules/landing",
  "src/modules/auth", "src/modules/onboarding", "src/modules/wizard",
  "src/modules/operations", "src/modules/analytics", "src/modules/customers",
  "src/modules/invoices", "src/modules/staff", "src/modules/services",
  "src/modules/settings", "src/shared/components/AuthGuard.tsx",
];
const ATTRS = new Set(["aria-label", "title", "placeholder", "alt", "subtitle", "description", "message", "hint"]);
const ALLOWED = new Set([
  "Systemly", "Google", "Africa/Cairo", "EGP", "PDF", "CSV", "URL", "ID",
  "Inter", "Playfair Display", "NOIR STUDIO", "Mariam Adel", "Yasmine Ali",
  "Salma Tarek", "Salma", "Ahmed Hassan", "Dr. Sarah Jenkins",
  "Aura Wellness — Salon", "Clinic Clarity — Clinic",
  "systemly.app/", "hgezli.com/", "ArrowDown", "Home",
  "analytics-chart-point is-active", "analytics-donut-segment is-active",
  "analytics-lollipop-row is-active", "analytics-heatmap-cell is-active",
  "pl-3.5", "mx-auto max-w-md",
]);
const TECHNICAL = [
  /^https?:\/\//, /^\//, /^#/, /^\./, /^[a-z0-9_-]+$/, /^[A-Z0-9_]+$/,
  /^\d{1,2}:\d{2}$/, /^\d+(px|rem|em|%|ms|s)$/, /^[\w.-]+@[\w.-]+$/,
  /^image\//, /^var\(--/, /^min\(/, /^(GET|POST|PATCH|PUT|DELETE)$/,
  /^(light|dark|system|salon|clinic)$/, /^(showTeam|showFaq|showReviews)$/,
  /^(pending|confirmed|in_progress|completed|no_show|cancelled_by_customer|cancelled_by_business|paid|draft|sent|voided)$/,
  /\b(bg-|text-|border-|hover:|focus:|shadow-|opacity-|translate-|scale-|rotate-|cursor-|object-|font-|items-|justify-|gap-|rounded-|ring-|var\(--)/,
];
const ARABIC_CATALOGUES = [
  ["src/i18n/platform-copy.ts", "platformLiteralPairs"],
  ["src/i18n/natural-arabic.ts", "naturalArabicPairs"],
  ["src/i18n/natural-arabic-more.ts", "naturalArabicMorePairs"],
  ["src/i18n/natural-arabic-final.ts", "naturalArabicFinalPairs"],
];
const BANNED_LITERAL_ARABIC = [
  "النظام الذي يدير نشاطك من الخلف",
  "النظام خلف نشاطك",
];

function walk(entry) {
  const absolute = path.join(ROOT, entry);
  if (!fs.existsSync(absolute)) return [];
  if (fs.statSync(absolute).isFile()) return absolute.endsWith(".tsx") ? [absolute] : [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((item) => {
    const child = path.join(absolute, item.name);
    return item.isDirectory() ? walk(path.relative(ROOT, child)) : child.endsWith(".tsx") ? [child] : [];
  });
}
function normalize(value) { return value.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
function userCopy(value) {
  const text = normalize(value);
  return Boolean(text && /[A-Za-z]/.test(text) && !ALLOWED.has(text) && !TECHNICAL.some((pattern) => pattern.test(text)));
}
function readPairs(filename, variable) {
  const absolute = path.join(ROOT, filename);
  const source = fs.readFileSync(absolute, "utf8");
  const file = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const pairs = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variable && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isArrayLiteralExpression(item) || item.elements.length < 2) continue;
        const [sourceValue, targetValue] = item.elements;
        if (ts.isStringLiteralLike(sourceValue) && ts.isStringLiteralLike(targetValue) && targetValue.text.trim()) {
          pairs.push([normalize(sourceValue.text), normalize(targetValue.text)]);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return pairs;
}
const cataloguePairs = ARABIC_CATALOGUES.flatMap(([filename, variable]) => readPairs(filename, variable));
const catalogue = new Set(cataloguePairs.map(([source]) => source));
function callName(node) { return ts.isCallExpression(node) ? node.expression.getText() : ""; }
function translated(node) {
  let current = node.parent;
  while (current) {
    const name = callName(current);
    if (name === "text" || name === "t" || name.endsWith(".t") || name === "translatePlatformText") return true;
    if (ts.isStatement(current) || ts.isJsxElement(current)) break;
    current = current.parent;
  }
  return false;
}

const problems = [];
for (const [source, arabic] of cataloguePairs) {
  if (/[٠-٩]/.test(arabic)) {
    problems.push(`[Arabic digits] ${JSON.stringify(source)} -> ${JSON.stringify(arabic)}`);
  }
  for (const banned of BANNED_LITERAL_ARABIC) {
    if (arabic.includes(banned)) {
      problems.push(`[Literal Arabic] ${JSON.stringify(source)} -> ${JSON.stringify(arabic)}`);
    }
  }
}

for (const filename of [...new Set(TARGETS.flatMap(walk))]) {
  const source = fs.readFileSync(filename, "utf8");
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (node, kind, value) => {
    const { line, character } = file.getLineAndCharacterOfPosition(node.getStart(file));
    problems.push(`${path.relative(ROOT, filename)}:${line + 1}:${character + 1} [${kind}] ${JSON.stringify(normalize(value))}`);
  };
  function visit(node) {
    if (ts.isJsxText(node) && userCopy(node.getText(file))) report(node, "JSX text", node.getText(file));
    if (ts.isJsxAttribute(node) && ATTRS.has(node.name.getText(file)) && node.initializer && ts.isStringLiteral(node.initializer) && userCopy(node.initializer.text)) report(node.initializer, "attribute", node.initializer.text);
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && userCopy(node.text) && !translated(node)) {
      const parent = node.parent;
      if (ts.isJsxExpression(parent) || ts.isConditionalExpression(parent) || ts.isConditionalExpression(parent.parent)) report(node, "expression", node.text);
    }
    if (callName(node) === "text" && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
      const key = normalize(node.arguments[0].text);
      if (userCopy(key) && !catalogue.has(key)) report(node.arguments[0], "missing catalogue entry", key);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
}

const unique = [...new Set(problems)].sort();
if (unique.length) {
  console.error(`Found ${unique.length} platform localization issue(s):\n${unique.join("\n")}`);
  process.exit(1);
}
console.log(`Localization audit passed with ${catalogue.size} explicit Arabic entries and the approved product voice.`);
