import { Check, CircleDollarSign, Save } from "lucide-react";
import { AppointmentActionCard } from "./AppointmentActionCard";

interface Props {
  saving: boolean;
  actionRunning: boolean;
  editable: boolean;
  dirty: boolean;
  paid: boolean;
  status: string;
  onSave: () => void;
  onCollect: () => void;
  onNoShow: () => void;
}

export function AppointmentQuickActions({
  saving,
  actionRunning,
  editable,
  dirty,
  paid,
  status,
  onSave,
  onCollect,
  onNoShow,
}: Props) {
  return (
    <section className="self-start rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">Quick Actions</h2>
        {dirty ? (
          <span className="text-xs font-medium text-amber-600">Unsaved changes</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2.5">
        <AppointmentActionCard
          icon={<Save size={16} />}
          label={saving ? "Saving changes…" : "Save changes"}
          tone="blue"
          disabled={!editable || !dirty || saving || actionRunning}
          onClick={onSave}
        />
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
      </div>
    </section>
  );
}
