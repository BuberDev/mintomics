"use client";

import { useMemo } from "react";
import type { EmissionPoint } from "@/types/mintomics";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EmissionCurveChartProps {
  emissionCurve: EmissionPoint[];
}

const tokenFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export default function EmissionCurveChart({ emissionCurve }: EmissionCurveChartProps) {
  const sortedCurve = useMemo(
    () => [...emissionCurve].sort((a, b) => a.month - b.month),
    [emissionCurve],
  );

  const latestPoint = sortedCurve.at(-1);
  const maxMonthlyUnlock = sortedCurve.reduce(
    (highest, point) => (point.newlyUnlocked > highest ? point.newlyUnlocked : highest),
    0,
  );

  return (
    <section className="glass rounded-xl p-6">
      <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider mb-4">
        Emission Curve
      </h3>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedCurve} margin={{ top: 8, right: 16, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="circulatingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="month"
              tickFormatter={(month) => `M${month}`}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.35)"
            />
            <YAxis
              yAxisId="percent"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.35)"
            />
            <YAxis
              yAxisId="tokens"
              orientation="right"
              tickFormatter={(value) => tokenFormatter.format(value)}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.35)"
            />
            <Tooltip
              labelFormatter={(label) => `Month ${label}`}
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.96)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 10,
                color: "#f3f4f6",
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
            />

            <Area
              yAxisId="percent"
              type="monotone"
              dataKey="circulatingPercent"
              name="Circulating Supply (%)"
              stroke="#ffffff"
              fill="url(#circulatingFill)"
              strokeWidth={2.25}
              dot={false}
            />
            <Bar
              yAxisId="tokens"
              dataKey="newlyUnlocked"
              name="Newly Unlocked Tokens"
              fill="rgba(255, 255, 255, 0.38)"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Final Circulating Supply</p>
          <p className="text-gray-100 font-semibold">
            {latestPoint ? tokenFormatter.format(latestPoint.circulatingSupply) : "N/A"}
            {latestPoint ? (
              <span className="text-gray-400 font-normal ml-2">
                ({percentFormatter.format(latestPoint.circulatingPercent)}%)
              </span>
            ) : null}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Max Monthly Unlock</p>
          <p className="text-gray-100 font-semibold">{tokenFormatter.format(maxMonthlyUnlock)}</p>
        </div>
      </div>
    </section>
  );
}
