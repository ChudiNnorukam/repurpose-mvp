"use client";

import { motion } from "framer-motion";

/** Radial spread visual */
export function RadialVisual() {
  const items = [
    { label: "LinkedIn Post", angle: -30 },
    { label: "Twitter Thread", angle: 30 },
    { label: "IG Caption", angle: 90 },
    { label: "Carousel Copy", angle: 150 },
    { label: "FB Question", angle: -150 },
  ] as const;

  return (
    <div
      className="relative mt-12 h-[400px] w-full max-w-[500px] select-none"
      data-testid="hero-radial"
    >
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur-2xl" />

      {/* Center "Your Post" */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background/70 px-5 py-3 text-sm shadow-xl ring-1 ring-white/10 backdrop-blur"
      >
        Your Post
      </motion.div>

      {/* Platform labels positioned around center */}
      {items.map((it, i) => {
        const angle = it.angle;
        const radians = (angle * Math.PI) / 180;
        const distance = 140;
        const x = Math.cos(radians) * distance;
        const y = Math.sin(radians) * distance;

        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              marginLeft: `${x}px`,
              marginTop: `${y}px`,
            }}
          >
            <div className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 shadow-md backdrop-blur transition hover:scale-[1.05] hover:border-white/25 hover:bg-white/10">
              {it.label}
            </div>
          </motion.div>
        );
      })}

      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/10" />
    </div>
  );
}
