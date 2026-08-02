"use client";

import { usePlatformText } from "@/i18n/usePlatformText";
import { HeartPulse } from "lucide-react";

interface Props {
  diagnosisAssessment: string;
  clinicalSessionNotes: string;
  planAndPrescription: string;
  disabled: boolean;
  onDiagnosisAssessmentChange: (value: string) => void;
  onClinicalSessionNotesChange: (value: string) => void;
  onPlanAndPrescriptionChange: (value: string) => void;
}

const textareaClass =
  "mt-1.5 min-h-28 w-full rounded-xl border border-transparent bg-slate-50 p-3.5 text-sm font-normal text-slate-700 outline-none transition-colors duration-150 hover:bg-slate-100/80 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100/60 disabled:cursor-not-allowed disabled:bg-slate-50/60 disabled:text-slate-400";

export function ClinicVisitSection({
  diagnosisAssessment,
  clinicalSessionNotes,
  planAndPrescription,
  disabled,
  onDiagnosisAssessmentChange,
  onClinicalSessionNotesChange,
  onPlanAndPrescriptionChange,
}: Props) {
  const text = usePlatformText();
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <HeartPulse size={17} />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">{text("Clinic visit record")}</h2>
            <p className="text-xs text-slate-500">
              {text("Clinical information attached to this appointment.")}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
          {text("Clinic")}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-slate-600">
          {text("Diagnosis and assessment")}
          <textarea
            value={diagnosisAssessment}
            disabled={disabled}
            onChange={(event) =>
              onDiagnosisAssessmentChange(event.target.value)
            }
            className={textareaClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          {text("Clinical session notes")}
          <textarea
            value={clinicalSessionNotes}
            disabled={disabled}
            onChange={(event) =>
              onClinicalSessionNotesChange(event.target.value)
            }
            className={textareaClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          {text("Plan and prescription")}
          <textarea
            value={planAndPrescription}
            disabled={disabled}
            onChange={(event) =>
              onPlanAndPrescriptionChange(event.target.value)
            }
            placeholder={text("Add the treatment plan, medication, dosage, instructions, and follow-up details.")}
            className={`${textareaClass} min-h-32`}
          />
        </label>
      </div>
    </section>
  );
}
