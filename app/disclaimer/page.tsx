import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | Mintomics",
  description:
    "Mintomics provides decision support only. Review generated tokenomics with legal, compliance, and token engineering experts.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm uppercase tracking-[0.3em] text-white/60">
          Mintomics
        </Link>
        <h1 className="mt-4 text-4xl font-semibold text-white">Not Financial Advice</h1>
        <p className="mt-6 text-sm leading-8 text-gray-400">
          Mintomics provides decision support only. The generated tokenomics output should be reviewed by legal counsel, compliance specialists, and an experienced token engineer before launch.
        </p>
      </div>
    </main>
  );
}
