"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

type Props = {
  mode: AuthMode;
};

type AuthError = {
  error: string;
  code?: string;
  issues?: Array<{ path?: (string | number)[]; message: string }>;
  redirectUrl?: string;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.42 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.038l5.657-5.657C34.999 6.053 29.749 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.038l5.657-5.657C34.999 6.053 29.749 4 24 4 15.318 4 7.86 8.84 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.622 0 10.721-2.149 14.616-5.639l-6.744-5.715C29.842 34.846 27.072 36 24 36c-5.397 0-9.618-3.322-11.271-7.956l-6.522 5.02C7.736 39.523 15.236 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a11.95 11.95 0 0 1-4.431 5.646h.001l6.744 5.715C36.741 39.835 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

export default function AuthFlowPage({ mode }: Props) {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const cycle = searchParams.get("cycle") === "annual" ? "annual" : "monthly";
  const initialEmail = searchParams.get("email") ?? "";
  const rawRedirectUrl = searchParams.get("redirect_url") || "/generate";
  const redirectUrl = rawRedirectUrl.startsWith("/") ? rawRedirectUrl : "/generate";
  const postAuthRedirect = intent === "upgrade" ? `/api/billing?cycle=${cycle}` : redirectUrl;
  const errorParam = searchParams.get("error");
  const verificationNotice = searchParams.get("verification");
  const [formState, setFormState] = useState({
    email: initialEmail,
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    verificationNotice === "sent"
      ? "We sent a verification email. Please check your inbox before signing in."
      : verificationNotice === "resent"
        ? "We sent another verification email. Please check your inbox."
        : null,
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    errorParam ? decodeURIComponent(errorParam) : null,
  );

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ user: { id: string } | null }>;
      })
      .then((payload) => {
        if (!cancelled && payload?.user) {
          window.location.replace(postAuthRedirect);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [postAuthRedirect]);

  const pageMeta = useMemo(() => {
    if (mode === "sign-in") {
      return {
        eyebrow: "Welcome back",
        title: "Sign in to continue your Mintomics work.",
        subtitle:
          "Pick up saved projects, open your billing center, or continue straight into a generation flow.",
        switchLabel: "Need an account?",
        switchHref: `/sign-up?${new URLSearchParams({
          redirect_url: redirectUrl,
          ...(intent ? { intent } : {}),
          ...(searchParams.get("cycle") ? { cycle } : {}),
        }).toString()}`,
        submitLabel: "Sign in",
        googleLabel: "Continue with Google",
        forgotHref: `/forgot-password?${new URLSearchParams({
          redirect_url: redirectUrl,
          ...(formState.email ? { email: formState.email } : {}),
        }).toString()}`,
      };
    }

    return {
      eyebrow: "Create account",
      title: "Start your Mintomics workspace.",
      subtitle:
        "Create a secure account so your projects, billing, and generation history stay connected.",
      switchLabel: "Already have an account?",
      switchHref: `/sign-in?${new URLSearchParams({
        redirect_url: redirectUrl,
        ...(intent ? { intent } : {}),
        ...(searchParams.get("cycle") ? { cycle } : {}),
      }).toString()}`,
      submitLabel: "Create account",
      googleLabel: "Continue with Google",
    };
  }, [formState.email, intent, mode, redirectUrl, searchParams]);

  const forgotPasswordHref =
    mode === "sign-in"
      ? pageMeta.forgotHref!
      : `/forgot-password?${new URLSearchParams({
          redirect_url: redirectUrl,
          ...(formState.email ? { email: formState.email } : {}),
        }).toString()}`;

  const googleHref = `/api/auth/google/start?redirect_url=${encodeURIComponent(postAuthRedirect)}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrorCode(null);
    setVerificationMessage(null);

    try {
      const endpoint = mode === "sign-in" ? "/api/auth/sign-in" : "/api/auth/sign-up";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          redirect_url: postAuthRedirect,
          intent,
          cycle,
        }),
      });

      const body = (await response.json().catch(() => null)) as AuthError | null;

      if (!response.ok || !body) {
        if (body?.code === "email_not_verified") {
          setErrorCode(body.code);
        }
        throw new Error(body?.error || "Unable to continue.");
      }

      window.location.assign(body.redirectUrl || postAuthRedirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formState.email) {
      setError("Enter your email address first.");
      return;
    }

    setIsResendingVerification(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formState.email }),
      });

      if (!response.ok) {
        throw new Error("Unable to resend verification email.");
      }

      setVerificationMessage("We sent a fresh verification email. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend verification email.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-gray-100">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="glass-effect rounded-[2rem] p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            {pageMeta.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            {pageMeta.title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            {pageMeta.subtitle}
          </p>

          {intent === "upgrade" && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              <p className="font-medium text-white">Upgrade flow</p>
              <p className="mt-2 leading-7">
                After authentication we will continue directly to checkout for your selected plan.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={pageMeta.switchHref}
              className="inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              {pageMeta.switchLabel} {mode === "sign-in" ? "Create one" : "Sign in"}
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-white/25 hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-gray-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">Security first</p>
              <p className="mt-2 leading-7">
                Sessions are stored in secure httpOnly cookies and tied to your Mintomics workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-medium text-white">Single account surface</p>
              <p className="mt-2 leading-7">
                Google login and email/password live in one clean flow, with no hosted third-party portal.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full  p-2.5">
                <Image
                  src="/logo.png"
                  alt="Mintomics"
                  width={64}
                  height={64}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-semibold text-white">
              {mode === "sign-in" ? "Sign in to Mintomics" : "Create your account"}
            </h2>
            <p className="mt-3 text-center text-sm leading-7 text-gray-400">
              {mode === "sign-in"
                ? "Welcome back. Sign in to continue."
                : "A few details and you are ready to build."}
            </p>

            {verificationMessage && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {verificationMessage}
              </div>
            )}

            <a
              href={googleHref}
              className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
            >
              <GoogleMark />
              {pageMeta.googleLabel}
            </a>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.28em] text-white/35">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white" htmlFor="displayName">
                    Display name
                  </label>
                  <input
                    id="displayName"
                    value={formState.displayName}
                    onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                    placeholder="Mintomics Studio"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-white" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  value={formState.email}
                  onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  value={formState.password}
                  onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                  placeholder="At least 12 characters"
                  type="password"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                />
              </div>

              {mode === "sign-in" && (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Link href={forgotPasswordHref} className="text-white/70 underline-offset-4 hover:text-white hover:underline">
                    Forgot password?
                  </Link>
                  {errorCode === "email_not_verified" && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="text-white/70 underline-offset-4 hover:text-white hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResendingVerification ? "Sending..." : "Resend verification"}
                    </button>
                  )}
                </div>
              )}

              {mode === "sign-up" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-white" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    value={formState.confirmPassword}
                    onChange={(event) => setFormState((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-white/30"
                    placeholder="Repeat your password"
                    type="password"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    {pageMeta.submitLabel}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-6 text-gray-500">
              By continuing, you agree to the Mintomics terms and privacy policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
