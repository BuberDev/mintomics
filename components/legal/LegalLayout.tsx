"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface TOCItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  toc: TOCItem[];
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  toc,
  children,
}: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observers = new Map();
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-100px 0% -80% 0%",
      threshold: 0,
    });

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
        observers.set(item.id, element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);

  return (
    <main className="min-h-screen bg-black text-gray-100">
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-16">
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
            Mintomics
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-xl text-gray-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px w-8 bg-white/20"></span>
            <p className="text-sm font-medium text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                On this page
              </p>
              <nav className="flex flex-col gap-3">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`text-sm transition-all duration-200 ${
                      activeId === item.id
                        ? "text-white font-medium translate-x-1"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="glass-effect rounded-[2.5rem] border border-white/10 p-8 md:p-12 lg:p-16">
            <div className="prose prose-invert prose-brand max-w-none">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
