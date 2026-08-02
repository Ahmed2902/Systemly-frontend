import fs from "node:fs";

const file = "src/i18n/config.ts";
let source = fs.readFileSync(file, "utf8");
source = source
  .replace('): "ar-EG" | "en-EG" {', '): "ar-EG-u-nu-latn" | "en-EG" {')
  .replace('return locale === "ar" ? "ar-EG" : "en-EG";', 'return locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG";');
if (!source.includes('"ar-EG-u-nu-latn"')) throw new Error("Could not enforce Latin digits");
fs.writeFileSync(file, source);
console.log(`updated ${file}`);
