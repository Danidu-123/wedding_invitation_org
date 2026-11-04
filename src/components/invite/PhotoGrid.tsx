"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PHOTOS, WEDDING } from "@/lib/config";
import { Sprig } from "./Ornament";

export function PhotoGrid() {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + PHOTOS.length) % PHOTOS.length)),
    [],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  return (
    <section id="photos" className="relative px-4 pt-14 pb-20 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <motion.header
          className="mb-10 text-center sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="kicker text-gold-600">The wedding of</p>
          <h2 className="mt-4 font-script text-6xl leading-[1.1] text-navy-800 sm:text-7xl md:text-8xl">
            {WEDDING.groom} <span className="font-display text-4xl italic text-gold-500 sm:text-5xl">&amp;</span>{" "}
            {WEDDING.bride}
          </h2>
          <Sprig className="mx-auto mt-5 w-56 sm:w-64" />
          <p className="mt-3 font-display text-lg tracking-[0.35em] text-navy-700">{WEDDING.shortDate}</p>
        </motion.header>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
          {PHOTOS.map((p, i) => (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}: ${p.alt}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[14px] bg-pearl shadow-[0_18px_40px_-24px_rgba(12,26,54,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 1, delay: (i % 3) * 0.12 + Math.floor(i / 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                priority={i < 3}
                className="object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.06]"
                style={{ objectPosition: p.pos }}
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/35 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-2 rounded-[10px] border border-gold-300/70 transition-all duration-700 ease-luxe group-hover:inset-3 sm:inset-3 sm:group-hover:inset-4" />
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 font-display text-sm tracking-[0.3em] text-ivory opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                0{i + 1}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-navy-950/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <motion.div
              key={active}
              className="relative h-[82vh] w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={PHOTOS[active].src} alt={PHOTOS[active].alt} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button onClick={close} aria-label="Close" className="absolute top-4 right-4 rounded-full border border-gold-500/50 p-2.5 text-gold-300 transition hover:bg-gold-500/15">
              <X className="size-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-3 rounded-full border border-gold-500/50 p-2.5 text-gold-300 transition hover:bg-gold-500/15 sm:left-6">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-3 rounded-full border border-gold-500/50 p-2.5 text-gold-300 transition hover:bg-gold-500/15 sm:right-6">
              <ChevronRight className="size-5" />
            </button>
            <p className="absolute bottom-5 font-display tracking-[0.3em] text-gold-300/80">
              {active + 1} / {PHOTOS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
