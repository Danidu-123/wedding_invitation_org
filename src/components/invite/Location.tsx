"use client";
import { CalendarPlus, MapPin, Navigation } from "lucide-react";
import { MAPS, WEDDING } from "@/lib/config";
import { googleCalendarUrl } from "@/lib/calendar";
import { Sprig } from "./Ornament";
import { Reveal } from "./Reveal";

const btn =
  "inline-flex items-center justify-center gap-2.5 rounded-full border px-6 py-3 text-xs font-medium tracking-[0.18em] uppercase transition-all duration-500 ease-luxe hover:-translate-y-0.5";

export function Location() {
  return (
    <section id="location" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="kicker text-gold-600">Where to find us</p>
          <h2 className="mt-4 font-display text-5xl font-light text-navy-900 sm:text-6xl">The Venue</h2>
          <Sprig className="mx-auto mt-5 w-52" />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid overflow-hidden rounded-2xl border border-gold-500/40 bg-white shadow-[0_30px_70px_-40px_rgba(12,26,54,0.5)] md:grid-cols-5">
            <div className="relative flex flex-col justify-center gap-6 p-8 text-center sm:p-12 md:col-span-2 md:text-left">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold-500/60 text-gold-600 md:mx-0">
                <MapPin className="size-6" strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="font-display text-3xl text-navy-900 sm:text-4xl">{WEDDING.venue.name}</h3>
                <p className="mt-2 font-display text-xl text-gold-600 italic">{WEDDING.venue.hall}</p>
                <p className="mt-3 text-sm tracking-wide text-navy-700/80">{WEDDING.venue.address}, Sri Lanka</p>
              </div>
              <div className="flex flex-col gap-3">
                <a href={MAPS.open} target="_blank" rel="noopener noreferrer" className={`${btn} border-navy-900 bg-navy-900 text-ivory hover:bg-navy-800`}>
                  <MapPin className="size-4" /> Open in Google Maps
                </a>
                <a href={MAPS.directions} target="_blank" rel="noopener noreferrer" className={`${btn} border-navy-900/25 text-navy-900 hover:border-gold-500 hover:text-gold-700`}>
                  <Navigation className="size-4" /> Get directions
                </a>
                <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className={`${btn} border-navy-900/25 text-navy-900 hover:border-gold-500 hover:text-gold-700`}>
                  <CalendarPlus className="size-4" /> Add to calendar
                </a>
              </div>
            </div>
            <div className="relative min-h-[320px] bg-pearl md:col-span-3">
              <iframe
                title={`Map of ${WEDDING.venue.name}`}
                src={MAPS.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full grayscale-[35%] contrast-[1.05]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
