"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, CircleHelp, CircleX, Heart, Loader2, Minus, Phone, Plus, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { WEDDING, rsvpOpen, type RsvpChoice } from "@/lib/config";
import { Sprig } from "./Ornament";
import { Reveal } from "./Reveal";

const CHOICES: { id: RsvpChoice; label: string; icon: typeof Heart; tone: string; active: string }[] = [
  { id: "accepted", label: "Joyfully accept", icon: CircleCheck, tone: "hover:border-emerald-600/50", active: "border-emerald-700 bg-emerald-50 text-emerald-900" },
  { id: "maybe", label: "Maybe", icon: CircleHelp, tone: "hover:border-gold-500", active: "border-gold-600 bg-gold-300/30 text-gold-700" },
  { id: "declined", label: "Regretfully decline", icon: CircleX, tone: "hover:border-rose-600/50", active: "border-rose-700 bg-rose-50 text-rose-900" },
];

const THANKS: Record<RsvpChoice, string> = {
  accepted: "Thank you for your response! We look forward to celebrating with you.",
  maybe: "Thank you for letting us know. We hope you can make it — you can update your answer any time before the deadline.",
  declined: "Thank you for letting us know. You will be missed, and we're grateful for your blessings.",
};

const field =
  "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-3.5 text-[15px] text-navy-900 placeholder:text-navy-900/35 transition focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 focus:outline-none";

export type GuestInvite = { code: string; name: string; invitedCount: number; rsvp: string; attendees: number | null };

