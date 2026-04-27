import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Mintomics",
  description:
    "Review the Mintomics terms of service, including product usage, service availability, and responsibility for tokenomics output.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm uppercase tracking-[0.3em] text-white/60">
          Mintomics
        </Link>
        <h1 className="mt-4 text-4xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-6 text-sm leading-8 text-gray-400">
          Mintomics is a decision-support product for token design. By using the app, you agree to use the output responsibly, review it with qualified professionals, and accept that the service may change as the product evolves.
        </p>
        <p className="mt-4 text-sm leading-8 text-gray-400">
          The service is provided as-is, without warranties of any kind. We may suspend or modify features, pricing, or access to protect the product and its users.
        </p>
      </div>
    </main>
  );
}
