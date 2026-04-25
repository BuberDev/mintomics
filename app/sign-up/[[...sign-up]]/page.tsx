import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/config";
import TrackPageView from "@/components/analytics/TrackPageView";

type SignUpPageProps = {
  searchParams?: {
    redirect_url?: string;
    intent?: string;
    cycle?: string;
  };
};

function getAfterSignUpUrl(searchParams?: SignUpPageProps["searchParams"]) {
  const redirectUrl = searchParams?.redirect_url;
  const intent = searchParams?.intent;
  const cycle = searchParams?.cycle === "annual" ? "annual" : "monthly";

  if (intent === "upgrade") {
    return `/api/billing?cycle=${cycle}`;
  }

  if (redirectUrl && redirectUrl.startsWith("/")) {
    return redirectUrl;
  }

  return "/generate?signup=1";
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  if (!isClerkConfigured()) {
    const cycle = searchParams?.cycle === "annual" ? "annual" : "monthly";
    const continueHref = searchParams?.intent === "upgrade" ? `/api/billing?cycle=${cycle}` : "/generate";

    redirect(continueHref);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-6 py-16 text-gray-100">
      <TrackPageView eventName="signup_started" payload={{ surface: "sign_up" }} />
      <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="glass-effect rounded-[2rem] p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
            Create Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            {searchParams?.intent === "upgrade" ? "Unlock Pro with a free account first." : "Set up your Mintomics workspace."}
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400">
            Mintomics uses an account to save your token models, keep your project history, and hand off securely to checkout when you upgrade.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
            {searchParams?.intent === "upgrade" ? (
              <>
                <p className="font-medium text-white">Upgrade flow</p>
                <p className="mt-2 leading-7">
                  After sign-up, we will continue directly to checkout for the selected plan.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-white">Free flow</p>
                <p className="mt-2 leading-7">
                  After sign-up, we will take you straight into your first mintomics draft.
                </p>
              </>
            )}
          </div>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl={getAfterSignUpUrl(searchParams)}
            fallbackRedirectUrl={getAfterSignUpUrl(searchParams)}
            appearance={{ elements: { footer: "hidden" } }}
          />
        </div>
      </div>
    </main>
  );
}
