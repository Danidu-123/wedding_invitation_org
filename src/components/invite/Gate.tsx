"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Music2 } from "lucide-react";
import { WEDDING } from "@/lib/config";

const ease = [0.76, 0, 0.24, 1] as const;

export function Gate({ open, onOpen, guestName }: { open: boolean; onOpen: () => void; guestName?: string }) {
  return (
    <AnimatePresence>
      {!open && (
        <motion.div className="fixed inset-0 z-50 overflow-hidden" exit={{ pointerEvents: "none" }} transition={{ duration: 1.4 }}>
          {/* Doors */}
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className={`grain absolute inset-y-0 w-1/2 bg-navy-900 ${side === "left" ? "left-0 border-r" : "right-0 border-l"} border-gold-500/40`}
              exit={{ x: side === "left" ? "-100%" : "100%" }}
              transition={{ duration: 1.3, ease }}
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #d8bd7e 1px, transparent 0)",
                  backgroundSize: "22px 22px",
                }}
              />
            </motion.div>
          ))}

          {/* Card */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-6"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="relative w-full max-w-lg bg-navy-900 px-6 py-14 text-center shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] sm:px-12">
              <div className="pointer-events-none absolute inset-0 border border-gold-500/60" />
              <div className="pointer-events-none absolute inset-2 border border-gold-500/25" />

              <motion.p
                className="kicker text-gold-300/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9 }}
              >
                {guestName ? `Dear ${guestName}` : "You are cordially invited"}
              </motion.p>

              <motion.div
                className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full border border-gold-500/70"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-display text-gold-foil text-5xl leading-none font-light italic">T</span>
                <span className="mx-1.5 font-display text-lg italic text-gold-400/80">&amp;</span>
                <span className="font-display text-gold-foil text-5xl leading-none font-light italic">C</span>
              </motion.div>

              <motion.h1
                className="mt-8 font-display text-4xl font-light tracking-wide text-ivory sm:text-5xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 1 }}
              >
                {WEDDING.groom} <span className="italic text-gold-400">&amp;</span> {WEDDING.bride}
              </motion.h1>
              <motion.p
                className="mt-3 font-display text-lg tracking-[0.3em] text-gold-300/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                {WEDDING.shortDate}
              </motion.p>

              <motion.button
                type="button"
                onClick={onOpen}
                className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full border border-gold-500 px-8 py-3.5 text-sm tracking-[0.2em] text-gold-300 uppercase transition-colors duration-500 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.9 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-gold-400 transition-transform duration-500 ease-luxe group-hover:scale-x-100" />
                <Music2 className="relative size-4" />
                <span className="relative">Open Invitation</span>
              </motion.button>
              <p className="mt-4 text-xs tracking-wider text-ivory/40">Music will begin playing</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
