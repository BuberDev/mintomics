"use client";

import { useMemo, useState } from "react";
import AllocationPieChart from "@/components/charts/AllocationPieChart";
import EmissionCurveChart from "@/components/charts/EmissionCurveChart";
import RedFlagsList from "@/components/charts/RedFlagsList";
import SellPressureTable from "@/components/charts/SellPressureTable";
import VestingTimelineChart from "@/components/charts/VestingTimelineChart";
import UpgradeModal from "@/components/results/UpgradeModal";
import { trackEvent } from "@/lib/analytics/client";
import { exportReportToPdf } from "@/lib/export/reportPdf";
import type { PlanTier, SellPressureRow, TokenomicsOutput } from "@/types/mintomics";

interface ResultsDashboardProps {
  onEditInputs: () => void;
  result: TokenomicsOutput;
  plan: PlanTier;
  onReset: () => void;
}

const tokenFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function getScoreStyles(score: number) {
  if (score >= 80) {
    return {
      badge: "bg-green-500/15 text-green-300 border border-green-500/25",
      fill: "bg-green-400",
      label: "Strong",
    };
  }

  if (score >= 60) {
    return {
      badge: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25",
      fill: "bg-yellow-400",
      label: "Needs refinement",
    };
  }

  return {
    badge: "bg-red-500/15 text-red-300 border border-red-500/25",
    fill: "bg-red-400",
    label: "High risk",
  };
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPeakPressureMonth(rows: SellPressureRow[]) {
  return rows.reduce<SellPressureRow | null>((current, row) => {
    if (!current || row.valueAtMidUsd > current.valueAtMidUsd) {
      return row;
    }

    return current;
  }, null);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
    </div>
  );
}

