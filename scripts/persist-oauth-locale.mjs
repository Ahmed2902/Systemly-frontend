import fs from "node:fs";

const file = "src/modules/auth/components/OAuthCallbackPanel.tsx";
let source = fs.readFileSync(file, "utf8");

function addImport(statement, anchor) {
  if (source.includes(statement)) return;
  const index = source.indexOf(anchor);
  if (index < 0) throw new Error(`Import anchor not found: ${anchor}`);
  source = source.slice(0, index) + `${statement}\n` + source.slice(index);
}

addImport('import { useLocale } from "@/i18n/LocaleProvider";', 'import { useAuth }');
addImport('import { updatePreferredLanguage } from "../auth.api";', 'import { useAuth }');

if (!source.includes("const { locale } = useLocale();")) {
  const authHook = source.match(/const \{[^\n]*setSession[^\n]*\} = useAuth\(\);/);
  if (!authHook) throw new Error("Could not find OAuth setSession hook");
  source = source.replace(authHook[0], `${authHook[0]}\n  const { locale } = useLocale();`);
}

const patterns = [
  /setSession\(([^,]+),\s*([^\)]+)\);/,
  /setSession\(response\.data\.user,\s*response\.data\.accessToken\);/,
];
let replaced = source.includes("await updatePreferredLanguage(locale, accessToken)");

if (!replaced) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (!match) continue;
    const full = match[0];
    const userExpression = match[1] ?? "response.data.user";
    const tokenExpression = match[2] ?? "response.data.accessToken";
    source = source.replace(
      full,
      `const accessToken = ${tokenExpression.trim()};\n      const sessionUser = ${userExpression.trim()};\n      try {\n        await updatePreferredLanguage(locale, accessToken);\n      } catch (preferenceError) {\n        console.error(\"Unable to persist OAuth language preference:\", preferenceError);\n      }\n      setSession(\n        { ...sessionUser, preferredLanguage: locale },\n        accessToken,\n      );`,
    );
    replaced = true;
    break;
  }
}

if (!replaced) throw new Error("Could not find OAuth session assignment");
fs.writeFileSync(file, source);
console.log(`updated ${file}`);
