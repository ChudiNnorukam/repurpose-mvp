"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

/** Lightweight animated aurora background */
function AuroraBackground({ className = "" }: { className?: string }) {
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
  )
}

/** Radial spread visual */
function RadialVisual() {
  const items = [
    { label: "LinkedIn Post", angle: -20 },
    { label: "Twitter Thread", angle: 20 },
    { label: "IG Caption", angle: 60 },
    { label: "Carousel Copy", angle: 140 },
    { label: "FB Question", angle: -140 },
  ] as const

  return (
    <div className="relative mt-16 h-80 w-80 select-none sm:h-96 sm:w-96" data-testid="hero-radial">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background/70 px-5 py-3 text-sm shadow-xl ring-1 ring-white/10 backdrop-blur"
      >
        Your Post
      </motion.div>
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
          className="absolute left-1/2 top-1/2 origin-left"
          style={{ transform: `rotate(${it.angle}deg)` }}
        >
          <div className="h-px w-24 translate-x-2 bg-gradient-to-r from-white/20 to-white/0 sm:w-28" />
          <div className="translate-x-28 -translate-y-3.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 shadow-md backdrop-blur transition hover:scale-[1.05] hover:border-white/25 hover:bg-white/10 sm:translate-x-32">
            {it.label}
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
    </div>
  )
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-medium text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 " +
        "bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 focus:ring-indigo-400 " +
        className
      }
    >
      {children}
    </button>
  )
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", children, ...rest } = props
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-base font-medium text-white/90 shadow-sm backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30 " +
        className
      }
    >
      {children}
    </button>
  )
}

export function Hero() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 text-foreground md:py-32" data-testid="hero-section">
      <AuroraBackground className="absolute inset-0 -z-10" />

      <div className="container mx-auto flex max-w-6xl flex-col items-center px-6 text-center sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tight md:text-6xl"
        >
          One Thought →
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"> Ten Posts</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground"
          data-testid="hero-subtext"
        >
          Write once. Our AI adapts it for LinkedIn, Twitter, Instagram — instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <PrimaryButton aria-label="Get started with AI repurposing" data-testid="cta-primary">
            Get Started → Transform
          </PrimaryButton>
          <SecondaryButton aria-label="Open example demo" data-testid="cta-secondary" onClick={() => setShowDemo(true)}>
            See Example
          </SecondaryButton>
        </motion.div>

        <RadialVisual />

        {showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-w-lg rounded-xl bg-background p-8 shadow-2xl">
              <button
                onClick={() => setShowDemo(false)}
                className="absolute right-4 top-4 text-sm text-white/70 hover:text-white"
              >
                Close
              </button>
              <h2 className="mb-4 text-xl font-semibold">Example Demo</h2>
              <p className="text-muted-foreground">
                This is where a lightweight demo of content transformation would appear.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Page() {
  useEffect(() => {
    const el = document.querySelector('[data-testid="hero-section"]')
    if (!el) {
      console.error("[Hero Smoke Test] Hero section did not mount")
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
    </main>
  )
}

/**
 * TEST CASES:
 * 1) Hero renders with AuroraBackground in backdrop
 * 2) CTAs visible and clickable
 * 3) RadialVisual spokes present with hover scaling
 * 4) Clicking "See Example" opens overlay demo, which can be closed
 * 5) Exactly one <h1> exists with "One Thought" and "Ten Posts"
 * 6) Focus rings visible on keyboard tabbing through CTAs
 */
