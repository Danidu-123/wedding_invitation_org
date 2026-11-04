"use client";
import { motion } from "framer-motion";

/** Fine-line botanical divider drawn in gold; strokes draw in when scrolled into view. */
export function Sprig({ className = "", tone = "#c2a15a" }: { className?: string; tone?: string }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] as const } },
  };
  const leaf = (d: string, i: number) => (
    <motion.path key={i} d={d} variants={draw} stroke={tone} strokeWidth={0.9} fill="none" strokeLinecap="round" />
  );
  const leaves = [
    "M60 20 C 48 12, 36 12, 26 20",
    "M26 20 C 30 14, 38 10, 44 13",
    "M38 20 C 42 26, 50 28, 56 24",
    "M14 20 C 18 15, 24 14, 28 16",
    "M2 20 L 120 20",
  ];
  return (
    <motion.svg
      viewBox="0 0 240 40"
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      aria-hidden
    >
      <g>{leaves.map(leaf)}</g>
      <g transform="translate(240 0) scale(-1 1)">{leaves.map(leaf)}</g>
      <motion.path
        d="M120 13 L 126 20 L 120 27 L 114 20 Z"
        variants={draw}
        stroke={tone}
        strokeWidth={0.9}
        fill="none"
      />
      <motion.circle cx="120" cy="20" r="1.6" fill={tone} variants={draw} />
    </motion.svg>
  );
}

/** Corner flourish for framed cards. Rotate per corner. */
export function Corner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={0.8}>
      <path d="M2 58 V 14 Q 2 2 14 2 H 58" />
      <path d="M8 58 V 20 Q 8 8 20 8 H 58" opacity={0.5} />
      <path d="M14 22 C 20 18, 22 12, 20 6 M 22 14 C 28 14, 32 10, 34 4" />
      <circle cx="14" cy="14" r="1.6" fill="currentColor" />
    </svg>
  );
}
