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
const callback = read(callbackPath);
const authApi = read(authApiPath);

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
