"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Zap, Clock, Target, ChevronDown, ArrowDown } from "lucide-react"
import { COLOR_PRIMARY } from '@/lib/design-tokens'

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
    { label: "LinkedIn Post", angle: -30 },
    { label: "Twitter Thread", angle: 30 },
    { label: "IG Caption", angle: 90 },
    { label: "Carousel Copy", angle: 150 },
    { label: "FB Question", angle: -150 },
  ] as const

  return (
    <div className="relative mt-12 h-[400px] w-full max-w-[500px] select-none" data-testid="hero-radial">
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
        const angle = it.angle
        const radians = (angle * Math.PI) / 180
        const distance = 140
        const x = Math.cos(radians) * distance
        const y = Math.sin(radians) * distance

        return (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              marginLeft: `${x}px`,
              marginTop: `${y}px`
            }}
          >
            <div className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 shadow-md backdrop-blur transition hover:scale-[1.05] hover:border-white/25 hover:bg-white/10">
              {it.label}
            </div>
          </motion.div>
        )
      })}

      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-white/10" />
    </div>
  )
}


export function Hero() {
  const [showDemo, setShowDemo] = useState(false)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle esc key to close overlay
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDemo) {
        setShowDemo(false)
      }
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [showDemo])

  // Focus trap inside overlay
  useEffect(() => {
    if (!showDemo || !overlayRef.current) return

    const overlay = overlayRef.current
    const focusableElements = overlay.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when overlay opens
    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    overlay.addEventListener("keydown", handleTab as any)
    return () => overlay.removeEventListener("keydown", handleTab as any)
  }, [showDemo])

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] py-16 text-[#ededed] md:py-24" data-testid="hero-section">
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
              <Button size="sm" className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover}`}>
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
          <Button
            size="lg"
            className={`${COLOR_PRIMARY.bg} text-white ${COLOR_PRIMARY.bgHover}`}
            aria-label="Get started with AI repurposing"
            data-testid="cta-primary"
            onClick={() => router.push('/signup')}
          >
            Get Started → Transform
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            aria-label="Open example demo"
            data-testid="cta-secondary"
            onClick={() => setShowDemo(true)}
          >
            See Example
          </Button>
        </motion.div>

        <RadialVisual />

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
              <h2 id="demo-title" className="mb-6 text-2xl font-semibold">Example Transformation</h2>
              <p id="demo-description" className="text-gray-400 text-sm mb-4">See how Repurpose transforms content for different platforms</p>

              {/* Mock content preview */}
              <div className="space-y-4">
                <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                  <div className="text-xs text-white/60 mb-2">Original</div>
                  <p className="text-sm text-white/90">
                    Just shipped a new feature that lets you repurpose content across platforms in seconds!
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className={`rounded-lg border ${COLOR_PRIMARY.border} ${COLOR_PRIMARY.bgLight}/50 p-4`}>
                    <div className={`text-xs ${COLOR_PRIMARY.text} mb-2 flex items-center gap-1`}>
                      <span>🐦</span> Twitter
                    </div>
                    <p className="text-sm text-white/90">
                      🚀 New feature alert! Repurpose content across platforms in seconds ⚡

                      No more copy-paste. Just smart automation.

                      #ContentCreation #AI
                    </p>
                  </div>

                  <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
                    <div className="text-xs text-indigo-400 mb-2 flex items-center gap-1">
                      <span>💼</span> LinkedIn
                    </div>
                    <p className="text-sm text-white/90">
                      I'm excited to announce our latest feature: instant content repurposing across all major platforms.

                      This is a game-changer for content creators who want to maximize their reach without the manual work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}

/** How It Works Section */
function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Connect Your Accounts",
      description: "Link Twitter, LinkedIn, and Instagram with secure OAuth. One-time setup, fully encrypted.",
      icon: Target,
    },
    {
      number: "2",
      title: "Write Your Content",
      description: "Create your post once. Our AI understands context, tone, and audience for each platform.",
      icon: Sparkles,
    },
    {
      number: "3",
      title: "AI Adapts & Schedules",
      description: "Get platform-optimized versions instantly. Schedule or post immediately across all channels.",
      icon: Zap,
    },
  ]

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From idea to published — in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
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
                  <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${COLOR_PRIMARY.bg} text-white shadow-lg`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${COLOR_PRIMARY.bgLight} ${COLOR_PRIMARY.text} font-bold text-lg`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Features Section */
function Features() {
  const features = [
    {
      title: "AI-Powered Adaptation",
      description: "Our AI understands platform nuances — Twitter's brevity, LinkedIn's professionalism, Instagram's visual focus.",
      icon: Sparkles,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Scheduling",
      description: "Schedule posts across all platforms at optimal times. Queue content weeks in advance.",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Template Library",
      description: "Save successful posts as templates. Reuse proven formats to speed up content creation.",
      icon: Target,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Lightning Fast",
      description: "Transform one post into 5+ platform-specific versions in under 10 seconds.",
      icon: Zap,
      gradient: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Built for Content Creators</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to maximize your content's reach — without the busywork
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                <div className="relative">
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
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
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** FAQ Section */
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does the AI content adaptation work?",
      answer: "Our AI analyzes your original content and understands the unique requirements of each platform. It adapts tone, length, hashtags, and formatting while preserving your core message. Twitter gets concise hooks, LinkedIn gets professional depth, and Instagram gets engaging captions.",
    },
    {
      question: "Which social media platforms are supported?",
      answer: "Currently we support Twitter, LinkedIn, and Instagram. We're actively working on adding Facebook, TikTok, and YouTube Community posts. Each platform has unique formatting and character limits that our AI respects.",
    },
    {
      question: "Can I edit the AI-generated content before posting?",
      answer: "Absolutely! Every AI-generated post is fully editable. Think of our AI as a smart first draft — you have complete control to refine, adjust tone, or rewrite entirely before scheduling or posting.",
    },
    {
      question: "Is my data secure? Do you store my login credentials?",
      answer: "We use OAuth 2.0 for all platform connections, which means we never see or store your passwords. Your content is encrypted in transit and at rest. We're SOC 2 Type II compliant and take security seriously.",
    },
    {
      question: "How much does Repurpose cost?",
      answer: "We offer a free tier that includes 10 AI adaptations per month. Our Pro plan ($19/month) includes unlimited adaptations, template library, and priority support. Enterprise plans with custom integrations are available.",
    },
    {
      question: "Can I schedule posts for different time zones?",
      answer: "Yes! When you schedule a post, we automatically detect your timezone and display it clearly. You can schedule content days or weeks in advance across all platforms simultaneously.",
    },
    {
      question: "What happens if a scheduled post fails?",
      answer: "If a post fails (due to API limits, connection issues, etc.), we'll automatically retry up to 3 times and notify you via email. You can manually retry from your Posts dashboard at any time.",
    },
    {
      question: "Do you have analytics or post performance tracking?",
      answer: "Analytics are coming soon! We're building engagement tracking, reach metrics, and A/B testing for different content variations. Join our waitlist to be notified when it launches.",
    },
  ]

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto max-w-4xl px-6 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
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
  )
}

/** Final CTA Section */
function FinalCTA() {
  const router = useRouter()

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
          Join thousands of content creators who've automated their social media presence. Start free — no credit card required.
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
            onClick={() => router.push('/signup')}
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6"
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </motion.div>

        <p className="mt-6 text-sm text-gray-400">
          Free tier includes 10 AI adaptations/month • No credit card required
        </p>
      </div>
    </section>
  )
}

/** Footer */
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/landing" className="text-2xl font-bold text-white inline-block mb-4">
              Repurpose<span className={COLOR_PRIMARY.text}>AI</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              AI-powered content repurposing for social media. Write once, publish everywhere.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/signup" className="hover:text-white transition">Get Started</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/landing#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="/landing#faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RepurposeAI. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Twitter
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
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
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      <Hero />
      <HowItWorks />
      <Features />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
