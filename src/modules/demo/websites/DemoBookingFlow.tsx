"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Clock3 } from "lucide-react";

export type DemoBookingVertical = "salon" | "clinic";

type DemoService = {
  id: string;
  name: string;
  category?: string | null;
  durationMin: number;
  priceEgp: number;
};

type DemoStaff = {
  id: string;
  name: string;
  jobTitle?: string | null;
};

type StoredDemoBooking = {
  id: string;
  vertical: DemoBookingVertical;
  customerName: string;
  customerPhone: string;
  serviceIndex: number;
  serviceName: string;
  staffIndex: number;
  staffName: string;
  startsAt: string;
  createdAt: string;
};

const STORAGE_KEY = "systemly-demo-public-bookings-v1";

function tomorrowDate() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

function demoSlots(date: string) {
  return ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map(
    (time) => ({
      display: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(`${date}T${time}:00`)),
      value: time,
    }),
  );
}

function saveDemoBooking(booking: StoredDemoBooking) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as StoredDemoBooking[];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...current].slice(0, 20)));
  } catch {
    // Demo confirmation should still work if storage is blocked.
  }
}

export function DemoBookingFlow({
  vertical,
  businessName,
  services,
  staff,
}: {
  vertical: DemoBookingVertical;
  businessName: string;
  services: DemoService[];
  staff: DemoStaff[];
}) {
  const [step, setStep] = useState(1);
  const [serviceIndex, setServiceIndex] = useState<number | null>(null);
  const [staffIndex, setStaffIndex] = useState<number | null>(null);
  const [date, setDate] = useState(tomorrowDate);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const slots = useMemo(() => demoSlots(date), [date]);
  const service = serviceIndex === null ? null : services[serviceIndex];
  const member = staffIndex === null ? null : staff[staffIndex];
  const siteHref = `/demo/websites/${vertical}`;
  const operationsHref = `/demo/operations/${vertical}/calendar`;

  function confirm() {
    if (!service || !member || !time || !name.trim() || !phone.trim()) return;
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    saveDemoBooking({
      id: `public-${Date.now()}`,
      vertical,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      serviceIndex: serviceIndex ?? 0,
      serviceName: service.name,
      staffIndex: staffIndex ?? 0,
      staffName: member.name,
      startsAt,
      createdAt: new Date().toISOString(),
    });
    setDone(true);
  }

  if (done && service && member && time) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Check size={22} strokeWidth={2.5} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Booking confirmed
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your appointment is reserved.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This is an interactive Systemly demo. Your demo booking is stored in this browser so you can open the operations calendar and see the customer-side flow continue into reception.
          </p>

          <dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-5 text-sm">
            <div className="flex justify-between gap-4 py-4"><dt className="text-slate-400">Service</dt><dd className="text-right font-medium">{service.name}</dd></div>
            <div className="flex justify-between gap-4 py-4"><dt className="text-slate-400">{vertical === "clinic" ? "Doctor / staff" : "Artist"}</dt><dd className="text-right font-medium">{member.name}</dd></div>
            <div className="flex justify-between gap-4 py-4"><dt className="text-slate-400">Date</dt><dd className="text-right font-medium">{date}</dd></div>
            <div className="flex justify-between gap-4 py-4"><dt className="text-slate-400">Time</dt><dd className="text-right font-medium">{slots.find((slot) => slot.value === time)?.display}</dd></div>
          </dl>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href={siteHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Back to website
            </Link>
            <Link href={operationsHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              View in operations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-8 text-slate-950 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href={siteHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950">
            <ArrowLeft size={16} /> {businessName}
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Step {step} of 4</span>
        </div>

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Online booking</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {step === 1 && "Choose a service"}
              {step === 2 && (vertical === "clinic" ? "Choose your doctor or staff member" : "Choose your artist")}
              {step === 3 && "Choose an available time"}
              {step === 4 && "Your details"}
            </h1>
          </div>

          <div className="p-6 sm:p-8">
            {step === 1 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => setServiceIndex(index)} className={`rounded-2xl border p-4 text-left transition ${serviceIndex === index ? "border-slate-950 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                    <div className="font-semibold">{item.name}</div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {item.durationMin} min</span>
                      <span>{item.priceEgp} EGP</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {staff.map((person, index) => (
                  <button key={person.id} type="button" onClick={() => setStaffIndex(index)} className={`rounded-2xl border p-4 text-left transition ${staffIndex === index ? "border-slate-950 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                    <div className="font-semibold">{person.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{person.jobTitle || "Team member"}</div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  Date
                  <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setDate(event.target.value); setTime(null); }} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-slate-500" />
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button key={slot.value} type="button" onClick={() => setTime(slot.value)} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${time === slot.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 hover:border-slate-400"}`}>{slot.display}</button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">Full name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-slate-500" /></label>
                <label className="text-sm font-medium text-slate-700">Phone number<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 outline-none focus:border-slate-500" /></label>
                <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <strong className="text-slate-950">{service?.name}</strong> with {member?.name} on {date} at {slots.find((slot) => slot.value === time)?.display}.
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 border-t border-slate-100 px-6 py-5 sm:px-8">
            <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1} className="min-h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 disabled:opacity-40">Back</button>
            {step < 4 ? (
              <button type="button" onClick={() => setStep((current) => Math.min(4, current + 1))} disabled={(step === 1 && serviceIndex === null) || (step === 2 && staffIndex === null) || (step === 3 && !time)} className="min-h-11 flex-1 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-40">Continue</button>
            ) : (
              <button type="button" onClick={confirm} disabled={!name.trim() || !phone.trim()} className="min-h-11 flex-1 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-40">Confirm booking</button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
