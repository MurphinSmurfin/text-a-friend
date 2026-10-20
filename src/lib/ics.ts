const p = (n: number) => String(n).padStart(2, "0");
const local = (d: Date) =>
  `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;

/** A weekly Monday event in floating local time, which calendars import as a repeating reminder. */
export function mondayReminder(
  start: Date,
  url: string,
  now = new Date(),
): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Text-A-Friend//EN",
    "BEGIN:VEVENT",
    `UID:monday-${local(start)}@text-a-friend`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${local(start)}`,
    "DURATION:PT15M",
    "RRULE:FREQ=WEEKLY;BYDAY=MO",
    "SUMMARY:Spin the wheel",
    `DESCRIPTION:Pick this week's friend: ${url}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