export function Rsvp({ guest }: { guest?: GuestInvite }) {
  const [open, setOpen] = useState(true);
  const [choice, setChoice] = useState<RsvpChoice | null>(null);
  const [name, setName] = useState(guest?.name ?? "");
  const [phone, setPhone] = useState("");
  const [count, setCount] = useState(Math.max(1, guest?.attendees || guest?.invitedCount || 1));
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const previous = guest && guest.rsvp !== "pending" ? (guest.rsvp as RsvpChoice) : null;

  useEffect(() => setOpen(rsvpOpen()), []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!choice) return;
    setError(null);
    setState("sending");
    const hp = (new FormData(e.currentTarget).get("website") as string) || "";
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: guest?.code ?? null,
          name,
          phone,
          status: choice,
          attendees: choice === "declined" ? 0 : count,
          message,
          website: hp,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  return (
    <section id="rsvp" className="relative overflow-hidden bg-pearl px-4 py-24 sm:px-8 sm:py-32">
      <div className="relative mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="kicker text-gold-600">Kindly respond</p>
          <h2 className="mt-4 font-display text-5xl font-light text-navy-900 sm:text-6xl">Would you join us?</h2>
          <Sprig className="mx-auto mt-5 w-52" />
          <p className="mx-auto mt-6 max-w-md font-display text-xl text-navy-800/80 italic">
            Please send us your confirmation on or before{" "}
            <span className="whitespace-nowrap text-navy-900 not-italic">{WEDDING.rsvpDeadlineLabel}</span>.
          </p>
          {previous && state !== "done" && (
            <p className="mt-4 text-sm text-navy-700">
              We have your response as <strong className="font-medium">{CHOICES.find((c) => c.id === previous)?.label}</strong>. You can change it below.
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="relative rounded-2xl border border-gold-500/40 bg-ivory p-6 shadow-[0_30px_70px_-40px_rgba(12,26,54,0.45)] sm:p-10">
            <AnimatePresence mode="wait">
              {!open ? (
                <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <Heart className="mx-auto size-8 text-gold-500" strokeWidth={1.3} />
                  <p className="mt-4 font-display text-2xl text-navy-900">Online RSVP has closed</p>
                  <p className="mt-2 text-sm text-navy-700/80">Please contact us directly if your plans have changed.</p>
                  <Contacts />
                </motion.div>
              ) : state === "done" && choice ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="py-6 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                    className="mx-auto flex size-16 items-center justify-center rounded-full bg-navy-900 text-gold-300"
                  >
                    <Heart className="size-7" fill="currentColor" />
                  </motion.span>
                  <p className="mt-6 font-script text-5xl text-navy-900">Thank you{name ? `, ${name.split(" ")[0]}` : ""}</p>
                  <p className="mx-auto mt-4 max-w-sm font-display text-xl text-navy-800/85">{THANKS[choice]}</p>
                  <button type="button" onClick={() => setState("idle")} className="mt-8 text-xs tracking-[0.2em] text-gold-700 uppercase underline-offset-4 hover:underline">
                    Change my response
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Your response">
                    {CHOICES.map(({ id, label, icon: Icon, tone, active }) => {
                      const on = choice === id;
                      return (
                        <motion.button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setChoice(id)}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center justify-center gap-2.5 rounded-xl border px-4 py-4 text-sm font-medium transition-all duration-300 sm:flex-col sm:py-6 ${on ? active + " shadow-sm" : "border-navy-900/15 bg-white text-navy-800 " + tone}`}
                        >
                          <Icon className="size-5 sm:size-6" strokeWidth={1.5} />
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence initial={false}>
                    {choice && (
                      <motion.form
                        key="fields"
                        onSubmit={submit}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-5 pt-8">
                          <p className="text-center font-display text-2xl text-navy-900">Please confirm your details</p>
                          <label className="block">
                            <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">Your name</span>
                            <input className={field} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" placeholder="Full name" />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">Phone number</span>
                            <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" pattern="[0-9+\s\-()]{9,20}" title="Please enter a valid phone number" />
                          </label>

                          {choice !== "declined" && (
                            <div>
                              <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">
                                {choice === "maybe" ? "Guests if attending" : "Number of guests"} <span className="normal-case tracking-normal text-navy-700/60">(including you)</span>
                              </span>
                              <div className="flex items-center gap-3">
                                <button type="button" aria-label="Fewer guests" onClick={() => setCount((c) => Math.max(1, c - 1))} className="flex size-11 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 transition hover:border-gold-500 disabled:opacity-30" disabled={count <= 1}>
                                  <Minus className="size-4" />
                                </button>
                                <span className="w-12 text-center font-display text-3xl text-navy-900 lining" aria-live="polite">{count}</span>
                                <button type="button" aria-label="More guests" onClick={() => setCount((c) => Math.min(10, c + 1))} className="flex size-11 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 transition hover:border-gold-500 disabled:opacity-30" disabled={count >= 10}>
                                  <Plus className="size-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          <label className="block">
                            <span className="mb-1.5 block text-xs tracking-[0.15em] text-navy-700 uppercase">Message <span className="normal-case tracking-normal text-navy-700/60">(optional)</span></span>
                            <textarea className={`${field} min-h-24 resize-y`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="Your wishes for the couple" />
                          </label>

                          {/* Honeypot for bots */}
                          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                          {error && <p role="alert" className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

                          <button
                            type="submit"
                            disabled={state === "sending"}
                            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-navy-900 py-4 text-sm font-medium tracking-[0.2em] text-ivory uppercase transition-all duration-500 ease-luxe hover:bg-navy-800 hover:shadow-[0_12px_30px_-12px_rgba(12,26,54,0.7)] disabled:opacity-60"
                          >
                            {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            {state === "sending" ? "Sending…" : "Send my response"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        {open && (
          <Reveal delay={0.15} className="mt-10 text-center">
            <p className="text-xs tracking-[0.2em] text-navy-700/70 uppercase">Questions? Contact us</p>
            <Contacts />
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Contacts() {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      {WEDDING.contacts.map((c) => (
        <a key={c.name} href={`tel:+${c.phone}`} className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 bg-white px-5 py-2.5 text-sm text-navy-900 transition hover:border-gold-500">
          <Phone className="size-3.5 text-gold-600" /> {c.name} · {c.display}
        </a>
      ))}
    </div>
  );
}
