"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

type Props = {};

export default function ForgotPasswordPage(_: Props) {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/generate";
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signInHref = useMemo(
    () =>
      `/sign-in?${new URLSearchParams({
        redirect_url: redirectUrl,
        ...(email ? { email } : {}),
      }).toString()}`,
    [email, redirectUrl],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirect_url: redirectUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send reset link.");
      }

      setMessage("If that email exists, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="glass-effect rounded-[2rem] p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            Account recovery
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Recover access to your Mintomics account.
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            Request a secure reset link and set a new password without exposing your account to unnecessary risk.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={signInHref}
              className="inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Back to sign in
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-white/25 hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-semibold text-white">
              Reset your password
            </h2>
            <p className="mt-3 text-center text-sm leading-7 text-gray-400">
              Enter your email and we will send a secure reset link.
            </p>

            {message && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-white" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b5bf7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4b4be9] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send reset link
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
