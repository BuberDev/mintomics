"use client";

import { useMemo } from "react";
import type { VestingEntry } from "@/types/mintomics";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VestingTimelineChartProps {
  vestingSchedules: VestingEntry[];
}

const CATEGORY_COLORS = [
  "#ffffff",
  "#e5e7eb",
  "#d1d5db",
  "#9ca3af",
  "#f3f4f6",
  "#cbd5e1",
  "#94a3b8",
  "#bfc7d4",
];

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function buildTimelineData(schedules: VestingEntry[]) {
  const maxMonth = schedules.reduce(
    (highest, schedule) =>
      Math.max(
        highest,
        ...schedule.schedule.map((item) => item.month),
      ),
    0,
  );

  const scheduleMaps = schedules.map((schedule) => ({
    category: schedule.category,
    byMonth: new Map(schedule.schedule.map((item) => [item.month, item.cumulativePercent])),
  }));

  const carryForward = new Map<string, number>();

  return Array.from({ length: maxMonth + 1 }, (_, month) => {
    const row: Record<string, number> = { month };

    for (const schedule of scheduleMaps) {
      const value = schedule.byMonth.get(month);
      if (typeof value === "number") {
        carryForward.set(schedule.category, value);
      }
      row[schedule.category] = carryForward.get(schedule.category) ?? 0;
    }

    return row;
  });
}

export default function VestingTimelineChart({ vestingSchedules }: VestingTimelineChartProps) {
  const chartData = useMemo(() => buildTimelineData(vestingSchedules), [vestingSchedules]);
  const categories = useMemo(
    () => vestingSchedules.map((entry) => entry.category),
    [vestingSchedules],
  );

  return (
    <section className="glass rounded-xl p-4 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/75">
        Vesting Timeline
      </h3>

      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="month"
              tickFormatter={(month) => `M${month}`}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.35)"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              stroke="rgba(148, 163, 184, 0.35)"
            />
            <Tooltip
              formatter={(value: number | string) => `${percentFormatter.format(Number(value))}%`}
              labelFormatter={(label) => `Month ${label}`}
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.96)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 10,
                color: "#f3f4f6",
              }}
            />
            <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span className="text-xs text-gray-300">{value}</span>} />

            {categories.map((category, index) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vestingSchedules.map((schedule) => (
          <div
            key={schedule.category}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
          >
            <p className="text-gray-200 text-sm font-medium mb-2">{schedule.category}</p>
            <p className="text-xs text-gray-400">
              Cliff: <span className="text-gray-200">{schedule.cliffMonths}m</span>
            </p>
            <p className="text-xs text-gray-400">
              Vesting: <span className="text-gray-200">{schedule.vestingMonths}m</span>
            </p>
            <p className="text-xs text-gray-400">
              TGE Unlock: <span className="text-gray-200">{percentFormatter.format(schedule.tgePercent)}%</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
