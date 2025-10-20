"use client";

import Link from "next/link";
import { COLOR_PRIMARY } from "@/lib/design-tokens";

/** Footer */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link
              href="/landing"
              className="text-2xl font-bold text-white inline-block mb-4"
            >
              Repurpose<span className={COLOR_PRIMARY.text}>AI</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              AI-powered content repurposing for social media. Write once,
              publish everywhere.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/landing#features"
                  className="hover:text-white transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/landing#faq"
                  className="hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RepurposeAI. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
