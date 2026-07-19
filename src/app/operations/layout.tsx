import { Sidebar } from "@/modules/operations/components/Sidebar";
import { OperationsProvider } from "@/modules/operations/operations.context";
import { NewAppointmentModal } from "@/modules/operations/components/NewAppointment";

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OperationsProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <NewAppointmentModal />
    </OperationsProvider>
  );
}
