"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const redirectUrl = searchParams.get("redirect_url") || "/generate";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; redirectUrl?: string } | null;

      if (!response.ok || !body) {
        throw new Error(body?.error || "Unable to reset password.");
      }

      window.location.assign(body.redirectUrl || redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-gray-100 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="glass-effect rounded-[2rem] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            Account recovery
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Set a new password.
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base">
            Choose a strong password that you do not use elsewhere. This update will sign out all existing sessions for safety.
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
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 p-2.5">
                <Image src="/logo.png" alt="Mintomics" width={64} height={64} className="h-full w-full object-contain" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-2xl font-semibold text-white sm:text-3xl">
              Reset password
            </h2>
            <p className="mt-3 text-center text-sm leading-7 text-gray-400">
              {email ? `Resetting password for ${email}` : "Enter your new password below."}
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {!token ? (
              <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                This reset link is missing its token. Request a new one from the sign-in page.
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                    placeholder="At least 12 characters"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white" htmlFor="confirmPassword">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                    placeholder="Repeat your password"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5b5bf7] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4b4be9] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Reset password
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
