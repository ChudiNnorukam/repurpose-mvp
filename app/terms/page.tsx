import Link from 'next/link'

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Repurpose ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Repurpose is a content adaptation platform that helps users repurpose their content across multiple social media platforms including Twitter and LinkedIn. The Service uses artificial intelligence to adapt your content while maintaining your authentic voice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 mb-4">
              You must create an account to use the Service. You agree to provide accurate, current, and complete information during registration and to keep this information updated.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Age Requirement</h3>
            <p className="text-gray-700 mb-4">
              You must be at least 13 years old to use this Service. Users under 18 must have parental or guardian consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Social Media Integration</h2>
            <p className="text-gray-700 mb-4">
              By connecting your social media accounts (Twitter, LinkedIn), you authorize Repurpose to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Access your account information as permitted by the platform's OAuth authorization</li>
              <li>Post content to your accounts on your behalf</li>
              <li>Store OAuth access tokens securely to maintain the connection</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can revoke these permissions at any time by disconnecting your accounts in your settings or through the respective social media platform's settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Content Ownership</h3>
            <p className="text-gray-700 mb-4">
              You retain all ownership rights to the content you create and submit through the Service. By using the Service, you grant Repurpose a non-exclusive, worldwide license to process, adapt, and post your content as directed by you.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Content Restrictions</h3>
            <p className="text-gray-700 mb-4">You agree not to post content that:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains hate speech, harassment, or discriminatory content</li>
              <li>Contains malware, viruses, or malicious code</li>
              <li>Promotes illegal activities or violence</li>
              <li>Violates the terms of service of connected social media platforms</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Content Responsibility</h3>
            <p className="text-gray-700 mb-4">
              You are solely responsible for all content you post through the Service. Repurpose is not responsible for user-generated content and does not endorse any opinions expressed by users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI-Generated Content</h2>
            <p className="text-gray-700 mb-4">
              The Service uses artificial intelligence (OpenAI GPT-4) to adapt your content. While we strive for accuracy and quality:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>AI-adapted content should be reviewed before posting</li>
              <li>You are responsible for all content posted, including AI-adapted versions</li>
              <li>We do not guarantee that AI adaptations will be error-free or meet your expectations</li>
              <li>You should verify accuracy of factual information in AI-adapted content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Spam or send unsolicited communications using the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We strive to provide reliable service, but we do not guarantee that the Service will be available at all times. The Service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not liable for any losses resulting from service interruptions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Subscription and Payment</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Beta Access</h3>
            <p className="text-gray-700 mb-4">
              During the beta period, the Service may be offered free of charge or at discounted rates. We reserve the right to introduce pricing at any time with reasonable notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Future Pricing</h3>
            <p className="text-gray-700 mb-4">
              When subscription plans are introduced, payment terms will be clearly communicated. Subscriptions may be subject to automatic renewal unless canceled.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.3 Refunds</h3>
            <p className="text-gray-700 mb-4">
              Refund policies will be specified in the subscription terms when pricing is introduced.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 By You</h3>
            <p className="text-gray-700 mb-4">
              You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 By Us</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account if you violate these Terms of Service, engage in fraudulent activity, or use the Service in a manner that harms other users or our business.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Effect of Termination</h3>
            <p className="text-gray-700 mb-4">
              Upon termination, your right to use the Service ceases immediately. Your data will be deleted according to our Privacy Policy data retention schedule.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service, including all software, design, text, graphics, and other content (excluding user content), is owned by Repurpose and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 mb-4">
              We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, REPURPOSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-700 mb-4">
              Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the twelve months prior to the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless Repurpose, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you post through the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              The Service integrates with third-party platforms (Twitter, LinkedIn, OpenAI, etc.). Your use of these platforms is subject to their respective terms of service. We are not responsible for the actions, policies, or content of third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved in the courts located in [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              For any disputes arising from these Terms or the Service, you agree to first attempt to resolve the dispute informally by contacting us. If we cannot resolve the dispute within 30 days, either party may pursue formal dispute resolution.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. Severability</h2>
            <p className="text-gray-700 mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">20. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> legal@repurpose.app<br />
              <strong>Address:</strong> [Your Business Address]
            </p>
          </section>

          <section className="mb-8">
            <p className="text-gray-700 mb-4">
              By using Repurpose, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
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
