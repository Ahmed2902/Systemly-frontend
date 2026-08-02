import fs from "node:fs";
import path from "node:path";

const replacements = new Map([
  ["النظام الذي يدير عملك من الخلف.", "كل ما تحتاجه لإدارة نشاطك في مكان واحد."],
  ["النظام الذي يدير نشاطك من الخلف.", "كل ما تحتاجه لإدارة نشاطك في مكان واحد."],
  ["النظام الذي يدير عملك من الخلف", "كل ما تحتاجه لإدارة نشاطك في مكان واحد"],
  ["النظام الذي يدير نشاطك من الخلف", "كل ما تحتاجه لإدارة نشاطك في مكان واحد"],
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(child);
    return /\.(ts|tsx)$/.test(entry.name) ? [child] : [];
  });
}

let changed = 0;
for (const file of walk("src")) {
  const source = fs.readFileSync(file, "utf8");
  let next = source;
  for (const [before, after] of replacements) next = next.split(before).join(after);
  if (next !== source) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`updated ${file}`);
  }
}
console.log(`Updated ${changed} file(s).`);
