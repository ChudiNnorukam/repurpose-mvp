import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repurpose AI - Transform Your Content Across All Major Platforms",
  description: "Stop rewriting content manually. Repurpose AI automatically adapts your content for Twitter, LinkedIn, Facebook, and Instagram with AI-powered intelligence. Save hours and maintain your authentic voice across all platforms.",
  keywords: [
    "content repurposing",
    "AI content writer",
    "social media automation",
    "content marketing",
    "multi-platform posting",
    "Twitter content",
    "LinkedIn posts",
    "Instagram captions",
    "Facebook posts",
    "content strategy"
  ],
  openGraph: {
    title: "Repurpose AI - Transform Your Content Intelligently",
    description: "AI-powered content repurposing for Twitter, LinkedIn, Facebook, and Instagram. Save time and maximize your reach.",
    type: "website",
    siteName: "Repurpose AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repurpose AI - Transform Your Content",
    description: "AI-powered content adaptation across all major social platforms",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
