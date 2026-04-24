import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm uppercase tracking-[0.3em] text-white/60">
          Mintomics
        </Link>
        <h1 className="mt-4 text-4xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-6 text-sm leading-8 text-gray-400">
          Mintomics stores project inputs, generated outputs, and limited usage metadata so users can reload and iterate on their models. If auth is enabled, that data is scoped to the authenticated owner.
        </p>
        <p className="mt-4 text-sm leading-8 text-gray-400">
          We use third-party infrastructure such as Clerk, OpenRouter, and Vercel Postgres where configured. We do not intentionally expose secrets client-side.
        </p>
      </div>
    </main>
  );
}
