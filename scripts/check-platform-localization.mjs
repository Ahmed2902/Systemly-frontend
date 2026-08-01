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
]);

const ALLOWED_PATTERNS = [
  /^https?:\/\//,
  /^\//,
  /^#/, 
  /^\.?\.?\//,
  /^[a-z0-9_-]+$/,
  /^[A-Z0-9_]+$/,
  /^\d{1,2}:\d{2}$/,
  /^\d+(px|rem|em|%|ms|s)$/,
  /^[\w.-]+@[\w.-]+$/,
  /^(GET|POST|PATCH|PUT|DELETE)$/,
  /^(light|dark|system)$/,
  /^(salon|clinic)$/,
  /^(pending|confirmed|in_progress|completed|no_show|cancelled_by_customer|cancelled_by_business|paid|draft|sent|voided)$/,
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
  return value.replace(/\s+/g, " ").trim();
}

function isEnglishCopy(value) {
  const normalized = normalize(value);
  if (!normalized || !/[A-Za-z]/.test(normalized)) return false;
  if (ALLOWED_EXACT.has(normalized)) return false;
  if (ALLOWED_PATTERNS.some((pattern) => pattern.test(normalized))) return false;
  return normalized.length >= 2;
}

function isTranslated(node) {
  let current = node.parent;
  while (current) {
    if (ts.isCallExpression(current)) {
      const expression = current.expression.getText();
      if (
        expression === "text" ||
        expression === "t" ||
        expression.endsWith(".t") ||
        expression === "translatePlatformText"
      ) {
        return true;
      }
    }
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
      const isVisibleExpression =
        ts.isJsxExpression(parent) ||
        ts.isConditionalExpression(parent) ||
        ts.isArrayLiteralExpression(parent) ||
        (ts.isPropertyAssignment(parent) &&
          ts.isIdentifier(parent.name) &&
          /^(label|title|subtitle|description|copy|message|placeholder|emptyTitle|emptyDescription|eyebrow|kicker|note|name)$/i.test(
            parent.name.text,
          ));

      if (isVisibleExpression) report(node, node.text, "string expression");
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
  console.error(`Found ${ordered.length} platform strings that are not explicitly localized:\n`);
  for (const finding of ordered) {
    console.error(
      `${finding.file}:${finding.location} [${finding.kind}] ${JSON.stringify(finding.value)}`,
    );
  }
  process.exit(1);
}

console.log(`Localization audit passed across ${files.length} platform files.`);
