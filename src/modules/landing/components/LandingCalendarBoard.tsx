"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { usePlatformText } from "@/i18n/usePlatformText";
import type { CSSProperties } from "react";

type CalendarTone =
  | "confirmed"
  | "progress"
  | "completed"
  | "locked"
  | "break";

type CalendarEvent = {
  id: string;
  appointmentId?: string;
  customer: string;
  service: string;
  time: string;
  left: string;
  width: string;
  tone: CalendarTone;
  sequence?: string;
};

type CalendarRow = {
  id: string;
  initials: string;
  name: string;
  role: string;
  events: CalendarEvent[];
};

const HOURS = ["9:00", "10:00", "11:00", "12:00"];

const ROWS: CalendarRow[] = [
  {
    id: "staff-nour",
    initials: "NK",
    name: "Nour Khalil",
    role: "Senior stylist",
    events: [
      {
        id: "event-mariam",
        appointmentId: "appt-1",
        customer: "Mariam Adel",
        service: "Haircut & blow-dry",
        time: "9:15 – 10:00",
        left: "7%",
        width: "25%",
        tone: "confirmed",
      },
      {
        id: "event-break",
        customer: "Break",
        service: "30 min",
        time: "11:00 – 11:30",
        left: "57%",
        width: "14%",
        tone: "break",
      },
    ],
  },
  {
    id: "staff-mona",
    initials: "MA",
    name: "Mona Adel",
    role: "Nail technician",
    events: [
      {
        id: "event-yasmine-one",
        appointmentId: "appt-2",
        customer: "Yasmine Ali",
        service: "Gel manicure",
        time: "10:00 – 10:45",
        left: "27%",
        width: "23%",
        tone: "progress",
        sequence: "1/2",
      },
    ],
  },
  {
    id: "staff-lina",
    initials: "DL",
    name: "Dr. Lina Hassan",
    role: "Dermatologist",
    events: [
      {
        id: "event-yasmine-two",
        appointmentId: "appt-2",
        customer: "Yasmine Ali",
        service: "Skin consultation",
        time: "11:00 – 11:45",
        left: "52%",
        width: "23%",
        tone: "progress",
        sequence: "2/2",
      },
      {
        id: "event-salma",
        appointmentId: "appt-3",
        customer: "Salma Tarek",
        service: "Skin follow-up",
        time: "12:00 – 12:30",
        left: "80%",
        width: "17%",
        tone: "locked",
      },
    ],
  },
];

export function LandingCalendarBoard({
  variant = "workspace",
  selectedAppointmentId = null,
  onSelectAppointment,
}: {
  variant?: "workspace" | "story";
  selectedAppointmentId?: string | null;
  onSelectAppointment?: (appointmentId: string) => void;
}) {
  const text = usePlatformText();
  const { locale } = useLocale();
  return (
    <div
      className={`landing-calendar-preview landing-calendar-preview-${variant}`}
      aria-label={text("Systemly staff calendar preview")}
      dir="ltr"
    >
      <div className="landing-calendar-preview-head">
        <span dir={locale === "ar" ? "rtl" : "ltr"}>{text("Team member")}</span>
        <div>
          {HOURS.map((hour) => (
            <b key={hour}>{localizeTime(hour, locale)}</b>
          ))}
        </div>
      </div>

      {ROWS.map((row) => (
        <div className="landing-calendar-preview-row" key={row.id}>
          <div className="landing-calendar-preview-staff" dir={locale === "ar" ? "rtl" : "ltr"}>
            <span>{row.initials}</span>
            <div>
              <strong>{text(row.name)}</strong>
              <small>{text(row.role)}</small>
            </div>
          </div>

          <div className="landing-calendar-preview-timeline">
            {row.events.map((event) => (
              <PreviewEvent
                event={event}
                key={event.id}
                locale={locale}
                selected={
                  Boolean(event.appointmentId) &&
                  event.appointmentId === selectedAppointmentId
                }
                onSelectAppointment={onSelectAppointment}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewEvent({
  event,
  locale,
  selected,
  onSelectAppointment,
}: {
  event: CalendarEvent;
  locale: "en" | "ar";
  selected: boolean;
  onSelectAppointment?: (appointmentId: string) => void;
}) {
  const text = usePlatformText();
  const className = `landing-calendar-preview-event is-${event.tone}${
    selected ? " is-selected" : ""
  }`;
  const style = {
    left: event.left,
    width: event.width,
  } satisfies CSSProperties;
  const customer = text(event.customer);
  const service = text(event.service);
  const time = localizeTime(event.time, locale);
  const content = (
    <>
      {event.sequence ? <i>{event.sequence}</i> : null}
      <span>{time}</span>
      <strong>{customer}</strong>
      <small>{service}</small>
    </>
  );

  if (event.appointmentId && onSelectAppointment) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => onSelectAppointment(event.appointmentId as string)}
        aria-label={`${customer}, ${service}, ${time}`}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={style} dir={locale === "ar" ? "rtl" : "ltr"}>
      {content}
    </div>
  );
}

function localizeTime(value: string, locale: "en" | "ar") {
  if (locale !== "ar") return value;
  return value
    .replace(/9:(\d{2})/g, "9:$1 ص")
    .replace(/10:(\d{2})/g, "10:$1 ص")
    .replace(/11:(\d{2})/g, "11:$1 ص")
    .replace(/12:(\d{2})/g, "12:$1 م");
}
