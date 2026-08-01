import fs from "node:fs";

const files = [
  "src/i18n/platform-copy.ts",
  "src/i18n/messages.ts",
  "src/i18n/natural-arabic.ts",
  "src/i18n/natural-arabic-more.ts",
  "src/i18n/natural-arabic-final.ts",
];

const replacements = [
  ["مساحة العمل", "نظام الإدارة"],
  ["لم يحضر", "عدم حضور"],
  ["عدم الحضور", "عدم حضور"],
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, "utf8");
  let next = source;
  for (const [before, after] of replacements) {
    next = next.split(before).join(after);
  }
  if (next !== source) {
    fs.writeFileSync(file, next);
    console.log(`updated ${file}`);
  }
}
