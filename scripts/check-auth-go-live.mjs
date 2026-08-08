import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`auth go-live check failed: ${message}`);
    process.exitCode = 1;
  }
}

function collectFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return [];

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [relativePath];

  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) return collectFiles(child);
    return /\.(?:ts|tsx|js|jsx|css)$/.test(entry.name) ? [child] : [];
  });
}

const callbackPath = "src/modules/auth/components/OAuthCallbackPanel.tsx";
const authApiPath = "src/modules/auth/auth.api.ts";
const sharedApiPath = "src/shared/lib/api.ts";
const bookingApiPath = "src/modules/booking/booking.api.ts";
const manualBookingApiPath = "src/modules/operations/NewAppointment.api.ts";
const wizardApiPath = "src/modules/wizard/wizard.api.ts";
const wizardPreviewPath = "src/modules/wizard/wizard.preview.ts";
const customizePath = "src/modules/wizard/components/StepCustomizePreview.tsx";
const serviceStaffPath = "src/modules/wizard/components/StepServiceStaff.tsx";

const callback = read(callbackPath);
const authApi = read(authApiPath);
const sharedApi = read(sharedApiPath);
const bookingApi = read(bookingApiPath);
const manualBookingApi = read(manualBookingApiPath);
const wizardApi = read(wizardApiPath);
const wizardPreview = read(wizardPreviewPath);
const customize = read(customizePath);
const serviceStaff = read(serviceStaffPath);

// The OAuth callback must never recover a Systemly access token from the URL.
assert(!callback.includes("useSearchParams"), `${callbackPath} must not read callback query parameters`);
assert(!/searchParams\s*\.\s*get\s*\(\s*["']token["']\s*\)/.test(callback), `${callbackPath} must not read a token query parameter`);
assert(!/[?&]token=/.test(callback), `${callbackPath} must not construct token-bearing URLs`);

// The browser-bound refresh cookie is the session hand-off from the backend.
for (const requiredSymbol of ["refreshAccessToken", "getCurrentUser", "setSession"]) {
  assert(callback.includes(requiredSymbol), `${callbackPath} must use ${requiredSymbol}`);
}
assert(
  /requestWithCsrf<RefreshResponse>\(\s*["']\/auth\/refresh["']/.test(authApi),
  `${authApiPath} must refresh through the CSRF-protected request helper`,
);
assert(
  /credentials:\s*["']include["']/.test(authApi),
  `${authApiPath} must send browser cookies on auth requests`,
);

// Backend main uses a nested error envelope: { success:false, error:{ code, message, ... } }.
assert(
  sharedApi.includes("nestedError?.message"),
  `${sharedApiPath} must read nested backend error messages`,
);
assert(
  sharedApi.includes("nestedError?.code"),
  `${sharedApiPath} must preserve nested backend error codes`,
);
assert(
  authApi.includes("normalizeApiError"),
  `${authApiPath} must normalize nested backend errors for auth forms`,
);
assert(
  authApi.includes("nested?.code"),
  `${authApiPath} must preserve nested auth error codes such as EMAIL_NOT_VERIFIED and CSRF_INVALID`,
);

// Scheduling timezone is owned by the business on backend main, never the browser.
for (const [file, source] of [
  [bookingApiPath, bookingApi],
  [manualBookingApiPath, manualBookingApi],
]) {
  assert(
    !/params\.set\(\s*["']timezone["']/.test(source),
    `${file} must not send a browser timezone to booking availability`,
  );
}
assert(
  !/timezone\??:\s*string/.test(bookingApi),
  `${bookingApiPath} booking payload must not expose a browser timezone override`,
);

// Pre-business onboarding media must use the dedicated authenticated onboarding flow.
assert(
  wizardApi.includes("/onboarding/media/asset/presign"),
  `${wizardApiPath} must presign onboarding uploads through /onboarding/media`,
);
assert(
  wizardApi.includes("/onboarding/media/asset/confirm"),
  `${wizardApiPath} must confirm onboarding uploads before persisting their URLs`,
);
assert(
  !wizardApi.includes("/photos/gallery/presign"),
  `${wizardApiPath} must not use post-onboarding /photos routes before a business exists`,
);

// Backend main does not persist these future website controls yet. Do not present or submit them.
for (const unsupportedField of ["heroDescription:", "heroCardText:", "showServicePrices:"]) {
  assert(
    !wizardApi.includes(unsupportedField),
    `${wizardApiPath} must not submit unsupported field ${unsupportedField}`,
  );
}
assert(
  wizardPreview.includes('heroDescription: ""') &&
    wizardPreview.includes('heroCardText: ""') &&
    wizardPreview.includes("showServicePrices: true"),
  `${wizardPreviewPath} must mirror the defaults returned by the current backend`,
);
assert(
  customize.includes('className="onboarding-field hidden">\n              <label>{text("Hero introduction")}</label>') &&
    customize.includes('className="onboarding-field hidden">\n              <label>{text("Hero image highlight")}</label>') &&
    customize.includes('className="hidden items-center justify-between') &&
    customize.includes('text("Show service prices")'),
  `${customizePath} must hide website controls that backend main cannot persist`,
);

// Onboarding must respect backend service/role validation independent of UI language.
assert(
  serviceStaff.includes("priceEgp: 1,") && serviceStaff.includes("min={1}"),
  `${serviceStaffPath} must prevent zero-priced services that backend onboarding rejects`,
);
assert(
  !serviceStaff.includes('role === text("Receptionist")') &&
    !serviceStaff.includes('role !== text("Receptionist")'),
  `${serviceStaffPath} must compare stored role enums, not localized labels`,
);

// User-facing go-live surfaces must use the Systemly identity.
const identityRoots = [
  "src/app/(auth)",
  "src/app/invite",
  "src/modules/auth",
  "src/modules/wizard/components/LivePreviewPane.tsx",
];
const staleBrandFiles = identityRoots
  .flatMap(collectFiles)
  .filter((file) => /hgezli/i.test(read(file)));

assert(
  staleBrandFiles.length === 0,
  `stale Hgezli branding remains in go-live surfaces: ${staleBrandFiles.join(", ")}`,
);

if (!process.exitCode) {
  console.log("auth go-live contract passed");
}
