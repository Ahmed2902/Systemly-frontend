import fs from "node:fs";

function update(path, replacements) {
  let source = fs.readFileSync(path, "utf8");
  let changed = false;
  for (const [before, after] of replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) throw new Error(`Pattern not found in ${path}: ${before}`);
    source = source.replace(before, after);
    changed = true;
  }
  if (changed) fs.writeFileSync(path, source);
  console.log(`${changed ? "updated" : "unchanged"} ${path}`);
}

update("src/modules/staff/components/StaffFormModal.tsx", [
  [
    '{!service.isActive ? " · Inactive" : ""}',
    '{!service.isActive ? ` · ${text("Inactive")}` : ""}',
  ],
]);

update("src/modules/staff/components/StaffProfileScreen.tsx", [
  [">← Back to staff</Link>", '>{text("← Back to staff")}</Link>'],
  [">Upcoming appointments</h2>", '>{text("Upcoming appointments")}</h2>'],
]);

for (const [path, subtitle] of [
  ["src/app/(auth)/forgot-password/page.tsx", "Enter the email connected to your account and we will send a secure reset link."],
  ["src/app/(auth)/reset-password/page.tsx", "Use a strong password that you do not reuse on another service."],
  ["src/app/(auth)/verify-email/page.tsx", "We are validating your email verification link and preparing your workspace."],
  ["src/app/(auth)/resend-verification/page.tsx", "Enter your email and we will send a fresh verification link."],
  ["src/app/(auth)/oauth-callback/page.tsx", "We are securely connecting your Google account to Systemly."],
]) {
  update(path, [[`subtitle=${JSON.stringify(subtitle)}`, `subtitle={text(${JSON.stringify(subtitle)})}`]]);
}
