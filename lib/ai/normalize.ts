import type {
  AllocationItem,
  EmissionPoint,
  RedFlag,
  SellPressureRow,
  TokenomicsInput,
  TokenomicsOutput,
  VestingEntry,
} from "@/types/mintomics";

const PALETTE = [
  "#ffffff",
  "#dbe4ff",
  "#b8c4ff",
  "#93a4ff",
  "#c7d2fe",
  "#f8fafc",
  "#cbd5e1",
  "#e2e8f0",
];

const CATEGORY_ORDER = [
  "Team",
  "Investors",
  "Community",
  "Treasury",
  "Ecosystem",
  "Public Sale",
  "Advisors",
  "Liquidity",
];

const PROJECT_CATEGORY_PRESETS: Record<string, Record<string, number>> = {
  defi_dex: { Team: 18, Investors: 18, Community: 32, Treasury: 16, Ecosystem: 10, "Public Sale": 6 },
  defi_lending: { Team: 18, Investors: 18, Community: 30, Treasury: 18, Ecosystem: 10, "Public Sale": 6 },
  gamefi: { Team: 20, Investors: 20, Community: 28, Treasury: 12, Ecosystem: 15, "Public Sale": 5 },
  dao: { Team: 12, Investors: 12, Community: 48, Treasury: 18, Ecosystem: 5, "Public Sale": 5 },
  rwa: { Team: 16, Investors: 20, Community: 22, Treasury: 22, Ecosystem: 10, "Public Sale": 10 },
  infra_l1: { Team: 18, Investors: 20, Community: 24, Treasury: 18, Ecosystem: 14, "Public Sale": 6 },
  infra_l2: { Team: 18, Investors: 20, Community: 24, Treasury: 18, Ecosystem: 14, "Public Sale": 6 },
  nft_marketplace: { Team: 18, Investors: 18, Community: 30, Treasury: 16, Ecosystem: 10, "Public Sale": 8 },
  social: { Team: 16, Investors: 16, Community: 34, Treasury: 14, Ecosystem: 14, "Public Sale": 6 },
  other: { Team: 18, Investors: 18, Community: 28, Treasury: 16, Ecosystem: 12, "Public Sale": 8 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((sum, item) => sum + selector(item), 0);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function canonicalCategory(value: string, fallbackIndex: number) {
  const lower = value.toLowerCase();

  if (lower.includes("team") || lower.includes("founder")) return "Team";
  if (lower.includes("investor") || lower.includes("seed") || lower.includes("private")) return "Investors";
  if (lower.includes("community") || lower.includes("rewards") || lower.includes("airdrop")) return "Community";
  if (lower.includes("treasury") || lower.includes("dao fund") || lower.includes("reserve")) return "Treasury";
  if (lower.includes("ecosystem") || lower.includes("grant") || lower.includes("builder")) return "Ecosystem";
  if (lower.includes("sale") || lower.includes("public")) return "Public Sale";
  if (lower.includes("advisor")) return "Advisors";
  if (lower.includes("liquidity")) return "Liquidity";

  return CATEGORY_ORDER[fallbackIndex] ?? value;
}

function buildFallbackAllocation(input: TokenomicsInput): AllocationItem[] {
  const preset = PROJECT_CATEGORY_PRESETS[input.projectType] ?? PROJECT_CATEGORY_PRESETS.other;
  const hasPreferences =
    input.teamPercent > 0 ||
    input.investorsPercent > 0 ||
    input.communityPercent > 0 ||
    input.treasuryPercent > 0 ||
    input.ecosystemPercent > 0 ||
    input.publicSalePercent > 0;

  const raw = CATEGORY_ORDER.map((category) => {
    const keyMap: Record<string, keyof TokenomicsInput> = {
      Team: "teamPercent",
      Investors: "investorsPercent",
      Community: "communityPercent",
      Treasury: "treasuryPercent",
      Ecosystem: "ecosystemPercent",
      "Public Sale": "publicSalePercent",
    };

    const preference = input[keyMap[category]] as number;
    const fallback = preset[category] ?? 0;
    const percent = hasPreferences && preference > 0 ? preference : fallback;
    return { category, percent };
  }).filter((item) => item.percent > 0);

  const total = sumBy(raw, (item) => item.percent);
  const normalized = raw.map((item, index) => {
    const percent = total > 0 ? (item.percent / total) * 100 : item.percent;
    const rounded = Math.round(percent * 10) / 10;
    return {
      category: item.category,
      percent: rounded,
      tokens: 0,
      valueUsd: 0,
      color: PALETTE[index % PALETTE.length],
      rationale:
        `Baseline ${item.category.toLowerCase()} allocation calibrated for ${input.projectType.replace(/_/g, " ")} projects.`,
    };
  });

  const roundedTotal = sumBy(normalized, (item) => item.percent);
  const delta = Math.round((100 - roundedTotal) * 10) / 10;
  if (normalized.length > 0 && Math.abs(delta) >= 0.1) {
    normalized[0].percent = Math.round((normalized[0].percent + delta) * 10) / 10;
  }

  return normalized.map((item, index) => ({
    ...item,
    tokens: Math.round((item.percent / 100) * input.totalSupply),
    valueUsd: Math.round(((item.percent / 100) * input.totalSupply * input.tokenPriceUsd) * 100) / 100,
    color: PALETTE[index % PALETTE.length],
  }));
}

function normalizeAllocation(input: TokenomicsInput, allocation: AllocationItem[] | undefined) {
  const incoming = (allocation ?? [])
    .filter((item) => item && typeof item.percent === "number" && item.percent > 0)
    .slice(0, 8)
    .map((item, index) => ({
      category: canonicalCategory(item.category || "", index),
      percent: item.percent,
      rationale: item.rationale || "AI recommendation aligned to the project input.",
      color: item.color || PALETTE[index % PALETTE.length],
    }));

  const withFallbacks = incoming.length >= 4 ? incoming : buildFallbackAllocation(input);
  const total = sumBy(withFallbacks, (item) => item.percent);
  const normalized = withFallbacks.map((item, index) => ({
    category: item.category,
    percent: total > 0 ? Math.round(((item.percent / total) * 100) * 10) / 10 : item.percent,
    tokens: 0,
    valueUsd: 0,
    color: PALETTE[index % PALETTE.length],
    rationale: item.rationale,
  }));

  const roundedTotal = sumBy(normalized, (item) => item.percent);
  const delta = Math.round((100 - roundedTotal) * 10) / 10;
  if (normalized.length > 0 && Math.abs(delta) >= 0.1) {
    normalized[0].percent = Math.round((normalized[0].percent + delta) * 10) / 10;
  }

  return normalized.map((item, index) => ({
    ...item,
    tokens: Math.round((item.percent / 100) * input.totalSupply),
    valueUsd: Math.round(((item.percent / 100) * input.totalSupply * input.tokenPriceUsd) * 100) / 100,
    color: PALETTE[index % PALETTE.length],
    rationale: item.rationale || `Allocation set to ${formatPercent(item.percent)} for ${item.category}.`,
  }));
}

function buildMonthlySchedule({
  tokens,
  cliffMonths,
  vestingMonths,
  tgePercent,
}: {
  tokens: number;
  cliffMonths: number;
  vestingMonths: number;
  tgePercent: number;
}): VestingEntry["schedule"] {
  const safeVestingMonths = Math.max(1, vestingMonths);
  const schedule: VestingEntry["schedule"] = [];
  const tgeTokens = Math.round(tokens * (tgePercent / 100) * 100) / 100;
  const unlockable = Math.max(0, tokens - tgeTokens);
  const monthly = unlockable / safeVestingMonths;

  for (let month = 0; month < 48; month += 1) {
    let unlocked = tgeTokens;
    if (month > 0 && month >= cliffMonths) {
      const linearMonths = Math.min(month - cliffMonths + 1, safeVestingMonths);
      unlocked += monthly * linearMonths;
    }

    const capped = clamp(unlocked, 0, tokens);
    schedule.push({
      month,
      tokensUnlocked: Math.round(capped * 100) / 100,
      cumulativePercent: tokens > 0 ? Math.round((capped / tokens) * 1000) / 10 : 0,
    });
  }

  return schedule;
}

function normalizeSchedule(
  entry: VestingEntry | undefined,
  fallback: {
    category: string;
    tokens: number;
    cliffMonths: number;
    vestingMonths: number;
    tgePercent: number;
  },
): VestingEntry {
  const cliffMonths = clamp(
    Math.round(entry?.cliffMonths ?? fallback.cliffMonths),
    0,
    36,
  );
  const vestingMonths = clamp(
    Math.round(entry?.vestingMonths ?? fallback.vestingMonths),
    1,
    48,
  );
  const tgePercent = clamp(
    Math.round((entry?.tgePercent ?? fallback.tgePercent) * 10) / 10,
    0,
    100,
  );

  return {
    category: entry?.category ?? fallback.category,
    cliffMonths,
    vestingMonths,
    tgePercent,
    schedule: buildMonthlySchedule({
      tokens: fallback.tokens,
      cliffMonths,
      vestingMonths,
      tgePercent,
    }),
  };
}

function buildDefaultSchedules(
  input: TokenomicsInput,
  allocation: AllocationItem[],
): VestingEntry[] {
  const tokenMap = new Map(allocation.map((item) => [item.category, item.tokens]));
  const schedules: VestingEntry[] = [];

  const ensure = (
    category: string,
    defaults: { cliffMonths: number; vestingMonths: number; tgePercent: number },
  ) => {
    const tokens = tokenMap.get(category) ?? 0;
    if (tokens <= 0) {
      return;
    }

    schedules.push(
      normalizeSchedule(undefined, {
        category,
        tokens,
        cliffMonths: defaults.cliffMonths,
        vestingMonths: defaults.vestingMonths,
        tgePercent: defaults.tgePercent,
      }),
    );
  };

  ensure("Team", { cliffMonths: input.teamCliffMonths, vestingMonths: input.teamVestingMonths, tgePercent: 0 });
  ensure("Investors", { cliffMonths: input.investorCliffMonths, vestingMonths: input.investorVestingMonths, tgePercent: 0 });
  ensure("Community", { cliffMonths: 0, vestingMonths: 36, tgePercent: 8 });
  ensure("Treasury", { cliffMonths: 0, vestingMonths: 48, tgePercent: 0 });
  ensure("Ecosystem", { cliffMonths: 0, vestingMonths: 36, tgePercent: 0 });
  ensure("Public Sale", { cliffMonths: 0, vestingMonths: 24, tgePercent: 15 });
  ensure("Advisors", { cliffMonths: 6, vestingMonths: 24, tgePercent: 0 });
  ensure("Liquidity", { cliffMonths: 0, vestingMonths: 12, tgePercent: 100 });

  return schedules.slice(0, 8);
}

function normalizeVestingSchedules(
  input: TokenomicsInput,
  allocation: AllocationItem[],
  schedules: VestingEntry[] | undefined,
) {
  const scheduleByCategory = new Map((schedules ?? []).map((entry) => [entry.category, entry]));
  const defaults = buildDefaultSchedules(input, allocation);
  const fallbackByCategory = new Map(defaults.map((entry) => [entry.category, entry]));

  const categories = new Set([...defaults.map((entry) => entry.category), ...(schedules ?? []).map((entry) => entry.category)]);
  const result = Array.from(categories).map((category) => {
    const fallback = fallbackByCategory.get(category);
    if (!fallback) {
      return null;
    }

    return normalizeSchedule(scheduleByCategory.get(category), {
      category,
      tokens: fallback.schedule.at(-1)?.tokensUnlocked ?? 0,
      cliffMonths: fallback.cliffMonths,
      vestingMonths: fallback.vestingMonths,
      tgePercent: fallback.tgePercent,
    });
  });

  return result.filter((entry): entry is VestingEntry => Boolean(entry));
}

function buildEmissionCurve(
  allocation: AllocationItem[],
  schedules: VestingEntry[],
): EmissionPoint[] {
  const monthCount = 48;
  const emissionCurve: EmissionPoint[] = [];

  for (let month = 0; month < monthCount; month += 1) {
    const newlyUnlocked = sumBy(schedules, (schedule) => schedule.schedule[month]?.tokensUnlocked ?? 0) -
      sumBy(schedules, (schedule) => schedule.schedule[month - 1]?.tokensUnlocked ?? 0);

    const circulatingSupply = sumBy(schedules, (schedule) => schedule.schedule[month]?.tokensUnlocked ?? 0);
    emissionCurve.push({
      month,
      circulatingSupply: Math.round(circulatingSupply * 100) / 100,
      circulatingPercent: allocation.length > 0 && schedules.length > 0
        ? Math.round((circulatingSupply / sumBy(allocation, (item) => item.tokens)) * 1000) / 10
        : 0,
      newlyUnlocked: Math.round(Math.max(0, newlyUnlocked) * 100) / 100,
    });
  }

  return emissionCurve;
}

function buildSellPressure(
  input: TokenomicsInput,
  emissionCurve: EmissionPoint[],
): SellPressureRow[] {
  return emissionCurve.map((point) => {
    const valueAtMidUsd = point.newlyUnlocked * input.tokenPriceUsd;
    const ratio = point.circulatingPercent;
    let riskLevel: SellPressureRow["riskLevel"] = "low";

    if (ratio > 35 || valueAtMidUsd > input.targetRaiseUsd * 0.3) {
      riskLevel = "critical";
    } else if (ratio > 18 || valueAtMidUsd > input.targetRaiseUsd * 0.15) {
      riskLevel = "high";
    } else if (ratio > 8 || valueAtMidUsd > input.targetRaiseUsd * 0.08) {
      riskLevel = "medium";
    }

    return {
      month: point.month,
      tokensUnlocked: Math.round(point.newlyUnlocked * 100) / 100,
      valueAtLowUsd: Math.round(valueAtMidUsd * 0.5 * 100) / 100,
      valueAtMidUsd: Math.round(valueAtMidUsd * 100) / 100,
      valueAtHighUsd: Math.round(valueAtMidUsd * 3 * 100) / 100,
      riskLevel,
    };
  });
}

function buildRedFlags(
  input: TokenomicsInput,
  allocation: AllocationItem[],
  schedules: VestingEntry[],
  sellPressure: SellPressureRow[],
  parsedFlags: RedFlag[] | undefined,
): RedFlag[] {
  const flags: RedFlag[] = (parsedFlags ?? []).slice(0, 6).map((flag) => ({
    severity: flag.severity,
    category: flag.category || "General",
    title: flag.title,
    description: flag.description,
    recommendation: flag.recommendation,
  }));

  const team = allocation.find((item) => item.category === "Team");
  const investors = allocation.find((item) => item.category === "Investors");
  const community = allocation.find((item) => item.category === "Community");
  const treasury = allocation.find((item) => item.category === "Treasury");
  const teamSchedule = schedules.find((schedule) => schedule.category === "Team");
  const investorSchedule = schedules.find((schedule) => schedule.category === "Investors");
  const peakPressure = [...sellPressure].sort((a, b) => b.valueAtMidUsd - a.valueAtMidUsd)[0];

  if ((team?.percent ?? 0) < 12) {
    flags.push({
      severity: "critical",
      category: "Team Allocation",
      title: "Team allocation is too thin",
      description: "The team share is below benchmark levels for a founder-led Web3 model, which can weaken retention and execution incentives.",
      recommendation: "Increase the team allocation to a more credible benchmark and rebalance the remaining supply across community and treasury buckets.",
    });
  }

  if ((investors?.percent ?? 0) > 30) {
    flags.push({
      severity: "warning",
      category: "Investor Concentration",
      title: "Investor allocation is too heavy",
      description: "The investor bucket exceeds the threshold used in the product benchmarks, which can create community backlash and excessive supply pressure.",
      recommendation: "Reduce investor concentration or extend the vesting timeline so the model stays closer to founder-friendly market norms.",
    });
  }

  if (input.projectType === "dao" || input.projectType === "defi_dex") {
    if ((community?.percent ?? 0) < 20) {
      flags.push({
        severity: "warning",
        category: "Community Allocation",
        title: "Community allocation is too low",
        description: "Community incentives look underfunded for a protocol that depends on distribution, participation, and network effects.",
        recommendation: "Shift more supply into community rewards, incentives, or liquidity programs so the launch story feels sustainable.",
      });
    }
  }

  if ((treasury?.percent ?? 0) < 10) {
    flags.push({
      severity: "warning",
      category: "Treasury Runway",
      title: "Treasury runway looks thin",
      description: "The treasury allocation is below the buffer usually needed for protocol development, grants, and operational flexibility.",
      recommendation: "Expand treasury allocation or shorten allocations elsewhere to preserve runway for future execution.",
    });
  }

  if ((teamSchedule?.cliffMonths ?? input.teamCliffMonths) < 12) {
    flags.push({
      severity: "critical",
      category: "Team Cliff",
      title: "Team cliff is too short",
      description: "A short team cliff creates a misalignment risk at launch and is one of the easiest investor red flags to spot.",
      recommendation: "Set the team cliff to 12 months or more and align it with a longer vesting curve.",
    });
  }

  if ((investorSchedule?.vestingMonths ?? input.investorVestingMonths) < 18) {
    flags.push({
      severity: "warning",
      category: "Investor Vesting",
      title: "Investor vesting is compressed",
      description: "Investor vesting appears shorter than the benchmark range, which can increase short-term pressure and reduce diligence confidence.",
      recommendation: "Extend investor vesting so the unlock curve looks more credible to long-term holders and backers.",
    });
  }

  if (peakPressure && peakPressure.riskLevel === "critical") {
    flags.push({
      severity: "critical",
      category: "Unlock Pressure",
      title: `High unlock pressure in month ${peakPressure.month}`,
      description: "One month stands out as a major unlock event, which can distort price discovery and create avoidable sell pressure.",
      recommendation: "Stagger large unlocks or rebalance the cliffs to soften the peak monthly supply impact.",
    });
  }

  if (flags.length === 0) {
    flags.push({
      severity: "info",
      category: "Benchmark Fit",
      title: "No severe red flags detected",
      description: "The model stays reasonably close to the built-in benchmark heuristics and does not trigger a hard risk escalation.",
      recommendation: "Use this as a strong starting point and validate the model with legal and token engineering review before launch.",
    });
  }

  return flags.slice(0, 8);
}

function buildSummary(
  input: TokenomicsInput,
  allocation: AllocationItem[],
  redFlags: RedFlag[],
  investorReadinessScore: number,
): Pick<TokenomicsOutput, "executiveSummary" | "keyStrengths" | "keyRisks"> {
  const largest = [...allocation].sort((a, b) => b.percent - a.percent)[0];
  const strengths = [
    `Allocation is anchored around ${largest?.category ?? "balanced distribution"} with a ${largest ? formatPercent(largest.percent) : "balanced"} share.`,
    "Vesting, emission, and sell pressure are normalized into a 48-month investor-style view.",
    "The output is designed to be readable by founders, advisors, and investors without extra editing.",
  ];

  const risks = redFlags.slice(0, 3).map((flag) => `${flag.title}: ${flag.recommendation}`);
  while (risks.length < 3) {
    risks.push("Review the model against your launch timeline, legal constraints, and planned distribution strategy.");
  }

  const executiveSummary =
    `${input.projectName} is positioned as a ${input.projectType.replace(/_/g, " ")} token model with ${allocation.length} allocation buckets, ` +
    `a ${formatPercent(allocation[0]?.percent ?? 0)} top bucket, and ${redFlags.length} investor-facing risk item${redFlags.length === 1 ? "" : "s"}. ` +
    `The current investor readiness score is ${investorReadinessScore}/100, so the model is useful for early diligence and iteration, but it still benefits from final legal and token engineering review.`;

  return {
    executiveSummary,
    keyStrengths: strengths.slice(0, 5),
    keyRisks: risks.slice(0, 5),
  };
}

export function normalizeTokenomicsOutput(
  input: TokenomicsInput,
  parsed: Partial<TokenomicsOutput> | null,
): TokenomicsOutput {
  const allocation = normalizeAllocation(input, parsed?.allocation as AllocationItem[] | undefined);
  const schedules = normalizeVestingSchedules(input, allocation, parsed?.vestingSchedules as VestingEntry[] | undefined);
  const emissionCurve = buildEmissionCurve(allocation, schedules);
  const sellPressure = buildSellPressure(input, emissionCurve);
  const redFlags = buildRedFlags(input, allocation, schedules, sellPressure, parsed?.redFlags as RedFlag[] | undefined);
  const investorReadinessScore = clamp(
    100 - redFlags.reduce((score, flag) => {
      if (flag.severity === "critical") return score + 15;
      if (flag.severity === "warning") return score + 8;
      return score + 3;
    }, 0),
    0,
    100,
  );
  const summary = buildSummary(input, allocation, redFlags, investorReadinessScore);

  return {
    projectName: parsed?.projectName?.trim() || input.projectName,
    tokenSymbol: parsed?.tokenSymbol?.trim() || input.tokenSymbol,
    totalSupply: input.totalSupply,
    generatedAt: parsed?.generatedAt || new Date().toISOString(),
    allocation,
    vestingSchedules: schedules,
    emissionCurve,
    sellPressure,
    redFlags,
    executiveSummary: parsed?.executiveSummary?.trim().length ? parsed.executiveSummary : summary.executiveSummary,
    keyStrengths: (parsed?.keyStrengths?.length ? parsed.keyStrengths : summary.keyStrengths).slice(0, 5),
    keyRisks: (parsed?.keyRisks?.length ? parsed.keyRisks : summary.keyRisks).slice(0, 5),
    investorReadinessScore: typeof parsed?.investorReadinessScore === "number"
      ? clamp(parsed.investorReadinessScore, 0, 100)
      : investorReadinessScore,
  };
}
