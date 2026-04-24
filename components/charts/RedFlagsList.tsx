"use client";

import { useMemo } from "react";
import type { RedFlag } from "@/types/mintomics";

interface RedFlagsListProps {
  redFlags: RedFlag[];
}

const SEVERITY_ORDER: Record<RedFlag["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const SEVERITY_STYLES: Record<RedFlag["severity"], string> = {
  critical: "bg-red-500/10 border-red-500/30",
  warning: "bg-yellow-500/10 border-yellow-500/30",
  info: "bg-blue-500/10 border-blue-500/30",
};

const SEVERITY_BADGE_STYLES: Record<RedFlag["severity"], string> = {
  critical: "bg-red-500/20 text-red-300",
  warning: "bg-yellow-500/20 text-yellow-300",
  info: "bg-blue-500/20 text-blue-300",
};

export default function RedFlagsList({ redFlags }: RedFlagsListProps) {
  const sortedFlags = useMemo(
    () => [...redFlags].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]),
    [redFlags],
  );

  return (
    <section className="glass rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider">
          Investor Red Flags
        </h3>
        <p className="text-xs text-gray-400 mt-1">{sortedFlags.length} findings detected</p>
      </div>

      {sortedFlags.length === 0 ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          No major red flags detected in this model.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFlags.map((flag, index) => (
            <div
              key={`${flag.title}-${index}`}
              className={`rounded-lg p-4 border ${SEVERITY_STYLES[flag.severity]}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${SEVERITY_BADGE_STYLES[flag.severity]}`}
                >
                  {flag.severity}
                </span>
                <span className="text-xs text-gray-400">{flag.category}</span>
              </div>
              <p className="text-white text-sm font-medium mb-1">{flag.title}</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-2">{flag.description}</p>
              <p className="text-green-300 text-xs leading-relaxed">Recommendation: {flag.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
