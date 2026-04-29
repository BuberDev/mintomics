import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Mintomics",
  description:
    "Read how Mintomics stores project inputs, generated outputs, and usage metadata, and how we handle third-party infrastructure.",
  alternates: {
    canonical: "/privacy",
  },
};

import LegalLayout from "@/components/legal/LegalLayout";

const toc = [
  { id: "collection", title: "1. Information We Collect" },
  { id: "usage", title: "2. How We Use Your Information" },
  { id: "sharing", title: "3. Information Sharing" },
  { id: "security", title: "4. Data Security" },
  { id: "cookies", title: "5. Cookies and Tracking" },
  { id: "rights", title: "6. Your Rights" },
  { id: "contact", title: "7. Contact Us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your data when you use the Mintomics platform."
      lastUpdated="April 29, 2026"
      toc={toc}
    >
      <section id="collection" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">1. Information We Collect</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            When you use Mintomics, we collect information that you provide directly to us, such as when you create an account, fill out a project wizard, or contact support. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name, password)</li>
            <li>Project inputs (token supply, funding stage, descriptions)</li>
            <li>Billing information (processed securely via Stripe)</li>
            <li>Communication records between you and Mintomics</li>
          </ul>
        </div>
      </section>

      <section id="usage" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">2. How We Use Your Information</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing and maintaining the Mintomics Service</li>
            <li>Generating AI-driven tokenomics models based on your inputs</li>
            <li>Processing transactions and sending related information</li>
            <li>Sending technical notices, updates, and support messages</li>
            <li>Analyzing usage trends to improve the platform</li>
          </ul>
        </div>
      </section>

      <section id="sharing" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">3. Information Sharing</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            We do not sell your personal data. We only share information with third-party service providers that perform services on our behalf, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Clerk:</strong> For authentication and user management</li>
            <li><strong>Stripe:</strong> For payment processing and billing</li>
            <li><strong>OpenRouter:</strong> For processing AI generation requests (project inputs are sent to LLM providers)</li>
            <li><strong>Resend:</strong> For transactional email delivery</li>
          </ul>
        </div>
      </section>

      <section id="security" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">4. Data Security</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.
          </p>
          <p>
            We use industry-standard security measures, including encryption at rest and in transit, to protect your personal information. Database access is restricted and monitored.
          </p>
        </div>
      </section>

      <section id="cookies" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">5. Cookies and Tracking</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
          </p>
          <p>
            Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </div>
      </section>

      <section id="rights" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">6. Your Rights</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The right to access and receive a copy of your data</li>
            <li>The right to rectify inaccurate or incomplete information</li>
            <li>The right to request deletion of your personal data</li>
            <li>The right to object to or restrict certain processing</li>
          </ul>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">7. Contact Us</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <p className="font-medium text-white">
            Email: hello@mintomics.com
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
