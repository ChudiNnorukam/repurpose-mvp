import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Repurpose
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Repurpose</h1>
        <p className="text-xl text-gray-600 mb-12">
          Your content, everywhere it matters — effortlessly.
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is Repurpose?</h2>
            <p className="text-gray-700 mb-4">
              Repurpose is an AI-powered content adaptation platform that helps content creators, marketers, and businesses maximize their reach across multiple social media platforms. We transform your original content into platform-optimized versions that maintain your authentic voice while respecting each platform's unique culture and best practices.
            </p>
            <p className="text-gray-700 mb-4">
              Instead of manually rewriting your content for Twitter, LinkedIn, and other platforms, Repurpose does the heavy lifting for you — preserving your message, tone, and personality while adapting format, length, and style to each platform's requirements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why We Built This</h2>
            <p className="text-gray-700 mb-4">
              Creating great content takes time and effort. But in today's multi-platform world, your content only reaches a fraction of your potential audience if it lives in just one place.
            </p>
            <p className="text-gray-700 mb-4">
              The problem? Each platform has different conventions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Twitter rewards brevity and hashtags</li>
              <li>LinkedIn values professional tone and longer-form insights</li>
              <li>Each platform has different character limits and formatting rules</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Manually adapting your content for each platform is tedious, time-consuming, and often leads to inconsistent quality. We built Repurpose to solve this problem — letting you focus on creating great content while we handle the distribution.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Original Content</h3>
                  <p className="text-gray-700">
                    Write your post, article, or update in your natural voice. This becomes your source content.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Adapts for Each Platform</h3>
                  <p className="text-gray-700">
                    Our AI (powered by OpenAI GPT-4) analyzes your content and creates platform-specific versions that maintain your voice while optimizing for each platform's best practices.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review and Schedule</h3>
                  <p className="text-gray-700">
                    Review the AI-adapted versions, make any tweaks you want, and schedule them to post at optimal times for each platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sit Back and Relax</h3>
                  <p className="text-gray-700">
                    Repurpose automatically posts your content to all connected platforms at the scheduled times. Your content reaches your entire audience with zero extra effort.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Adaptation</h3>
                <p className="text-gray-700">
                  Sophisticated AI that understands platform conventions and maintains your authentic voice across all adaptations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Platform Support</h3>
                <p className="text-gray-700">
                  Currently supports Twitter and LinkedIn, with more platforms coming soon.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                <p className="text-gray-700">
                  Schedule posts to publish at optimal times for each platform to maximize engagement.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Control</h3>
                <p className="text-gray-700">
                  Review and edit all AI-generated content before it goes live. You're always in control.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure OAuth Integration</h3>
                <p className="text-gray-700">
                  Connect your social media accounts securely using industry-standard OAuth authentication.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Post Management</h3>
                <p className="text-gray-700">
                  View, manage, and track all your scheduled and published posts in one centralized dashboard.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who Is This For?</h2>
            <p className="text-gray-700 mb-4">Repurpose is perfect for:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Content Creators</strong> who want to maximize their reach without spending hours on manual adaptation</li>
              <li><strong>Marketers</strong> managing multiple brand accounts across different platforms</li>
              <li><strong>Small Business Owners</strong> who need an efficient social media presence but lack dedicated social media staff</li>
              <li><strong>Thought Leaders</strong> sharing insights across professional and casual networks</li>
              <li><strong>Agencies</strong> managing content for multiple clients across various platforms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-4">
              We're committed to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Privacy:</strong> Your content is yours. We never sell or share your data.</li>
              <li><strong>Security:</strong> Industry-standard encryption and security practices protect your accounts and content.</li>
              <li><strong>Quality:</strong> Continuous AI improvements to ensure your adapted content always sounds like you.</li>
              <li><strong>Transparency:</strong> Clear pricing, clear features, no hidden fees or surprises.</li>
              <li><strong>Support:</strong> Responsive customer support to help you succeed.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Beta Program</h2>
            <p className="text-gray-700 mb-4">
              We're currently in beta, which means you get early access to Repurpose with special pricing and the opportunity to shape the product's development. Beta users enjoy:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Early access to new features</li>
              <li>Direct communication with our development team</li>
              <li>Special beta pricing (locked in even after launch)</li>
              <li>Priority support</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Join our waitlist to get beta access and help us build the best content distribution platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Roadmap</h2>
            <p className="text-gray-700 mb-4">Coming soon:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Additional platforms (Instagram, Facebook, Threads, Bluesky)</li>
              <li>Advanced analytics and performance tracking</li>
              <li>Team collaboration features</li>
              <li>Content calendar view</li>
              <li>Browser extension for quick repurposing</li>
              <li>API access for developers</li>
              <li>Custom AI voice training for consistent brand voice</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions, feedback, or feature requests? We'd love to hear from you!
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> hello@repurpose.app<br />
              <strong>Support:</strong> support@repurpose.app<br />
              <strong>Twitter:</strong> @repurpose_app
            </p>
          </section>

          <section className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-700 mb-6">
              Join our beta program and start reaching your entire audience with every piece of content you create.
            </p>
            <Link
              href="/landing"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Join the Waitlist
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2025 Repurpose. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
