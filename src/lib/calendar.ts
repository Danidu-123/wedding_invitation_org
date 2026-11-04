import { WEDDING } from "./config";

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const title = `Wedding of ${WEDDING.groom} & ${WEDDING.bride}`;
const location = `${WEDDING.venue.name} (${WEDDING.venue.hall}), ${WEDDING.venue.address}`;
const details = `Poruwa ceremony at ${WEDDING.poruwaLabel}. Celebration ${WEDDING.timeLabel}.`;

export function googleCalendarUrl() {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${utc(WEDDING.celebrationStart)}/${utc(WEDDING.celebrationEnd)}`,
    details,
    location,
    ctz: "Asia/Colombo",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadIcs() {
  const esc = (s: string) => s.replace(/[,;\\]/g, (m) => `\\${m}`);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Thinidu and Chenaji//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:thinidu-chenaji-20261210@wedding",
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(WEDDING.celebrationStart)}`,
    `DTEND:${utc(WEDDING.celebrationEnd)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(details)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Wedding tomorrow",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "Thinidu-Chenaji-Wedding.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
