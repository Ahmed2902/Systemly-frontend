import "./operations.css";
import { Suspense } from "react";
import { OperationsProvider } from "@/modules/operations/operations.context";
import { NewAppointmentModal } from "@/modules/operations/components/NewAppointment";
import { OperationsShell } from "@/modules/operations/components/OperationsShell";
import { OperationsThemeProvider } from "@/modules/operations/operations-theme";

const themeBootScript = `(() => {
  try {
    const nextKey = "systemly-operations-theme";
    const legacyKey = "hgezli-operations-theme";
    const stored = localStorage.getItem(nextKey) || localStorage.getItem(legacyKey);
    const theme = stored === "light" || stored === "dark"
      ? stored
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    localStorage.setItem(nextKey, theme);
    localStorage.removeItem(legacyKey);
    document.documentElement.dataset.operationsTheme = theme;
    document.documentElement.classList.toggle("operations-dark", theme === "dark");
    document.documentElement.classList.toggle("operations-light", theme === "light");
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      <OperationsThemeProvider>
        <OperationsProvider>
          <div className="operations-workspace h-screen min-h-0 overflow-hidden">
            <OperationsShell>
              <Suspense fallback={<div className="h-full" />}>{children}</Suspense>
            </OperationsShell>
          </div>
          <NewAppointmentModal />
        </OperationsProvider>
      </OperationsThemeProvider>
    </>
  );
}
