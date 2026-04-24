"use client";

import Link from "next/link";
import { ChevronRight, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import BrandLogo from "@/components/ui/brand-logo";

const footerColumns = [
  {
    title: "What You Get",
    links: [
      "Allocation Breakdown",
      "Vesting Timelines",
      "Emission Modeling",
      "Sell Pressure Scenarios",
      "Investor Red Flags",
    ],
  },
  {
    title: "Resources",
    links: ["Product Walkthrough", "Founder FAQ", "Launch Checklist", "PRD Roadmap", "Beta Updates"],
  },
  {
    title: "Why Teams Switch",
    links: ["Faster than consultants", "Cheaper than custom work", "Built for founders", "Investor-facing output", "Instant iterations"],
  },
];

const legalLinks = [
  "Terms of Service",
  "Privacy Policy",
  "Cookie Settings",
  "Disclaimer",
];

const socialIcons = [
  { icon: <Instagram className="h-5 w-5" />, href: "https://instagram.com/tokenforgeai" },
  { icon: <Twitter className="h-5 w-5" />, href: "https://twitter.com/tokenforgeai" },
  { icon: <Linkedin className="h-5 w-5" />, href: "https://linkedin.com/company/tokenforgeai" },
  { icon: <Youtube className="h-5 w-5" />, href: "https://youtube.com/@tokenforgeai" },
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
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                Founder Signal
              </p>
              <h3 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Build a mintomics narrative investors can interrogate, not just admire.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-400">
                Get product updates, launch notes, and examples of strong allocation design straight from the Mintomics beta workflow.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="input-field h-12 rounded-xl border-white/15 bg-black/45 px-4 focus:border-white/40 focus:ring-white/20"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-100">
                  Join the Beta List
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
            <div className="mt-6 flex space-x-4">
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
                {col.links.map((text) => (
                  <li key={text}>
                    <Link
                      href="/generate"
                      className="text-sm text-gray-400 transition hover:text-white"
                    >
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
            {legalLinks.map((text) => (
              <Link
                key={text}
                href="/"
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