function InsightList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "risk";
}) {
  const bulletTone =
    tone === "positive"
      ? "bg-green-400/20 text-green-300"
      : "bg-red-400/20 text-red-300";

  return (
    <section className="glass rounded-xl p-6">
      <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span
              className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${bulletTone}`}
            >
              {tone === "positive" ? "+" : "!"}
            </span>
            <p className="text-sm leading-relaxed text-gray-300">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultsDashboard({
  onEditInputs,
  result,
  plan,
  onReset,
}: ResultsDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<"export" | "red_flags" | null>(null);
  const scoreStyles = getScoreStyles(result.investorReadinessScore);

  const largestAllocation = useMemo(
    () =>
      result.allocation.reduce((current, item) => {
        if (!current || item.percent > current.percent) {
          return item;
        }

        return current;
      }, result.allocation[0]),
    [result.allocation],
  );

  const peakPressureMonth = useMemo(
    () => getPeakPressureMonth(result.sellPressure),
    [result.sellPressure],
  );

  const criticalFlags = useMemo(
    () => result.redFlags.filter((flag) => flag.severity === "critical").length,
    [result.redFlags],
  );

  const fullDilutionMonth = useMemo(() => {
    const fullyDilutedPoint = result.emissionCurve.find((point) => point.circulatingPercent >= 99.9);
    return fullyDilutedPoint?.month ?? result.emissionCurve.at(-1)?.month ?? 0;
  }, [result.emissionCurve]);

  const visibleRedFlags = useMemo(
    () => (plan === "pro" ? result.redFlags : result.redFlags.slice(0, 3)),
    [plan, result.redFlags],
  );

  const hiddenRedFlagsCount = result.redFlags.length - visibleRedFlags.length;

  const openUpgrade = (reason: "export" | "red_flags") => {
    setUpgradeReason(reason);
    void trackEvent("paywall_viewed", {
      reason,
      projectName: result.projectName,
    });
    void trackEvent("upgrade_started", {
      reason,
      plan,
      projectName: result.projectName,
    });
  };

  const handleExport = async () => {
    if (plan !== "pro") {
      openUpgrade("export");
      return;
    }

    const reportElement = document.getElementById("mintomics-report");
    if (!reportElement) {
      setExportError("We couldn't find the report to export. Please refresh and try again.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      await exportReportToPdf({
        element: reportElement,
        filename: `${slugify(result.projectName)}-${result.tokenSymbol.toLowerCase()}-mintomics-report.pdf`,
      });
      void trackEvent("pdf_exported", {
        projectName: result.projectName,
        tokenSymbol: result.tokenSymbol,
      });
    } catch (error) {
      console.error("[Mintomics] PDF export failed:", error);
      setExportError("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="mintomics-report" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{result.projectName}</h2>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 whitespace-nowrap">
              {result.tokenSymbol}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {tokenFormatter.format(result.totalSupply)} total supply
            <span className="mx-2 text-gray-600">•</span>
            Generated {formatGeneratedAt(result.generatedAt)}
          </p>
        </div>

        <div
          data-pdf-exclude="true"
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end"
        >
          <div className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${scoreStyles.badge}`}>
            {scoreStyles.label}
          </div>
          <div
            className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap ${plan === "pro"
              ? "border border-white/25 bg-white/10 text-white"
              : "border border-white/15 bg-white/5 text-gray-300"
              }`}
          >
            {plan === "pro" ? "Pro" : "Free Plan"}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="min-h-11 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          {plan === "free" && (
            <button
              onClick={() => openUpgrade("red_flags")}
              className="min-h-11 w-full rounded-lg border border-white/30 px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:border-white/50 hover:text-white sm:w-auto"
            >
              Unlock Pro
            </button>
          )}
          <button
            onClick={onEditInputs}
            className="min-h-11 w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-gray-300 transition-colors hover:border-white/35 hover:text-white sm:w-auto"
          >
            Edit Inputs
          </button>
          <button
            onClick={onReset}
            className="min-h-11 w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-gray-300 transition-colors hover:border-white/35 hover:text-white sm:w-auto"
          >
            New Project
          </button>
        </div>
      </div>

      {plan === "free" && (
        <section
          data-pdf-exclude="true"
          className="rounded-2xl border border-white/15 bg-white/5 p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Free Tier Preview</p>
              <p className="mt-2 text-base font-medium text-white">
                Full red flags and PDF export are locked behind Pro.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                You can review the model now, then unlock the investor-facing deliverables when you're ready to share it.
              </p>
            </div>
            <button
              onClick={() => openUpgrade("export")}
              className="min-h-11 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100 sm:w-auto"
            >
              Unlock Pro
            </button>
          </div>
        </section>
      )}

      {exportError && (
        <div
          data-pdf-exclude="true"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {exportError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="glass rounded-xl p-4 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                Investor Readiness
              </p>
              <p className="mt-2 text-4xl font-bold text-white">
                {result.investorReadinessScore}
                <span className="ml-1 text-lg font-medium text-gray-500">/100</span>
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${scoreStyles.badge}`}>
              {scoreStyles.label}
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${scoreStyles.fill}`}
              style={{ width: `${Math.max(0, Math.min(100, result.investorReadinessScore))}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            A blended quality score based on allocation balance, vesting discipline, sell pressure, and the number of investor-facing concerns.
          </p>
        </div>

        <MetricCard
          label="Largest Allocation"
          value={`${percentFormatter.format(largestAllocation?.percent ?? 0)}%`}
          detail={largestAllocation ? largestAllocation.category : "No allocation data"}
        />

        <MetricCard
          label="Peak Sell Pressure"
          value={peakPressureMonth ? `M${peakPressureMonth.month}` : "N/A"}
          detail={peakPressureMonth ? usdFormatter.format(peakPressureMonth.valueAtMidUsd) : "No sell pressure data"}
        />

        <MetricCard
          label="Red Flags"
          value={String(result.redFlags.length)}
          detail={
            criticalFlags > 0
              ? `${criticalFlags} critical issue${criticalFlags === 1 ? "" : "s"}`
              : "No critical issues"
          }
        />

        <MetricCard
          label="Fully Diluted By"
          value={`M${fullDilutionMonth}`}
          detail="Projected month when circulating supply reaches ~100%"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="glass rounded-xl p-6">
          <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider mb-4">
            Executive Summary
          </h3>
          <p className="text-sm leading-7 text-gray-300">{result.executiveSummary}</p>
        </section>

        <section className="glass rounded-xl p-6">
          <h3 className="text-white/75 font-semibold text-sm uppercase tracking-wider mb-4">
            Model Snapshot
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Allocation Concentration</p>
              <p className="mt-1 text-sm text-gray-300">
                {largestAllocation
                  ? `${largestAllocation.category} holds ${percentFormatter.format(largestAllocation.percent)}% of supply.`
                  : "Allocation data not available."}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Peak Unlock Window</p>
              <p className="mt-1 text-sm text-gray-300">
                {peakPressureMonth
                  ? `Month ${peakPressureMonth.month} carries the highest baseline unlock value at ${usdFormatter.format(peakPressureMonth.valueAtMidUsd)}.`
                  : "Sell pressure data not available."}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Use This Model For</p>
              <p className="mt-1 text-sm text-gray-300">
                Internal iteration, founder discussions, and early investor conversations before legal and token engineering review.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightList title="Key Strengths" items={result.keyStrengths} tone="positive" />
        <InsightList title="Key Risks" items={result.keyRisks} tone="risk" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AllocationPieChart allocation={result.allocation} />
        <EmissionCurveChart emissionCurve={result.emissionCurve} />
      </div>

      <VestingTimelineChart vestingSchedules={result.vestingSchedules} />

      <SellPressureTable sellPressure={result.sellPressure} />

      <div className="space-y-4">
        <RedFlagsList redFlags={visibleRedFlags} />
        {hiddenRedFlagsCount > 0 && (
          <div
            data-pdf-exclude="true"
            className="rounded-xl border border-white/15 bg-white/5 p-5"
          >
            <p className="text-sm font-medium text-white">
              {hiddenRedFlagsCount} more investor red flag
              {hiddenRedFlagsCount === 1 ? "" : "s"} available in Pro.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Upgrade to unlock the full issue list, deeper recommendations, and exportable investor-ready reporting.
            </p>
            <button
              onClick={() => openUpgrade("red_flags")}
              className="mt-4 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-white/50 hover:text-white"
            >
              Reveal Full Report
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-gray-300">
        Mintomics provides decision support, not financial or legal advice. Final token design should be reviewed by legal counsel and an experienced token engineer before launch.
      </div>

      <UpgradeModal
        hiddenRedFlagsCount={hiddenRedFlagsCount}
        isOpen={upgradeReason !== null}
        reason={upgradeReason ?? "export"}
        onClose={() => {
          setUpgradeReason(null);
        }}
      />
    </div>
  );
}
