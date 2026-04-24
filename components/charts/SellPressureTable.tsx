"use client";

import type { SellPressureRow } from "@/types/mintomics";

interface SellPressureTableProps {
  sellPressure: SellPressureRow[];
}

const tokenFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const RISK_BADGE_CLASSES: Record<SellPressureRow["riskLevel"], string> = {
  low: "bg-green-500/15 text-green-300 border border-green-500/25",
  medium: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25",
  high: "bg-orange-500/15 text-orange-300 border border-orange-500/25",
  critical: "bg-red-500/15 text-red-300 border border-red-500/25",
};

const RISK_ROW_CLASSES: Record<SellPressureRow["riskLevel"], string> = {
  low: "",
  medium: "bg-yellow-500/5",
  high: "bg-orange-500/10",
  critical: "bg-red-500/10",
};

export default function SellPressureTable({ sellPressure }: SellPressureTableProps) {
  const rows = [...sellPressure].sort((a, b) => a.month - b.month);

  return (
    <section className="glass rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider">
          Sell Pressure Analysis
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Monthly unlock value under three market scenarios (0.5x / 1x / 3x seed price).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
              <th className="py-2 pr-3">Month</th>
              <th className="py-2 pr-3">Unlocked</th>
              <th className="py-2 pr-3">0.5x</th>
              <th className="py-2 pr-3">1x</th>
              <th className="py-2 pr-3">3x</th>
              <th className="py-2 text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.month} className={RISK_ROW_CLASSES[row.riskLevel]}>
                <td className="py-2.5 pr-3 text-gray-300 font-medium">M{row.month}</td>
                <td className="py-2.5 pr-3 text-gray-300">{tokenFormatter.format(row.tokensUnlocked)}</td>
                <td className="py-2.5 pr-3 text-gray-400">{usdFormatter.format(row.valueAtLowUsd)}</td>
                <td className="py-2.5 pr-3 text-gray-300">{usdFormatter.format(row.valueAtMidUsd)}</td>
                <td className="py-2.5 pr-3 text-gray-300">{usdFormatter.format(row.valueAtHighUsd)}</td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${RISK_BADGE_CLASSES[row.riskLevel]}`}
                  >
                    {row.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
