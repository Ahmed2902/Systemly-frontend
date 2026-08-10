"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePlatformText } from "@/i18n/usePlatformText";
import { Check, CircleDollarSign, RotateCcw, XCircle } from "lucide-react";
import { useAuth } from "@/modules/auth/useAuth";
import { revertAppointment } from "@/modules/operations/Calendar.api";
import { AppointmentActionCard } from "./AppointmentActionCard";
import { OperationsDropdown } from "../OperationsDropdown";
import type { PaymentMethod } from "@/modules/invoices/invoices.types";

const paymentMethodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MOBILE_WALLET", label: "Mobile wallet" },
];

interface Props {
  actionRunning: boolean;
  editable: boolean;
  dirty: boolean;
  canCancel: boolean;
  paid: boolean;
  status: string;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
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
  paymentMethod,
  onPaymentMethodChange,
  onCollect,
  onNoShow,
  onCancel,
}: Props) {
  const text = usePlatformText();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { accessToken, user } = useAuth();
  const [reverting, setReverting] = useState(false);
  const canRevert = paid || status === "completed" || status === "no_show";

  async function handleRevert() {
    if (!canRevert || !appointmentId || !accessToken || !user?.businessId) return;
    if (!confirm("Reopen this appointment for editing?")) return;

    setReverting(true);
    try {
      await revertAppointment(appointmentId, accessToken, user.businessId);
      window.location.reload();
    } finally {
      setReverting(false);
    }
  }

  return (
    <section className="self-start rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">{text("Quick Actions")}</h2>

      <div className="mt-4 space-y-2.5">
        {canRevert ? (
          <AppointmentActionCard
            icon={<RotateCcw size={16} />}
            label={reverting ? text("Reverting…") : text("Revert")}
            disabled={actionRunning || reverting}
            onClick={() => void handleRevert()}
          />
        ) : null}
        {!paid ? (
          <div className="pb-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {text("Payment method")}
            </label>
            <OperationsDropdown
              value={paymentMethod}
              options={paymentMethodOptions}
              disabled={!editable || dirty || actionRunning}
              onChange={(value) =>
                onPaymentMethodChange(value as PaymentMethod)
              }
              aria-label={text("Payment method")}
            />
          </div>
        ) : null}
        <AppointmentActionCard
          icon={<CircleDollarSign size={16} />}
          label={paid ? text("Payment collected") : text("Collect payment")}
          tone="green"
          disabled={!editable || dirty || paid || actionRunning}
          onClick={onCollect}
        />
        <AppointmentActionCard
          icon={<Check size={16} />}
          label={text("Mark no-show")}
          disabled={
            !editable ||
            !["pending", "confirmed"].includes(status) ||
            actionRunning
          }
          onClick={onNoShow}
        />
        <AppointmentActionCard
          icon={<XCircle size={16} />}
          label={text("Cancel appointment")}
          tone="red"
          disabled={!canCancel || actionRunning}
          onClick={onCancel}
        />
      </div>
    </section>
  );
}
