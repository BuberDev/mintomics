import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="min-h-screen bg-dark-900 px-6 py-16 text-gray-100">
        <div className="mx-auto max-w-lg glass rounded-2xl p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand-300">
            Auth Setup Needed
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Create account flow is waiting on Clerk</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Once Clerk keys are configured, this route becomes the hosted sign-up flow and `/generate` can be protected automatically.
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
        <SignUp />
      </div>
    </main>
  );
}
