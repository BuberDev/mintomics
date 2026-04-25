import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";
import TrackPageView from "@/components/analytics/TrackPageView";

type SignInPageProps = {
  searchParams?: {
    redirect_url?: string;
    intent?: string;
    cycle?: string;
  };
};

function getAfterSignInUrl(searchParams?: SignInPageProps["searchParams"]) {
  const redirectUrl = searchParams?.redirect_url;
  const intent = searchParams?.intent;
  const cycle = searchParams?.cycle === "annual" ? "annual" : "monthly";

  if (intent === "upgrade") {
    return `/api/billing?cycle=${cycle}`;
  }

  if (redirectUrl && redirectUrl.startsWith("/")) {
    return redirectUrl;
  }

  return "/generate";
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  if (!isClerkConfigured()) {
    redirect("/generate");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-6 py-16 text-gray-100">
      <TrackPageView eventName="signup_started" payload={{ surface: "sign_in" }} />
      <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="glass-effect rounded-[2rem] p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            Welcome Back
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Continue where your token model left off.
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            Sign in to access saved projects, regenerate reports, and continue any upgrade flow without losing context.
          </p>
          {searchParams?.intent === "upgrade" && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              <p className="font-medium text-white">Upgrade flow</p>
              <p className="mt-2 leading-7">
                After sign-in, we will continue directly to checkout for your selected plan.
              </p>
            </div>
          )}
          <Link
            href="/sign-up"
            className="mt-6 inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Need an account? Create one
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl={getAfterSignInUrl(searchParams)}
            fallbackRedirectUrl={getAfterSignInUrl(searchParams)}
            appearance={{ elements: { footer: "hidden" } }}
          />
        </div>
      </div>
    </main>
  );
}
