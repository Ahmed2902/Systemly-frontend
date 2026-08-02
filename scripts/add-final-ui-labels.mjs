import fs from "node:fs";

const file = "src/i18n/natural-arabic-final.ts";
let source = fs.readFileSync(file, "utf8");
const pairs = [
  ["Show password", "إظهار كلمة المرور"],
  ["Hide password", "إخفاء كلمة المرور"],
  ["Primary navigation", "القائمة الرئيسية"],
  ["Systemly home", "الصفحة الرئيسية لـ Systemly"],
  ["Loading account", "جارٍ تحميل الحساب"],
  ["Loading public site link", "جارٍ تحميل رابط الموقع العام"],
  ["Public site link unavailable", "رابط الموقع العام غير متاح"],
];
for (const [english, arabic] of pairs) {
  if (source.includes(`[${JSON.stringify(english)},`)) continue;
  source = source.replace(/\n\];\s*$/, `\n  [${JSON.stringify(english)}, ${JSON.stringify(arabic)}],\n];\n`);
}
fs.writeFileSync(file, source);
console.log(`updated ${file}`);
