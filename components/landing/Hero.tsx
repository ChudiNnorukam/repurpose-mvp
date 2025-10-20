"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";
import { COLOR_PRIMARY } from "@/lib/design-tokens";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { GridPattern } from "@/components/magicui/grid-pattern";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { RadialVisual } from "@/components/landing/RadialVisual";

export function Hero() {
  const [showDemo, setShowDemo] = useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle esc key to close overlay
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDemo) {
        setShowDemo(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showDemo]);

  // Focus trap inside overlay
  useEffect(() => {
    if (!showDemo || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const focusableElements = overlay.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when overlay opens
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    overlay.addEventListener("keydown", handleTab as any);
    return () => overlay.removeEventListener("keydown", handleTab as any);
  }, [showDemo]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-16 text-[#ededed] md:py-24"
      data-testid="hero-section"
    >
      {/* Skip to main content link for accessibility */}
      <a
        href="#how-it-works"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      <GridPattern className="opacity-20" />
      <AuroraBackground className="absolute inset-0 -z-10" />

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/landing" className="text-xl font-bold">
            Repurpose<span className={COLOR_PRIMARY.text}>AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover}`}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto flex max-w-6xl flex-col items-center px-6 text-center sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-7xl font-extrabold tracking-tight md:text-9xl"
        >
          One Thought →
          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {" "}
            Ten Posts
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 max-w-2xl text-xl text-muted-foreground"
          data-testid="hero-subtext"
        >
          Write once. Our AI adapts it for LinkedIn, Twitter, Instagram —
          instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10"
        >
          <ShimmerButton
            onClick={() => router.push("/signup")}
            className="text-xl px-10 py-6"
            aria-label="Start creating content with AI"
          >
            Start Creating Content
          </ShimmerButton>
        </motion.div>

        <RadialVisual />

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            delay: 1,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40">Scroll to explore</span>
          <ArrowDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </div>

      {showDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowDemo(false)}
          data-testid="overlay-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-title"
          aria-describedby="demo-description"
        >
          <div
            ref={overlayRef}
            className="relative max-w-2xl w-full rounded-xl bg-background p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDemo(false)}
              className="absolute right-4 top-4 text-sm text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
              aria-label="Close demo"
              data-testid="close-demo"
            >
              Close ✕
            </button>
            <h2 id="demo-title" className="mb-6 text-2xl font-semibold">
              Example Transformation
            </h2>
            <p id="demo-description" className="text-gray-400 text-sm mb-4">
              See how Repurpose transforms content for different platforms
            </p>

            {/* Mock content preview */}
            <div className="space-y-4">
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-2">Original</div>
                <p className="text-sm text-white/90">
                  Just shipped a new feature that lets you repurpose content
                  across platforms in seconds!
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className={`rounded-lg border ${COLOR_PRIMARY.border} ${COLOR_PRIMARY.bgLight}/50 p-4`}
                >
                  <div
                    className={`text-xs ${COLOR_PRIMARY.text} mb-2 flex items-center gap-1`}
                  >
                    <span>🐦</span> Twitter
                  </div>
                  <p className="text-sm text-white/90">
                    🚀 New feature alert! Repurpose content across platforms in
                    seconds ⚡ No more copy-paste. Just smart automation.
                    #ContentCreation #AI
                  </p>
                </div>

                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <div className="text-xs text-indigo-400 mb-2 flex items-center gap-1">
                    <span>💼</span> LinkedIn
                  </div>
                  <p className="text-sm text-white/90">
                    I'm excited to announce our latest feature: instant content
                    repurposing across all major platforms. This is a
                    game-changer for content creators who want to maximize their
                    reach without the manual work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
