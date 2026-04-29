import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Sparkles, Users } from "lucide-react";
import TrackPageView from "@/components/analytics/TrackPageView";
import AgencyLeadForm from "@/components/agency/AgencyLeadForm";

export const metadata: Metadata = {
  title: "Agency & Enterprise Tokenomics Solutions | Mintomics",
  description:
    "Mintomics Agency is the elite tier for Web3 consultants and studios. Scale your tokenomics advisory with white-label reports, multi-client management, and priority support.",
  alternates: {
    canonical: "/agency",
  },
};

const highlights = [
  {
    icon: Users,
    title: "Multi-client delivery",
    text: "Run repeatable tokenomics work for multiple founders without mixing workspaces or billing.",
  },
  {
    icon: ShieldCheck,
    title: "White-label-ready workflow",
    text: "Present the output as your own service while Mintomics handles the heavy lifting in the background.",
  },
  {
    icon: BadgeCheck,
    title: "Priority onboarding",
    text: "We help map your workflow, pricing, and approval process before a team rolls out the product.",
  },
] as const;

const steps = [
  "Submit a request with your client volume and workflow.",
  "We review fit, discuss implementation, and confirm pricing.",
  "We activate Agency access and support onboarding.",
] as const;

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-black text-gray-100">
      <TrackPageView eventName="pricing_viewed" payload={{ surface: "agency_page" }} />

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
            Agency
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Built for consultants who need repeatable delivery and a cleaner client workflow.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
            Agency is the hands-on tier for teams shipping tokenomics across multiple clients. It uses a sales-assisted onboarding flow with structured intake, priority setup, and a white-label-ready delivery model.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Sparkles className="h-5 w-5 text-white/85" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                  What Agency includes
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  A delivery model designed for teams, not just individual founders.
                </h2>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-white/80" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Onboarding flow
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
                {steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Pricing
              </p>
              <div className="mt-4">
                <p className="text-4xl font-semibold tracking-tight text-white">$149</p>
                <p className="mt-2 text-sm text-gray-400">per month, or $1,199 per year</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                Agency is designed for founders, advisors, and studios who want to deliver investor-ready tokenomics repeatedly without rebuilding the workflow each time.
              </p>
            </section>

            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Request Agency access
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Tell us what you need and we will shape the onboarding call.
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                This keeps the handoff structured, captures intent in the product, and gives us a clean audit trail for follow-up.
              </p>
              <div className="mt-6">
                <AgencyLeadForm />
              </div>
            </section>

            <section className="glass-effect rounded-[2rem] border border-white/10 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Good fit
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
                <li>• Token consultants managing multiple projects in parallel</li>
                <li>• Studios that need repeatable, branded output</li>
                <li>• Teams who want onboarding support and workflow alignment</li>
              </ul>
              <Link
                href="/pricing"
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
              >
                Back to pricing
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
