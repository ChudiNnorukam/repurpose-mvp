"use client";

import { motion } from "framer-motion";
import { Twitter, Linkedin, Instagram } from "lucide-react";

/** Social Proof Section */
export function SocialProof() {
  return (
    <section className="bg-gray-50 py-12 border-b border-gray-200">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <p className="text-sm text-gray-500 mb-2">
              Trusted by content creators
            </p>
            <p className="text-3xl font-bold text-gray-900">1,000+ Creators</p>
          </motion.div>

          <div className="h-12 w-px bg-gray-300 hidden md:block" aria-hidden />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6"
          >
            <div className="flex flex-col items-center">
              <Twitter
                className="h-8 w-8 text-blue-500 mb-2"
                aria-label="Twitter"
              />
              <span className="text-xs text-gray-500">Twitter</span>
            </div>
            <div className="flex flex-col items-center">
              <Linkedin
                className="h-8 w-8 text-blue-700 mb-2"
                aria-label="LinkedIn"
              />
              <span className="text-xs text-gray-500">LinkedIn</span>
            </div>
            <div className="flex flex-col items-center">
              <Instagram
                className="h-8 w-8 text-pink-600 mb-2"
                aria-label="Instagram"
              />
              <span className="text-xs text-gray-500">Instagram</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
