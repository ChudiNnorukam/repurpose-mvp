"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Target, Zap } from "lucide-react";
import { COLOR_PRIMARY } from "@/lib/design-tokens";

/** Features Section */
export function Features() {
  const features = [
    {
      title: "AI-Powered Adaptation",
      description:
        "Our AI understands platform nuances — Twitter's brevity, LinkedIn's professionalism, Instagram's visual focus.",
      icon: Sparkles,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Scheduling",
      description:
        "Schedule posts across all platforms at optimal times. Queue content weeks in advance.",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Template Library",
      description:
        "Save successful posts as templates. Reuse proven formats to speed up content creation.",
      icon: Target,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Lightning Fast",
      description:
        "Transform one post into 5+ platform-specific versions in under 10 seconds.",
      icon: Zap,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Built for Content Creators
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to maximize your content's reach — without the
            busywork
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}
                />

                <div className="relative">
                  <div
                    className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
