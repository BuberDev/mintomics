import {
  BadgeAlert,
  Blocks,
  CandlestickChart,
  Layers3,
} from "lucide-react";
import FooterNewsletter from "@/components/ui/demo";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";
import SiteHeader from "@/components/ui/site-header";
import TrackPageView from "@/components/analytics/TrackPageView";
import PricingTiers from "@/components/pricing/PricingTiers";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";

const featureCards = [
  {
    icon: Layers3,
    title: "Allocation logic that feels institutional",
    desc: "Turn founder intuition into a clean token split with rationale that can survive partner questions and committee reviews.",
  },
  {
    icon: CandlestickChart,
    title: "Emission and unlock pressure in one pass",
    desc: "Model circulation growth, surface dangerous unlock windows, and see where your token story actually breaks under pressure.",
  },
  {
    icon: BadgeAlert,
    title: "Red flags before investors find them",
    desc: "Mintomics calls out concentration, vesting misalignment, and launch-risk patterns before they damage conviction.",
  },
];

const processSteps = [
  {
    label: "01",
    title: "Describe the project",
    desc: "A short wizard captures utility, supply, raise assumptions, and the founder's preferred vesting posture.",
  },
  {
    label: "02",
    title: "Generate the full model",
    desc: "The engine produces allocation, schedules, circulation, pressure scenarios, and investor-readiness scoring.",
  },
  {
    label: "03",
    title: "Iterate with conviction",
    desc: "Tweak assumptions, compare versions, export a polished report, and come back to saved projects later.",
  },
];

const testimonials = [
  {
    quote:
      "It cut our token design review from a week of whiteboarding to one usable model in a single session.",
    name: "Nina K.",
    role: "DeFi founder",
  },
  {
    quote:
      "The red flag breakdown is the first AI output I felt comfortable putting in front of an advisor call.",
    name: "Marcus L.",
    role: "Crypto operator",
  },
  {
    quote:
      "I stopped rebuilding spreadsheets for every client. The structure is clean enough to ship.",
    name: "Sofia R.",
    role: "Web3 advisor",
  },
] as const;

export default function LandingPage() {
  const isSignedIn = isClerkConfigured() ? Boolean(auth().userId) : false;

  return (
    <main className="min-h-screen overflow-hidden bg-black text-gray-100">
      <SiteHeader />
      <TrackPageView eventName="landing_viewed" payload={{ surface: "home" }} />
      <EtherealBeamsHero />

      <section id="features" className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="glass-effect rounded-[2rem] p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
              Why This Feels Different
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Less spreadsheet theatre. More decision-ready token design.
            </h2>
            <p className="mt-6 text-base leading-8 text-gray-400">
              Most tools either drown founders in simulation jargon or stop at toy calculators. Mintomics is built around the actual moments that matter: shaping a credible launch narrative, avoiding obvious cap table mistakes, and surviving investor scrutiny.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                "Structured founder input instead of expert-only controls",
                "Benchmark-aware recommendations instead of blank canvases",
                "Report-first output designed for sharing, not just screen viewing",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Blocks className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/80" />
                  <p className="text-sm leading-7 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-6 md:grid-cols-2 xl:grid-cols-3 lg:self-start">
            {featureCards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-effect h-auto rounded-[2rem] p-6 shadow-[0_16px_45px_rgba(0,0,0,0.34)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_24px_60px_rgba(0,0,0,0.48)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/85">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Workflow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            From founder input to investor-grade output in one focused pass.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {processSteps.map(({ label, title, desc }) => (
            <div
              key={label}
              className="glass-effect rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/50">
                {label}
              </p>
              <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="readiness" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-effect rounded-[2rem] p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
              Readiness Layer
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Founders do not need another pretty chart. They need fewer blind spots.
            </h2>
            <p className="mt-6 text-base leading-8 text-gray-400">
              Mintomics scores models across allocation concentration, vesting hygiene, unlock risk, and investor narrative quality, then turns that into a clear direction for the next iteration.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ["Allocation balance", "Avoid over-weighting insiders before network growth has a chance."],
              ["Vesting discipline", "Reward long-term operators without creating obvious exit risk."],
              ["Launch pressure", "See which months could create market stress before you commit publicly."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="glass-effect rounded-2xl p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Early Feedback
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Builders want clarity, not another token spreadsheet.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map(({ quote, name, role }) => (
            <figure
              key={name}
              className="glass-effect rounded-[2rem] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <blockquote className="text-base leading-8 text-gray-300">
                “{quote}”
              </blockquote>
              <figcaption className="mt-6">
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Transparent pricing for teams that need speed, signal, and exportable output.
          </h2>
          <p className="mt-5 text-base leading-8 text-gray-400">
            Start free to validate the shape. Move to Pro for investor-ready reports, or Agency when you need repeatable delivery for clients.
          </p>
        </div>

        <div className="mt-14">
          <PricingTiers isSignedIn={isSignedIn} />
        </div>
      </section>

      <FooterNewsletter />
    </main>
  );
}
