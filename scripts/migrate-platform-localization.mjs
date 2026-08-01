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

const EXCLUDED_ATTRIBUTE_NAMES = new Set([
  "className",
  "id",
  "href",
  "src",
  "type",
  "name",
  "value",
  "role",
  "htmlFor",
  "target",
  "rel",
  "method",
  "action",
  "autoComplete",
  "inputMode",
  "pattern",
  "accept",
]);

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

function readTranslations() {
  const filename = path.join(ROOT, "src/i18n/platform-copy.ts");
  const source = fs.readFileSync(filename, "utf8");
  const sourceFile = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const translations = new Set();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "platformLiteralPairs" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const item of node.initializer.elements) {
        if (!ts.isArrayLiteralExpression(item) || item.elements.length < 2) continue;
        const english = item.elements[0];
        if (ts.isStringLiteralLike(english)) translations.add(english.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return translations;
}

function componentName(node) {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text;
  }
  return null;
}

function functionBody(node) {
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return ts.isBlock(node.body) ? node.body : null;
  }
  return null;
}

function containsJsx(node) {
  let found = false;
  function visit(current) {
    if (found) return;
    if (
      ts.isJsxElement(current) ||
      ts.isJsxSelfClosingElement(current) ||
      ts.isJsxFragment(current)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

function isComponentFunction(node) {
  const name = componentName(node);
  const body = functionBody(node);
  return Boolean(name && /^[A-Z]/.test(name) && body && containsJsx(body));
}

function hasLatinLetters(value) {
  return /[A-Za-z]/.test(value);
}

function isInsideTranslateCall(node) {
  let current = node.parent;
  while (current) {
    if (
      ts.isCallExpression(current) &&
      ts.isIdentifier(current.expression) &&
      ["text", "t", "translatePlatformText"].includes(current.expression.text)
    ) {
      return true;
    }
    if (ts.isStatement(current) || ts.isJsxElement(current)) break;
    current = current.parent;
  }
  return false;
}

function isExcludedString(node) {
  const parent = node.parent;
  if (
    ts.isImportDeclaration(parent) ||
    ts.isExportDeclaration(parent) ||
    ts.isExternalModuleReference(parent) ||
    ts.isLiteralTypeNode(parent)
  ) {
    return true;
  }

  if (
    (ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent) || ts.isMethodDeclaration(parent)) &&
    parent.name === node
  ) {
    return true;
  }

  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === node) return true;
  if (ts.isCaseClause(parent)) return true;

  if (ts.isJsxAttribute(parent)) {
    const name = parent.name.getText();
    return name.startsWith("data-") || EXCLUDED_ATTRIBUTE_NAMES.has(name);
  }

  if (ts.isCallExpression(parent)) {
    const expression = parent.expression.getText();
    if (
      expression.startsWith("console.") ||
      expression.includes("router.push") ||
      expression.includes("router.replace") ||
      expression === "fetch" ||
      expression === "api" ||
      expression.endsWith("api") ||
      expression.includes("URLSearchParams")
    ) {
      return true;
    }
  }

  return false;
}

function quote(value) {
  return JSON.stringify(value);
}

function migrateFile(filename, translations) {
  const source = fs.readFileSync(filename, "utf8");
  const client = /^\s*["']use client["'];/m.test(source);
  if (!client) return { changed: false, replacements: 0 };

  const sourceFile = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const components = [];

  function collect(node) {
    if (isComponentFunction(node)) components.push(node);
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);

  const edits = [];
  let replacementCount = 0;
  let needsImport = false;

  for (const component of components) {
    const body = functionBody(component);
    if (!body) continue;
    let componentChanged = false;

    function visit(node) {
      if (node !== component && isComponentFunction(node)) return;

      if (ts.isJsxText(node)) {
        const raw = node.getFullText(sourceFile);
        const value = raw.trim();
        if (value && hasLatinLetters(value) && translations.has(value)) {
          const leading = raw.match(/^\s*/)?.[0] ?? "";
          const trailing = raw.match(/\s*$/)?.[0] ?? "";
          edits.push({
            start: node.getFullStart(),
            end: node.getEnd(),
            text: `${leading}{text(${quote(value)})}${trailing}`,
          });
          replacementCount += 1;
          componentChanged = true;
        }
        return;
      }

      if (
        ts.isJsxAttribute(node) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        const name = node.name.getText(sourceFile);
        const value = node.initializer.text;
        if (
          !name.startsWith("data-") &&
          !EXCLUDED_ATTRIBUTE_NAMES.has(name) &&
          hasLatinLetters(value) &&
          translations.has(value)
        ) {
          edits.push({
            start: node.initializer.getStart(sourceFile),
            end: node.initializer.getEnd(),
            text: `{text(${quote(value)})}`,
          });
          replacementCount += 1;
          componentChanged = true;
          return;
        }
      }

      if (
        (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        hasLatinLetters(node.text) &&
        translations.has(node.text) &&
        !isExcludedString(node) &&
        !isInsideTranslateCall(node)
      ) {
        edits.push({
          start: node.getStart(sourceFile),
          end: node.getEnd(),
          text: `text(${quote(node.text)})`,
        });
        replacementCount += 1;
        componentChanged = true;
        return;
      }

      ts.forEachChild(node, visit);
    }

    visit(body);

    if (componentChanged && !/\busePlatformText\s*\(/.test(body.getText(sourceFile))) {
      edits.push({
        start: body.getStart(sourceFile) + 1,
        end: body.getStart(sourceFile) + 1,
        text: "\n  const text = usePlatformText();",
      });
      needsImport = true;
    }
  }

  if (!edits.length) return { changed: false, replacements: 0 };

  if (needsImport && !source.includes('from "@/i18n/usePlatformText"')) {
    const directive = source.match(/^\s*["']use client["'];\s*/)?.[0];
    const insertAt = directive ? directive.length : 0;
    edits.push({
      start: insertAt,
      end: insertAt,
      text: '\nimport { usePlatformText } from "@/i18n/usePlatformText";\n',
    });
  }

  const unique = new Map();
  for (const edit of edits) unique.set(`${edit.start}:${edit.end}`, edit);
  const ordered = [...unique.values()].sort((a, b) => b.start - a.start);
  let output = source;
  for (const edit of ordered) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }

  fs.writeFileSync(filename, output);
  return { changed: output !== source, replacements: replacementCount };
}

const translations = readTranslations();
const files = [...new Set(TARGETS.flatMap(walkFiles))];
let changedFiles = 0;
let replacements = 0;

for (const filename of files) {
  const result = migrateFile(filename, translations);
  if (result.changed) {
    changedFiles += 1;
    replacements += result.replacements;
    console.log(`localized ${path.relative(ROOT, filename)} (${result.replacements})`);
  }
}

console.log(`Localized ${replacements} literals across ${changedFiles} files.`);
