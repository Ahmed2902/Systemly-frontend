import "./operations-dark-fixes.css";
import "./operations-production-polish.css";
import { Suspense } from "react";
import { Sidebar } from "@/modules/operations/components/Sidebar";
import { OperationsProvider } from "@/modules/operations/operations.context";
import { NewAppointmentModal } from "@/modules/operations/components/NewAppointment";
import { OperationsThemeProvider } from "@/modules/operations/operations-theme";

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OperationsThemeProvider>
      <OperationsProvider>
        <div className="operations-workspace flex h-screen min-h-0 overflow-hidden transition-colors duration-200">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-hidden">
            <Suspense fallback={<div className="h-full" />}>{children}</Suspense>
          </main>
        </div>
        <NewAppointmentModal />
      </OperationsProvider>
    </OperationsThemeProvider>
  );
}
