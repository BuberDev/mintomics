import { z } from "zod";
import type { TokenomicsInput } from "@/types/mintomics";

// Zod schema mirrors TokenomicsOutput — used to validate AI JSON response

export const AllocationItemSchema = z.object({
  category: z.string(),
  percent: z.number().min(0).max(100),
  tokens: z.number().positive(),
  valueUsd: z.number().nonnegative(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  rationale: z.string().min(20),
});

export const MonthlyUnlockSchema = z.object({
  month: z.number().int().nonnegative(),
  tokensUnlocked: z.number().nonnegative(),
  cumulativePercent: z.number().min(0).max(100),
});

export const VestingEntrySchema = z.object({
  category: z.string(),
  cliffMonths: z.number().int().nonnegative(),
  vestingMonths: z.number().int().positive(),
  tgePercent: z.number().min(0).max(100),
  schedule: z.array(MonthlyUnlockSchema).length(48),
});

export const EmissionPointSchema = z.object({
  month: z.number().int().nonnegative(),
  circulatingSupply: z.number().nonnegative(),
  circulatingPercent: z.number().min(0).max(100),
  newlyUnlocked: z.number().nonnegative(),
});

export const SellPressureRowSchema = z.object({
  month: z.number().int().nonnegative(),
  tokensUnlocked: z.number().nonnegative(),
  valueAtLowUsd: z.number().nonnegative(),
  valueAtMidUsd: z.number().nonnegative(),
  valueAtHighUsd: z.number().nonnegative(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
});

export const RedFlagSchema = z.object({
  severity: z.enum(["info", "warning", "critical"]),
  category: z.string(),
  title: z.string(),
  description: z.string().min(30),
  recommendation: z.string().min(20),
});

export const TokenomicsOutputSchema = z.object({
  projectName: z.string(),
  tokenSymbol: z.string(),
  totalSupply: z.number().positive(),
  generatedAt: z.string(),
  allocation: z.array(AllocationItemSchema).min(4).max(8),
  vestingSchedules: z.array(VestingEntrySchema).min(2),
  emissionCurve: z.array(EmissionPointSchema).length(48),
  sellPressure: z.array(SellPressureRowSchema).length(48),
  redFlags: z.array(RedFlagSchema).min(1),
  executiveSummary: z.string().min(100),
  keyStrengths: z.array(z.string()).min(2).max(5),
  keyRisks: z.array(z.string()).min(2).max(5),
  investorReadinessScore: z.number().int().min(0).max(100),
});

export const TokenomicsInputSchema = z.object({
  projectName: z.string().trim().min(2).max(80),
  projectType: z.enum([
    "defi_dex",
    "defi_lending",
    "gamefi",
    "dao",
    "rwa",
    "infra_l1",
    "infra_l2",
    "nft_marketplace",
    "social",
    "other",
  ]),
  projectDescription: z.string().trim().min(20).max(800),
  totalSupply: z.number().positive().max(1_000_000_000_000),
  tokenSymbol: z.string().trim().min(2).max(12),
  fundingStage: z.enum(["pre_seed", "seed", "series_a", "public_only"]),
  targetRaiseUsd: z.number().positive().max(1_000_000_000),
  tokenPriceUsd: z.number().positive().max(1_000_000),
  teamPercent: z.number().min(0).max(100),
  investorsPercent: z.number().min(0).max(100),
  communityPercent: z.number().min(0).max(100),
  treasuryPercent: z.number().min(0).max(100),
  ecosystemPercent: z.number().min(0).max(100),
  publicSalePercent: z.number().min(0).max(100),
  teamCliffMonths: z.number().int().min(0).max(36),
  teamVestingMonths: z.number().int().min(1).max(60),
  investorCliffMonths: z.number().int().min(0).max(36),
  investorVestingMonths: z.number().int().min(1).max(60),
  launchTimelineMonths: z.number().int().min(1).max(36),
  mainUseCase: z.string().trim().min(5).max(300),
});

export function validateTokenomicsInput(input: TokenomicsInput) {
  return TokenomicsInputSchema.safeParse(input);
}

// Business rule validation on top of schema
export function validateAllocationSumsTo100(
  allocation: Array<{ percent: number }>
): boolean {
  const total = allocation.reduce((sum, a) => sum + a.percent, 0);
  return Math.abs(total - 100) < 0.1; // allow tiny rounding errors
}
