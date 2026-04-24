import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="min-h-screen bg-dark-900 px-6 py-16 text-gray-100">
        <div className="mx-auto max-w-lg glass rounded-2xl p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-300">
            Auth Setup Needed
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Clerk is not configured yet</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable sign in and account-based project history.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900 px-6 py-16 text-gray-100">
      <div className="mx-auto max-w-md">
        <SignIn />
      </div>
    </main>
  );
}
