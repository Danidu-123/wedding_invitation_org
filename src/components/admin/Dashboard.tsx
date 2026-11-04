"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check, CircleCheck, CircleHelp, CircleX, Download, Hourglass, KeyRound, Link2, Loader2, LogOut,
  MessageCircle, MessageSquareText, Pencil, Plus, RefreshCw, Search, Send, Trash2, Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STATUS_META, computeStats, formatPhone, inviteLink, whatsappUrl, type Guest, type RsvpStatus } from "@/lib/admin/guests";
import { WEDDING } from "@/lib/config";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GuestDialog, Modal, PasswordDialog } from "./GuestDialog";

type Filter = "all" | RsvpStatus | "unsent";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "accepted", label: "Accepted" },
  { id: "maybe", label: "Maybe" },
  { id: "declined", label: "Declined" },
  { id: "pending", label: "No response" },
  { id: "unsent", label: "Not sent" },
];

export function Dashboard() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [dialog, setDialog] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Guest | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const load = useCallback(async () => {
    setRefreshing(true);
    const { data, error } = await sb.from("guests").select("*").order("created_at", { ascending: false });
    setRefreshing(false);
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setGuests((data ?? []) as Guest[]);
    setStatus("ready");
  }, [sb]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: isAdmin, error } = await sb.rpc("is_admin");
      if (!alive) return;
      if (error || !isAdmin) return setStatus("denied");
      await load();
    })();
    const channel = sb
      .channel("guests-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, () => {
        clearTimeout(debounce.current);
        debounce.current = setTimeout(load, 400);
      })
      .subscribe();
    return () => {
      alive = false;
      sb.removeChannel(channel);
    };
  }, [sb, load]);

  const stats = useMemo(() => computeStats(guests), [guests]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qd = q.replace(/\D/g, "");
    return guests.filter((g) => {
      if (filter === "unsent" ? g.invitation_sent : filter !== "all" && g.rsvp !== filter) return false;
      if (!q) return true;
      return g.name.toLowerCase().includes(q) || (!!qd && (g.phone ?? "").includes(qd.replace(/^0/, "")));
    });
  }, [guests, filter, query]);

  async function signOut() {
    await sb.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function sendWhatsApp(g: Guest) {
    window.open(whatsappUrl(g), "_blank", "noopener,noreferrer");
    if (!g.invitation_sent) {
      setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, invitation_sent: true } : x)));
      await sb.from("guests").update({ invitation_sent: true, invitation_sent_at: new Date().toISOString() }).eq("id", g.id);
    }
  }

  async function copyLink(g: Guest) {
    try {
      await navigator.clipboard.writeText(inviteLink(g.invite_code));
      setCopied(g.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      window.prompt("Copy this invitation link:", inviteLink(g.invite_code));
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    setGuests((list) => list.filter((g) => g.id !== id));
    const { error } = await sb.from("guests").delete().eq("id", id);
    if (error) {
      setError(error.message);
      load();
    }
  }

  async function exportPdf() {
    setPdfBusy(true);
    try {
      const { downloadGuestReport } = await import("@/lib/admin/pdf");
      await downloadGuestReport(visible, FILTERS.find((f) => f.id === filter)!.label + (query ? ` · "${query}"` : ""));
    } finally {
      setPdfBusy(false);
    }
  }

  if (status === "loading")
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gold-600" />
      </div>
    );

  if (status === "denied")
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-3xl">This account doesn&apos;t have admin access.</p>
        <button onClick={signOut} className="rounded-full bg-navy-900 px-6 py-2.5 text-sm text-ivory">Sign out</button>
      </div>
    );

  const cards = [
    { label: "Total invitations", value: stats.total, sub: `${stats.invitedSeats} seats · ${stats.sent} sent`, icon: Users, tone: "text-navy-800 bg-navy-900/5", f: "all" as Filter },
    { label: "Accepted", value: stats.accepted, sub: `${stats.acceptedSeats} attending`, icon: CircleCheck, tone: "text-emerald-700 bg-emerald-50", f: "accepted" as Filter },
    { label: "Maybe", value: stats.maybe, sub: `${stats.maybeSeats} possible`, icon: CircleHelp, tone: "text-amber-700 bg-amber-50", f: "maybe" as Filter },
    { label: "Declined", value: stats.declined, sub: "can't attend", icon: CircleX, tone: "text-rose-700 bg-rose-50", f: "declined" as Filter },
    { label: "No response", value: stats.pending, sub: `due ${WEDDING.rsvpDeadlineLabel.replace(/^\w+, /, "").replace(" 2026", "")}`, icon: Hourglass, tone: "text-slate-600 bg-slate-100", f: "pending" as Filter },
  ];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 border-b border-gold-500/25 bg-navy-900 text-ivory">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-display text-xl sm:text-2xl">
              {WEDDING.groom} <span className="text-gold-400 italic">&amp;</span> {WEDDING.bride}
            </p>
            <p className="text-[11px] tracking-[0.2em] text-gold-300/70 uppercase">Guest dashboard · {WEDDING.shortDate}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={load} aria-label="Refresh" className="rounded-full p-2.5 text-gold-300 transition hover:bg-white/10">
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setPwOpen(true)} aria-label="Change password" className="rounded-full p-2.5 text-gold-300 transition hover:bg-white/10">
              <KeyRound className="size-4" />
            </button>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-gold-300 transition hover:bg-white/10">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error} <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
          </p>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {cards.map((c, i) => (
            <motion.button
              key={c.label}
              onClick={() => setFilter(c.f)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${filter === c.f ? "border-gold-500 ring-2 ring-gold-400/30" : "border-navy-900/8"} ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <span className={`inline-flex size-9 items-center justify-center rounded-full ${c.tone}`}>
                <c.icon className="size-4.5" strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-xs tracking-wider text-navy-700/70 uppercase">{c.label}</p>
              <p className="mt-0.5 font-display text-4xl leading-none lining">{c.value}</p>
              <p className="mt-1.5 text-xs text-navy-700/60">{c.sub}</p>
            </motion.button>
          ))}
        </section>

        {/* Toolbar */}
        <section className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${filter === f.id ? "bg-navy-900 text-ivory" : "bg-white text-navy-800 hover:bg-navy-900/5"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-700/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or phone"
                className="w-full rounded-full border border-navy-900/10 bg-white py-2.5 pr-4 pl-10 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 focus:outline-none"
              />
            </label>
            <button onClick={exportPdf} disabled={pdfBusy || !visible.length} className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 bg-white px-4 py-2.5 text-sm transition hover:border-gold-500 disabled:opacity-50">
              {pdfBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} PDF
            </button>
            <button onClick={() => { setEditing(null); setDialog(true); }} className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-navy-900 shadow-sm transition hover:bg-gold-400">
              <Plus className="size-4" /> Add guest
            </button>
          </div>
        </section>

        <p className="mt-4 text-xs text-navy-700/60">
          Showing {visible.length} of {guests.length} · PDF exports the guests currently shown
        </p>

        {/* List */}
        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-navy-900/15 bg-white/60 px-6 py-16 text-center">
            <p className="font-display text-2xl">{guests.length ? "No guests match this view" : "No guests yet"}</p>
            <p className="mt-2 text-sm text-navy-700/70">
              {guests.length ? "Try another filter or search." : "Add your first guest, then send their personal invitation on WhatsApp."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-hidden rounded-2xl border border-navy-900/8 bg-white shadow-sm md:block">
              <table className="w-full text-sm">
                <thead className="bg-pearl/70 text-left text-xs tracking-wider text-navy-700/70 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Guest</th>
                    <th className="px-3 py-3 font-medium">Phone</th>
                    <th className="px-3 py-3 text-center font-medium">Invited</th>
                    <th className="px-3 py-3 font-medium">RSVP</th>
                    <th className="px-3 py-3 text-center font-medium">Attending</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/6">
                  <AnimatePresence initial={false}>
                    {visible.map((g) => (
                      <motion.tr key={g.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="transition-colors hover:bg-ivory">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{g.name}</span>
                            {g.source === "self" && <span className="rounded bg-gold-300/40 px-1.5 py-0.5 text-[10px] tracking-wide text-gold-700 uppercase">Self RSVP</span>}
                            {g.message && <span title={g.message}><MessageSquareText className="size-3.5 text-gold-600" /></span>}
                          </div>
                          <div className="mt-0.5 text-xs text-navy-700/60">
                            {g.invitation_sent ? "Invitation sent" : "Not sent yet"}
                            {g.notes && <> · {g.notes}</>}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 whitespace-nowrap tabular-nums">{formatPhone(g.phone)}</td>
                        <td className="px-3 py-3.5 text-center tabular-nums">{g.invited_count}</td>
                        <td className="px-3 py-3.5"><Badge s={g.rsvp} /></td>
                        <td className="px-3 py-3.5 text-center tabular-nums">{g.rsvp === "pending" ? "—" : g.attendees ?? 0}</td>
                        <td className="px-5 py-3.5">
                          <Actions g={g} copied={copied === g.id} onWa={sendWhatsApp} onCopy={copyLink} onEdit={() => { setEditing(g); setDialog(true); }} onDelete={() => setToDelete(g)} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="mt-4 space-y-3 md:hidden">
              {visible.map((g) => (
                <li key={g.id} className="rounded-2xl border border-navy-900/8 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{g.name}</p>
                      <p className="mt-0.5 text-xs text-navy-700/60 tabular-nums">
                        {formatPhone(g.phone)} · invited {g.invited_count}
                        {g.rsvp !== "pending" && <> · attending {g.attendees ?? 0}</>}
                      </p>
                    </div>
                    <Badge s={g.rsvp} />
                  </div>
                  {g.message && <p className="mt-2 rounded-lg bg-gold-300/15 px-3 py-2 text-sm italic">“{g.message}”</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-navy-900/6 pt-3">
                    <span className="text-xs text-navy-700/60">{g.invitation_sent ? "Sent" : "Not sent"}{g.source === "self" ? " · Self RSVP" : ""}</span>
                    <Actions g={g} copied={copied === g.id} onWa={sendWhatsApp} onCopy={copyLink} onEdit={() => { setEditing(g); setDialog(true); }} onDelete={() => setToDelete(g)} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <GuestDialog open={dialog} guest={editing} onClose={() => setDialog(false)} onSaved={load} />
      <PasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete guest?">
        <p className="text-sm text-navy-700">
          <strong>{toDelete?.name}</strong> and their RSVP will be permanently removed. Their personal invitation link will stop working.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setToDelete(null)} className="rounded-full px-5 py-2.5 text-sm hover:bg-navy-900/5">Cancel</button>
          <button onClick={confirmDelete} className="rounded-full bg-rose-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-800">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function Badge({ s }: { s: RsvpStatus }) {
  const m = STATUS_META[s];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.badge}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} /> {m.label}
    </span>
  );
}

function Actions({ g, copied, onWa, onCopy, onEdit, onDelete }: {
  g: Guest; copied: boolean; onWa: (g: Guest) => void; onCopy: (g: Guest) => void; onEdit: () => void; onDelete: () => void;
}) {
  const icon = "rounded-full p-2 text-navy-700 transition hover:bg-navy-900/6";
  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        onClick={() => onWa(g)}
        disabled={!g.phone}
        title={g.phone ? "Open WhatsApp with a personalised invitation" : "Add a phone number first"}
        className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-[#1f8f4e] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#187540] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {g.invitation_sent ? <Send className="size-3.5" /> : <MessageCircle className="size-3.5" />}
        {g.invitation_sent ? "Resend" : "WhatsApp"}
      </button>
      <button onClick={() => onCopy(g)} aria-label="Copy invitation link" title="Copy personal invitation link" className={icon}>
        {copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
      </button>
      <button onClick={onEdit} aria-label={`Edit ${g.name}`} className={icon}><Pencil className="size-4" /></button>
      <button onClick={onDelete} aria-label={`Delete ${g.name}`} className={`${icon} hover:text-rose-700`}><Trash2 className="size-4" /></button>
    </div>
  );
}
