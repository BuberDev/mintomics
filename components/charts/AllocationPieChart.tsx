"use client";

import type { AllocationItem } from "@/types/mintomics";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface AllocationPieChartProps {
  allocation: AllocationItem[];
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

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

export default function AllocationPieChart({ allocation }: AllocationPieChartProps) {
  const totalPercent = allocation.reduce((sum, item) => sum + item.percent, 0);

  return (
    <section className="glass rounded-xl p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider">
          Allocation Breakdown
        </h3>
        <span className="text-xs text-gray-400">
          Total: {percentFormatter.format(totalPercent)}%
        </span>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              dataKey="percent"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={116}
              paddingAngle={2}
              stroke="rgba(10, 12, 26, 0.9)"
              strokeWidth={2}
              labelLine={false}
              label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
            >
              {allocation.map((entry, index) => (
                <Cell key={`${entry.category}-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | string) => `${percentFormatter.format(Number(value))}%`}
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-white/10">
              <th className="py-2">Category</th>
              <th className="py-2">Share</th>
              <th className="py-2">Tokens</th>
              <th className="py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {allocation.map((item) => (
              <tr key={item.category}>
                <td className="py-2.5 text-gray-200 font-medium">{item.category}</td>
                <td className="py-2.5 text-gray-300">{percentFormatter.format(item.percent)}%</td>
                <td className="py-2.5 text-gray-400">{tokenFormatter.format(item.tokens)}</td>
                <td className="py-2.5 text-right text-gray-300">{usdFormatter.format(item.valueUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
