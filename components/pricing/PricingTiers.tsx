"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import TrackedLink from "@/components/analytics/TrackedLink";

type BillingCycle = "monthly" | "annual";

const tiers = {
  free: {
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    period: "forever",
    description: "Generate one model per month and copy the summary into your deck.",
    features: ["1 design per month", "3 red flags preview", "Charts included", "No PDF export"],
    href: "/generate",
    cta: "Start Free",
  },
  pro: {
    name: "Pro",
    monthlyPrice: "$49",
    annualPrice: "$399",
    periodMonthly: "/month",
    periodAnnual: "/year",
    description: "Unlimited iteration, branded PDF export, and the full red flag report.",
    features: ["Unlimited designs", "Full red flags", "Project history", "PDF export", "Investor-ready sharing"],
    cta: "Go Pro",
    featured: true,
  },
  agency: {
    name: "Agency",
    monthlyPrice: "$149",
    annualPrice: "$1,199",
    periodMonthly: "/month",
    periodAnnual: "/year",
    description: "For consultants and teams shipping tokenomics repeatedly across multiple clients.",
    features: ["Unlimited clients", "White-label-ready delivery", "Priority support", "Roadmap access"],
    href: "/agency",
    cta: "Talk to Sales",
  },
} as const;

interface PricingTiersProps {
  isSignedIn: boolean;
}

export default function PricingTiers({ isSignedIn }: PricingTiersProps) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const cycleLabel = useMemo(
    () => (cycle === "annual" ? "Annual billing - 2 months free" : "Monthly billing"),
    [cycle],
  );

  const getPlanHref = () => {
    const cycleParam = cycle === "annual" ? "annual" : "monthly";
    return `/api/billing?cycle=${cycleParam}`;
  };

  return (
    <>
      <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
        {(["monthly", "annual"] as BillingCycle[]).map((option) => (
          <button
            key={option}
            onClick={() => setCycle(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              cycle === option ? "bg-white text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            {option === "monthly" ? "Monthly" : "Annual"}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-gray-400">{cycleLabel}</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[tiers.free, tiers.pro, tiers.agency].map((tier) => {
          const isFeatured = "featured" in tier && tier.featured;
          const isFree = tier.name === "Free";
          const href = isFree
            ? tier.href
            : "href" in tier
              ? tier.href
              : getPlanHref();
          const price = isFree
            ? tier.monthlyPrice
            : cycle === "annual"
              ? tier.annualPrice
              : tier.monthlyPrice;
          const period = isFree
            ? tier.period
            : cycle === "annual"
              ? tier.periodAnnual
              : tier.periodMonthly;

          return (
            <div
              key={tier.name}
              className={`rounded-[2rem] p-7 ${isFeatured ? "glass-effect border border-white/25 shadow-2xl shadow-white/10" : "glass-effect"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-xl font-semibold text-white">{tier.name}</p>
                {isFeatured ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    Recommended
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                    {tier.name === "Pro" ? "Investor-ready" : "Advisor-ready"}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-400">{tier.description}</p>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight text-white">{price}</span>
                <span className="pb-2 text-sm text-gray-500">{period ?? ""}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <TrackedLink
                href={href}
                eventName="cta_clicked"
                eventPayload={{
                  surface: "pricing",
                  tier: tier.name,
                  cycle,
                  signedIn: isSignedIn,
                }}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                  isFeatured
                    ? "bg-white text-black hover:bg-gray-100"
                    : "border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4" />
              </TrackedLink>
              {!isFree && (
                <div className="mt-4 flex items-start gap-2 text-xs leading-6 text-gray-500">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                  <p>{tier.name === "Agency" ? "We will respond with a tailored setup and migration plan." : "Checkout opens immediately and your workspace stays connected to billing."}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
