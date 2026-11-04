import { WEDDING } from "@/lib/config";

export type RsvpStatus = "pending" | "accepted" | "maybe" | "declined";

export type Guest = {
  id: string;
  name: string;
  phone: string | null;
  invite_code: string;
  invited_count: number;
  invitation_sent: boolean;
  invitation_sent_at: string | null;
  rsvp: RsvpStatus;
  attendees: number | null;
  message: string | null;
  notes: string | null;
  source: "admin" | "self";
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_META: Record<RsvpStatus, { label: string; badge: string; dot: string }> = {
  accepted: { label: "Accepted", badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/20", dot: "bg-emerald-500" },
  maybe: { label: "Maybe", badge: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  declined: { label: "Declined", badge: "bg-rose-50 text-rose-800 ring-rose-600/20", dot: "bg-rose-500" },
  pending: { label: "No response", badge: "bg-slate-100 text-slate-700 ring-slate-500/20", dot: "bg-slate-400" },
};

/** Mirrors public.normalize_phone in the database. Returns null for empty, throws on invalid. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("0")) d = "94" + d.slice(1);
  else if (d.length === 9) d = "94" + d;
  if (!/^\d{9,15}$/.test(d)) throw new Error("Please enter a valid phone number, e.g. 077 123 4567");
  return d;
}

export function formatPhone(p: string | null) {
  if (!p) return "—";
  if (p.startsWith("94") && p.length === 11) return `0${p.slice(2, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
  return `+${p}`;
}

export function inviteLink(code: string) {
  return `${window.location.origin}/i/${code}`;
}

export function whatsappUrl(g: Guest) {
  const text = [
    `Dear ${g.name},`,
    "",
    "With joy in our hearts, we warmly invite you to celebrate our wedding.",
    "",
    `💍 ${WEDDING.groom} & ${WEDDING.bride}`,
    `📅 ${WEDDING.dateLabel}`,
    `⏰ Poruwa ceremony ${WEDDING.poruwaLabel} · Celebration ${WEDDING.timeLabel}`,
    `📍 ${WEDDING.venue.name} — ${WEDDING.venue.hall}, ${WEDDING.venue.address}`,
    "",
    `Please open your invitation and kindly confirm your attendance on or before ${WEDDING.rsvpDeadlineLabel}:`,
    inviteLink(g.invite_code),
    "",
    "With love,",
    `${WEDDING.groom} & ${WEDDING.bride}`,
  ].join("\n");
  return `https://wa.me/${g.phone ?? ""}?text=${encodeURIComponent(text)}`;
}

export function computeStats(guests: Guest[]) {
  const by = (s: RsvpStatus) => guests.filter((g) => g.rsvp === s);
  const seats = (list: Guest[]) => list.reduce((n, g) => n + (g.attendees ?? 0), 0);
  return {
    total: guests.length,
    invitedSeats: guests.reduce((n, g) => n + g.invited_count, 0),
    sent: guests.filter((g) => g.invitation_sent).length,
    accepted: by("accepted").length,
    acceptedSeats: seats(by("accepted")),
    maybe: by("maybe").length,
    maybeSeats: seats(by("maybe")),
    declined: by("declined").length,
    pending: by("pending").length,
  };
}
