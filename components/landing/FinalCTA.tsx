"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { COLOR_PRIMARY } from "@/lib/design-tokens";
import { AuroraBackground } from "@/components/landing/AuroraBackground";

/** Final CTA Section */
export function FinalCTA() {
  const router = useRouter();

  return (
    <section className="relative bg-[#0a0a0a] py-24 overflow-hidden">
      <AuroraBackground className="absolute inset-0 -z-10" />

      <div className="container mx-auto max-w-4xl px-6 sm:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Ready to Save 10 Hours Per Week?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
        >
          Join thousands of content creators who've automated their social media
          presence. Start free — no credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover} text-lg px-8 py-6`}
            onClick={() => router.push("/signup")}
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </motion.div>

        <p className="mt-6 text-sm text-gray-400">
          Free tier includes 10 AI adaptations/month • No credit card required
        </p>
      </div>
    </section>
  );
}
