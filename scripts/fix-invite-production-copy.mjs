import fs from "node:fs";

const file = "src/app/operations/staff/invite/page.tsx";
const source = fs.readFileSync(file, "utf8");
const before = 'description={text("Create a secure invitation link and send it manually until production email delivery is active.")}';
const after = 'description={text("The invitation expires automatically. You can copy and send it through WhatsApp or another trusted channel.")}';
if (!source.includes(before) && !source.includes(after)) {
  throw new Error("Invitation description pattern not found");
}
fs.writeFileSync(file, source.replace(before, after));
