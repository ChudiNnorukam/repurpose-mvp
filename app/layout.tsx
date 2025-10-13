import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Repurpose AI - Transform Your Content Across Platforms",
  description: "Repurpose your content intelligently across Twitter, LinkedIn, Facebook, and Instagram with AI-powered adaptations. Save time and maximize your reach.",
  keywords: ["content repurposing", "AI content", "social media", "content marketing", "multi-platform posting"],
  authors: [{ name: "Repurpose AI" }],
  openGraph: {
    title: "Repurpose AI - Transform Your Content Across Platforms",
    description: "AI-powered content repurposing for Twitter, LinkedIn, Facebook, and Instagram",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repurpose AI - Transform Your Content",
    description: "AI-powered content repurposing across all major social platforms",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
