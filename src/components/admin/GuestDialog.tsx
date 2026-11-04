"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { STATUS_META, formatPhone, normalizePhone, type Guest, type RsvpStatus } from "@/lib/admin/guests";
import { supabaseBrowser } from "@/lib/supabase/client";

const input =
  "w-full rounded-lg border border-navy-900/15 bg-white px-3.5 py-2.5 text-[15px] focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 focus:outline-none";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 backdrop-blur-[2px] sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-ivory p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-full p-2 transition hover:bg-navy-900/5">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GuestDialog({ guest, open, onClose, onSaved }: { guest: Guest | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [invited, setInvited] = useState(2);
  const [rsvp, setRsvp] = useState<RsvpStatus>("pending");
  const [attendees, setAttendees] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(guest?.name ?? "");
    setPhone(guest?.phone ? formatPhone(guest.phone) : "");
    setInvited(guest?.invited_count ?? 2);
    setRsvp(guest?.rsvp ?? "pending");
    setAttendees(guest?.attendees != null ? String(guest.attendees) : "");
    setNotes(guest?.notes ?? "");
    setSent(guest?.invitation_sent ?? false);
    setError(null);
  }, [open, guest]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    let p: string | null;
    try {
      p = normalizePhone(phone);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    const att = rsvp === "declined" ? 0 : attendees === "" ? null : Number(attendees);
    const row = {
      name: name.trim(),
      phone: p,
      invited_count: invited,
      rsvp,
      attendees: rsvp === "pending" ? null : att,
      notes: notes.trim() || null,
      invitation_sent: sent,
      invitation_sent_at: sent ? (guest?.invitation_sent_at ?? new Date().toISOString()) : null,
      responded_at: rsvp !== "pending" && guest?.rsvp !== rsvp ? new Date().toISOString() : (guest?.responded_at ?? null),
    };
    setSaving(true);
    const sb = supabaseBrowser();
    const { error } = guest ? await sb.from("guests").update(row).eq("id", guest.id) : await sb.from("guests").insert(row);
    setSaving(false);
    if (error) {
      setError(error.code === "23505" ? "A guest with this phone number already exists." : error.message);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={guest ? "Edit guest" : "Add guest"}>
      <form onSubmit={save} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">Guest name *</span>
          <input className={input} required minLength={1} maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mr & Mrs Perera" autoFocus />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">WhatsApp number</span>
            <input className={input} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077 123 4567" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">Invited</span>
            <input className={input} type="number" min={1} max={20} value={invited} onChange={(e) => setInvited(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">RSVP response</span>
            <select className={input} value={rsvp} onChange={(e) => setRsvp(e.target.value as RsvpStatus)}>
              {(Object.keys(STATUS_META) as RsvpStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">Attending</span>
            <input className={input} type="number" min={0} max={20} disabled={rsvp === "pending" || rsvp === "declined"} value={rsvp === "declined" ? 0 : attendees} onChange={(e) => setAttendees(e.target.value)} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs tracking-wider text-navy-700 uppercase">Notes</span>
          <textarea className={`${input} min-h-20`} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Table, relation, dietary needs…" />
        </label>
        {guest?.message && (
          <div className="rounded-lg border border-gold-500/30 bg-gold-300/15 px-3.5 py-2.5 text-sm">
            <span className="block text-xs tracking-wider text-gold-700 uppercase">Guest&apos;s message</span>
            {guest.message}
          </div>
        )}
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={sent} onChange={(e) => setSent(e.target.checked)} className="size-4 accent-navy-900" />
          Invitation sent
        </label>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm transition hover:bg-navy-900/5">Cancel</button>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-medium text-ivory transition hover:bg-navy-800 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} {guest ? "Save changes" : "Add guest"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setPw(""); setPw2(""); setMsg(null); }
  }, [open]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 10) return setMsg({ ok: false, text: "Use at least 10 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords don't match." });
    setSaving(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    setSaving(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
  }

  return (
    <Modal open={open} onClose={onClose} title="Change password">
      <form onSubmit={save} className="space-y-4">
        <input className={input} type="password" autoComplete="new-password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <input className={input} type="password" autoComplete="new-password" placeholder="Repeat new password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{msg.text}</p>}
        <div className="flex justify-end">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-medium text-ivory disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} Update password
          </button>
        </div>
      </form>
    </Modal>
  );
}
