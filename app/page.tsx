import Link from "next/link";
import {
  ArrowRight,
  BadgeAlert,
  Blocks,
  CandlestickChart,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import Footer4Col from "@/components/ui/footer-column";
import FooterNewsletter from "@/components/ui/demo";
import EtherealBeamsHero from "@/components/ui/ethereal-beams-hero";

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

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For founders validating the rough shape of a token model.",
    features: ["1 design per month", "Charts included", "3 red flags preview", "No PDF export"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For teams preparing decks, diligence calls, and internal token decisions.",
    features: ["Unlimited designs", "Full red flag report", "PDF export", "Unlimited iterations", "Project history"],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$149",
    period: "/month",
    description: "For advisors and crypto operators handling multiple client models.",
    features: ["Everything in Pro", "Client workflows", "White-label reports soon", "API access soon", "Priority support"],
    cta: "Talk to Us",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-gray-100">
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

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Priced like software, not a consulting bottleneck.
          </h2>
          <p className="mt-5 text-base leading-8 text-gray-400">
            Start free, validate the model shape, then unlock the reporting and iteration power when the token story needs to leave your screen.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map(({ name, price, period, description, features, cta, highlight }) => (
            <div
              key={name}
              className={`rounded-[2rem] p-7 ${highlight
                  ? "glass-effect border border-white/25 shadow-2xl shadow-white/10"
                  : "glass-effect"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-white">{name}</p>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
                </div>
                {highlight && (
                  <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Best Value
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight text-white">{price}</span>
                <span className="pb-2 text-sm text-gray-500">{period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/80" />
                    <span className="leading-6">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/generate"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition ${highlight
                    ? "bg-white text-black hover:bg-gray-100"
                    : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <FooterNewsletter />
      <Footer4Col />
    </main>
  );
}
