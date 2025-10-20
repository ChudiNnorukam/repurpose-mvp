"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/** FAQ Section */
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the AI content adaptation work?",
      answer:
        "Our AI analyzes your original content and understands the unique requirements of each platform. It adapts tone, length, hashtags, and formatting while preserving your core message. Twitter gets concise hooks, LinkedIn gets professional depth, and Instagram gets engaging captions.",
    },
    {
      question: "Which social media platforms are supported?",
      answer:
        "Currently we support Twitter, LinkedIn, and Instagram. We're actively working on adding Facebook, TikTok, and YouTube Community posts. Each platform has unique formatting and character limits that our AI respects.",
    },
    {
      question: "Can I edit the AI-generated content before posting?",
      answer:
        "Absolutely! Every AI-generated post is fully editable. Think of our AI as a smart first draft — you have complete control to refine, adjust tone, or rewrite entirely before scheduling or posting.",
    },
    {
      question: "Is my data secure? Do you store my login credentials?",
      answer:
        "We use OAuth 2.0 for all platform connections, which means we never see or store your passwords. Your content is encrypted in transit and at rest. We're SOC 2 Type II compliant and take security seriously.",
    },
    {
      question: "How much does Repurpose cost?",
      answer:
        "We offer a free tier that includes 10 AI adaptations per month. Our Pro plan ($19/month) includes unlimited adaptations, template library, and priority support. Enterprise plans with custom integrations are available.",
    },
    {
      question: "Can I schedule posts for different time zones?",
      answer:
        "Yes! When you schedule a post, we automatically detect your timezone and display it clearly. You can schedule content days or weeks in advance across all platforms simultaneously.",
    },
    {
      question: "What happens if a scheduled post fails?",
      answer:
        "If a post fails (due to API limits, connection issues, etc.), we'll automatically retry up to 3 times and notify you via email. You can manually retry from your Posts dashboard at any time.",
    },
    {
      question: "Do you have analytics or post performance tracking?",
      answer:
        "Analytics are coming soon! We're building engagement tracking, reach metrics, and A/B testing for different content variations. Join our waitlist to be notified when it launches.",
    },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto max-w-4xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about Repurpose
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  id={`faq-answer-${index}`}
                  className="border-t border-gray-200"
                >
                  <p className="p-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
