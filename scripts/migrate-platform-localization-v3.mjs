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
const EXCLUDED_ATTRIBUTES = new Set([
  "className", "id", "href", "src", "type", "name", "value", "role",
  "htmlFor", "target", "rel", "method", "action", "autoComplete",
  "inputMode", "pattern", "accept", "style", "key",
]);

function normalize(value) {
  return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}
function walk(entry) {
  const absolute = path.join(ROOT, entry);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return absolute.endsWith(".tsx") ? [absolute] : [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((item) => {
    const child = path.join(absolute, item.name);
    return item.isDirectory() ? walk(path.relative(ROOT, child)) : child.endsWith(".tsx") ? [child] : [];
  });
}
function readKeys(filename, variableName) {
  const absolute = path.join(ROOT, filename);
  if (!fs.existsSync(absolute)) return [];
  const source = fs.readFileSync(absolute, "utf8");
  const file = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const keys = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isArrayLiteralExpression(item) || item.elements.length < 2) continue;
        const sourceValue = item.elements[0];
        const targetValue = item.elements[1];
        if (ts.isStringLiteralLike(sourceValue) && ts.isStringLiteralLike(targetValue) && targetValue.text.trim()) keys.push(normalize(sourceValue.text));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return keys;
}
const keys = new Set([
  ...readKeys("src/i18n/platform-copy.ts", "platformLiteralPairs"),
  ...readKeys("src/i18n/natural-arabic.ts", "naturalArabicPairs"),
  ...readKeys("src/i18n/natural-arabic-more.ts", "naturalArabicMorePairs"),
]);
function bodyOf(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && ts.isBlock(node.body)) return node.body;
  return null;
}
function componentName(node) {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if ((ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) return node.parent.name.text;
  return null;
}
function containsJsx(node) {
  let result = false;
  function visit(current) {
    if (result) return;
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current) || ts.isJsxFragment(current)) { result = true; return; }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return result;
}
function isComponent(node) {
  const name = componentName(node);
  const body = bodyOf(node);
  return Boolean(name && /^[A-Z]/.test(name) && body && containsJsx(body));
}
function insideText(node) {
  let current = node.parent;
  while (current) {
    if (ts.isCallExpression(current) && ["text", "t", "translatePlatformText"].includes(current.expression.getText())) return true;
    if (ts.isStatement(current) || ts.isJsxElement(current)) break;
    current = current.parent;
  }
  return false;
}
function canBeClient(source) {
  return !/export\s+(?:const|let|var)\s+metadata\b/.test(source) &&
    !/export\s+async\s+function\s+(?:generateMetadata|generateStaticParams)\b/.test(source) &&
    !/\b(?:cookies|headers)\s*\(/.test(source) &&
    !/export\s+default\s+async\s+function/.test(source);
}
function quote(value) { return JSON.stringify(value); }

function migrate(filename) {
  let source = fs.readFileSync(filename, "utf8");
  if (!canBeClient(source)) return { changed: false, count: 0, skipped: true };
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const bodies = [];
  function collect(node) {
    if (isComponent(node)) bodies.push(bodyOf(node));
    ts.forEachChild(node, collect);
  }
  collect(file);
  const edits = [];
  let count = 0;
  let needsImport = false;

  for (const body of bodies) {
    let changed = false;
    function visit(node) {
      if (node !== body && isComponent(node)) return;
      if (ts.isJsxText(node)) {
        const raw = node.getFullText(file);
        const value = normalize(raw);
        if (value && keys.has(value)) {
          const leading = raw.match(/^\s*/)?.[0] ?? "";
          const trailing = raw.match(/\s*$/)?.[0] ?? "";
          edits.push({ start: node.getFullStart(), end: node.getEnd(), text: `${leading}{text(${quote(value)})}${trailing}` });
          changed = true; count += 1; return;
        }
      }
      if (ts.isJsxAttribute(node) && node.initializer) {
        const name = node.name.getText(file);
        if (!name.startsWith("data-") && !EXCLUDED_ATTRIBUTES.has(name) && ts.isStringLiteral(node.initializer)) {
          const value = normalize(node.initializer.text);
          if (keys.has(value)) {
            edits.push({ start: node.initializer.getStart(file), end: node.initializer.getEnd(), text: `{text(${quote(value)})}` });
            changed = true; count += 1; return;
          }
        }
      }
      if (ts.isJsxExpression(node) && node.expression && (ts.isStringLiteral(node.expression) || ts.isNoSubstitutionTemplateLiteral(node.expression))) {
        const value = normalize(node.expression.text);
        if (keys.has(value) && !insideText(node.expression)) {
          edits.push({ start: node.expression.getStart(file), end: node.expression.getEnd(), text: `text(${quote(value)})` });
          changed = true; count += 1; return;
        }
      }
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !insideText(node)) {
        const value = normalize(node.text);
        const parent = node.parent;
        const conditional = ts.isConditionalExpression(parent) || (ts.isConditionalExpression(parent.parent) && (parent.parent.whenTrue === parent || parent.parent.whenFalse === parent));
        if (conditional && keys.has(value)) {
          edits.push({ start: node.getStart(file), end: node.getEnd(), text: `text(${quote(value)})` });
          changed = true; count += 1; return;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(body);
    if (changed && !/\busePlatformText\s*\(/.test(body.getText(file))) {
      edits.push({ start: body.getStart(file) + 1, end: body.getStart(file) + 1, text: "\n  const text = usePlatformText();" });
      needsImport = true;
    }
  }

  if (!edits.length) return { changed: false, count: 0, skipped: false };
  if (needsImport && !source.includes('from "@/i18n/usePlatformText"')) {
    const directive = source.match(/^\s*["']use client["'];\s*/)?.[0];
    const position = directive ? directive.length : 0;
    const prefix = directive ? "\n" : '"use client";\n\n';
    edits.push({ start: position, end: position, text: `${prefix}import { usePlatformText } from "@/i18n/usePlatformText";\n` });
  } else if (!/^\s*["']use client["'];/m.test(source)) {
    edits.push({ start: 0, end: 0, text: '"use client";\n\n' });
  }
  const unique = new Map();
  for (const edit of edits) unique.set(`${edit.start}:${edit.end}`, edit);
  for (const edit of [...unique.values()].sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  }
  fs.writeFileSync(filename, source);
  return { changed: true, count, skipped: false };
}

let changed = 0;
let translated = 0;
let skipped = 0;
for (const filename of [...new Set(TARGETS.flatMap(walk))]) {
  const result = migrate(filename);
  if (result.changed) { changed += 1; translated += result.count; console.log(`localized ${path.relative(ROOT, filename)} (${result.count})`); }
  if (result.skipped) skipped += 1;
}
console.log(`Localized ${translated} values across ${changed} files; skipped ${skipped} server-only files.`);
