"use client";

import Link from "next/link";
import { ChevronRight, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import BrandLogo from "@/components/ui/brand-logo";

const footerColumns = [
  {
    title: "What You Get",
    links: [
      { text: "Allocation Breakdown", href: "/#features" },
      { text: "Vesting Timelines", href: "/#process" },
      { text: "Emission Modeling", href: "/#readiness" },
      { text: "Sell Pressure Scenarios", href: "/generate" },
      { text: "Investor Red Flags", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "Product Walkthrough", href: "/generate" },
      { text: "Founder FAQ", href: "/pricing" },
      { text: "Launch Checklist", href: "/generate" },
      { text: "PRD Roadmap", href: "/terms" },
      { text: "Beta Updates", href: "mailto:hello@Mintomics.ai" },
    ],
  },
  {
    title: "Why Teams Switch",
    links: [
      { text: "Faster than consultants", href: "/#process" },
      { text: "Cheaper than custom work", href: "/pricing" },
      { text: "Built for founders", href: "/#features" },
      { text: "Investor-facing output", href: "/pricing" },
      { text: "Instant iterations", href: "/generate" },
    ],
  },
];

const legalLinks = [
  { text: "Terms of Service", href: "/terms" },
  { text: "Privacy Policy", href: "/privacy" },
  { text: "Disclaimer", href: "/disclaimer" },
];

const socialIcons = [
  { icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com/Mintomicsai" },
  { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com/Mintomicsai" },
  { icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com/company/Mintomicsai" },
  { icon: <Youtube className="h-5 w-5" />, href: "https://youtube.com/@Mintomicsai" },
];

export default function FooterNewsletter() {
  return (
    <section className="relative w-full pt-14 pb-2">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-96 w-96 rounded-full bg-slate-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="glass-effect mb-10 overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-[0_22px_70px_rgba(0,0,0,0.45)] md:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                Private Beta Signal
              </p>
              <h3 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Build a token narrative investors can interrogate, not just admire.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
                Get product updates, launch notes, and examples of strong allocation design straight from the Mintomics beta workflow.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  aria-label="Work email"
                  className="input-field h-12 rounded-xl border-white/15 bg-black/45 px-4 focus:border-white/40 focus:ring-white/20 sm:min-w-0 sm:flex-1"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-100 sm:w-auto"
                >
                  Join the Beta List
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-gray-500">
                No spam. Just product notes, launch updates, and examples we would actually present in a founder meeting.
              </p>
            </div>

            <div className="hidden lg:flex lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rotate-6 rounded-[1.75rem] bg-gradient-to-br from-white/30 via-white/10 to-slate-300/20" />
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=720&q=80"
                  alt="Web3 founders in a strategy workshop"
                  className="relative h-[300px] w-[420px] rounded-[1.5rem] object-cover shadow-2xl shadow-black/30"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-6 flex items-center space-x-3">
              <BrandLogo
                variant="wordmark"
                alt="Mintomics"
                width={220}
                height={56}
                className="h-10 w-auto"
              />
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-400">
              Built for Web3 founders who need sharp token logic, cleaner unlock narratives, and investor-ready reporting without waiting on a consulting sprint.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {socialIcons.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="glass-effect flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition hover:border-white/30 hover:text-white"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map(({ text, href }) => (
                  <li key={text}>
                    <Link href={href} className="text-sm text-gray-400 transition hover:text-white">
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2026 Mintomics. Built for serious token design.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map(({ text, href }) => (
              <Link
                key={text}
                href={href}
                className="text-sm text-gray-500 transition hover:text-white"
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
