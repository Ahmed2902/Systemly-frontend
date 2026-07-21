import { Check, CircleDollarSign, XCircle } from "lucide-react";
import { AppointmentActionCard } from "./AppointmentActionCard";

interface Props {
  actionRunning: boolean;
  editable: boolean;
  dirty: boolean;
  canCancel: boolean;
  paid: boolean;
  status: string;
  onCollect: () => void;
  onNoShow: () => void;
  onCancel: () => void;
}

export function AppointmentQuickActions({
  actionRunning,
  editable,
  dirty,
  canCancel,
  paid,
  status,
  onCollect,
  onNoShow,
  onCancel,
}: Props) {
  return (
    <section className="self-start rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Quick Actions</h2>

      <div className="mt-4 space-y-2.5">
        <AppointmentActionCard
          icon={<CircleDollarSign size={16} />}
          label={paid ? "Payment collected" : "Collect payment"}
          tone="green"
          disabled={!editable || dirty || paid || actionRunning}
          onClick={onCollect}
        />
        <AppointmentActionCard
          icon={<Check size={16} />}
          label="Mark no-show"
          disabled={
            !editable ||
            !["pending", "confirmed"].includes(status) ||
            actionRunning
          }
          onClick={onNoShow}
        />
        <AppointmentActionCard
          icon={<XCircle size={16} />}
          label="Cancel appointment"
          tone="red"
          disabled={!canCancel || actionRunning}
          onClick={onCancel}
        />
      </div>
    </section>
  );
}
