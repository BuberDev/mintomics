import Link from "next/link";
import AuthControls from "@/components/auth/AuthControls";
import TrackPageView from "@/components/analytics/TrackPageView";
import PricingTiers from "@/components/pricing/PricingTiers";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";
import { ArrowRight, CircleDollarSign, LockKeyhole, UserPlus2 } from "lucide-react";

type PricingPageProps = {
  searchParams?: {
    billing?: string;
    cycle?: string;
    missing?: string;
  };
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  const isSignedIn = isClerkConfigured() ? Boolean(auth().userId) : false;
  const billingMissing = searchParams?.billing === "missing";
  const selectedCycle = searchParams?.cycle === "annual" ? "annual" : "monthly";
  const missingKeys = (searchParams?.missing ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-black text-gray-100">
      <TrackPageView eventName="pricing_viewed" payload={{ surface: "pricing_page" }} />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
          Mintomics
        </Link>
        <AuthControls mode="landing" />
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Choose the workflow that matches where your token model is going.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
            Free is enough to validate the shape. Pro is for investor-ready sharing and repeatable export. Agency is for teams and consultants who need custom onboarding.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Annual billing includes 2 months free and routes through Stripe Checkout.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: UserPlus2,
              title: "Pick a plan",
              text: "Choose the tier that matches your workflow without extra setup steps.",
            },
            {
              icon: CircleDollarSign,
              title: "Secure checkout",
              text: "Stripe opens with the selected plan, billing cycle, and pricing already filled in.",
            },
            {
              icon: LockKeyhole,
              title: "Return to product",
              text: "After checkout, you come back to Mintomics ready to generate and iterate.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="glass-effect rounded-[1.75rem] border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-white/85" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                      0{index + 1}
                    </span>
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-gray-400">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {billingMissing && (
          <section className="mt-10 rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-6 text-amber-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
              Checkout Not Configured
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {selectedCycle === "annual" ? "Annual" : "Monthly"} checkout is not connected yet.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-amber-100/85">
              The billing handoff cannot continue because a Stripe price ID is missing in your environment variables. Add the correct Stripe price ID, restart the dev server, and the button will redirect normally.
            </p>

            <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
              <p className="font-medium text-white">Missing variables</p>
              <ul className="space-y-2">
                {missingKeys.length > 0 ? (
                  missingKeys.map((key) => <li key={key}>• {key}</li>)
                ) : (
                  <>
                    <li>• `STRIPE_PRO_MONTHLY_PRICE_ID` or `STRIPE_PRO_ANNUAL_PRICE_ID`</li>
                    <li>• `STRIPE_SECRET_KEY`</li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
              >
                Retry checkout
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
              >
                Back to home
              </Link>
            </div>
          </section>
        )}

        <PricingTiers isSignedIn={isSignedIn} />
      </section>
    </main>
  );
}
