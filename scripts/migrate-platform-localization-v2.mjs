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
const VISIBLE_PROPERTIES = new Set([
  "label", "title", "subtitle", "description", "copy", "message",
  "placeholder", "emptyTitle", "emptyDescription", "eyebrow", "kicker", "note",
]);

function normalize(value) {
  return value.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

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

function readKeys(filename, names) {
  const absolute = path.join(ROOT, filename);
  if (!fs.existsSync(absolute)) return new Set();
  const source = fs.readFileSync(absolute, "utf8");
  const sourceFile = ts.createSourceFile(absolute, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const keys = new Set();
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && names.has(node.name.text) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const item of node.initializer.elements) {
        if (!ts.isArrayLiteralExpression(item) || item.elements.length < 2) continue;
        const first = item.elements[0];
        const second = item.elements[1];
        if (ts.isStringLiteralLike(first) && ts.isStringLiteralLike(second) && second.text.trim()) keys.add(normalize(first.text));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return keys;
}

const translations = new Set([
  ...readKeys("src/i18n/platform-copy.ts", new Set(["platformLiteralPairs"])),
  ...readKeys("src/i18n/natural-arabic.ts", new Set(["naturalArabicPairs"])),
]);

function componentName(node) {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) return node.parent.name.text;
  return null;
}
function bodyOf(node) {
  if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) && ts.isBlock(node.body)) return node.body;
  return null;
}
function hasJsx(node) {
  let found = false;
  function visit(current) {
    if (found) return;
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current) || ts.isJsxFragment(current)) { found = true; return; }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}
function isComponent(node) {
  const name = componentName(node);
  const body = bodyOf(node);
  return Boolean(name && /^[A-Z]/.test(name) && body && hasJsx(body));
}
function insideTextCall(node) {
  let current = node.parent;
  while (current) {
    if (ts.isCallExpression(current) && current.expression.getText() === "text") return true;
    if (ts.isStatement(current) || ts.isJsxElement(current)) break;
    current = current.parent;
  }
  return false;
}
function quote(value) { return JSON.stringify(value); }

function migrate(filename) {
  let source = fs.readFileSync(filename, "utf8");
  if (!/^\s*["']use client["'];/m.test(source)) return { changed: false, count: 0 };
  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const componentBodies = [];
  function collect(node) {
    if (isComponent(node)) componentBodies.push(bodyOf(node));
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);

  let count = 0;
  let needsImport = false;
  for (const body of componentBodies) {
    let changed = false;
    function visit(node) {
      if (node !== body && isComponent(node)) return;

      if (ts.isJsxText(node)) {
        const raw = node.getFullText(sourceFile);
        const value = normalize(raw);
        if (value && translations.has(value)) {
          const leading = raw.match(/^\s*/)?.[0] ?? "";
          const trailing = raw.match(/\s*$/)?.[0] ?? "";
          edits.push({ start: node.getFullStart(), end: node.getEnd(), text: `${leading}{text(${quote(value)})}${trailing}` });
          changed = true; count += 1; return;
        }
      }

      if (ts.isJsxAttribute(node) && node.initializer) {
        const attr = node.name.getText(sourceFile);
        if (!attr.startsWith("data-") && !EXCLUDED_ATTRIBUTES.has(attr)) {
          if (ts.isStringLiteral(node.initializer)) {
            const value = normalize(node.initializer.text);
            if (translations.has(value)) {
              edits.push({ start: node.initializer.getStart(sourceFile), end: node.initializer.getEnd(), text: `{text(${quote(value)})}` });
              changed = true; count += 1; return;
            }
          }
          if (ts.isJsxExpression(node.initializer) && node.initializer.expression && ts.isPropertyAccessExpression(node.initializer.expression) && VISIBLE_PROPERTIES.has(node.initializer.expression.name.text) && !insideTextCall(node.initializer.expression)) {
            const expression = node.initializer.expression.getText(sourceFile);
            edits.push({ start: node.initializer.expression.getStart(sourceFile), end: node.initializer.expression.getEnd(), text: `text(${expression})` });
            changed = true; count += 1; return;
          }
        }
      }

      if (ts.isJsxExpression(node) && node.expression) {
        const expression = node.expression;
        if ((ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) && translations.has(normalize(expression.text)) && !insideTextCall(expression)) {
          edits.push({ start: expression.getStart(sourceFile), end: expression.getEnd(), text: `text(${quote(normalize(expression.text))})` });
          changed = true; count += 1; return;
        }
        if (ts.isPropertyAccessExpression(expression) && VISIBLE_PROPERTIES.has(expression.name.text) && !insideTextCall(expression)) {
          const value = expression.getText(sourceFile);
          edits.push({ start: expression.getStart(sourceFile), end: expression.getEnd(), text: `text(${value})` });
          changed = true; count += 1; return;
        }
      }

      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && translations.has(normalize(node.text)) && !insideTextCall(node)) {
        const parent = node.parent;
        if (ts.isConditionalExpression(parent) || (ts.isConditionalExpression(parent.parent) && (parent.parent.whenTrue === parent || parent.parent.whenFalse === parent))) {
          edits.push({ start: node.getStart(sourceFile), end: node.getEnd(), text: `text(${quote(normalize(node.text))})` });
          changed = true; count += 1; return;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(body);
    if (changed && !/\busePlatformText\s*\(/.test(body.getText(sourceFile))) {
      edits.push({ start: body.getStart(sourceFile) + 1, end: body.getStart(sourceFile) + 1, text: "\n  const text = usePlatformText();" });
      needsImport = true;
    }
  }

  if (!edits.length) return { changed: false, count: 0 };
  if (needsImport && !source.includes('from "@/i18n/usePlatformText"')) {
    const directive = source.match(/^\s*["']use client["'];\s*/)?.[0];
    const at = directive ? directive.length : 0;
    edits.push({ start: at, end: at, text: '\nimport { usePlatformText } from "@/i18n/usePlatformText";\n' });
  }

  const unique = new Map();
  for (const edit of edits) unique.set(`${edit.start}:${edit.end}`, edit);
  for (const edit of [...unique.values()].sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  }
  fs.writeFileSync(filename, source);
  return { changed: true, count };
}

const files = [...new Set(TARGETS.flatMap(walkFiles))];
let changed = 0;
let count = 0;
for (const file of files) {
  const result = migrate(file);
  if (result.changed) {
    changed += 1; count += result.count;
    console.log(`localized ${path.relative(ROOT, file)} (${result.count})`);
  }
}
console.log(`Localized ${count} additional values across ${changed} files using ${translations.size} catalogue keys.`);
