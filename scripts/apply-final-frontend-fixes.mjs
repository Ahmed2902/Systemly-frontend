import fs from "node:fs";

function update(path, transform) {
  const source = fs.readFileSync(path, "utf8");
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next);
  console.log(`${next !== source ? "updated" : "unchanged"} ${path}`);
}

update("src/modules/staff/components/StaffFormModal.tsx", (source) =>
  source.replace(
    '{!service.isActive ? " · Inactive" : ""}',
    '{!service.isActive ? ` · ${text("Inactive")}` : ""}',
  ),
);

update("src/modules/staff/components/StaffProfileScreen.tsx", (source) =>
  source
    .replace(
      /([>\s])← Back to staff(\s*<\/Link>)/,
      '$1{text("← Back to staff")}$2',
    )
    .replace(
      /(<h2[^>]*>)Upcoming appointments(<\/h2>)/,
      '$1{text("Upcoming appointments")}$2',
    ),
);

for (const [path, subtitle] of [
  ["src/app/(auth)/forgot-password/page.tsx", "Enter the email connected to your account and we will send a secure reset link."],
  ["src/app/(auth)/reset-password/page.tsx", "Use a strong password that you do not reuse on another service."],
  ["src/app/(auth)/verify-email/page.tsx", "We are validating your email verification link and preparing your workspace."],
  ["src/app/(auth)/resend-verification/page.tsx", "Enter your email and we will send a fresh verification link."],
  ["src/app/(auth)/oauth-callback/page.tsx", "We are securely connecting your Google account to Systemly."],
]) {
  update(path, (source) =>
    source.replace(
      `subtitle=${JSON.stringify(subtitle)}`,
      `subtitle={text(${JSON.stringify(subtitle)})}`,
    ),
  );
}
