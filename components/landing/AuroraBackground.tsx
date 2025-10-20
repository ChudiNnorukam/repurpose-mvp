"use client";

import { motion } from "framer-motion";

/** Lightweight animated aurora background */
export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent"
      />
      <motion.div
        initial={{ x: -80, y: -40, opacity: 0.3 }}
        animate={{ x: 80, y: 20, opacity: 0.5 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl"
      />
      <motion.div
        initial={{ x: 60, y: 40, opacity: 0.3 }}
        animate={{ x: -60, y: -20, opacity: 0.5 }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "reverse" }}
        className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl"
      />
    </div>
  );
}
