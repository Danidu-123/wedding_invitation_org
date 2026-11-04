"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, CalendarPlus, Clock, Gem, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/config";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { Corner, Sprig } from "./Ornament";
import { Reveal } from "./Reveal";

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function split(target: string, now: number | null) {
  const diff = now === null ? 0 : Math.max(0, new Date(target).getTime() - now);
  return {
    done: now !== null && diff === 0,
    parts: [
      ["Days", Math.floor(diff / 86_400_000)],
      ["Hours", Math.floor((diff % 86_400_000) / 3_600_000)],
      ["Minutes", Math.floor((diff % 3_600_000) / 60_000)],
      ["Seconds", Math.floor((diff % 60_000) / 1000)],
    ] as const,
  };
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Details() {
  const now = useNow();
  const main = split(WEDDING.celebrationStart, now);
  const poruwa = split(WEDDING.poruwa, now);
  const [calOpen, setCalOpen] = useState(false);

  const rows = [
    { icon: CalendarHeart, label: "Wedding date", value: WEDDING.dateLabel },
    { icon: Gem, label: "Poruwa ceremony", value: WEDDING.poruwaLabel },
    { icon: Clock, label: "Celebration", value: WEDDING.timeLabel },
    { icon: MapPin, label: "Venue", value: `${WEDDING.venue.name} · ${WEDDING.venue.hall}`, sub: WEDDING.venue.address },
  ];

  return (
    <section id="details" className="grain relative overflow-hidden bg-navy-900 px-4 py-24 text-ivory sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="kicker text-gold-400">Together with our families</p>
          <h2 className="mt-6 font-script text-6xl leading-tight sm:text-8xl">
            <span className="block text-gold-foil sm:inline">{WEDDING.groom}</span>
            <span className="mx-3 block font-display text-3xl italic text-gold-400/80 sm:inline sm:text-5xl">&amp;</span>
            <span className="block text-gold-foil sm:inline">{WEDDING.bride}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-display text-2xl leading-relaxed font-light text-ivory/85 italic sm:text-3xl">
            invite you to celebrate the beginning of our forever.
          </p>
          <Sprig className="mx-auto mt-8 w-56" tone="#d8bd7e" />
        </Reveal>

        {/* Details card */}
        <Reveal delay={0.1} className="relative mx-auto mt-14 max-w-2xl">
          <div className="relative rounded-sm border border-gold-500/40 bg-navy-800/40 px-6 py-10 backdrop-blur-sm sm:px-12">
            <Corner className="absolute top-2 left-2 size-10 text-gold-500/70" />
            <Corner className="absolute top-2 right-2 size-10 rotate-90 text-gold-500/70" />
            <Corner className="absolute right-2 bottom-2 size-10 rotate-180 text-gold-500/70" />
            <Corner className="absolute bottom-2 left-2 size-10 -rotate-90 text-gold-500/70" />
            <dl className="divide-y divide-gold-500/15">
              {rows.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-5 sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
                  <dt className="flex items-center gap-3 text-xs tracking-[0.25em] text-gold-400 uppercase">
                    <Icon className="size-4" strokeWidth={1.5} />
                    {label}
                  </dt>
                  <dd className="font-display text-xl text-ivory sm:text-right sm:text-2xl">
                    {value}
                    {sub && <span className="block text-base text-ivory/60">{sub}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* Countdown */}
        <Reveal delay={0.15} className="mt-20">
          <p className="kicker text-gold-400">{main.done ? "The day is here" : "Counting down to forever"}</p>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2 sm:gap-5">
            {main.parts.map(([label, n]) => (
              <div key={label} className="group relative rounded-xl border border-gold-500/35 bg-navy-950/40 px-1 py-5 transition-colors duration-500 hover:border-gold-400 sm:py-7">
                <div className="font-display text-4xl leading-none font-light text-gold-300 lining sm:text-6xl">
                  {String(n).padStart(2, "0").split("").map((c, i) => (
                    <Digit key={i} value={c} />
                  ))}
                </div>
                <div className="mt-3 text-[0.6rem] tracking-[0.25em] text-ivory/60 uppercase sm:text-xs">{label}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 font-display text-lg text-ivory/75 italic sm:text-xl">
            {poruwa.done ? (
              "The Poruwa ceremony has begun"
            ) : (
              <>
                Poruwa ceremony in{" "}
                <span className="text-gold-300 not-italic lining">
                  {poruwa.parts[0][1]}d {String(poruwa.parts[1][1]).padStart(2, "0")}h{" "}
                  {String(poruwa.parts[2][1]).padStart(2, "0")}m {String(poruwa.parts[3][1]).padStart(2, "0")}s
                </span>
              </>
            )}
          </p>
          <p className="mt-2 text-xs tracking-widest text-ivory/40">Sri Lanka time (GMT+5:30)</p>
        </Reveal>

        <Reveal delay={0.2} className="relative mt-12 inline-block">
          <button
            type="button"
            onClick={() => setCalOpen((v) => !v)}
            aria-expanded={calOpen}
            className="group inline-flex items-center gap-3 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-medium tracking-[0.18em] text-navy-900 uppercase shadow-[0_10px_30px_-10px_rgba(194,161,90,0.7)] transition-all duration-500 ease-luxe hover:-translate-y-0.5 hover:bg-gold-400"
          >
            <CalendarPlus className="size-4" /> Add to calendar
          </button>
          <AnimatePresence>
            {calOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 z-10 mt-3 w-60 -translate-x-1/2 overflow-hidden rounded-xl border border-gold-500/40 bg-ivory text-left text-navy-900 shadow-2xl"
              >
                <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="block px-5 py-3.5 text-sm transition hover:bg-pearl">
                  Google Calendar
                </a>
                <button type="button" onClick={() => { downloadIcs(); setCalOpen(false); }} className="block w-full border-t border-gold-500/20 px-5 py-3.5 text-left text-sm transition hover:bg-pearl">
                  Apple / Outlook (.ics)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
