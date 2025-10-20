"use client";

import { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  useEffect(() => {
    const el = document.querySelector('[data-testid="hero-section"]');
    if (!el) {
      console.error("[Hero Smoke Test] Hero section did not mount");
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
