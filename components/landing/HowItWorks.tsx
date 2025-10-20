"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Target } from "lucide-react";
import { COLOR_PRIMARY } from "@/lib/design-tokens";

/** How It Works Section */
export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Connect Your Accounts",
      description:
        "Link Twitter, LinkedIn, and Instagram with secure OAuth. One-time setup, fully encrypted.",
      icon: Target,
    },
    {
      number: "2",
      title: "Write Your Content",
      description:
        "Create your post once. Our AI understands context, tone, and audience for each platform.",
      icon: Sparkles,
    },
    {
      number: "3",
      title: "AI Adapts & Schedules",
      description:
        "Get platform-optimized versions instantly. Schedule or post immediately across all channels.",
      icon: Zap,
    },
  ];

  return (
    <section id="how-it-works" className="bg-gray-50 py-24">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From idea to published — in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${COLOR_PRIMARY.bg} text-white shadow-lg`}
                  >
                    <Icon className="h-10 w-10" />
                  </div>
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${COLOR_PRIMARY.bgLight} ${COLOR_PRIMARY.text} font-bold text-lg`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
