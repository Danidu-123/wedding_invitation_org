"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WEDDING } from "@/lib/config";
import { Details } from "./Details";
import { Gate } from "./Gate";
import { Location } from "./Location";
import { Sprig } from "./Ornament";
import { PhotoGrid } from "./PhotoGrid";
import { Rsvp, type GuestInvite } from "./Rsvp";

export function Invitation({ guest }: { guest?: GuestInvite }) {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  async function play() {
    const el = audio.current;
    if (!el) return;
    try {
      el.volume = 0;
      await el.play();
      // Gentle fade-in
      let v = 0;
      const t = setInterval(() => {
        v = Math.min(0.6, v + 0.03);
        el.volume = v;
        if (v >= 0.6) clearInterval(t);
      }, 80);
    } catch {
      /* autoplay refused — the toggle remains available */
    }
  }

  function open() {
    setOpened(true);
    window.scrollTo({ top: 0 });
    void play();
  }

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void play();
    else el.pause();
  }

  return (
    <>
      <audio
        ref={audio}
        src="/music/wedding.mp3"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Gate open={opened} onOpen={open} guestName={guest?.name} />

      <main>
        <PhotoGrid />
        <Details />
        <Location />
        <Rsvp guest={guest} />
      </main>

      <footer className="grain relative overflow-hidden bg-navy-950 px-6 py-20 text-center text-ivory">
        <Sprig className="mx-auto w-48" tone="#d8bd7e" />
        <p className="mt-6 font-script text-6xl text-gold-foil">Forever starts here</p>
        <p className="mt-6 font-display text-xl tracking-[0.3em] text-ivory/80 uppercase">
          {WEDDING.groom} &amp; {WEDDING.bride}
        </p>
        <p className="mt-2 text-sm tracking-[0.3em] text-gold-400/80">{WEDDING.shortDate}</p>
      </footer>

      <AnimatePresence>
        {opened && (
          <motion.button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause music" : "Play music"}
            aria-pressed={playing}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 240, damping: 18 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="fixed right-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full border border-gold-500/60 bg-navy-900/90 text-gold-300 shadow-[0_12px_30px_-10px_rgba(7,15,34,0.8)] backdrop-blur sm:right-6 sm:bottom-6"
          >
            {playing ? (
              <span className="flex h-5 items-end gap-[3px]" aria-hidden>
                {[0, 0.2, 0.4, 0.1].map((d, i) => (
                  <span key={i} className="eq-bar block h-full w-[3px] rounded-full bg-gold-300" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
            ) : (
              <Play className="ml-0.5 size-5" fill="currentColor" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
