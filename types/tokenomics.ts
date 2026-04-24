// ─── INPUT: What the founder fills in ──────────────────────────────────────

export type ProjectType =
  | "defi_dex"
  | "defi_lending"
  | "gamefi"
  | "dao"
  | "rwa"
  | "infra_l1"
  | "infra_l2"
  | "nft_marketplace"
  | "social"
  | "other";

export type FundingStage = "pre_seed" | "seed" | "series_a" | "public_only";
export type PlanTier = "free" | "pro";

export interface TokenomicsInput {
  // Project basics
  projectName: string;
  projectType: ProjectType;
  projectDescription: string;

  // Token supply
  totalSupply: number;          // e.g. 1_000_000_000
  tokenSymbol: string;          // e.g. "TFG"

  // Funding
  fundingStage: FundingStage;
  targetRaiseUsd: number;       // e.g. 2_000_000
  tokenPriceUsd: number;        // seed round price

  // Allocation hints (founder preferences, 0 = let AI decide)
  teamPercent: number;          // 0-30 typical
  investorsPercent: number;     // 0-25 typical
  communityPercent: number;     // 0-50 typical
  treasuryPercent: number;      // 0-30 typical
  ecosystemPercent: number;     // 0-20 typical
  publicSalePercent: number;    // 0-20 typical

  // Vesting preferences
  teamCliffMonths: number;      // typically 12
  teamVestingMonths: number;    // typically 36-48
  investorCliffMonths: number;  // typically 6-12
  investorVestingMonths: number;// typically 18-36

  // Additional context
  launchTimelineMonths: number; // months until TGE
  mainUseCase: string;          // what token is used for in-protocol
}

// ─── OUTPUT: What the AI generates ─────────────────────────────────────────

export interface AllocationItem {
  category: string;       // "Team", "Investors", "Community", etc.
  percent: number;        // 0-100, all must sum to 100
  tokens: number;         // calculated from totalSupply
  valueUsd: number;       // at token price
  color: string;          // hex color for chart
  rationale: string;      // AI explanation
}

export interface VestingEntry {
  category: string;
  cliffMonths: number;
  vestingMonths: number;  // after cliff
  tgePercent: number;     // % unlocked at TGE (0 for most)
  schedule: MonthlyUnlock[];
}

export interface MonthlyUnlock {
  month: number;          // 0 = TGE
  tokensUnlocked: number;
  cumulativePercent: number;
}

export interface EmissionPoint {
  month: number;
  circulatingSupply: number;
  circulatingPercent: number;  // % of total supply
  newlyUnlocked: number;
}

export interface SellPressureRow {
  month: number;
  tokensUnlocked: number;
  valueAtLowUsd: number;   // price scenario: 0.5x seed
  valueAtMidUsd: number;   // price scenario: 1x seed
  valueAtHighUsd: number;  // price scenario: 3x seed
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface RedFlag {
  severity: "info" | "warning" | "critical";
  category: string;        // "Concentration Risk", "Cliff Alignment", etc.
  title: string;
  description: string;
  recommendation: string;
}

export interface TokenomicsOutput {
  // Meta
  projectName: string;
  tokenSymbol: string;
  totalSupply: number;
  generatedAt: string;     // ISO timestamp

  // Core output
  allocation: AllocationItem[];
  vestingSchedules: VestingEntry[];
  emissionCurve: EmissionPoint[];
  sellPressure: SellPressureRow[];
  redFlags: RedFlag[];

  // Summary
  executiveSummary: string;
  keyStrengths: string[];
  keyRisks: string[];
  investorReadinessScore: number;  // 0-100
}

export interface SavedTokenomicsProject {
  id: string;
  ownerId: string;
  input: TokenomicsInput;
  result: TokenomicsOutput;
  plan: PlanTier;
  createdAt: string;
  updatedAt: string;
}

// ─── UI State ───────────────────────────────────────────────────────────────

export type GenerationStatus =
  | "idle"
  | "validating"
  | "generating"
  | "streaming"
  | "complete"
  | "error";

export interface GenerationState {
  status: GenerationStatus;
  progress: number;          // 0-100
  currentStep: string;       // "Analyzing allocation..." etc.
  result: TokenomicsOutput | null;
  error: string | null;
}
